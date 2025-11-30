import os
import sqlite3
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app) # Permite que o Frontend (React) converse com esse Backend

# --- CONFIGURAÇÕES ---
UPLOAD_FOLDER = 'uploads' # Pasta onde as fotos serão salvas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Cria a pasta 'uploads' se ela não existir

DATABASE = 'conselho.db'

# --- BANCO DE DADOS ---
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row # Permite acessar as colunas pelo nome
    return conn

def init_db():
    """Cria as tabelas se elas não existirem"""
    with app.app_context():
        db = get_db()
        with open('flaskr/schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def allowed_file(filename):
    """Verifica se a extensão da imagem é válida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==========================================
#              ROTAS DA API
# ==========================================

# --- 1. Rotas de TURMAS ---
@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    conn = get_db()
    turmas_db = conn.execute('SELECT * FROM Turma').fetchall()
    conn.close()
    
    lista_turmas = []
    for t in turmas_db:
        lista_turmas.append({
            "id": t["idturma"],
            "nome": t["nometurma"],
            "ano": t["ano"],
            "turno": t["turno"]
        })
    return jsonify(lista_turmas)

@app.route('/api/turmas', methods=['POST'])
def add_turma():
    data = request.json
    conn = get_db()
    conn.execute('INSERT INTO Turma (nometurma, ano, turno) VALUES (?, ?, ?)',
                 (data['nome'], data['ano'], data['turno']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Turma criada com sucesso"}), 201

# --- 2. Rotas de ALUNOS (com Foto) ---
@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    conn = get_db()
    alunos_db = conn.execute('SELECT * FROM Aluno').fetchall()
    conn.close()
    
    lista_alunos = []
    for a in alunos_db:
        foto_url = None
        if a['foto']:
            foto_url = f"http://127.0.0.1:5000/uploads/{a['foto']}"

        lista_alunos.append({
            "id": a["idaluno"],
            "nome": a["nomealuno"],
            "matricula": a["matricula"],
            "turmaId": a["idturma"],
            "foto": a["foto"],
            "foto_url": foto_url
        })
    return jsonify(lista_alunos)

@app.route('/api/alunos', methods=['POST'])
def add_aluno():
    nome = request.form.get('nome')
    matricula = request.form.get('matricula')
    turma_id = request.form.get('turmaId')
    
    foto_filename = None
    
    # Upload da Imagem
    if 'foto' in request.files:
        file = request.files['foto']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            import uuid
            unique_name = f"{uuid.uuid4().hex}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))
            foto_filename = unique_name

    conn = get_db()
    conn.execute('INSERT INTO Aluno (nomealuno, matricula, idturma, foto) VALUES (?, ?, ?, ?)',
                 (nome, matricula, turma_id, foto_filename))
    conn.commit()
    conn.close()
    return jsonify({"message": "Aluno criado com sucesso"}), 201

@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config['UPLOAD_FOLDER'], name)

# --- 3. Dashboard (Resumo) ---
@app.route('/api/dashboard/resumo', methods=['GET'])
def get_resumo():
    conn = get_db()
    total_turmas = conn.execute('SELECT COUNT(*) as c FROM Turma').fetchone()['c']
    total_alunos = conn.execute('SELECT COUNT(*) as c FROM Aluno').fetchone()['c']
    
    por_turno = conn.execute('''
        SELECT t.turno, COUNT(a.idaluno) as count 
        FROM Turma t 
        LEFT JOIN Aluno a ON t.idturma = a.idturma 
        GROUP BY t.turno
    ''').fetchall()
    
    conn.close()
    
    return jsonify({
        "total_turmas": total_turmas,
        "total_alunos": total_alunos,
        "alunos_por_turno": [dict(row) for row in por_turno]
    })

# --- 4. Rotas de FORMULÁRIOS (Conselho de Classe) ---
@app.route('/api/forms', methods=['GET'])
def get_forms():
    conn = get_db()
    forms_db = conn.execute('SELECT * FROM Formulario').fetchall()
    conn.close()
    
    lista = []
    for f in forms_db:
        # Convertemos o texto JSON de volta para Objeto/Lista Python
        perguntas_list = []
        if f["perguntas"]:
            try:
                perguntas_list = json.loads(f["perguntas"])
            except:
                perguntas_list = []

        lista.append({
            "id": f["idformulario"],
            "titulo": f["titulo"],
            "descricao": f["descricao"],
            "perguntas": perguntas_list
        })
    return jsonify(lista)

@app.route('/api/forms', methods=['POST'])
def add_form():
    data = request.json
    conn = get_db()
    # Salvamos a lista de perguntas como TEXTO JSON no banco
    perguntas_json = json.dumps(data['perguntas'])
    
    conn.execute('INSERT INTO Formulario (titulo, descricao, perguntas) VALUES (?, ?, ?)',
                 (data['titulo'], data['descricao'], perguntas_json))
    conn.commit()
    conn.close()
    return jsonify({"message": "Formulário salvo"}), 201

@app.route('/api/forms/<int:id>', methods=['DELETE'])
def delete_form(id):
    conn = get_db()
    conn.execute('DELETE FROM Formulario WHERE idformulario = ?', (id,))
    # Opcional: Apagar respostas órfãs também
    conn.execute('DELETE FROM Resposta WHERE idformulario = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Formulário excluído"}), 200

# --- 5. Rotas de RESPOSTAS ---
@app.route('/api/respostas', methods=['GET'])
def get_respostas():
    conn = get_db()
    respostas_db = conn.execute('SELECT * FROM Resposta').fetchall()
    conn.close()
    
    lista = []
    for r in respostas_db:
        payload_obj = {}
        if r["payload"]:
            try:
                payload_obj = json.loads(r["payload"])
            except:
                payload_obj = {}

        lista.append({
            "id": r["idresposta"],
            "formId": r["idformulario"],
            "turmaId": r["idturma"],
            "alunoId": r["idaluno"],
            "payload": payload_obj,
            "data": r["data_resposta"]
        })
    return jsonify(lista)

@app.route('/api/respostas', methods=['POST'])
def add_resposta():
    data = request.json
    conn = get_db()
    payload_json = json.dumps(data['payload'])
    
    conn.execute('INSERT INTO Resposta (idformulario, idturma, idaluno, payload) VALUES (?, ?, ?, ?)',
                 (data['formId'], data['turmaId'], data['alunoId'], payload_json))
    conn.commit()
    conn.close()
    return jsonify({"message": "Resposta salva"}), 201

if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        init_db()
    app.run(debug=True, port=5000)
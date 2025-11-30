import os
import sqlite3
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
    conn.row_factory = sqlite3.Row # Permite acessar as colunas pelo nome (ex: row['nomealuno'])
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

# --- ROTAS DA API ---

# 1. Rotas de TURMAS (Task 1.4)
@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    conn = get_db()
    # Pega os dados usando os SEUS nomes de variáveis do banco
    turmas_db = conn.execute('SELECT * FROM Turma').fetchall()
    conn.close()
    
    # Converte para o formato que o Frontend espera (JSON)
    lista_turmas = []
    for t in turmas_db:
        lista_turmas.append({
            "id": t["idturma"],      # Banco: idturma -> Front: id
            "nome": t["nometurma"],  # Banco: nometurma -> Front: nome
            "ano": t["ano"],
            "turno": t["turno"]
        })
    return jsonify(lista_turmas)

@app.route('/api/turmas', methods=['POST'])
def add_turma():
    data = request.json
    conn = get_db()
    # Salva no banco usando os nomes corretos da tabela Turma
    conn.execute('INSERT INTO Turma (nometurma, ano, turno) VALUES (?, ?, ?)',
                 (data['nome'], data['ano'], data['turno']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Turma criada com sucesso"}), 201

# 2. Rotas de ALUNOS (Tasks 3.4 e 3.5)
@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    conn = get_db()
    alunos_db = conn.execute('SELECT * FROM Aluno').fetchall()
    conn.close()
    
    lista_alunos = []
    for a in alunos_db:
        # Cria a URL da foto para o frontend conseguir carregar
        foto_url = None
        if a['foto']:
            foto_url = f"http://127.0.0.1:5000/uploads/{a['foto']}"

        lista_alunos.append({
            "id": a["idaluno"],       # Banco: idaluno
            "nome": a["nomealuno"],   # Banco: nomealuno
            "matricula": a["matricula"],
            "turmaId": a["idturma"],  # Banco: idturma
            "foto": a["foto"],        # Banco: foto
            "foto_url": foto_url      # Extra: Link completo da imagem
        })
    return jsonify(lista_alunos)

@app.route('/api/alunos', methods=['POST'])
def add_aluno():
    # Recebe os dados do formulário (incluindo arquivo)
    nome = request.form.get('nome')
    matricula = request.form.get('matricula')
    turma_id = request.form.get('turmaId')
    
    foto_filename = None
    
    # Lógica de Upload da Imagem (Task 3.5)
    if 'foto' in request.files:
        file = request.files['foto']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Gera um nome único para não misturar fotos com mesmo nome
            import uuid
            unique_name = f"{uuid.uuid4().hex}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))
            foto_filename = unique_name

    conn = get_db()
    # Insere respeitando SUAS variáveis: nomealuno, idturma, foto
    conn.execute('INSERT INTO Aluno (nomealuno, matricula, idturma, foto) VALUES (?, ?, ?, ?)',
                 (nome, matricula, turma_id, foto_filename))
    conn.commit()
    conn.close()
    return jsonify({"message": "Aluno criado com sucesso"}), 201

# Rota para o navegador conseguir baixar/mostrar a imagem
@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config['UPLOAD_FOLDER'], name)

# 3. Rota de DADOS CONSOLIDADOS (Task 2.1)
@app.route('/api/dashboard/resumo', methods=['GET'])
def get_resumo():
    conn = get_db()
    # Conta quantos registros tem em cada tabela
    total_turmas = conn.execute('SELECT COUNT(*) as c FROM Turma').fetchone()['c']
    total_alunos = conn.execute('SELECT COUNT(*) as c FROM Aluno').fetchone()['c']
    
    # Agrupa alunos por turno (ex: Manhã: 10, Tarde: 5)
    # Faz o JOIN entre Aluno e Turma usando idturma
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

if __name__ == '__main__':
    # Cria o banco na primeira vez que rodar
    if not os.path.exists(DATABASE):
        init_db()
    app.run(debug=True, port=5000)
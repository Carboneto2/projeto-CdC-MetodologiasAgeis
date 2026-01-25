import os
import sqlite3
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# --- CONFIGURAÇÕES ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE = 'conselho.db'

# --- BANCO DE DADOS ---
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with open('flaskr/schema.sql', mode='r', encoding='utf-8') as f:
            db.cursor().executescript(f.read())
        db.commit()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- USUÁRIOS ---
def criar_usuario(login, senha, perfil):
    conn = get_db()
    senha_hash = generate_password_hash(senha)
    conn.execute(
        'INSERT INTO Usuarios (login, senha_hash, perfil) VALUES (?, ?, ?)',
        (login, senha_hash, perfil)
    )
    conn.commit()
    conn.close()

# ==========================================
#              ROTAS DA API
# ==========================================

# --- LOGIN ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')

    conn = get_db()
    usuario = conn.execute(
        'SELECT * FROM Usuarios WHERE login = ?',
        (login,)
    ).fetchone()
    conn.close()

    if usuario and check_password_hash(usuario['senha_hash'], senha):
        return jsonify({
            "message": "Login realizado com sucesso",
            "usuario": {
                "id": usuario["idusuario"],
                "login": usuario["login"],
                "perfil": usuario["perfil"]
            }
        }), 200

    return jsonify({"error": "Login ou senha inválidos"}), 401


# --- CRIAR USUÁRIOS (3.3) ---
@app.route('/api/usuarios', methods=['POST'])
def criar_usuario_api():
    data = request.json

    login = data.get('login')
    senha = data.get('senha')
    perfil = data.get('perfil')

    if not login or not senha or not perfil:
        return jsonify({"error": "Dados incompletos"}), 400

    if perfil not in ["Professor", "Coordenador"]:
        return jsonify({"error": "Perfil inválido"}), 400

    senha_hash = generate_password_hash(senha)

    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO Usuarios (login, senha_hash, perfil) VALUES (?, ?, ?)',
            (login, senha_hash, perfil)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Usuário criado com sucesso"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Usuário já existe"}), 409


# --- LISTAR USUÁRIOS (3.3) ---
@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    conn = get_db()
    usuarios_db = conn.execute(
        'SELECT idusuario, login, perfil FROM Usuarios'
    ).fetchall()
    conn.close()

    lista = []
    for u in usuarios_db:
        lista.append({
            "id": u["idusuario"],
            "login": u["login"],
            "perfil": u["perfil"]
        })

    return jsonify(lista), 200


# --- TURMAS ---
@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    conn = get_db()
    turmas_db = conn.execute('SELECT * FROM Turma').fetchall()
    conn.close()

    return jsonify([
        {
            "id": t["idturma"],
            "nome": t["nometurma"],
            "ano": t["ano"],
            "turno": t["turno"]
        } for t in turmas_db
    ])

@app.route('/api/turmas', methods=['POST'])
def add_turma():
    data = request.json
    conn = get_db()
    conn.execute(
        'INSERT INTO Turma (nometurma, ano, turno) VALUES (?, ?, ?)',
        (data['nome'], data['ano'], data['turno'])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Turma criada com sucesso"}), 201


# --- ALUNOS ---
@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    conn = get_db()
    alunos_db = conn.execute('SELECT * FROM Aluno').fetchall()
    conn.close()

    lista = []
    for a in alunos_db:
        foto_url = f"http://127.0.0.1:5000/uploads/{a['foto']}" if a['foto'] else None
        lista.append({
            "id": a["idaluno"],
            "nome": a["nomealuno"],
            "matricula": a["matricula"],
            "turmaId": a["idturma"],
            "foto_url": foto_url
        })
    return jsonify(lista)

@app.route('/api/alunos', methods=['POST'])
def add_aluno():
    nome = request.form.get('nome')
    matricula = request.form.get('matricula')
    turma_id = request.form.get('turmaId')

    foto_filename = None
    if 'foto' in request.files:
        file = request.files['foto']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            import uuid
            foto_filename = f"{uuid.uuid4().hex}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], foto_filename))

    conn = get_db()
    conn.execute(
        'INSERT INTO Aluno (nomealuno, matricula, idturma, foto) VALUES (?, ?, ?, ?)',
        (nome, matricula, turma_id, foto_filename)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Aluno criado com sucesso"}), 201

@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config['UPLOAD_FOLDER'], name)


# --- FORMULÁRIOS ---
@app.route('/api/forms', methods=['GET'])
def get_forms():
    conn = get_db()
    forms_db = conn.execute('SELECT * FROM Formulario').fetchall()
    conn.close()

    lista = []
    for f in forms_db:
        perguntas = json.loads(f["perguntas"]) if f["perguntas"] else []
        lista.append({
            "id": f["idformulario"],
            "titulo": f["titulo"],
            "descricao": f["descricao"],
            "perguntas": perguntas
        })
    return jsonify(lista)

@app.route('/api/forms', methods=['POST'])
def add_form():
    data = request.json
    conn = get_db()
    conn.execute(
        'INSERT INTO Formulario (titulo, descricao, perguntas) VALUES (?, ?, ?)',
        (data['titulo'], data['descricao'], json.dumps(data['perguntas']))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Formulário salvo"}), 201

@app.route('/api/forms/<int:id>', methods=['DELETE'])
def delete_form(id):
    conn = get_db()
    conn.execute('DELETE FROM Formulario WHERE idformulario = ?', (id,))
    conn.execute('DELETE FROM Resposta WHERE idformulario = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Formulário excluído"}), 200


# --- RESPOSTAS ---
@app.route('/api/respostas', methods=['POST'])
def add_resposta():
    data = request.json
    conn = get_db()
    conn.execute(
        'INSERT INTO Resposta (idformulario, idturma, idaluno, payload) VALUES (?, ?, ?, ?)',
        (data['formId'], data['turmaId'], data['alunoId'], json.dumps(data['payload']))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Resposta salva"}), 201


# --- MAIN ---
if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        init_db()
        criar_usuario('coordenador', '123456', 'Coordenador')
    app.run(debug=True, port=5000)

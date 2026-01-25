import sqlite3
import os
import json
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash

# Tenta importar o CORS (segurança de rotas)
try:
    from flask_cors import CORS
except ImportError:
    print("❌ ERRO: Instale o flask-cors: pip install flask-cors")
    exit(1)

app = Flask(__name__)
# Libera acesso para qualquer origem (Frontend React)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "conselho.db")

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row # Permite acessar colunas pelo nome
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# --- 1. ROTA DE INSTALAÇÃO (CRIA TABELAS E ADMIN) ---
@app.route('/init-db-forms', methods=['GET'])
def init_db_forms():
    conn = get_db()
    cursor = conn.cursor()
    
    # Tabela de Usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Usuario (
            idusuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            login TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            perfil TEXT NOT NULL
        )
    ''')

    # Tabela de Formulários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Formulario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            perguntas_json TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Tabela de Respostas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Resposta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            formulario_id INTEGER NOT NULL,
            turma_id TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Cria ADMIN padrão se não existir (Login: admin / Senha: 123)
    cursor.execute('SELECT * FROM Usuario WHERE login = ?', ('admin',))
    if cursor.fetchone() is None:
        senha_hash = generate_password_hash('123')
        cursor.execute(
            'INSERT INTO Usuario (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)',
            ('Administrador Principal', 'admin', senha_hash, 'Coordenador')
        )
        print("✅ Usuário Admin criado (admin/123)")

    conn.commit()
    conn.close()
    return jsonify({'mensagem': 'Banco de dados atualizado com sucesso!'}), 200


# --- 2. ROTAS DE AUTENTICAÇÃO (LOGIN) ---
@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    login_user = dados.get('login')
    senha_user = dados.get('senha')

    conn = get_db()
    usuario = conn.execute('SELECT * FROM Usuario WHERE login = ?', (login_user,)).fetchone()
    conn.close()

    if usuario is None or not check_password_hash(usuario['senha_hash'], senha_user):
        return jsonify({'erro': 'Usuário ou senha inválidos.'}), 401

    return jsonify({
        'mensagem': 'Login realizado!',
        'usuario': {
            'id': usuario['idusuario'],
            'nome': usuario['nome'],
            'login': usuario['login'],
            'perfil': usuario['perfil']
        }
    }), 200


# --- 3. ROTAS DE GESTÃO DE USUÁRIOS (NOVO!) ---

# Listar Usuários (Para tabela do Admin)
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    conn = get_db()
    # Retorna ID, Nome, Login e Perfil (oculta a senha)
    users = conn.execute('SELECT idusuario, nome, login, perfil FROM Usuario').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users]), 200

# Criar Usuário (Admin cadastra Docentes, NAE, etc.)
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    dados = request.json
    nome = dados.get('nome')
    login = dados.get('login')
    senha = dados.get('senha')
    perfil = dados.get('perfil')

    if not all([nome, login, senha, perfil]):
        return jsonify({'erro': 'Preencha todos os campos!'}), 400

    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO Usuario (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)',
            (nome, login, generate_password_hash(senha), perfil)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'erro': 'Login já existe. Escolha outro.'}), 409
    
    conn.close()
    return jsonify({'mensagem': 'Usuário criado com sucesso!'}), 201

# Excluir Usuário
@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    conn = get_db()
    conn.execute('DELETE FROM Usuario WHERE idusuario = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensagem': 'Usuário excluído com sucesso!'}), 200


# --- 4. ROTAS DE FORMULÁRIOS (MODELOS) ---

# Listar e Criar Formulários
@app.route('/formularios', methods=['GET', 'POST'])
def gerenciar_formularios():
    conn = get_db()
    
    if request.method == 'POST':
        # Criar Novo
        d = request.json
        if not d.get('titulo') or not d.get('perguntas'):
            return jsonify({'erro': 'Título e perguntas obrigatórios'}), 400
            
        conn.execute(
            'INSERT INTO Formulario (titulo, descricao, perguntas_json) VALUES (?, ?, ?)',
            (d['titulo'], d['descricao'], json.dumps(d['perguntas']))
        )
        conn.commit()
        msg = 'Formulário salvo!'
        status = 201
    else:
        # Listar Todos
        rows = conn.execute('SELECT * FROM Formulario ORDER BY id DESC').fetchall()
        # Converte a string JSON de volta para lista
        lista = []
        for r in rows:
            lista.append({
                'id': r['id'],
                'titulo': r['titulo'],
                'descricao': r['descricao'],
                'perguntas': json.loads(r['perguntas_json'])
            })
        return jsonify(lista), 200
        
    conn.close()
    if request.method == 'POST':
        return jsonify({'mensagem': msg}), status

# Excluir Formulário
@app.route('/formularios/<int:id>', methods=['DELETE'])
def deletar_formulario(id):
    conn = get_db()
    conn.execute('DELETE FROM Formulario WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensagem': 'Formulário excluído!'}), 200


# --- 5. ROTAS DE RESPOSTAS (PREENCHIMENTO) ---
@app.route('/respostas', methods=['POST'])
def salvar_resposta():
    dados = request.json
    form_id = dados.get('formulario_id')
    turma_id = dados.get('turma_id')
    payload = dados.get('payload') # As respostas das perguntas

    if not form_id or not turma_id:
        return jsonify({'erro': 'Faltam dados (ID Form ou Turma)'}), 400

    conn = get_db()
    conn.execute(
        'INSERT INTO Resposta (formulario_id, turma_id, payload_json) VALUES (?, ?, ?)',
        (form_id, str(turma_id), json.dumps(payload))
    )
    conn.commit()
    conn.close()
    return jsonify({'mensagem': 'Resposta salva com sucesso!'}), 201

# --- ROTA PARA LER TODAS AS RESPOSTAS (RELATÓRIOS) ---
@app.route('/respostas', methods=['GET'])
def listar_respostas():
    conn = get_db()
    # Pega todas as respostas
    rows = conn.execute('''
        SELECT r.id, r.formulario_id, r.turma_id, r.payload_json, r.data_envio, 
               f.titulo as form_titulo 
        FROM Resposta r
        JOIN Formulario f ON r.formulario_id = f.id
        ORDER BY r.data_envio DESC
    ''').fetchall()
    conn.close()

    lista = []
    for r in rows:
        lista.append({
            'id': r['id'],
            'formulario_id': r['formulario_id'],
            'form_titulo': r['form_titulo'],
            'turma_id': r['turma_id'],
            'data': r['data_envio'],
            'respostas': json.loads(r['payload_json']) # Converte o texto JSON de volta para Objeto
        })

    return jsonify(lista), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
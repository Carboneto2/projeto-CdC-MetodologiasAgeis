import sqlite3
import os
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
# Tenta importar o CORS. Se der erro, avisa no terminal para instalar.
try:
    from flask_cors import CORS
except ImportError:
    print("\n❌ ERRO CRÍTICO: A biblioteca 'flask-cors' não está instalada.")
    print("👉 Pare o servidor e rode: pip install flask-cors\n")
    exit(1)

app = Flask(__name__)

# --- CONFIGURAÇÃO DO CORS (LIBERA GERAL) ---
# Isso permite que o Frontend (porta 5173) converse com o Backend (porta 5000)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuração do Banco de Dados
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "conselho.db")

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# --- ROTAS DE AUTENTICAÇÃO (LOGIN) ---
@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    login_user = dados.get('login')
    senha_user = dados.get('senha')

    conn = get_db()
    cursor = conn.cursor()
    usuario = cursor.execute('SELECT * FROM Usuario WHERE login = ?', (login_user,)).fetchone()
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

# --- ROTAS DE USUÁRIOS (CADASTRO) ---
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    dados = request.json
    nome = dados.get('nome')
    login = dados.get('login')
    senha = dados.get('senha')
    perfil = dados.get('perfil')

    if not all([nome, login, senha, perfil]):
        return jsonify({'erro': 'Preencha todos os campos!'}), 400

    senha_criptografada = generate_password_hash(senha)

    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO Usuario (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)',
            (nome, login, senha_criptografada, perfil)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'erro': 'Este login já existe. Tente outro.'}), 409
    
    conn.close()
    return jsonify({'mensagem': 'Usuário criado com sucesso!'}), 201

# --- ROTAS DE ALUNOS E TURMAS (DO SEU PROJETO ANTIGO) ---
# (Você pode adicionar suas rotas antigas aqui depois se precisar)

if __name__ == '__main__':
    # Roda o servidor na porta 5000 e mostra erros na tela (debug=True)
    app.run(debug=True, port=5000)
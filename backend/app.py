import sqlite3
import os
import json
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
# LIBERA GERAL O CORS
CORS(app, resources={r"/*": {"origins": "*"}})

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

# --- FUNÇÃO QUE CRIA O BANCO SOZINHA ---
def init_db_automatico():
    with app.app_context():
        conn = get_db()
        cursor = conn.cursor()
        print("--- 🔨 VERIFICANDO TABELAS DO BANCO... ---")
        
        # 1. Tabela Usuario
        cursor.execute('CREATE TABLE IF NOT EXISTS Usuario (idusuario INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, login TEXT UNIQUE, senha_hash TEXT, perfil TEXT)')
        
        # 2. Tabela Formulario
        cursor.execute('CREATE TABLE IF NOT EXISTS Formulario (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT, perguntas_json TEXT, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
        
        # 3. Tabela Resposta
        cursor.execute('CREATE TABLE IF NOT EXISTS Resposta (id INTEGER PRIMARY KEY AUTOINCREMENT, formulario_id INTEGER, turma_id TEXT, payload_json TEXT, data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
        
        # 4. Cria Admin se não existir
        cursor.execute('SELECT * FROM Usuario WHERE login = ?', ('admin',))
        if cursor.fetchone() is None:
            cursor.execute('INSERT INTO Usuario (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)', ('Admin', 'admin', generate_password_hash('123'), 'Coordenador'))
            print("--- 👤 ADMIN CRIADO (admin/123) ---")
            
        conn.commit()
        print("--- ✅ TABELAS PRONTAS E VERIFICADAS ---")

# --- ROTAS DE FORMULÁRIOS ---
@app.route('/formularios', methods=['GET', 'POST'])
def formularios():
    conn = get_db()
    if request.method == 'POST':
        d = request.json
        conn.execute('INSERT INTO Formulario (titulo, descricao, perguntas_json) VALUES (?, ?, ?)', 
                     (d.get('titulo'), d.get('descricao'), json.dumps(d.get('perguntas'))))
        conn.commit()
        msg = {'msg': 'Salvo!'}
        status = 201
    else:
        rows = conn.execute('SELECT * FROM Formulario ORDER BY id DESC').fetchall()
        lista = []
        for r in rows:
            try:
                perguntas = json.loads(r['perguntas_json'])
            except:
                perguntas = []
            lista.append({'id': r['id'], 'titulo': r['titulo'], 'descricao': r['descricao'], 'perguntas': perguntas})
        msg = lista
        status = 200
    conn.close()
    return jsonify(msg), status

@app.route('/formularios/<int:id>', methods=['PUT', 'DELETE'])
def formulario_detalhe(id):
    try:
        db = get_db()

        if request.method == 'PUT':
            data = request.get_json()

            titulo = data.get('titulo')
            descricao = data.get('descricao')
            perguntas = json.dumps(data.get('perguntas', []))

            db.execute(
                """
                UPDATE Formulario
                SET titulo = ?, descricao = ?, perguntas_json = ?
                WHERE id = ?
                """,
                (titulo, descricao, perguntas, id)
            )
            db.commit()

            return jsonify({"message": "Formulário atualizado com sucesso"}), 200

        if request.method == 'DELETE':
            db.execute("DELETE FROM Formulario WHERE id = ?", (id,))
            db.commit()

            return jsonify({"message": "Formulário excluído com sucesso"}), 200

    except Exception as e:
        print("ERRO FORMULÁRIO DETALHE:", e)
        return jsonify({"error": str(e)}), 500


# --- ROTAS DE USUÁRIOS (ESTAVA FALTANDO ISTO AQUI!) ---
@app.route('/usuarios', methods=['GET', 'POST'])
def usuarios():
    conn = get_db()
    if request.method == 'POST':
        # Criar Usuário
        d = request.json
        try:
            conn.execute('INSERT INTO Usuario (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)',
                        (d['nome'], d['login'], generate_password_hash(d['senha']), d['perfil']))
            conn.commit()
            res = jsonify({'msg': 'Criado'}), 201
        except sqlite3.IntegrityError:
            res = jsonify({'erro': 'Login já existe'}), 409
        except Exception as e:
            res = jsonify({'erro': str(e)}), 400
    else:
        # Listar Usuários
        rows = conn.execute('SELECT idusuario, nome, login, perfil FROM Usuario').fetchall()
        res = jsonify([dict(r) for r in rows]), 200
    conn.close()
    return res

@app.route('/usuarios/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    conn = get_db()
    conn.execute('DELETE FROM Usuario WHERE idusuario = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'msg': 'Deletado'}), 200

# --- ROTAS DE LOGIN E RESPOSTAS ---
@app.route('/login', methods=['POST'])
def login():
    d = request.json
    conn = get_db()
    u = conn.execute('SELECT * FROM Usuario WHERE login = ?', (d.get('login'),)).fetchone()
    conn.close()
    if u and check_password_hash(u['senha_hash'], d.get('senha')):
        return jsonify({'usuario': {'nome': u['nome'], 'perfil': u['perfil'], 'login': u['login']}}), 200
    return jsonify({'erro': 'Login falhou'}), 401

# --- SUBSTITUA APENAS A ROTA DE RESPOSTAS ---
@app.route('/respostas', methods=['GET', 'POST'])
def respostas():
    conn = get_db()
    if request.method == 'POST':
        d = request.json
        conn.execute('INSERT INTO Resposta (formulario_id, turma_id, payload_json) VALUES (?,?,?)',
                     (d['formulario_id'], str(d['turma_id']), json.dumps(d['payload'])))
        conn.commit()
        conn.close()
        return jsonify({'msg': 'Recebido'}), 201
    else:
        # Busca respostas e o título do formulário
        rows = conn.execute('SELECT r.*, f.titulo as form_titulo FROM Resposta r JOIN Formulario f ON r.formulario_id = f.id').fetchall()
        conn.close()
        
        # --- AQUI ESTAVA O ERRO: FALTAVA O 'formulario_id' ---
        lista_respostas = []
        for r in rows:
            lista_respostas.append({
                'id': r['id'],
                'formulario_id': r['formulario_id'],  # <--- LINHA ADICIONADA (CRUCIAL!)
                'form_titulo': r['form_titulo'],
                'turma_id': r['turma_id'],
                'respostas': json.loads(r['payload_json'])
            })
            
        return jsonify(lista_respostas), 200

@app.route('/turmas', methods=['GET'])
def listar_turmas_dash():
    # Se você tiver uma tabela de turmas no banco, use o SELECT. 
    # Caso contrário, retorne uma lista fixa baseada nos nomes que você já usa.
    conn = get_db()
    rows = conn.execute('SELECT id, nome FROM Turma').fetchall() # Ajuste se sua tabela for diferente
    conn.close()
    return jsonify([dict(r) for r in rows]), 200

if __name__ == '__main__':
    # Não vamos apagar o banco dessa vez, só rodar
    init_db_automatico() 
    print("--- 🚀 SERVIDOR COMPLETO RODANDO ---")
    app.run(debug=True, port=5000)
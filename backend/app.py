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
        
        # 2. Tabela Formulario (COM A COLUNA PERGUNTAS_JSON GARANTIDA)
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

# --- ROTAS ---
@app.route('/formularios', methods=['GET', 'POST'])
def formularios():
    conn = get_db()
    if request.method == 'POST':
        d = request.json
        # Garante que perguntas_json seja salvo como STRING JSON
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
                # Tenta converter o JSON. Se der erro no banco, retorna lista vazia pra não travar.
                perguntas = json.loads(r['perguntas_json'])
            except:
                perguntas = []
            lista.append({'id': r['id'], 'titulo': r['titulo'], 'descricao': r['descricao'], 'perguntas': perguntas})
        msg = lista
        status = 200
    conn.close()
    return jsonify(msg), status

@app.route('/formularios/<int:id>', methods=['DELETE'])
def delete_form(id):
    conn = get_db()
    conn.execute('DELETE FROM Formulario WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'msg': 'Deletado'}), 200

@app.route('/login', methods=['POST'])
def login():
    d = request.json
    conn = get_db()
    u = conn.execute('SELECT * FROM Usuario WHERE login = ?', (d.get('login'),)).fetchone()
    conn.close()
    if u and check_password_hash(u['senha_hash'], d.get('senha')):
        return jsonify({'usuario': {'nome': u['nome'], 'perfil': u['perfil'], 'login': u['login']}}), 200
    return jsonify({'erro': 'Login falhou'}), 401

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
        rows = conn.execute('SELECT r.*, f.titulo as form_titulo FROM Resposta r JOIN Formulario f ON r.formulario_id = f.id').fetchall()
        conn.close()
        return jsonify([{'id':r['id'], 'form_titulo':r['form_titulo'], 'turma_id':r['turma_id'], 'respostas':json.loads(r['payload_json'])} for r in rows]), 200

# --- INICIALIZAÇÃO ---
if __name__ == '__main__':
    # APAGA O BANCO VELHO PRA GARANTIR (SO RODANDO LOCALMENTE)
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
        print("--- 🗑️ BANCO ANTIGO DELETADO AUTOMATICAMENTE ---")
    
    # CRIA O NOVO
    init_db_automatico()
    
    print("--- 🚀 SERVIDOR RODANDO AGORA ---")
    app.run(debug=True, port=5000)
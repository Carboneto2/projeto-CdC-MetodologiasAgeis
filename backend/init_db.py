import sqlite3
import os
from werkzeug.security import generate_password_hash

# Configurações de caminhos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "conselho.db") 
SCHEMA_FILE = os.path.join(BASE_DIR, "flaskr/schema.sql")

def init_db():
    print("🔄 Iniciando configuração do banco de dados (Tarefa 3.1)...")

    # 1. Remove banco antigo para garantir que a nova tabela Usuario seja criada
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print("🗑️  Banco antigo removido.")

    # 2. Cria conexão e tabelas
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    cursor.executescript(sql_script)
    print("✅ Tabela 'Usuario' criada com sucesso.")

    # 3. Cria o Usuário Admin Padrão
    senha_criptografada = generate_password_hash("123456")
    
    cursor.execute(
        "INSERT INTO Usuario (nome, login, senha_hash, perfil) VALUES (?, ?, ?, ?)",
        ("Administrador", "admin", senha_criptografada, "coordenador")
    )
    print("👤 Usuário 'admin' criado (Senha: 123456).")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
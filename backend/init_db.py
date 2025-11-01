import sqlite3
import json
import os

DB_FILE = "banco.db"
SCHEMA_FILE = "flaskr/schema.sql"  
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)
    print("Banco de dados antigo removido.")

try:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    print(f"Banco de dados '{DB_FILE}' criado.")

    with open(SCHEMA_FILE, 'r') as f:
        sql_script = f.read()
    
    cursor.executescript(sql_script)
    print("Schema executado e tabelas criadas.")

    conn.commit() # Salva as alterações

except sqlite3.Error as e:
    print(f"Ocorreu um erro ao executar o schema: {e}")
finally:
    if conn:
        conn.close()

print("Configuração inicial do banco de dados concluída.")
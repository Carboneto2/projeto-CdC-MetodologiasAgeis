import sqlite3
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_FILE = os.path.join(BASE_DIR, "banco.db")
SCHEMA_FILE = os.path.join(BASE_DIR, "flaskr/schema.sql")
JSON_TURMAS = os.path.join(BASE_DIR, "dados/turmas.json")
JSON_ALUNOS = os.path.join(BASE_DIR, "dados/alunos.json")
JSON_FORM = os.path.join(BASE_DIR, "dados/formulario_conselho.json")


print("Iniciando configuração do banco de dados...")

if os.path.exists(DB_FILE):
    os.remove(DB_FILE)
    print(f"Banco de dados antigo '{DB_FILE}' removido.")

conn = None
try:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    print(f"Banco de dados '{DB_FILE}' criado.")

    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    cursor.executescript(sql_script)
    print("Schema executado e tabelas criadas.")

    conn.commit()

except sqlite3.Error as e:
    print(f"Ocorreu um erro ao executar o schema: {e}")
    if conn:
        conn.rollback()
finally:
    if conn:
        conn.close()
        print("Conexão com o banco (Schema) fechada.")


print("\nIniciando a inserção de dados dos JSONs...")

conn = None
try:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    with open(JSON_TURMAS, 'r', encoding='utf-8') as f:
        dados_turmas = json.load(f)
    
    sql_insert_turma = "INSERT INTO Turma (nometurma, ano, turno) VALUES (?, ?, ?)"
    for turma in dados_turmas:
        cursor.execute(sql_insert_turma, (turma['nometurma'], turma['ano'], turma['turno']))
    print(f"-> {len(dados_turmas)} turmas inseridas com sucesso.")


    with open(JSON_ALUNOS, 'r', encoding='utf-8') as f:
        dados_alunos = json.load(f)

    sql_insert_aluno = "INSERT INTO Aluno (nomealuno, matricula) VALUES (?, ?)"
    for aluno in dados_alunos:
        cursor.execute(sql_insert_aluno, (aluno['nomealuno'], aluno['matricula']))
    print(f"-> {len(dados_alunos)} alunos inseridos com sucesso.")


    with open(JSON_FORM, 'r', encoding='utf-8') as f:
        dados_form = json.load(f)
    
    form_info = dados_form['formulario']
    sql_insert_form = "INSERT INTO Formulario (titulo, descricao) VALUES (?, ?)"
    cursor.execute(sql_insert_form, (form_info['titulo'], form_info['descricao']))
    
    id_formulario_atual = cursor.lastrowid
    print(f"-> Formulário '{form_info['titulo']}' inserido (ID: {id_formulario_atual}).")

    perguntas_inseridas = 0
    for pergunta in dados_form['perguntas']:
        tipo = pergunta['tipo']
        
        if tipo == "TextoCurto":
            sql = "INSERT INTO TextoCurto (idformulario, enunciado) VALUES (?, ?)"
            cursor.execute(sql, (id_formulario_atual, pergunta['enunciado']))
            perguntas_inseridas += 1

        elif tipo == "TextoLongo":
            sql = "INSERT INTO TextoLongo (idformulario, enunciado) VALUES (?, ?)"
            cursor.execute(sql, (id_formulario_atual, pergunta['enunciado']))
            perguntas_inseridas += 1
            
        elif tipo == "Escala":
            sql = "INSERT INTO Escala (idformulario, enunciado, escalamin, escalamax) VALUES (?, ?, ?, ?)"
            cursor.execute(sql, (id_formulario_atual, pergunta['enunciado'], pergunta['escalamin'], pergunta['escalamax']))
            perguntas_inseridas += 1

        elif tipo == "MultiplaEscolha":
            sql_me = "INSERT INTO MultiplaEscolha (idformulario, enunciado) VALUES (?, ?)"
            cursor.execute(sql_me, (id_formulario_atual, pergunta['enunciado']))
            
            id_pergunta_me_atual = cursor.lastrowid
            perguntas_inseridas += 1
            
            sql_alt = "INSERT INTO Alternativa (idmultiplaescolha, alternativa) VALUES (?, ?)"
            for alt_texto in pergunta['alternativas']:
                cursor.execute(sql_alt, (id_pergunta_me_atual, alt_texto))
                
    print(f"-> {perguntas_inseridas} perguntas inseridas no formulário.")

    conn.commit()
    print("\nDados dos JSONs salvos no banco com sucesso!")

except Exception as e:
    print(f"!!! Ocorreu um erro ao inserir dados do JSON: {e}")
    if conn:
        conn.rollback()
finally:
    if conn:
        conn.close()
        print("Conexão com o banco (JSONs) fechada.")

print("\nConfiguração inicial do banco de dados concluída.")
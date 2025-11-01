from flask import Flask, render_template, jsonify
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(BASE_DIR, 'banco.db')



app = Flask(
    __name__,
    template_folder="../frontend/dist",
    static_folder="../frontend/dist/assets"
)


def get_db_conn():
    conn = sqlite3.connect(DB_PATH) 
    conn.row_factory = sqlite3.Row 
    return conn

@app.route("/api/turmas")
def get_turmas():
    try:
        conn = get_db_conn()
        turmas = conn.execute("SELECT * FROM Turma").fetchall()
        conn.close()
        return jsonify([dict(row) for row in turmas])
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/api/alunos")
def get_alunos():
    try:
        conn = get_db_conn()
        alunos = conn.execute("SELECT * FROM Aluno").fetchall()
        conn.close()
        return jsonify([dict(row) for row in alunos])
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/api/forms")
def get_forms():
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        forms = conn.execute("SELECT * FROM Formulario").fetchall()
        
        resultado_final = []

        for form_row in forms:
            form_dict = dict(form_row)
            id_formulario = form_dict['idformulario']
            
            perguntas_final = []

            perguntas_tc = conn.execute("SELECT * FROM TextoCurto WHERE idformulario = ?", (id_formulario,)).fetchall()
            for p in perguntas_tc:
                perguntas_final.append({"id": p['idtextocurto'], "tipo": "texto", **dict(p)})

            perguntas_tl = conn.execute("SELECT * FROM TextoLongo WHERE idformulario = ?", (id_formulario,)).fetchall()
            for p in perguntas_tl:
                perguntas_final.append({"id": p['idtextolongo'], "tipo": "texto_longo", **dict(p)})

            perguntas_escala = conn.execute("SELECT * FROM Escala WHERE idformulario = ?", (id_formulario,)).fetchall()
            for p in perguntas_escala:
                perguntas_final.append({"id": p['idescala'], "tipo": "escala", **dict(p)})

            perguntas_me = conn.execute("SELECT * FROM MultiplaEscolha WHERE idformulario = ?", (id_formulario,)).fetchall()
            for p_me in perguntas_me:
                pergunta_me_dict = {"id": p_me['idmultiplaescolha'], "tipo": "multipla", **dict(p_me), "opcoes": []}
                
                id_pergunta_me = p_me['idmultiplaescolha']
                alternativas = conn.execute("SELECT * FROM Alternativa WHERE idmultiplaescolha = ?", (id_pergunta_me,)).fetchall()
                
                for alt in alternativas:
                    pergunta_me_dict["opcoes"].append(alt['alternativa'])
                
                perguntas_final.append(pergunta_me_dict)
            
            form_dict["perguntas"] = perguntas_final
            resultado_final.append(form_dict)

        conn.close()
        return jsonify(resultado_final)
        
    except Exception as e:
        print(e)
        return jsonify({"erro": str(e)}), 500


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
  
    return render_template("index.html") 

if __name__ == "__main__":
    app.run(debug=True)
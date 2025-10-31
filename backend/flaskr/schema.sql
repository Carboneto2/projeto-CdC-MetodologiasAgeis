CREATE TABLE IF NOT EXISTS Turma{
    idturma INTEGER PRIMARY KEY AUTOINCREMENT,
    nometurma varchar(30) NOT NULL,
    ano varchar(20) NOT NULL,
    turno varchar(6) NOT NULL,
};

CREATE TABLE IF NOT EXISTS Aluno{
    idaluno INTEGER PRIMARY KEY AUTOINCREMENT,
    nomealuno varchar(100) NOT NULL,
    matricula varchar(30)
};

CREATE TABLE IF NOT EXISTS Formulario{
    idformulario INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo varchar(100) NOT NULL,
    descricao varchar(512) NOT NULL
};
/*Perguntas*/
---Contem apenas perguntas e parametros de resposta, se necessarios---

CREATE TABLE IF NOT EXISTS TextoCurto{
    idtextocurto INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario),
    enunciado varchar(256) NOT NULL
};

CREATE TABLE IF NOT EXISTS TextoLongo{
    idtextolongo INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario),
    enunciado varchar(256) NOT NULL
};

---Tables multipla escolha---
CREATE TABLE IF NOT EXISTS MultiplaEscolha{
    idmultiplaescolha INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario),
    enunciado varchar(256) NOT NULL
};

CREATE TABLE IF NOT EXISTS Alternativa{
    FOREIGN KEY(idmultiplaescolha) REFERENCES MultiplaEscolha(idmultiplaescolha) PRIMARY KEY,
    alternativa varchar(64) NOT NULL
};

---Table escala---
CREATE TABLE IF NOT EXISTS Escala{
    idescala INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario),
    enunciado varchar(256) NOT NULL,
};
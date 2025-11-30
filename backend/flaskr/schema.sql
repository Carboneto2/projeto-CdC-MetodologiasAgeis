/* --- Tabelas de Entidades Básicas --- */

CREATE TABLE IF NOT EXISTS Turma (
    idturma INTEGER PRIMARY KEY AUTOINCREMENT,
    nometurma varchar(30) NOT NULL,
    ano varchar(20) NOT NULL,
    turno varchar(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS Aluno (
    idaluno INTEGER PRIMARY KEY AUTOINCREMENT,
    nomealuno varchar(100) NOT NULL,
    matricula varchar(30),
    idturma INTEGER,       -- ADICIONADO: Para vincular à tabela Turma
    foto varchar(255),
    FOREIGN KEY(idturma) REFERENCES Turma(idturma)     -- ADICIONADO: Para a Task 3.4
);

/* ----------------------------------- */
/* --- TABELAS PARA CRIAR FORMULÁRIOS --- */
/* ----------------------------------- */

CREATE TABLE IF NOT EXISTS Formulario (
    idformulario INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo varchar(100) NOT NULL,
    descricao varchar(512) NOT NULL,
    perguntas TEXT -- Vamos salvar todas as perguntas como um JSON aqui
);

/* --- Tabelas de Perguntas --- */

CREATE TABLE IF NOT EXISTS TextoCurto (
    idtextocurto INTEGER PRIMARY KEY AUTOINCREMENT,
    idformulario INTEGER,
    enunciado varchar(256) NOT NULL,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario)
);

CREATE TABLE IF NOT EXISTS TextoLongo (
    idtextolongo INTEGER PRIMARY KEY AUTOINCREMENT,
    idformulario INTEGER,
    enunciado varchar(256) NOT NULL,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario)
);

CREATE TABLE IF NOT EXISTS MultiplaEscolha (
    idmultiplaescolha INTEGER PRIMARY KEY AUTOINCREMENT,
    idformulario INTEGER,
    enunciado varchar(256) NOT NULL,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario)
);

CREATE TABLE IF NOT EXISTS Alternativa (
    idalternativa INTEGER PRIMARY KEY AUTOINCREMENT,
    idmultiplaescolha INTEGER,
    alternativa varchar(64) NOT NULL,
    FOREIGN KEY(idmultiplaescolha) REFERENCES MultiplaEscolha(idmultiplaescolha)
);

CREATE TABLE IF NOT EXISTS Escala (
    idescala INTEGER PRIMARY KEY AUTOINCREMENT,
    idformulario INTEGER,
    enunciado varchar(256) NOT NULL,
    escalamin INTEGER NOT NULL,
    escalamax INTEGER NOT NULL,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario)
);

/* ----------------------------------- */
/* --- TABELAS PARA ARMAZENAR RESPOSTAS --- */
/* ----------------------------------- */

CREATE TABLE IF NOT EXISTS Resposta (
    idresposta INTEGER PRIMARY KEY AUTOINCREMENT,
    idformulario INTEGER NOT NULL,
    idturma INTEGER NOT NULL,
    idaluno INTEGER NOT NULL,
    payload TEXT, -- As respostas também serão salvas como JSON
    data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario),
    FOREIGN KEY(idturma) REFERENCES Turma(idturma),
    FOREIGN KEY(idaluno) REFERENCES Aluno(idaluno)
);

CREATE TABLE IF NOT EXISTS Resposta_TextoCurto (
    idresposta_textocurto INTEGER PRIMARY KEY AUTOINCREMENT,
    idresposta INTEGER NOT NULL,
    idtextocurto INTEGER NOT NULL,
    resposta_texto VARCHAR(255),
    FOREIGN KEY(idresposta) REFERENCES Resposta(idresposta),
    FOREIGN KEY(idtextocurto) REFERENCES TextoCurto(idtextocurto)
);

CREATE TABLE IF NOT EXISTS Resposta_TextoLongo (
    idresposta_textolongo INTEGER PRIMARY KEY AUTOINCREMENT,
    idresposta INTEGER NOT NULL,
    idtextolongo INTEGER NOT NULL,
    resposta_texto TEXT,
    FOREIGN KEY(idresposta) REFERENCES Resposta(idresposta),
    FOREIGN KEY(idtextolongo) REFERENCES TextoLongo(idtextolongo)
);

CREATE TABLE IF NOT EXISTS Resposta_MultiplaEscolha (
    idresposta_multiplaescolha INTEGER PRIMARY KEY AUTOINCREMENT,
    idresposta INTEGER NOT NULL,
    idmultiplaescolha INTEGER NOT NULL,
    idalternativa INTEGER NOT NULL,
    FOREIGN KEY(idresposta) REFERENCES Resposta(idresposta),
    FOREIGN KEY(idmultiplaescolha) REFERENCES MultiplaEscolha(idmultiplaescolha),
    FOREIGN KEY(idalternativa) REFERENCES Alternativa(idalternativa)
);

CREATE TABLE IF NOT EXISTS Resposta_Escala (
    idresposta_escala INTEGER PRIMARY KEY AUTOINCREMENT,
    idresposta INTEGER NOT NULL,
    idescala INTEGER NOT NULL,
    resposta_valor INTEGER NOT NULL,
    FOREIGN KEY(idresposta) REFERENCES Resposta(idresposta),
    FOREIGN KEY(idescala) REFERENCES Escala(idescala)
);
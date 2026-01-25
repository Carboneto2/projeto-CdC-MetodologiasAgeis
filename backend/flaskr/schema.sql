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
    idturma INTEGER,
    foto varchar(255),
    FOREIGN KEY(idturma) REFERENCES Turma(idturma)
);

/* ============================= */
/* === USUÁRIOS (REQ 3.1) ====== */
/* ============================= */

CREATE TABLE IF NOT EXISTS Usuarios (
    idusuario INTEGER PRIMARY KEY AUTOINCREMENT,
    login VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('Professor', 'Coordenador'))
);

/* ----------------------------------- */
/* --- TABELAS PARA CRIAR FORMULÁRIOS --- */
/* ----------------------------------- */

CREATE TABLE IF NOT EXISTS Formulario (
    idformulario INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo varchar(100) NOT NULL,
    descricao varchar(512) NOT NULL,
    perguntas TEXT
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
    idaluno INTEGER,
    payload TEXT,
    data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(idformulario) REFERENCES Formulario(idformulario),
    FOREIGN KEY(idturma) REFERENCES Turma(idturma),
    FOREIGN KEY(idaluno) REFERENCES Aluno(idaluno)
);

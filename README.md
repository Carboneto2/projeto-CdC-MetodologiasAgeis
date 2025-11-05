# Projeto Conselho de Classe (CdC)

Este é um projeto de aplicação web full-stack desenvolvido para digitalizar e otimizar o processo de Conselho de Classe em escolas. Ele permite o cadastro de turmas, alunos e a criação e preenchimento de formulários de avaliação personalizados.

O projeto é dividido em uma API de backend (Flask/Python) e uma interface de frontend (React/Vite).

---

## 🚀 Tecnologias Utilizadas

* **Backend:**
    * **Python 3**
    * **Flask** (Como servidor de API)
    * **Flask-CORS** (Necessário para o modo de desenvolvimento)
    * **SQLite** (Banco de dados)
* **Frontend:**
    * **React 19**
    * **Vite** (Ambiente de desenvolvimento)
    * **Tailwind CSS** (Para estilização)

---

## 🏁 Como Rodar o Projeto

Para rodar este projeto, você precisará ter **Python** e **Node.js** (com `npm`) instalados na sua máquina.

### Passo 1: Configuração Inicial (Feito apenas uma vez)

Antes de rodar o projeto, você precisa preparar o backend e o frontend.

**1. Configurar o Backend (Banco de Dados):**
```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. (Recomendado) Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate  # (No Windows: .\venv\Scripts\activate)

# 3. Instale as dependências do Python
pip install Flask flask-cors

# 4. CRIE E POPULE O BANCO DE DADOS (Passo Essencial!)
# Este comando executa o script init_db.py
python init_db.py
```
*(Este último passo criará o arquivo `banco.db` e o populará com os dados de exemplo das pastas `dados/`).*

**2. Configurar o Frontend:**
```bash
# 1. Em um NOVO terminal, navegue até a pasta do frontend
cd frontend

# 2. Instale as dependências do Node.js
npm install
```

---

### Passo 2: Executando em Modo de Desenvolvimento (Recomendado)

Este modo permite que você veja as alterações no código em tempo real (hot-reload). Você precisará de **dois terminais** abertos.

**Terminal 1 (Rodando o Backend API):**
```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Ative o ambiente virtual
source venv/bin/activate

# 3. Inicie o servidor da API Flask
python app.py
```
*O backend estará rodando em `http://127.0.0.1:5000`*

**Terminal 2 (Rodando o Frontend React):**
```bash
# 1. Navegue até a pasta do frontend
cd frontend

# 2. Inicie o servidor de desenvolvimento do Vite
npm run dev
```
*O frontend estará rodando em `http://localhost:5173`*

**Acesso:**
Após iniciar os dois servidores, abra seu navegador e acesse:
**➡️ `http://localhost:5173`**

---

### Passo 3: Executando em Modo de Produção (Para Apresentação)

Este modo simula como o projeto seria entregue. Ele "compila" o frontend e usa o Flask para servir todos os arquivos.

1.
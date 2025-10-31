# Projeto Conselho de Classe (CdC)

Este é um projeto de aplicação web full-stack desenvolvido para digitalizar e otimizar o processo de Conselho de Classe em escolas. Ele permite o cadastro de turmas, alunos e a criação e preenchimento de formulários de avaliação personalizados.

---

## 🚀 Tecnologias Utilizadas

* **Backend:**
    * **Python 3**
    * **Flask** (Como servidor de API)
    * **SQLite** (Definido pelo `schema.sql`)
    * **Flask-CORS** (Necessário para a comunicação com o frontend)
* **Frontend:**
    * **React 19**
    * **Vite** (Como ambiente de desenvolvimento)
    * **Tailwind CSS** (Para estilização)

---

## 🏁 Como Rodar o Projeto

Para rodar este projeto, você precisará ter **Python** e **Node.js** (com `npm`) instalados na sua máquina.

O projeto é dividido em duas partes (backend e frontend) que devem ser executadas **simultaneamente em dois terminais separados**.

### Terminal 1: Rodando o Backend (API Flask)

1.  **Navegue até a pasta do backend:**
    ```bash
    cd projeto-CdC-MetodologiasAgeis-main/backend
    ```

2.  **(Recomendado) Crie um ambiente virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # (No Windows: .\venv\Scripts\activate)
    ```

3.  **Instale as dependências do Python:**
    *(Crie um arquivo `requirements.txt` na pasta `backend` com `Flask` e `flask-cors` e depois rode:)*
    ```bash
    pip install Flask flask-cors
    ```

4.  **Inicie o servidor Flask:**
    ```bash
    python app.py
    ```
    *O backend estará rodando em `http://127.0.0.1:5000`*

### Terminal 2: Rodando o Frontend (React)

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd projeto-CdC-MetodologiasAgeis-main/frontend
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento do Vite:**
    ```bash
    npm run dev
    ```
    *O frontend estará rodando em `http://localhost:5173`*

### Acesso

Após iniciar os dois servidores, abra seu navegador e acesse:
**➡️ `http://localhost:5173`**
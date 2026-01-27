
### 📝 Conteúdo do `README.md`

```markdown
# 🏫 Sistema de Conselho de Classe Digital (CdC)

O **CdC** é uma solução Full-Stack desenvolvida para modernizar e digitalizar o processo de Conselho de Classe. 
Ele permite que coordenadores e professores gerenciem turmas, alunos e avaliações de forma centralizada, 
transformando dados qualitativos em inteligência pedagógica através de dashboards e relatórios automáticos.

---

## 📂 Estrutura do Projeto

O repositório está organizado em uma arquitetura modular para facilitar a manutenção e o deploy:

```text
/projeto-cdc
├── /backend            # API Flask (Python) e Banco de Dados SQLite
│   ├── /uploads        # Armazenamento local de fotos dos alunos (ignorado pelo Git)
│   ├── app.py          # Servidor principal e rotas da API
│   └── requirements.txt # Dependências Python otimizadas
├── /frontend           # Interface SPA (React + Vite)
│   ├── /src            # Componentes, Hooks, Contexts e Views
│   ├── package.json    # Dependências JavaScript (Recharts, jsPDF, etc.)
│   └── tailwind.config.js
├── .gitignore          # Configuração de exclusão para Git (Raiz)
└── README.md           # Documentação principal

```

---

## ✨ Funcionalidades Principais

### 🔒 Segurança e Perfis

* **Autenticação:** Sistema de login com hash de senha seguro via `Werkzeug`.
* **Níveis de Acesso:** Diferenciação entre perfis de **Coordenador** (acesso total) e **Docente** (preenchimento e visualização).

### 📋 Gestão Pedagógica

* **Formulários Inteligentes:** Criação de questionários dinâmicos com suporte a múltiplas instâncias (Docentes, NAE, NAPNE, NEABI e NEPGES).
* **Modelo Oficial:** Botão de injeção automática do modelo padrão institucional.
* **Registro de Alunos:** Cadastro completo com suporte a upload de fotos para identificação visual rápida.

### 📊 Inteligência de Dados

* **Dashboard de Monitoramento:** Gráficos interativos (Pizza e Barras) via `Recharts` para identificar alunos em destaque ou risco.
* **Grade de Confronto:** Visualização consolidada de todas as respostas dos professores por pergunta.
* **Exportação PDF:** Geração automática de relatórios oficiais para impressão através de `jsPDF` e `html2canvas`.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React 19, Vite, Tailwind CSS, Recharts, Lucide React.
* **Backend:** Python 3, Flask, Flask-CORS, SQLAlchemy, SQLite.

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos

* Python 3.10 ou superior
* Node.js 18 ou superior

### 2. Configuração do Backend

Entre na pasta do servidor e configure o ambiente virtual:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py

```

### 3. Configuração do Frontend

Em um novo terminal, instale as dependências e inicie o servidor de desenvolvimento:

```bash
cd frontend
npm install
npm run dev

```

---

## 👥 Equipe e Papéis

* **Product Owner:** Gustavo
* **Scrum Master:** Ana Clara
* **Desenvolvimento:** Lara, Pedro, Alex, Emanuel

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e institucionais. Consulte a coordenação para detalhes sobre permissões de uso.

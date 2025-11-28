# PI4-Kodarys - Plataforma Gamificada de Programação 🎮

Este repositório contém o código da **plataforma Kodarys**, um RPG educacional projetado para ensinar conceitos de programação de forma lúdica e imersiva.

Atualmente, este repositório foca em:

- **Backend em Java** usando:
  - um servidor **TCP** (`MainServer`) que valida e salva dados no MongoDB
  - um servidor **HTTP adaptador** (`HttpToTcpServer`) que recebe requisições do frontend e repassa para o servidor TCP
- **Frontend em React** (`frontend`) para a interface web (login, registro, etc.)
- **MongoDB** como banco de dados
---

## 📖 Sobre o Projeto

O objetivo do Kodarys é ser uma plataforma onde o estudante:

- entra em uma **narrativa gamificada**
- completa **missões** relacionadas a programação
- tem **progresso salvo** e um perfil de jogador

Neste momento, o foco do backend é:

- **cadastro de usuários (nome, email, idade, senha)**
- **armazenamento seguro de senha (hash com BCrypt)**
- fluxo básico de comunicação entre **frontend → HTTP → TCP → MongoDB**

---

## ✨ Funcionalidades implementadas (estado atual)

- **Cadastro de usuário via site (React):**
  - campos: `nome`, `email`, `idade`, `senha`, `confirmar senha`
  - validação básica no frontend e backend
- **Envio de dados do frontend → backend Java:**
  - `frontend` faz `POST` para `http://localhost:8080/api/usuario`
  - `HttpToTcpServer` recebe o JSON via HTTP e repassa pro TCP
  - `MainServer` recebe o JSON via TCP, valida e salva no MongoDB
- **Armazenamento no MongoDB:**
  - coleção `usuarios`
  - campos: `nome`, `email`, `idade`, `senhaHash`, `createdAt`
- **Segurança de senha:**
  - senhas são armazenadas **com hash BCrypt**
  - nunca é salva a senha em texto puro

---

## 🛠️ Stack Tecnológica (Atual)

- **Backend:**
  - Java (aplicação simples com `ServerSocket` + `HttpServer`)
  - Gson (parse de JSON)
  - MongoDB Driver
  - Dotenv (carregar variáveis do `.env`)
  - BCrypt (hash de senha)

- **Frontend:**
  - React (Vite ou similar)
  - TypeScript/JavaScript
  - React Router
  - MUI Icons

- **Banco de Dados:**
  - MongoDB

---

## 🏛️ Arquitetura do Backend e Frontend

### 🔹 Visão geral do fluxo

```text
[React]  → HTTP POST /api/usuario (porta 8080)
   ↓
[HttpToTcpServer.java]  (Servidor HTTP em Java)
   ↓ (TCP, JSON)
[MainServer.java]       (Servidor TCP em Java)
   ↓
Validação + Hash de senha + MongoDB

🔹 Papéis de cada componente

HttpToTcpServer.java

Sobe um servidor HTTP na porta 8080

Recebe requisições do frontend em /api/usuario

Lê o JSON do corpo da requisição

Abre um socket TCP para localhost:5000

Envia o JSON como uma linha

Lê a resposta do MainServer e devolve essa resposta pro frontend

MainServer.java

Sobe um servidor TCP na porta 5000

Aceita conexões de clientes (como o HttpToTcpServer)

Lê uma linha de JSON (usuário)

Converte JSON → Usuario (via Gson)

Valida se nome, email, senha e idade foram enviados

Gera um hash da senha com BCrypt

Insere documento no MongoDB (coleção usuarios)

Responde um JSON simples com status e mensagem

Usuario.java

Classe modelo para o usuário

Campos: nome, email, senha, idade

Usada pelo Gson para mapear o JSON do frontend

Frontend (frontend/)

Tela de registro (RegisterPage)

Coleta nome, email, idade, senha, confirmar senha

Faz fetch para http://localhost:8080/api/usuario com os dados

Exibe mensagens de sucesso/erro

Redireciona para a página de login após cadastro bem-sucedido

🍃 Estrutura do Banco de Dados (MongoDB)

Coleção principal usada no código atual:

// Coleção: usuarios
{
  "_id": "ObjectId(...)",
  "nome": "Roston",
  "email": "Roston@gmail.com",
  "idade": 24,
  "senhaHash": "$2a$10$lM4rYgRHgYxFdwzyTtnw.e40UKlLqsvFT9tkPE.MSfQx8CXPjt6e6",
  "createdAt": "2025-03-05 14:22:37"
}


senhaHash é gerada com BCrypt.
createdAt é salvo como string formatada (yyyy-MM-dd HH:mm:ss) no fuso America/Sao_Paulo.

📂 Estrutura de Pastas (simplificada)
PI4-Kodarys/
├── KodarysServer/
│   ├── pom.xml
│   └── src/main/java/com/kodarys/
│       ├── MainServer.java          # Servidor TCP (porta 5000)
│       ├── HttpToTcpServer.java     # Servidor HTTP (porta 8080)
│       └── model/
│           └── Usuario.java         # Modelo de usuário
├── frontend/
│   ├── package.json
│   └── src/
│       └── pages/...
├── .env                             # Config do MongoDB (lido pelo Dotenv)
└── README.md

⚙️ Pré-requisitos

Para rodar o projeto, você precisa ter instalado:

Java 17+

Maven

Node.js + npm

MongoDB (rodando localmente ou em um servidor)

🧾 Configuração do .env

Na raiz do projeto (PI4-Kodarys/), crie um arquivo chamado .env com:

MONGODB_URI="string de conexão do mongodb"
DB_NAME=Kodarys
MONGO_COLLECTION=usuarios


O Dotenv procura o .env a partir do diretório onde o programa é executado.
Se você rodar o MainServer pela raiz do projeto, ele encontrará esse arquivo.

🚀 Como Rodar o Backend (Java)
1. Entre na pasta do servidor
cd KodarysServer

2. Compile o projeto com Maven
mvn clean package


Isso vai:

baixar dependências (MongoDB, Gson, Dotenv, BCrypt)

compilar o código

gerar o .class/.jar

3. Rodar o MainServer (servidor TCP)

Você pode rodar de duas formas:

✅ Pela IDE (IntelliJ/Eclipse/Visual Studio)

Abra o projeto KodarysServer

Vá até MainServer.java

Clique em Run na classe MainServer

✅ Pelo terminal com Maven
mvn exec:java -Dexec.mainClass="com.kodarys.MainServer"


Se tudo deu certo, você verá algo como:

Conectado ao MongoDB. URI: mongodb://localhost:27017 DB: Kodarys | Coleção: usuarios
Servidor TCP rodando na porta 5000...

4. Rodar o HttpToTcpServer (servidor HTTP)

Em outro terminal (ou outra run config na IDE), ainda dentro de KodarysServer:

Pela IDE

Abra HttpToTcpServer.java

Clique em Run

Pelo Maven
mvn exec:java -Dexec.mainClass="com.kodarys.HttpToTcpServer"


Saída esperada:

Adaptador HTTP para TCP rodando na porta 8080...


Agora você tem:

TCP (MainServer) rodando em localhost:5000

HTTP (HttpToTcpServer) rodando em http://localhost:8080/api/usuario

💻 Como Rodar o Frontend (React)
1. Entre na pasta do frontend
cd frontend

2. Instale as dependências
npm install

3. Rode o servidor de desenvolvimento
npm run dev


Normalmente o Vite sobe na porta 5173.
No terminal, aparecerá algo como:

  Local:   http://localhost:5173/


Abra no navegador:

👉 http://localhost:5173/

🔁 Fluxo para Criar uma Conta

Acesse http://localhost:5173/ e vá para a tela de cadastro.

Preencha nome, email, idade, senha e confirmar senha.

Clique em Cadastrar.

O frontend faz POST para:

http://localhost:8080/api/usuario


com um JSON assim:

{
  "nome": "Roston",
  "email": "Roston@gmail.com",
  "idade": 24,
  "senha": "roston123"
}


HttpToTcpServer repassa esse JSON via TCP para MainServer (localhost:5000).

MainServer:

valida os campos

gera o hash da senha

insere no MongoDB na coleção usuarios

responde com algo como:

{
  "status": "ok",
  "mensagem": "JSON válido e salvo no MongoDB."
}


O frontend mostra uma mensagem e pode redirecionar para a tela de login.

🧑‍💻 Equipe

Este projeto está sendo desenvolvido por:

Raul Gruenwaldt Antonio

João Pedro Pires de Andrade

Otávio Rosa Zampolli

Fernando Furlanetto Cardoso

Matheus Augusto Mendonça
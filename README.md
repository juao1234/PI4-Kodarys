# PI4-Kodarys - Plataforma Gamificada de Programação 🎮

Este repositório contém o código-fonte do **backend** para a Plataforma Gamificada de Aprendizado de Programação, um RPG educacional projetado para ensinar conceitos de programação (Python) de forma lúdica e imersiva.

A aplicação é construída em **Java (Spring Boot) e Python** e utiliza **MongoDB** como banco de dados para gerenciar o progresso dos usuários, a narrativa e os desafios.

## 📖 Sobre o Projeto

O objetivo principal é criar uma ferramenta de aprendizado onde os estudantes são imersos em uma história interativa. Em vez de lições tradicionais, o usuário avança na narrativa completando "missões" que, na verdade, são desafios de programação. O sistema foca em fornecer um ambiente com NPCs, diálogos e um enredo que contextualiza os problemas a serem resolvidos.

## ✨ Funcionalidades Principais (MVP)

* **RF01: Narrativa Imersiva:** Apresenta uma história interativa com personagens e cenários.
* **RF02: Interação com NPCs:** Permite que o usuário interaja com NPCs para avançar na história.
* **RF03: Missões de Programação:** Desafios de código (Python) integrados à narrativa com feedback imediato (passou/falhou).
* **RF04: Editor de Código Integrado:** Um editor de código web para a resolução das missões.
* **RF05/RF06: Autenticação de Usuário:** Sistema completo de cadastro e login.
* **RF07: Perfil do Usuário:** Página com estatísticas de progresso e missões completadas.
* **RF08: Segurança:** Armazenamento de senhas com hash seguro e execução de código isolada (sandboxing).

### 🚀 Funcionalidades Planejadas (Pós-MVP)

* **RF11: Explicação de Erros com IA:** Feedback detalhado sobre erros de código usando IA.
* **RF12: Teste de Execução:** Permitir ao usuário testar o código antes da submissão final.
* **RF13: Personalização de Avatar:** Customização de perfil e avatar.
* **RF14: Plano Premium:** Implementação de monetização com itens cosméticos e planos.
* **RF15: NPCs com IA:** Geração de diálogos e missões personalizadas com IA.

## 🛠️ Stack Tecnológica

* **Backend:** Java (Spring Boot)
* **Banco de Dados:** MongoDB
* **Linguagem dos Desafios:** Python (executado em ambiente sandboxed)
* **Autenticação:** JWT (JSON Web Tokens)
* **Build:** Maven (ou Gradle)

---

## 🏛️ Arquitetura do Backend(Pyhton e Java) e Frontend(React)

Conforme definido no documento de requisitos, este servidor Java é responsável por:

* Autenticação e autorização de usuários.
* Cadastro e gerenciamento de contas.
* Controle do estado narrativo e das missões de cada usuário.
* Exposição de uma API REST para comunicação com o frontend.
* Processamento e feedback das submissões de código ("passou/falhou").
* Comunicação direta com o banco de dados MongoDB.
* Registro e controle de sessões e segurança básica.

## 🍃 Estrutura do Banco de Dados (MongoDB)

O sistema utiliza o MongoDB para armazenar todos os dados persistentes, organizados nas seguintes coleções:

```json
// 1. Coleção: usuarios
{
  "_id": "ObjectId(...)",
  "nome": "Fernando Furlanetto",
  "email": "fernando@email.com",
  "senha_hash": "bcrypt_hash(...)",
  "nome_usuario": "fernando.dev",
  "xp": 150,
  "progresso": { ... },
  "personalizacoes": { ... }
}

// 2. Coleção: missoes
{
  "_id": "ObjectId(...)",
  "id_missao": "M01_INTRO",
  "titulo": "A Caverna dos Ecos",
  "descricao": "Use a magia 'print()' para iluminar a caverna...",
  "script_validacao": "python_script_para_testar_output(...)",
  "status": "ATIVA"
}

// 3. Coleção: historico_missoes
{
  "_id": "ObjectId(...)",
  "id_usuario": "ObjectId(...)",
  "id_missao": "ObjectId(...)",
  "resultado": "SUCESSO", // ou "FALHA"
  "data": "ISODate(...)",
  "codigo_submetido": "print('Olá, Mundo!')"
}

// 4. Coleção: estado_narrativa
{
  "_id": "ObjectId(...)",
  "id_usuario": "ObjectId(...)",
  "ponto_historia_atual": "CIDADE_INICIAL_NPC_02",
  "escolhas_feitas": ["AJUDOU_FERREIRO", "IGNOROU_GUARDA"],
  "dialogos_vistos": ["D01", "D02"]
}

// 5. Coleção: transacoes (Opcional/Pós-MVP)
{
  "_id": "ObjectId(...)",
  "id_usuario": "ObjectId(...)",
  "tipo_plano": "PREMIUM",
  "historico_pagamento": [ ... ],
  "itens_adquiridos": ["ESPADA_LENDARIA_SKIN"]
}
````
1.  **Instale as dependências (via Maven):**
    ```bash
    mvn clean install
    ```

3.  **Execute a aplicação:**
    ```bash
    mvn spring-boot:run
    ```

O servidor estará rodando em `http://localhost:8080`.

## 🧑‍💻 Equipe

Este projeto está sendo desenvolvido por:

* Raul Gruenwaldt Antonio
* João Pedro Pires de Andrade
* Otávio Rosa Zampolli
* Fernando Furlanetto Cardoso
* Matheus Augusto Mendonça

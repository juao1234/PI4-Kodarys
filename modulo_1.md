# 🔷 1. OBJETIVOS DO MÓDULO

Garantir que o aprendiz domine:

## 1. Ambiente Python
- O que é o interpretador
- Diferença entre código e execução
- Terminal como canal de magia

## 2. print() — Primeira Ferramenta
- Uso correto
- Strings entre aspas
- Exemplo certo e errado
- Erros comuns

## 3. Variáveis e Tipos Básicos
- Conceito de variável
- Tipos: int, float, str
- Atribuição
- Nomeação correta
- Boas práticas

## 4. Entrada e Saída
- input()
- Diferença entre string e número
- Conversão: int(), float(), str()

## 5. Operadores
- Aritméticos
- Concatenação de strings
- Conversão de tipos
- Erros comuns entre str e int

---

# 🔷 2. METODOLOGIA (CICLO DE ENSINO OFICIAL)

O módulo segue **SEMPRE** este ciclo:

## (1) Professor ensina
- Explicação curta
- Exemplo certo
- Exemplo errado
- Mini desafio mental

## (2) Aluno pratica
- Escreve código
- Execução real
- Sistema coleta tentativas

## (3) Professor analisa, pede explicação e otimização
- Análise objetiva
- Pede que o aluno explique o próprio código
- Sugere otimização (nomes, clareza, redundância)

## (4) NPC apresenta código defeituoso
- Lyra/um aprendiz traz código quebrado
- Ou Raxos provoca o aluno com um “desafio”
- Aluno diagnostica erro

## (5) Aluno ajuda o NPC
- Explica o erro
- Corrige
- NPC reforça conceito

Este ciclo é o coração pedagógico do módulo.

---

# 🔷 3. HISTÓRIA DO MÓDULO 1 — DUNGEON PRIMEVA

## 🏰 Premissa
O aluno é um Aprendiz da Guilda dos Compiladores e deve explorar a **Dungeon Primeva**, local onde o Código-Fonte do mundo foi corrompido.

O professor Sygnus guia o trio:
- Você (protagonista)
- Lyra (amiga)
- Raxos (rival ciumento)

A cada sala, o trio encontra mecanismos, portas, runas e criaturas bugadas que só podem ser manipuladas com **magia Python**.

---

# 🔷 4. NPCs — PERFIS, PERSONALIDADES E FUNÇÕES

## 🧙‍♂️ PROFESSOR SYGNUS
### Função pedagógica:
- Ensinar conteúdo técnico
- Fornecer exemplos corretos/errados
- Avaliar a prática
- Pedir explicação e otimização
- Corrigir raciocínio

### Personalidade:
- Calmo
- Preciso
- Didático
- Não perde tempo com drama

---

## 🟢 LYRA — Amiga do Protagonista
### Função pedagógica:
- Trazer códigos quebrados
- Pedir ajuda
- Reforçar explicações
- Demonstrar erros comuns

### Personalidade:
- Gentil
- Insegura em programação
- Admira o protagonista
- Cria tensão sem perceber

### Tipos de erros que ela comete:
- Esquecer aspas
- Somar str com int
- Nomear variável errado
- Esquecer conversão

---

## 🔥 RAXOS — Rival & ciumento
### Função pedagógica:
- Apontar erros do aluno
- Trazer códigos mal otimizados
- Mostrar “versões melhores”
- Provocar competição

### Personalidade:
- Arrogante
- Talentoso
- Orgulhoso
- Tem ciúmes do protagonista
- Gosta secretamente da Lyra

### Gatilhos dramáticos:
- Lyra elogia o protagonista
- O protagonista acerta algo que ele erra
- A explicação do protagonista impressiona Lyra

---

# 🔷 5. MISSÕES DO MÓDULO 1 (4 MISSÕES)

## MISSÃO 1 — A Porta da Voz do Código
### Conceitos:
- interpretador
- print()
- strings

### Desafios:
- Abrir a porta com print
- Ajudar Lyra com print errado
- Raxos critica o protagonista

---

## MISSÃO 2 — O Salão das Variáveis
### Conceitos:
- variáveis
- tipos básicos
- nomeação

### Desafios:
- Criar variáveis mágicas
- Corrigir variável mal nomeada da Lyra
- Raxos tenta impor “melhor” solução

---

## MISSÃO 3 — O Oráculo do Input
### Conceitos:
- input()
- strings vs números
- conversão

### Desafios:
- Responder perguntas de input
- Corrigir erro de tipo do Lyra
- Raxos tenta responder antes do protagonista

---

## MISSÃO 4 — A Câmara das Operações
### Conceitos:
- operadores aritméticos
- concatenação
- conversão

### Desafios:
- Resolver cálculos mágicos
- Depurar código bugado da dungeon
- Raxos mostra “código otimizado”

---

# 🔷 6. PROMPTS OFICIAIS DO SISTEMA (MODELO A SER IMPLEMENTADO)

## 🧙‍♂️ PROMPT DO PROFESSOR SYGNUS (LLM)
```
Você é o Professor Sygnus, Mestre Arcano da Guilda dos Compiladores.
Seu papel é ensinar programação em Python de forma clara, objetiva e incremental.

REGRAS:
1. Ensine APENAS o conceito do módulo atual.
2. Sempre apresente:
   - Explicação curta
   - Exemplo correto
   - Exemplo errado
   - Mini desafio mental
3. Após o aluno enviar o código:
   - Avalie
   - Peça explicação passo a passo do raciocínio
   - Ensine otimização simples
4. Nunca dê respostas prontas sem explicação.
5. Use metáforas leves do mundo de Kodarys.
```

---

## 🟢 PROMPT DA LYRA (LLM)
```
Você é Lyra, aprendiz gentil e ansiosa para aprender.

REGRAS:
1. Você frequentemente traz códigos com erros simples.
2. Peça ajuda ao protagonista com sinceridade.
3. Reforce sempre o aprendizado após receber a explicação.
4. Admire o protagonista de forma sutil.
5. Às vezes cause tensão com Raxos sem perceber.
```

---

## 🔥 PROMPT DO RAXOS (LLM)
```
Você é Raxos, rival competitivo, talentoso e com ciúmes.

REGRAS:
1. Aponte erros do protagonista com tom competitivo.
2. Mostre soluções 'mais otimizadas', mas não perfeitas.
3. Às vezes cometa pequenos erros e tente esconder.
4. Demonstre ciúmes quando Lyra elogia o protagonista.
5. Ofereça desafios extras para se exibir.
```

---

## 🎙️ PROMPT DO NARRADOR (LLM)
```
Você é o Narrador do mundo de Kodarys.
Seu papel é descrever ambientes, salas, criaturas e eventos.

REGRAS:
1. Nunca ensine programação.
2. Nunca corrija código.
3. Apresente desafios e eventos ligados ao tema de forma narrativa.
4. Descreva com linguagem épica leve, sem exageros.
```

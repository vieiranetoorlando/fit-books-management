# Gerenciamento de Acervo - FIT

Sistema Full Stack de gerenciamento de livros desenvolvido para o desafio técnico da FIT Tecnologia. 
O projeto foca em **Fidelidade ao Design**, **Tipagem Estrita** e **Robustez de Dados**.

---

## Tecnologias Principais

- **Backend:** Node.js (ESM), TypeScript, Express, Prisma ORM
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Banco de Dados:** PostgreSQL (via Docker)
- **Padronização:** ESLint, Prettier e Conventional Commits

---

## Estrutura do Repositório

```
/backend          # API REST com Prisma e validação de tipos
/frontend         # SPA React otimizada com Vite e Tailwind
/docker           # Configurações de infraestrutura
docker-compose.yml # Orquestração do PostgreSQL e serviços
```

---

## Instruções de Instalação e Execução

### 1. Ambiente de Banco de Dados

Certifique-se de possuir o Docker instalado e o Node.js (v18+).  
Na raiz do projeto, execute:

```bash
docker-compose up -d
```

---

### 2. Configuração do Backend

```bash
cd backend
npm install
# Configure o seu .env com a DATABASE_URL do Docker
npx prisma migrate dev      # Cria as tabelas
npx prisma db seed          # Popula o banco com os dados do design (Figma)
npm run dev
```

---

### 3. Configuração do Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Configuração do Frontend

```bash
[x] CRUD Completo: Cadastro, Listagem, Edição e Exclusão de livros.

[x] Busca Dinâmica: Filtro de livros por título ou autor.

[x] Persistência: Dados salvos em banco relacional PostgreSQL.

[x] Seed de Dados: Script para carregar os livros exatos do protótipo Figma.

[x] Responsividade: Interface adaptável para Mobile e Desktop.
```

### 5. Decisões Técnicas (Qualidade)

```bash
Prisma Client: Utilizado para garantir que qualquer erro de banco seja capturado em tempo de compilação.

CORS: Configurado para permitir a comunicação segura entre o Frontend (Vite) e o Backend (Express).

Tratamento de Exceções: Todas as rotas possuem blocos try/catch e retornam status codes HTTP semânticos (201, 204, 404, 500).
```

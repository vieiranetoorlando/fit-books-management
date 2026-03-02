# Gerenciamento de Acervo - FIT

Sistema de gerenciamento de livros desenvolvido para o desafio técnico da FIT.  
O projeto utiliza uma arquitetura baseada em micro-serviços (backend e frontend) organizados em um monorepo, priorizando tipagem estrita e segurança.

---

## Tecnologias Principais

- **Backend:** Node.js (ESM), TypeScript, Express, Prisma ORM  
- **Frontend:** React, TypeScript, Vite, Tailwind CSS  
- **Infraestrutura:** PostgreSQL via Docker Compose  

---

## Estrutura do Repositório

```
/backend            # API REST, schema do banco de dados e lógica de negócio
/frontend           # Aplicação SPA desenvolvida em React
docker-compose.yml  # Orquestração dos serviços de banco de dados
```

---

## Instruções de Instalação e Execução

### 1. Ambiente de Banco de Dados

Certifique-se de possuir o Docker instalado.  
Na raiz do projeto, execute:

```bash
docker-compose up -d
```

---

### 2. Configuração do Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

---

### 3. Configuração do Frontend

```bash
cd frontend
npm install
npm run dev
```
# FIT Livros - Desafio Full Stack

Aplicacao full stack para gestao de acervo de livros, implementada com foco em:
- fidelidade ao design do Figma;
- robustez de API e validacao de dados;
- organizacao de codigo e manutenibilidade;
- execucao simples com Docker.

## 1. Visao Geral

O projeto possui:
- frontend React para listagem, busca, cadastro, edicao, exclusao e detalhes de livros;
- backend Express + Prisma com API REST e upload de capas;
- PostgreSQL como persistencia;
- testes automatizados para frontend e backend;
- ambiente containerizado para subir toda a stack com um comando.

## 2. Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Vitest, Testing Library
- Backend: Node.js, TypeScript, Express 5, Prisma, Multer, Vitest, Supertest
- Banco de dados: PostgreSQL 15
- Infra local: Docker Compose

## 3. Funcionalidades

- Listagem de livros com ordenacao por criacao
- Busca por titulo e autor
- Visualizacao de detalhes do livro
- Cadastro e edicao de livro
- Exclusao com confirmacao
- Upload de capa (JPG/PNG/WEBP ate 5MB)
- Fallback visual para livros sem imagem
- Notificacoes de sucesso/erro no frontend
- Validacoes de payload no backend
- Endpoint de health check (`GET /health`)

## 4. Arquitetura e Decisoes Tecnicas

### Frontend
- Separacao em `pages`, `components`, `services` e `types`.
- `services/bookService.ts` centraliza chamadas HTTP.
- Estado da pagina principal concentra fluxo de CRUD e modais.
- `BookCover` abstrai fallback da capa para evitar duplicacao de logica.

### Backend
- `src/app.ts` concentra middlewares, rotas e validacoes de dominio.
- `src/server.ts` apenas inicia o servidor (facilita testes do app isolado).
- Prisma como camada de acesso a dados.
- Validacoes server-side de obrigatoriedade, formato e tamanho maximo.

### Docker
- `docker-compose.yml` sobe `db`, `backend` e `frontend`.
- Healthchecks para orquestracao mais previsivel.
- Backend sobe aplicando migrations automaticamente.
- Frontend gera build estatico e serve via Nginx.

## 5. Estrutura de Pastas

```text
.
|-- backend
|   |-- prisma
|   |-- src
|   |-- Dockerfile
|-- frontend
|   |-- src
|   |-- Dockerfile
|   |-- nginx.conf
|-- docker-compose.yml
|-- .env.example
```

## 6. Variaveis de Ambiente

### Raiz do projeto (`.env`)
Baseie-se em `.env.example`:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=biblioteca_db
DB_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=5173
```

Importante:
- O arquivo `.env` e o arquivo real lido pelo Docker Compose na sua maquina.
- O arquivo `.env.example` e somente um modelo versionado no Git para facilitar configuracao.
- Se voce alterar `BACKEND_PORT` ou `FRONTEND_PORT`, as URLs de acesso mudam de acordo com esses valores.

### Frontend (`frontend/.env`) para execucao sem Docker
Baseie-se em `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

## 7. Como Rodar com Docker (Recomendado)

1. Clonar repositorio:
```bash
git clone <URL_DO_REPOSITORIO>
cd projeto-fit-livros
```

2. Criar `.env`:
```bash
# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

3. Subir a stack:
```bash
docker compose up -d --build
```

4. Acessar aplicacao:
- Frontend: `http://localhost:<FRONTEND_PORT>`
- Backend (health): `http://localhost:<BACKEND_PORT>/health`

Exemplo com valores padrao:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/health`

5. Popular dados iniciais (opcional, recomendado para demonstracao):
```bash
docker compose exec backend npx prisma db seed
```

6. Parar a stack:
```bash
docker compose down
```

## 8. Checklist de Clone Limpo

Para validar que qualquer pessoa consegue rodar:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Resultados esperados:
- `db` com status `healthy`
- `backend` com status `healthy`
- `frontend` com status `up`
- `http://localhost:<BACKEND_PORT>/health` respondendo `{"status":"ok"}`
- `http://localhost:<FRONTEND_PORT>` carregando a aplicacao

## 9. Como Rodar sem Docker

### Banco
Suba um PostgreSQL local e configure a `DATABASE_URL` do backend.

Pre-check recomendado antes do backend:
```bash
docker compose up -d db
docker compose ps
```

O status esperado para o banco e `healthy`.

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 10. Testes e Qualidade

### Frontend
```bash
cd frontend
npm run lint
npm test
npm run build
```

### Backend
```bash
cd backend
npm run build
npm test
```

## 11. Troubleshooting

### Erro de porta em uso (`bind: ... port is already allocated`)
Edite o `.env` na raiz para trocar portas:

```env
DB_PORT=5433
BACKEND_PORT=3001
FRONTEND_PORT=5174
```

Depois:
```bash
docker compose up -d --build
```

### API nao sobe por problema de banco/migration
```bash
docker compose logs -f backend
docker compose logs -f db
```

Se necessario, resetar volumes locais:
```bash
docker compose down -v
docker compose up -d --build
```

### Erro `Can't reach database server at localhost:5432`

Esse erro indica que o backend iniciou, mas o banco local nao estava ativo.

Resolucao rapida:
```bash
docker compose up -d db
docker compose ps
```

Quando o `db` estiver `healthy`, rode novamente:
```bash
cd backend
npm run dev
```

### Verificar status dos containers
```bash
docker compose ps
```

### Popular dados de exemplo manualmente
```bash
docker compose exec backend npx prisma db seed
```

### Capas do seed nao aparecem
Para as capas padrao funcionarem em qualquer maquina, os arquivos locais precisam existir em `backend/uploads/seed` com estes nomes:
- `a-revolucao-dos-bichos.jpg`
- `dom-casmurro.jpg`
- `o-senhor-dos-aneis-a-sociedade-do-anel.jpg`
- `javascript-the-good-parts.jpg`

## 12. Nota sobre Versionamento e Seguranca

Este repositorio versiona intencionalmente alguns arquivos que, em um projeto real, normalmente nao seriam versionados, para garantir reproducao completa no desafio tecnico.

- Apenas as capas fixas de demonstracao em `backend/uploads/seed` foram versionadas para garantir o mesmo resultado visual no clone.
- Uploads dinamicos de usuarios continuam fora do Git.
- Arquivos `.env` nao sao versionados.
- O repositorio inclui somente `.env.example` como modelo de configuracao.
- As credenciais dos exemplos sao para ambiente local de desenvolvimento e devem ser trocadas em qualquer uso real.

## 13. Criticidade e Trade-offs

- Foco em validacao no backend para garantir integridade dos dados independentemente do frontend.
- Upload local simplifica o desafio; em producao real, o ideal seria storage externo (S3, GCS, etc.).
- Frontend usa estado local por simplicidade; para escala maior, caberia cache de dados dedicado.
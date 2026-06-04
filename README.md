# FinanceSecure API

API de gestão financeira pessoal e investimentos construída com Node.js, Fastify, TypeScript, Prisma e MongoDB Atlas.

O projeto está organizado para combinar:
- Arquitetura Hexagonal de Alistair Cockburn
- conceitos de Domain-Driven Design
- separação clara entre domínio, aplicação e adapters

## Stack

- Node.js
- Fastify
- TypeScript
- Prisma
- MongoDB Atlas
- JWT
- Argon2
- Swagger OpenAPI

## Estrutura

### `src/domain`

Núcleo do domínio.

Contém:
- entidades
- regras de negócio puras
- serviços de cálculo
- mensagens de erro de domínio

### `src/application`

Camada de aplicação.

Contém:
- `use-cases`
- `dto`
- `ports`
- `validators`
- `errors`

Aqui ficam os fluxos da aplicação e os contratos que os adapters precisam implementar.

### `src/adapters`

Borda do sistema.

Contém:
- `http`
- `database`

#### `src/adapters/http`

- controllers Fastify
- middlewares de autenticação, autorização e erro
- rotas
- integração com Swagger

#### `src/adapters/database`

- repositórios Prisma
- jobs
- integração concreta com banco

### `src/shared`

Infraestrutura transversal:
- configuração de ambiente
- singleton do Prisma
- segurança de senha
- container simples

## Execução local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

Use `.env.example` como base para criar seu `.env`.

Variáveis principais:

```env
DATABASE_URL=
JWT_SECRET=
CORS_ORIGINS=
PORT=3333
HOST=0.0.0.0
ENABLE_SWAGGER=true
RUN_INVESTMENT_YIELD_JOB=false
```

### 3. Gerar cliente Prisma

```bash
npx prisma generate
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Servidor local:

```text
http://localhost:3333
```

Healthcheck:

```text
GET /health
```

Swagger:

```text
http://localhost:3333/documentation
```

## Build e produção

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

## Deploy no Render

### Requisitos

- `DATABASE_URL` do MongoDB Atlas
- `JWT_SECRET` com pelo menos 32 caracteres
- `CORS_ORIGINS` com as origens permitidas
- `ENABLE_SWAGGER=true` se quiser documentação pública

### Observações importantes

- a aplicação usa `trustProxy: true`, importante para ambientes atrás de proxy como o Render
- o Prisma usa singleton compartilhado para evitar múltiplas instâncias desnecessárias
- `/health` pode responder mesmo se alguma rota de negócio falhar; por isso é importante validar login, cadastro e banco separadamente

## Rotas principais

- `POST /api/usuarios/cadastrar`
- `POST /api/usuarios/login`
- `PUT /api/usuarios/alterar-email`
- `PUT /api/usuarios/alterar-senha`
- `DELETE /api/usuarios/apagar-conta`
- `POST /api/transacoes/adicionar`
- `GET /api/transacoes/extrato`
- `POST /api/investimento/adicionar`
- `POST /api/investimento/resgatar/:id`

## Documentação Swagger

A documentação usa Fastify Swagger + Swagger UI.

Em produção, se `ENABLE_SWAGGER=true`:

```text
/documentation
```

## Notas arquiteturais

- controllers adaptam HTTP para casos de uso
- DTOs definem o contrato de entrada da aplicação
- use cases orquestram regras de negócio
- repositories implementam portas da aplicação
- o domínio não depende de Fastify, Prisma ou Render

## Próximos passos recomendados

- revisar todos os schemas Swagger para garantir alinhamento 100% com os DTOs
- adicionar testes de integração para login, cadastro e healthcheck
- documentar fluxo de autenticação JWT
- padronizar completamente as mensagens de erro

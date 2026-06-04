# Finsecure API

API para gestão financeira pessoal, controle de transações e acompanhamento de investimentos. O projeto foi construído com **Node.js**, **Fastify**, **TypeScript**, **Prisma** e **MongoDB**, seguindo uma organização próxima da Arquitetura Hexagonal.

### O que a API entrega

- Cadastro, login, alteração de e-mail, alteração de senha e remoção de conta.
- Lançamento, atualização, cancelamento e consulta de extrato de transações.
- Cadastro e manutenção de tipos de investimento.
- Aplicação, resgate, consulta de extrato e total investido.
- Cálculo de rendimento diário para investimentos com base no CDI.
- Documentação interativa via Swagger UI.

### Tecnologias

- **Fastify** para a camada HTTP.
- **TypeScript** como linguagem principal.
- **Prisma** como cliente de persistência.
- **MongoDB** como banco de dados.
- **JWT** para autenticação.
- **Argon2id** para novos hashes de senha, com compatibilidade para hashes bcrypt legados.
- **node-cron** para processamento agendado de rendimentos.
- **Swagger/OpenAPI** para documentação das rotas.

## Estrutura do projeto

```text
src/
├── domain/        # Entidades e serviços de domínio
├── application/   # Casos de uso, DTOs, validadores e portas
├── adapters/      # HTTP, controllers, middlewares, rotas e repositórios
├── shared/        # Configurações, container e utilitários compartilhados
├── app.ts         # Configuração da aplicação Fastify
└── server.ts      # Inicialização do servidor e jobs
```

## Como executar

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env`:

```env
NODE_ENV=development
CDI_ANUAL=14.40
DATABASE_URL="mongodb://localhost:27017/financesecure"
JWT_SECRET="troque-por-um-segredo-com-pelo-menos-32-caracteres"
CORS_ORIGINS="http://localhost:3000,http://localhost:8081"
HOST=0.0.0.0
PORT=3333
ENABLE_SWAGGER=true
RUN_INVESTMENT_YIELD_JOB=false
```

Gere o cliente Prisma, se necessário:

```bash
npx prisma generate
```

Execute em desenvolvimento:

```bash
npm run dev
```

Servidor padrão:

```text
http://localhost:3333
```

Documentação Swagger:

```text
http://localhost:3333/documentation
```

## Scripts disponíveis

```bash
npm run dev      # inicia o servidor com tsx em modo watch
npm run build    # compila o TypeScript para dist/
npm run start    # executa a versão compilada
npm run seed     # executa o seed do Prisma
npm run promote-admin -- --email=usuario@exemplo.com
npm test         # executa os testes automatizados
```

Para iniciar API e MongoDB com Docker:

```bash
docker compose up --build
```

## Principais rotas

| Grupo | Rotas |
| --- | --- |
| Usuários | `/api/usuarios/cadastrar`, `/api/usuarios/login`, `/api/usuarios/alterar-email`, `/api/usuarios/alterar-senha`, `/api/usuarios/apagar-conta` |
| Transações | `/api/transacoes/adicionar`, `/api/transacoes/extrato`, `/api/transacoes/alterar/:id`, `/api/transacoes/cancelar-transacao/:id` |
| Investimentos | `/api/investimento/adicionar`, `/api/investimento/resgatar/:id`, `/api/investimento/extrato`, `/api/investimento/total-investido` |
| Tipos de investimento | `/api/investimento/tipo`, `/api/investimento/tipo/:id`, `/api/investimento/tipo/adicionar`, `/api/investimento/tipo/atualizar/:id` |

## Contrato monetário

A API trabalha com valores monetários em reais decimais, usando `number`/`Float` nos contratos HTTP e no Prisma. Exemplo: `5029.96` representa R$ 5.029,96.

Não use centavos em inteiro para os campos monetários da API. O valor `502996` seria interpretado como R$ 502.996,00.

As rotas privadas exigem o header:

```http
Authorization: Bearer <token>
```

## Documentação complementar

- [Arquitetura](docs/arquitetura.md)
- [Filtros e validações](docs/filtros.md)
- [Autenticação e segurança](docs/seguranca.md)
- [LGPD](docs/lgpd.md)

#### Observações de manutenção

- O Swagger mostra os contratos HTTP mais próximos da execução atual.
- Os detalhes de arquitetura, filtros, segurança e LGPD devem permanecer em `docs/`.
- Ao adicionar uma nova rota, atualize o schema da rota e revise esta visão geral quando a funcionalidade fizer parte do uso principal da API.

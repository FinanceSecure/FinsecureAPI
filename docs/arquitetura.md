# Arquitetura

A Finsecure API segue uma organização inspirada em **Ports and Adapters**, também conhecida como Arquitetura Hexagonal. A ideia principal é manter a regra de negócio longe dos detalhes de infraestrutura, como HTTP, banco de dados e bibliotecas externas.

Na prática, o projeto ainda depende de alguns tipos externos em pontos específicos, mas a divisão geral já deixa claro onde cada responsabilidade deve ficar.

## Visão geral das camadas

```text
src/
├── domain/
│   ├── entities/
│   ├── erros/
│   └── services/
├── application/
│   ├── dto/
│   ├── errors/
│   ├── mappers/
│   ├── ports/
│   ├── use-cases/
│   └── validators/
├── adapters/
│   ├── database/
│   └── http/
└── shared/
    ├── config/
    ├── container/
    └── utils/
```

## Domain

A pasta `domain/` concentra os conceitos centrais da aplicação.

Responsabilidades:

- Representar entidades como usuário, transação, investimento e tipo de investimento.
- Concentrar serviços de cálculo financeiro, como rendimento de investimento, CDI e resgate parcial.
- Manter erros e regras que pertencem ao negócio, não ao transporte HTTP.

Exemplos relevantes:

- `domain/entities/User.ts`
- `domain/entities/Transaction.ts`
- `domain/entities/Investment.ts`
- `domain/services/investment-calculator.ts`
- `domain/services/calcResgateParcialService.ts`

## Application

A pasta `application/` orquestra os fluxos da API. Ela recebe dados já interpretados pela borda HTTP, aplica regras de validação e chama os repositórios através de contratos.

Responsabilidades:

- Implementar casos de uso.
- Definir DTOs de entrada.
- Declarar portas de repositório em `application/ports/repositories`.
- Centralizar erros de aplicação.
- Validar dados que fazem parte do fluxo de negócio.

Principais casos de uso:

- `userUseCases.ts`: cadastro, login, alteração de e-mail, alteração de senha e remoção de usuário.
- `transactionUseCases.ts`: criação, atualização, remoção e extrato financeiro.
- `investmentUseCases.ts`: aplicação, resgate, extrato e total investido.
- `investmentTypeUseCases.ts`: cadastro, listagem, detalhe/simulação e atualização de tipos de investimento.
- `apply-daily-yieldUsecases.ts`: aplicação de rendimento diário aos investimentos.

## Adapters

A pasta `adapters/` contém as implementações concretas de entrada e saída.

### HTTP

`adapters/http/` representa a borda de entrada da aplicação.

Responsabilidades:

- Registrar rotas Fastify.
- Aplicar middlewares de autenticação e validação.
- Converter requisições HTTP em chamadas para casos de uso.
- Definir schemas usados pelo Swagger.
- Padronizar tratamento de erros HTTP.

Pastas importantes:

- `controllers/`: handlers chamados pelas rotas.
- `routes/`: definição dos endpoints.
- `middlewares/`: autenticação, validação de transações e tratamento de erros.
- `exceptions/`: erros HTTP específicos.

### Database

`adapters/database/` representa a borda de saída para persistência.

Responsabilidades:

- Implementar os contratos definidos em `application/ports/repositories`.
- Usar Prisma para consultar e alterar dados no MongoDB.
- Executar jobs relacionados a persistência, como rendimento diário.

Pastas importantes:

- `repositories/`: implementações concretas dos repositórios.
- `jobs/`: agendamentos executados com `node-cron`.
- `db.ts`: conexão ou instância de acesso ao banco.

## Shared

`shared/` guarda recursos usados por mais de uma camada.

Responsabilidades:

- Configurações de ambiente.
- Instâncias compartilhadas, como Prisma.
- Container simples de dependências.
- Utilitários financeiros reutilizáveis.

## Fluxo de uma requisição

Fluxo comum em uma rota privada:

1. O cliente envia uma requisição HTTP para uma rota em `/api`.
2. O Fastify executa o middleware de autenticação quando a rota exige token.
3. Middlewares de validação conferem formato, campos obrigatórios e regras básicas.
4. O controller extrai `body`, `params`, `query` e `request.user`.
5. O controller chama o caso de uso correspondente.
6. O caso de uso aplica regras de negócio e usa uma porta de repositório.
7. O adapter de banco executa a operação via Prisma.
8. O controller retorna JSON com status HTTP adequado.
9. Erros são tratados pelo `erroMiddleware`.

## Banco de dados

O Prisma está configurado para **MongoDB** em `prisma/schema.prisma`.

Modelos principais:

- `User`
- `Transaction`
- `Investment`
- `InvestmentType`
- `InvestmentApplication`
- `InvestmentYieldHistory`

Os índices definidos no schema favorecem consultas por usuário, tipo, categoria, status, data e relacionamento entre investimento e tipo de investimento.

## Jobs e rendimento diário

Ao iniciar o servidor, `server.ts` chama `startInvestmentYieldJob()`.

O job roda em dias úteis à meia-noite:

```text
0 0 * * 1-5
```

Ele busca investimentos com rendimento pendente e cria entradas em `InvestmentYieldHistory`. O cálculo usa a variável `CDI_ANUAL`, com valor padrão `14.4` quando a variável não é informada.

## Diretrizes para evolução

- Novas regras de negócio devem entrar em `domain/` ou `application/`, não diretamente em controllers.
- Novas rotas devem ter schema Fastify para manter o Swagger útil.
- Repositórios devem continuar implementando contratos em `application/ports/repositories`.
- Mudanças em autenticação devem ser documentadas também em [segurança](seguranca.md).
- Novos filtros, formatos e validações devem ser documentados em [filtros e validações](filtros.md).

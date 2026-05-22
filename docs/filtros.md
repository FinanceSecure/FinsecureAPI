# Filtros e validações

Este documento descreve as validações aplicadas pela API e os parâmetros aceitos pelas rotas atuais. Para testar os contratos de forma interativa, use também o Swagger:

```text
http://localhost:3333/documentation
```

## Padrões gerais

- Datas devem ser enviadas em formato aceito por `Date`, preferencialmente ISO.
- IDs do MongoDB devem ter 24 caracteres hexadecimais quando a rota declara esse padrão.
- Valores monetários devem ser numéricos e maiores que zero quando representam aplicação, resgate ou lançamento financeiro.
- Rotas privadas dependem de `request.user.userId`, preenchido pelo middleware de autenticação.
- Erros de validação retornam JSON no formato `{ "error": "mensagem" }`.

## Usuários

### Cadastro

Rota:

```http
POST /api/usuarios/cadastrar
```

Campos:

| Campo | Regra |
| --- | --- |
| `name` | obrigatório, string, mínimo de 3 caracteres no schema da rota |
| `email` | obrigatório, formato de e-mail no schema da rota |
| `password` | obrigatório, mínimo de 8 caracteres |

Além do schema HTTP, o validador de aplicação exige:

- senha com pelo menos 8 caracteres;
- pelo menos uma letra maiúscula;
- pelo menos um caractere especial.

### Login

Rota:

```http
POST /api/usuarios/login
```

Campos obrigatórios:

- `email`
- `password`

Quando as credenciais são válidas, a API retorna um token JWT.

### Alteração de e-mail

Rota privada:

```http
PUT /api/usuarios/alterar-email
```

Campos obrigatórios:

- `oldEmail`
- `newEmail`

Ambos devem estar em formato de e-mail.

### Alteração de senha

Rota privada:

```http
PUT /api/usuarios/alterar-senha
```

Campos obrigatórios:

- `email`
- `oldPassword`
- `newPassword`

O schema exige no mínimo 8 caracteres para as senhas.

## Transações

### Criar transação

Rota privada:

```http
POST /api/transacoes/adicionar
```

Campos obrigatórios:

| Campo | Regra |
| --- | --- |
| `title` | string, máximo de 100 caracteres |
| `amount` | number, maior que zero |
| `date` | data válida |
| `type` | valor de `TransactionType` |

Campos opcionais:

| Campo | Regra |
| --- | --- |
| `description` | string, máximo de 255 caracteres |
| `category` | valor de `TransactionCategory` |
| `isRecurring` | boolean, padrão `false` |

Tipos aceitos pelo schema Prisma:

- `INCOME`
- `EXPENSE`
- `INVESTMENT`

Observação: o schema da rota de criação documenta `INCOME` e `EXPENSE`; o enum do banco também possui `INVESTMENT`.

Categorias aceitas:

- `SALARY`
- `FREELANCE`
- `DIVIDENDS`
- `CASHBACK`
- `BONUS`
- `FOOD`
- `TRANSPORT`
- `HEALTH`
- `EDUCATION`
- `ENTERTAINMENT`
- `HOUSING`
- `UTILITIES`
- `INVESTMENT_APPLICATION`
- `INVESTMENT_REDEMPTION`
- `INVESTMENT_DIVIDEND`
- `INVESTMENT_INTEREST`
- `OTHER`

Status calculado:

- data futura: `PENDING`;
- data atual ou passada: `COMPLETED`.

### Consultar extrato

Rota privada:

```http
GET /api/transacoes/extrato
```

Retorna resumo financeiro do usuário:

- saldo;
- total de entradas;
- total de despesas;
- total investido;
- últimas transações.

### Atualizar transação

Rota privada:

```http
PUT /api/transacoes/alterar/:id
```

Parâmetros:

| Campo | Regra |
| --- | --- |
| `id` | ObjectId com 24 caracteres hexadecimais |

Campos aceitos no corpo:

- `title`
- `description`
- `amount`
- `date`
- `type`
- `category`

Validações principais:

- `title`, quando enviado, deve ser string;
- `description`, quando enviada, deve ser string;
- `amount`, quando enviado, deve ser number;
- `date`, quando enviada, deve ser uma data válida;
- `type`, quando enviado, deve existir em `TransactionType`.

### Cancelar transação

Rota privada:

```http
DELETE /api/transacoes/cancelar-transacao/:id
```

O usuário só pode cancelar transações vinculadas ao próprio `userId`.

## Investimentos

### Adicionar investimento

Rota privada:

```http
POST /api/investimento/adicionar
```

A API aceita nomes em inglês ou português para compatibilidade:

| Inglês | Português | Regra |
| --- | --- | --- |
| `investmentTypeId` | `tipoInvestimentoId` | obrigatório |
| `investedAmount` | `valorInvestido` | number maior que zero |
| `purchaseDate` | `dataCompra` | data válida |

Ao registrar uma aplicação, a API também executa o cálculo de rendimento pendente para o usuário.

### Resgatar investimento

Rota privada:

```http
POST /api/investimento/resgatar/:id
```

Parâmetros:

- `id`: pode representar o investimento específico ou o tipo de investimento.

Corpo:

- `amount` ou `investedAmount`;
- valor deve ser numérico e maior que zero.

Regras:

- investimentos totalmente resgatados são ignorados;
- o resgate usa os investimentos mais antigos primeiro;
- o valor solicitado não pode ser maior que o saldo disponível.

### Extrato de investimentos

Rota privada:

```http
GET /api/investimento/extrato
```

Retorna o portfólio do usuário com:

- resumo total;
- posições por investimento;
- aplicações;
- histórico de rendimentos;
- valores bruto, líquido, imposto e saldo.

### Total investido

Rota privada:

```http
GET /api/investimento/total-investido
```

Retorna:

- `totalInvested`;
- `grossBalance`;
- `netBalance`.

## Tipos de investimento

### Listar tipos

Rota:

```http
GET /api/investimento/tipo
```

Retorna os tipos cadastrados com nome, categoria, percentual de benchmark e indicador de imposto de renda.

Observação: o schema Swagger declara autenticação para esta rota, mas a implementação atual não aplica `preHandler` de autenticação nela.

### Detalhar tipo com simulação

Rota privada:

```http
GET /api/investimento/tipo/:id?valor=1000
```

Parâmetros:

- `id`: identificador do tipo de investimento.
- `valor`: valor opcional usado na simulação. Quando omitido, o padrão é `1000`.

A simulação usa uma taxa diária aproximada de CDI no caso de uso de tipos de investimento.

### Adicionar tipo

Rota privada:

```http
POST /api/investimento/tipo/adicionar
```

Campos obrigatórios:

| Campo | Regra |
| --- | --- |
| `name` | string |
| `type` | categoria de investimento |
| `benchmarkPercentage` | number |
| `hasIncomeTax` | boolean |

Categorias aceitas:

- `FIXED_INCOME`
- `STOCKS`
- `FII`
- `ETF`
- `CRYPTO`
- `FUND`

### Atualizar tipo

Rota privada:

```http
PUT /api/investimento/tipo/atualizar/:id
```

Campos aceitos:

- `name`
- `type`
- `benchmarkPercentage`
- `hasIncomeTax`

Somente campos enviados são atualizados.

## Tratamento de erros

O `erroMiddleware` trata:

- `HttpError`, usando o status definido no próprio erro;
- `ApplicationError`, usando `statusCode`;
- erros comuns de JavaScript como status `500`.

Respostas de erro seguem o padrão:

```json
{
  "error": "Mensagem do erro"
}
```

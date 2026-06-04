# Autenticacao e seguranca

A FinanceSecure API protege rotas privadas com JWT e armazena novas senhas com Argon2id.

## Senhas

No cadastro e na alteracao de senha:

- a senha deve possuir entre 12 e 128 caracteres;
- passphrases e espacos sao permitidos;
- nao ha exigencia artificial de maiusculas ou caracteres especiais;
- o hash novo usa Argon2id.

Hashes bcrypt existentes continuam validos. Depois de um login correto, a API substitui o hash legado por Argon2id sem exigir redefinicao de senha.

## JWT

O login gera token JWT com expiracao de `2h`. O middleware aceita somente tokens assinados com `HS256`, exige `userId` e devolve `401` para token ausente, invalido ou expirado.

`JWT_SECRET` e obrigatorio e deve possuir pelo menos 32 caracteres. A API nao inicia com segredo padrao.

## Autorizacao

Controllers usam o `userId` extraido do token. O cliente nao escolhe o usuario afetado por alteracao de e-mail, alteracao de senha, transacoes ou investimentos.

Usuarios possuem papel `USER` ou `ADMIN`. Cadastro e edicao de tipos de investimento exigem `ADMIN`.

As rotas privadas incluem:

- alteracao de e-mail, senha e remocao de conta;
- operacoes e extrato de transacoes;
- aplicacao, resgate e extrato de investimentos;
- consulta e manutencao de tipos de investimento.

Cadastro, login e `/health` sao publicos.

## Protecoes HTTP

- `@fastify/helmet` adiciona headers defensivos.
- `@fastify/rate-limit` limita cadastro e login a cinco tentativas por minuto por IP.
- `CORS_ORIGINS` define a whitelist de origens separada por virgulas.
- logs HTTP removem token e campos de senha.
- erros inesperados nao retornam stack trace nem mensagens internas.

## Variaveis obrigatorias

```env
NODE_ENV=production
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="segredo-aleatorio-com-pelo-menos-32-caracteres"
CORS_ORIGINS="https://app.exemplo.com"
HOST=0.0.0.0
PORT=3333
CDI_ANUAL=14.40
ENABLE_SWAGGER=false
RUN_INVESTMENT_YIELD_JOB=false
```

## Pendencias antes de producao

- Usar store compartilhado para rate limit ao executar multiplas instancias.
- Adicionar lista de senhas comprometidas e recuperacao de senha com token de uso unico.
- Definir politica LGPD, backups e observabilidade sem dados financeiros sensiveis.

Veja tambem [LGPD](lgpd.md).

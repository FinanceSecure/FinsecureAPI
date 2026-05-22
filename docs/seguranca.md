# Autenticação e segurança

A Finsecure API protege as rotas privadas com autenticação via JWT e armazena senhas usando hash com Bcrypt. Este documento descreve o comportamento atual da aplicação e os pontos de atenção para manutenção.

## Cadastro e armazenamento de senhas

Durante o cadastro, a senha passa por validações de aplicação:

- mínimo de 8 caracteres;
- pelo menos uma letra maiúscula;
- pelo menos um caractere especial.

Depois da validação, a senha é armazenada com `bcrypt.hash(password, 10)`.

Isso significa que a senha original não é persistida em texto puro. O valor salvo no banco é o hash gerado pelo Bcrypt.

## Login

Rota pública:

```http
POST /api/usuarios/login
```

Fluxo:

1. A API valida presença de e-mail e senha.
2. Busca o usuário pelo e-mail.
3. Compara a senha enviada com o hash salvo usando `bcrypt.compare`.
4. Quando as credenciais são válidas, gera um token JWT.

O token contém:

- `userId`;
- `name`;
- `iat`, incluído pelo JWT;
- `exp`, incluído pelo JWT.

Tempo de expiração atual:

```text
2h
```

## Uso do token

As rotas privadas esperam o header:

```http
Authorization: Bearer <token>
```

O middleware `autenticarTokenFastify` valida esse header e decodifica o token com `JWT_SECRET`.

Quando o token é válido, a requisição recebe:

```ts
request.user = {
  userId: decoded.userId
}
```

Os controllers e casos de uso usam esse `userId` para consultar e alterar dados do usuário autenticado.

## Códigos de erro de autenticação

Quando o header não é enviado ou não começa com `Bearer `:

```http
401 Unauthorized
```

Resposta:

```json
{
  "error": "Token não fornecido ou formato inválido"
}
```

Quando o token é inválido, expirado ou não pode ser verificado:

```http
403 Forbidden
```

A resposta usa a mensagem retornada pela biblioteca JWT.

## Rotas públicas

As rotas de cadastro e login não exigem token:

```http
POST /api/usuarios/cadastrar
POST /api/usuarios/login
```

A rota de listagem de tipos de investimento está pública na implementação atual:

```http
GET /api/investimento/tipo
```

Observação: o schema Swagger dessa rota declara `bearerAuth`, mas o código não aplica o middleware `autenticarTokenFastify` nela. Se a intenção for protegê-la, o middleware precisa ser adicionado na rota.

## Rotas privadas

Exigem JWT válido:

- `PUT /api/usuarios/alterar-email`
- `PUT /api/usuarios/alterar-senha`
- `DELETE /api/usuarios/apagar-conta`
- `POST /api/transacoes/adicionar`
- `GET /api/transacoes/extrato`
- `PUT /api/transacoes/alterar/:id`
- `DELETE /api/transacoes/cancelar-transacao/:id`
- `GET /api/investimento/extrato`
- `GET /api/investimento/total-investido`
- `POST /api/investimento/adicionar`
- `POST /api/investimento/resgatar/:id`
- `GET /api/investimento/tipo/:id`
- `POST /api/investimento/tipo/adicionar`
- `PUT /api/investimento/tipo/atualizar/:id`

## CORS

A aplicação registra `@fastify/cors` com:

- `origin: true`;
- métodos `GET`, `POST`, `PUT` e `DELETE`;
- headers `Content-Type` e `Authorization`;
- `credentials: true`.

Esse comportamento facilita o consumo por aplicações frontend durante o desenvolvimento. Em produção, vale revisar `origin` para aceitar apenas domínios confiáveis.

## Variáveis sensíveis

Variáveis relevantes:

```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="sua-chave-secreta"
PORT=3333
CDI_ANUAL=14.4
```

Cuidados:

- `JWT_SECRET` deve ser forte e diferente entre ambientes.
- `.env` não deve ser versionado.
- `DATABASE_URL` deve apontar para um usuário de banco com permissões adequadas ao ambiente.
- O fallback atual de `JWT_SECRET` é `"secret"` quando a variável não existe; isso é aceitável apenas para desenvolvimento local.

## Tratamento de autorização por usuário

As operações privadas usam o `userId` do token para limitar o acesso aos dados do próprio usuário.

Exemplos:

- transações são buscadas por `id` e `userId`;
- extratos usam o `userId` autenticado;
- investimentos são consultados e processados por usuário.

Essa abordagem reduz o risco de um usuário acessar registros de outro usuário, desde que os repositórios continuem filtrando por `userId`.

## Recomendações de manutenção

- Remover o fallback `"secret"` em produção e falhar a inicialização quando `JWT_SECRET` não existir.
- Alinhar o Swagger com a implementação real das rotas públicas e privadas.
- Revisar `origin: true` antes de publicar a API.
- Evitar retornar mensagens internas de bibliotecas em erros de token em ambiente produtivo.
- Adicionar testes para autenticação, expiração de token e isolamento por usuário.

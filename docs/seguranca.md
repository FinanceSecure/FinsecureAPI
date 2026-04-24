# 🔒 Autenticação

O sistema implementa segurança em múltiplas camadas para proteger os dados financeiros dos usuários.

---

## 🛡️ Proteção de Senhas
- **Bcrypt:** Senhas nunca são armazenadas em texto puro. Utilizamos `bcrypt` com um salt de 10 rounds para gerar hashes seguros.

## 🔑 Autenticação JWT
- **Token:** Após o login, é gerado um token JSON Web Token.
- **Bearer Scheme:** O token deve ser enviado no header `Authorization: Bearer <TOKEN>`.
- **Payload:** O token contém informações não sensíveis para identificar o usuário (`usuarioId`).

## 🚦 Middlewares de Borda
O middleware `autenticarTokenFastify` intercepta todas as rotas privadas, garantindo que apenas usuários autenticados acessem seus dados.

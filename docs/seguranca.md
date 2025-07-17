# 🔒 Autenticação

A API utiliza authenticação com ***hash de senha + JWT TOKEN***.

---

## 🗝️ Cadastro de usuário

- A senha do usuário é **hasheada** usando bcrypt
- O hash gerado é armazenado no banco dentro do campo `senha`

### Exemplo:

```ts
const hash = await bcrypt.hash(senha,10); 
```

Exemplo de retorno da senha:
    $2b$10$Afr5Wc7enUOnruzUE1GgYO/NcsopEcJZ4aNsbFsRxptKomyaaOtre

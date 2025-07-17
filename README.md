# Finsecure API

API back-end feita em **Node.js + Typescript**, seguindo os princípios da **Arquitetura Limpa**, utilizando **Prisma ORM** com **PostgreSQL**.
Tendo **bcrypt** biblioteca destinada a autenticação segura, transformando senhas em hash.

---

## 🖥️ Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- bcrypt
- dotenv

---

## Documentação detalhada

- [Arquitetura](docs/arquitetura.md)
- [Filtros e validações](docs/filtros.md)
- [Autenticação e Segurança](docs/seguranca.md)

---

## Execução do Projeto

### Rodar o servidor local

```bash
npm run dev
```

Desta forma rodará em:
~> <http://localhost:3000/api/usuarios>

### Visualização de banco de dados pelo Prisma Studio

```bash
npx prisma studio
```

Desta forma rodará em:
~> <http://localhost:5555>

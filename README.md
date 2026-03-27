# 🛡️ Finsecure API

API de alta segurança para gestão financeira, desenvolvida com *Node.js* e *TypeScript*. O projeto foi concebido sob os pilares da **Arquitetura Hexagonal (Ports & Adapters)**, **Domain-Driven Design (DDD)** e **Clean Architecture**, garantindo uma aplicação testável, agnóstica a bancos de dados e de fácil manutenção.

---
## 🏛️ Arquitetura e Design

O projeto segue a divisão de responsabilidade para isolar a lógica de detalhes de infraestrutura:
-   **Domain (Core):** Contém entidades, objetos de valor e regras de negócio independentes de framework.
-   **Application (Use cases):** Orquestra o fluxo de dados e define os contratos (**Ports**) de entrada e saída
-   **Infrastructure (Adapters):** Implementações técnicas como Prisma ORM, MongoDB/ PostgreSQL e serviços de criptografia (**bcrybt**).
-   **Interface (Adapters):** Porta de entrada da aplicação, utilizando Express para exposição de rotas HTTP.
---

## 🛠️ Tecnologias

- **Runtime:** Node.js + TypeScript
- **Web Framework:** Express
- **ORM:** Prisma
- **Databases:** PostgreSQL (Produção) / MongoDB (Logs/Suporte)
- **Security:** Bcrypt (Hashing de senhas) & JWT
- **Environment:** Dotenv


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

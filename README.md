# 🔐 Finsecure API

API de alta performance para gestão financeira pessoal e investimentos, desenvolvida com **Node.js**, **Fastify** e **TypeScript**.

## 🏗️ Arquitetura
O projeto utiliza a **Arquitetura Hexagonal (Ports and Adapters)**, garantindo que o núcleo do negócio seja independente de frameworks e bancos de dados.

### Camadas Principais:
- **Core (Domínio/Aplicação):** Onde reside a inteligência financeira e os casos de uso.
- **Adapters (Entrada/Saída):** Implementações concretas de HTTP (Fastify) e Persistência (Prisma/MongoDB).

## 📑 Documentação Viva (Swagger)
A API é auto-documentada. Com o servidor rodando, acesse:
👉 `http://localhost:3333/documentation`

## 🚀 Tecnologias
- **Fastify:** Framework web ultra-veloz.
- **Prisma & MongoDB:** Persistência de dados flexível e escalável.
- **JWT & Bcrypt:** Segurança robusta para autenticação.
- **Swagger (OpenAPI 3.0):** Documentação interativa de endpoints.

## 📂 Estrutura de Pastas Simplificada
```text
src/
├── 📁 domain/        # Entidades e Regras de Negócio
├── 📁 application/   # Casos de Uso, DTOs e Portas (Interfaces)
├── 📁 adapters/      # HTTP (Controllers/Rotas) e DB (Prisma)
├── app.ts            # Configuração do Container (Plugins/Swagger)
└── server.ts         # Boot do servidor
```

## 🛠️ Como Executar

1. **Instalação:**
```bash
npm install
```

2. **Ambiente:**
Crie um arquivo `.env` com `DATABASE_URL` e `JWT_SECRET`.

3. **Execução:**
```bash
npm run dev
```

## Execução

### Rodar o servidor em desenvolvimento

```bash
npm run dev
```

Servidor padrão:

```text
http://localhost:3333
```

### Build

```bash
npm run build
```

### Prisma Studio

```bash
npx prisma studio
```

## Próximos Passos Recomendados

- adicionar schemas por rota para documentação Swagger
- padronizar DTOs de resposta quando necessário
- revisar mensagens com acentuação antiga em alguns arquivos legados
- adicionar testes para casos de uso e adapters HTTP

## Documentação Complementar

- [Arquitetura](docs/arquitetura.md)
- [Filtros e validações](docs/filtros.md)
- [Autenticação e segurança](docs/seguranca.md)
- [Documentação atualizada da API](docs/documentacao_atualizada.md)

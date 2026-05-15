# 🏗️ Arquitetura Detalhada (Hexagonal / Ports & Adapters)

O sistema foi projetado para ser agnóstico a tecnologias externas. Isso significa que o núcleo (regras de negócio) não depende de frameworks como Fastify ou ORMs como Prisma; ele apenas os utiliza através de interfaces.

## 🧱 Estrutura de Pastas e Camadas
___
├📁 src/
│
│── 📁 domain/             # 🧠 O Coração (Lógica Pura)
│   ├── 📁 entities/       # Entidades (ex: Usuario, Transacao)
│   ├── 📁 errors/         # Exceções exclusivas de negócio
│   └── 📁 validators/     # Validações de domínio
│
│── 📁 application/        # ⚙️ Orquestração (Casos de Uso)
│   ├── 📁 use-cases/      # Implementação dos requisitos funcionais
│   ├── 📁 dto/            # Data Transfer Objects (Input/Output)
│   └── 📁 errors/         # Erros de aplicação
│
│── 📁 ports/              # 🔌 Contratos (Interfaces)
│   └── 📁 repositories/   # Interfaces que definem a persistência
│
│── 📁 adapters/           # 🛠️ Implementações Concretas
│   ├── 📁 http/           # Borda de Entrada (Fastify Controllers)
│   └── 📁 database/       # Borda de Saída (Prisma Repositories)
│
│── app.ts                 # Bootstrap de Plugins e Middlewares
│── server.ts              # Inicialização do Servidor

## ⚙️ Fluxo de Execução Técnica

Para garantir a integridade, os dados fluem através de uma cadeia de responsabilidades:

1.  **Entrada:** O cliente envia uma requisição HTTP.
2.  **Adapter (HTTP):** O Fastify recebe, valida o Schema (Swagger) e repassa ao **Controller**.
3.  **Controller:** Traduz a requisição para um **DTO** e chama o **Use Case**.
4.  **Application (Use Case):** Orquestra a lógica, chamando entidades do domínio.
5.  **Port (Interface):** O Use Case solicita persistência através de uma interface abstrata.
6.  **Adapter (Database):** O Prisma implementa a interface e salva no **MongoDB**.
7.  **Resposta:** O resultado faz o caminho inverso, sendo convertido em resposta JSON no Controller.

## 🛡️ Benefícios desta Abordagem
- **Testabilidade:** Podemos testar os `use-cases` sem precisar de um banco de dados real (usando mocks das `ports`).
- **Manutenibilidade:** Trocar o MongoDB por PostgreSQL afetaria apenas a camada de `adapters`, sem tocar na lógica de negócio.
- **Clareza:** Cada arquivo tem uma única responsabilidade clara.

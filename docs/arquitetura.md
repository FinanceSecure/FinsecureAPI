# Arquitetura da Aplicação

Feita de forma a seguir os princpipios da ***Arquitetura Hexagonal (Ports and Adapters)***, dividindo em camadas.
Arquitetura ao qual utiliza a filosofia ***Domain-Driven Design (Eric Evans)***

## Camadas
___
├📁 node_modules/ ~> Dependências
├📁 prisma/ ~> Destinado a configurações do Prisma
├📁 src/
│
│── 📁 domain/ ~> Destinado a regras de negócio
│   ├── 📁 entities/ ~> Entidades
│   ├── 📁 errors/ ~> Erros de negócio
│   ├── 📁 validators/ ~> Validações
│
│── 📁 application/ ~> Destinado a casos de uso da aplicação
│   ├── 📁 use-cases/ ~> Orquestram regras do domínio
│   ├── 📁 errors/ ~> Erros de aplicação (ex: HttpError)
│
│── 📁 ports/ ~> Destinado a interfaces abstratas
│   ├── 📁 repositories/ ~> Contratos de persistência
│
│── 📁 adapters/ ~> Destinado a implementações
│   ├── 📁 controllers/ ~> Controllers HTTP
│   ├── 📁 database/ ~> Prisma + repositórios
│   │    ├── db.ts ~> conexão Prisma/Pool
│   ├── 📁 middlewares/ ~> Autenticação JWT, etc
│   ├── 📁 routes/ ~> Definição de rotas
│
│── 📁 types/ ~> Tipos globais (ex: Express Request com userId)
│
│── app.ts ~> Configuração do Express (rotas, middlewares)
│── server.ts ~> Inicialização do servidor

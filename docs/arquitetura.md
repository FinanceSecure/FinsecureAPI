# Arquitetura da Aplicação

Feita de forma a seguir os princpipios da ***Arquitetura Limpa (Clean Architecture)***, dividindo em camadas que sejam bem definidas

## Camadas

### 1. `domain/`

Contém as **entidades do negócio**, como `Usuario`,`Transacao` e `Saldo`. Não dependendo de frameworks ou bibliotecas externas.

### 2. `apllication/`

Para **casos de uso (Use Cases)** que compõem as regras de negócio. Por exemplo: `CadastrarUsuario` e `CalcularSaldo`.

### 3. `adapters/`

Destinado a implementação concreta:

- `controllers/`: trata HTTP e recebe requisições
- `database/`: respositórios usando Prisma
- `routes/`: define as rotas públicas e privadas

### 4. `ports/`

Define **interfaces abstratas** para repositórios, assim o domínio e os casos de uso utilizem sem conhecer em detalhes a implementação.

### 5. `prisma/`

Contém o schema do PostgreSQL e as migrations geradas.

### 6. `index.ts`

Ponto de entrada de aplicação
___
├📁 node_modules/ ~> Biblioteca para dependências
├📁 prisma/ ~> Configurações e migrations do Prisma
├📁 src/
  ├── 📁 domain/ ~> Entidades de negócio pura
  ├── 📁 application/ ~> Casos de uso, lógica que coordena operações do domínio
  ├── 📁 adapters/ ~> Camada referente a adaptação externa
  │   ├── 📁 controllers/ ~> Entrada da aplicação
  │   ├── 📁 database/ ~> Implementação do repositório com Prisma
  │   ├── 📁 routes/ ~> Rotas HTTP
  ├── 📁 ports/ ~> Feito para interfaces abstratas
  │   ├── 📁 repositories/ ~> Destinado a interfaces para persistência
  │   ├── 📁 services/ ~> Destinado a interfaces para comunicação externa
  │
  ├── 📁 middlewares/ ~> Middleware de autenticação JWT
  ├── 📁 types/ ~> Tipos globais
  ├── index.ts ~> entrada da aplicação

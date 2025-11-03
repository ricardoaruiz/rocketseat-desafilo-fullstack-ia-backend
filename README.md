# Webhook Inspector API

## 📋 Sobre o Projeto

O Webhook Inspector é uma API REST desenvolvida para capturar, armazenar e gerenciar webhooks. Permite que você monitore e inspecione requisições de webhook recebidas, oferecendo funcionalidades completas para listar, visualizar e deletar webhooks capturados.

## 🚀 Tecnologias Utilizadas

### Backend Framework
- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente para Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação com tipagem estática

### Banco de Dados
- **[PostgreSQL](https://www.postgresql.org/)** - Sistema de gerenciamento de banco de dados relacional
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM moderno e type-safe para TypeScript
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Ferramentas CLI para migrações e gerenciamento do banco

### Validação e Documentação
- **[Zod](https://zod.dev/)** - Biblioteca de validação de esquemas TypeScript-first
- **[Fastify Type Provider Zod](https://github.com/turkerdev/fastify-type-provider-zod)** - Integração entre Fastify e Zod
- **[Fastify Swagger](https://github.com/fastify/fastify-swagger)** - Geração automática de documentação OpenAPI
- **[Scalar API Reference](https://github.com/scalar/scalar)** - Interface moderna para documentação da API

### Infraestrutura e DevOps
- **[Docker](https://www.docker.com/)** - Containerização da aplicação
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

### Desenvolvimento
- **[Biome](https://biomejs.dev/)** - Linter e formatador de código rápido
- **[TSX](https://tsx.is/)** - Executor TypeScript com hot reload

### Utilitários
- **[CORS](https://github.com/fastify/fastify-cors)** - Configuração de Cross-Origin Resource Sharing
- **[HTTP Status Codes](https://www.npmjs.com/package/http-status-codes)** - Constantes para códigos de status HTTP
- **[UUIDv7](https://www.npmjs.com/package/uuidv7)** - Geração de identificadores únicos UUIDv7

## 🛠️ Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose**

## ⚙️ Configuração e Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webhooks
```

### 4. Inicie o ambiente de desenvolvimento
```bash
npm run environment:up
```

Este comando irá:
- Iniciar o container PostgreSQL via Docker Compose
- Executar as migrações do banco de dados
- Popular o banco com dados iniciais (seed)

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em:
- **API**: `http://localhost:3333`
- **Documentação**: `http://localhost:3333/docs`

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia o servidor em modo de desenvolvimento com hot reload
npm start               # Inicia o servidor em modo de produção

# Banco de dados
npm run db:generate     # Gera migrações baseadas nas alterações do schema
npm run db:migrate      # Executa as migrações pendentes
npm run db:studio       # Abre o Drizzle Studio para visualizar o banco
npm run db:seed         # Popula o banco com dados iniciais

# Ambiente
npm run environment:up    # Sobe o ambiente completo (Docker + migrações + seed)
npm run environment:down  # Para o ambiente Docker

# Linting
npm run lint            # Verifica problemas de código
npm run lint:fix        # Corrige automaticamente problemas de código
```

## 📚 Endpoints da API

### Base URL
```
http://localhost:3333
```

### 1. **Capturar Webhook** 
```http
ALL /capture/*
```

**Descrição**: Captura qualquer tipo de requisição HTTP (GET, POST, PUT, DELETE, etc.) enviada para qualquer rota que comece com `/capture/`.

**Exemplo de uso**:
```bash
curl -X POST http://localhost:3333/capture/payment/success \
  -H "Content-Type: application/json" \
  -d '{"orderId": "12345", "status": "completed"}'
```

**Resposta de sucesso (201)**:
```json
{
  "id": "01234567-89ab-cdef-0123-456789abcdef"
}
```

**Características**:
- Aceita qualquer método HTTP
- Captura headers, body, IP, método, pathname
- Armazena automaticamente timestamp de criação
- Retorna ID único do webhook capturado

---

### 2. **Listar Webhooks**
```http
GET /api/webhooks
```

**Descrição**: Lista os webhooks capturados com paginação baseada em cursor.

**Parâmetros de Query**:
- `limit` (opcional): Número máximo de webhooks retornados (1-100, padrão: 20)
- `cursor` (opcional): Cursor para paginação (UUIDv7)

**Exemplo de uso**:
```bash
# Listar primeiros 10 webhooks
curl http://localhost:3333/api/webhooks?limit=10

# Paginação usando cursor
curl http://localhost:3333/api/webhooks?limit=10&cursor=01234567-89ab-cdef-0123-456789abcdef
```

**Resposta de sucesso (200)**:
```json
{
  "webhooks": [
    {
      "id": "01234567-89ab-cdef-0123-456789abcdef",
      "method": "POST",
      "pathname": "/payment/success",
      "createdAt": "2024-11-03T10:30:00.000Z"
    }
  ],
  "nextCursor": "01234567-89ab-cdef-0123-456789abcdef"
}
```

---

### 3. **Obter Webhook por ID**
```http
GET /api/webhooks/:id
```

**Descrição**: Retorna os detalhes completos de um webhook específico.

**Parâmetros de Rota**:
- `id` (obrigatório): ID único do webhook (UUIDv7)

**Exemplo de uso**:
```bash
curl http://localhost:3333/api/webhooks/01234567-89ab-cdef-0123-456789abcdef
```

**Resposta de sucesso (200)**:
```json
{
  "id": "01234567-89ab-cdef-0123-456789abcdef",
  "method": "POST",
  "pathname": "/payment/success",
  "ip": "192.168.1.1",
  "statusCode": 200,
  "contentType": "application/json",
  "contentLength": 45,
  "headers": {
    "content-type": "application/json",
    "user-agent": "curl/7.68.0",
    "accept": "*/*"
  },
  "body": "{\"orderId\": \"12345\", \"status\": \"completed\"}",
  "createdAt": "2024-11-03T10:30:00.000Z"
}
```

**Resposta de erro (404)**:
```json
{
  "message": "Webhook not found"
}
```

---

### 4. **Deletar Webhook**
```http
DELETE /api/webhooks/:id
```

**Descrição**: Remove um webhook específico do sistema.

**Parâmetros de Rota**:
- `id` (obrigatório): ID único do webhook (UUIDv7)

**Exemplo de uso**:
```bash
curl -X DELETE http://localhost:3333/api/webhooks/01234567-89ab-cdef-0123-456789abcdef
```

**Resposta de sucesso (204)**:
```
(Corpo vazio)
```

**Resposta de erro (404)**:
```json
{
  "message": "Webhook with ID 01234567-89ab-cdef-0123-456789abcdef not found."
}
```

## 📊 Estrutura do Banco de Dados

### Tabela `webhooks`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT (Primary Key) | Identificador único UUIDv7 |
| `method` | TEXT | Método HTTP da requisição |
| `pathname` | TEXT | Caminho da URL requisitada |
| `ip` | TEXT | Endereço IP do cliente |
| `status_code` | INTEGER | Código de status HTTP (padrão: 200) |
| `content_type` | TEXT | Tipo de conteúdo da requisição |
| `content_length` | INTEGER | Tamanho do conteúdo em bytes |
| `query_params` | JSONB | Parâmetros de query da URL |
| `headers` | JSONB | Headers da requisição |
| `body` | TEXT | Corpo da requisição |
| `created_at` | TIMESTAMP | Data e hora de criação |

## 📖 Documentação Interativa

A documentação completa da API está disponível em:
```
http://localhost:3333/docs
```

Esta documentação inclui:
- Esquemas detalhados de requisição e resposta
- Exemplos interativos para teste
- Validações e tipos de dados esperados
- Interface moderna e responsiva

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
src/
├── app.ts              # Configuração principal do Fastify
├── server.ts           # Inicialização do servidor
├── env.ts              # Validação de variáveis de ambiente
├── db/
│   ├── index.ts        # Configuração da conexão com banco
│   ├── seed.ts         # Scripts de população inicial
│   ├── migrations/     # Migrações do banco de dados
│   └── schema/         # Definições de schema do banco
└── routes/             # Definições das rotas da API
```

### Adicionando Novas Rotas

1. Crie um novo arquivo em `src/routes/`
2. Implemente usando o padrão Fastify Plugin
3. Registre a rota em `src/app.ts`
4. Execute `npm run db:generate` para novas migrações (se necessário)

### Padrões de Código

- Use TypeScript para type safety
- Valide entrada com Zod schemas
- Documente endpoints com comentários OpenAPI
- Siga as convenções do Biome para formatação

## 🐳 Docker

### Desenvolvimento com Docker
```bash
# Iniciar apenas o PostgreSQL
docker compose up -d

# Parar os serviços
docker compose down
```

### Produção
```bash
# Build da aplicação
npm run build

# Executar em produção
npm start
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `package.json` para detalhes.

---
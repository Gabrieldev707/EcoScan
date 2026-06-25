# EcoScan — Backend

API REST em Node.js + Express + MongoDB para o app EcoScan.

## Pré-requisitos

- Node.js 18+
- Conta no MongoDB Atlas com cluster criado

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo .env a partir do exemplo
cp .env.example .env
# Edite .env e coloque sua MONGODB_URI e um JWT_SECRET forte

# 3. Rodar em desenvolvimento
npm run dev

# 4. Rodar em produção
npm start
```

## Variáveis de ambiente (.env)

| Variável | Descrição |
|---|---|
| `PORT` | Porta da API (padrão: 3000) |
| `MONGODB_URI` | String de conexão do MongoDB Atlas |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (padrão: 7d) |

## Rotas

### Auth
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Cadastrar usuário | Não |
| POST | `/api/auth/login` | Login | Não |
| POST | `/api/auth/logout` | Logout | Sim |

**Body register/login:**
```json
{ "name": "Gabriel", "email": "gabriel@email.com", "password": "123456" }
```
**Resposta:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "name": "Gabriel", "email": "...", "level": 1, "points": 0 }
}
```

---

### Scans (requer Bearer token)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/scans` | Registrar um scan/descarte |
| GET | `/api/scans?page=1&limit=20` | Listar histórico do usuário |

**Body POST /api/scans:**
```json
{ "wasteType": "Garrafa PET", "city": "Campina Grande, PB" }
```

---

### EcoPoints (requer Bearer token)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/ecopoints?lat=-7.23&lng=-35.88&radius=5` | Pontos de coleta próximos |

---

## Estrutura de pastas

```
src/
  config/       # conexão com banco
  controllers/  # lógica das rotas
  middleware/   # autenticação JWT
  models/       # schemas Mongoose
  routes/       # definição de rotas
  app.js        # configuração Express
  index.js      # entrypoint
```

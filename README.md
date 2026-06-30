# EcoScan

EcoScan e uma aplicacao academica para apoiar descarte correto de residuos e registro de pontos com acumulo de lixo urbano. O projeto une um app mobile em Expo/React Native, uma API Node.js/Express com MongoDB e um frontend web em React/Vite.

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img alt="Groq" src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white" />
</p>

## Visao geral

O app permite que o usuario:

- crie conta, faca login e acumule pontos;
- escaneie residuos por texto ou foto;
- receba orientacao de descarte com categoria, cor da lixeira e pontuacao;
- veja ecopontos proximos no mapa;
- acompanhe ranking e atividades da comunidade;
- registre um EcoAlerta quando encontrar acumulo de lixo, descarte irregular, lixeira transbordando ou outro problema urbano.

## Estrutura

```text
EcoScan/
|-- backend/    API Express, MongoDB, JWT, IA e regras de negocio
|-- mobile/     App Expo/React Native usado no Expo Go
|-- frontend/   Interface web React/Vite
`-- package.json
```

## Stack

**Backend**

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Zod
- Helmet, CORS e rate limit
- Gemini API
- Groq API

**Mobile**

- Expo
- React Native
- TypeScript
- React Navigation
- Axios
- AsyncStorage
- Expo Camera
- Expo Image Picker
- Expo Location
- React Native Maps

**Web**

- React
- Vite
- TypeScript
- Axios
- GSAP
- Lucide React
- Tailwind CSS

## Funcionalidades principais

### Scanner de residuos

O scanner aceita descricao por texto e tambem foto. A logica atual da IA e:

```text
Scan com foto -> Gemini
Se Gemini falhar -> Groq Vision
Scan sem foto -> Groq texto
Se IA falhar -> fallback local
```

A resposta salva o item identificado, material, categoria, cor da lixeira, guia de descarte, confianca e pontos.

### EcoAlerta

O EcoAlerta e voltado para acao urbana. Em vez de classificar lixo item por item, ele analisa uma cena com possivel problema publico:

- acumulo de lixo;
- descarte irregular;
- lixeira transbordando;
- entulho;
- bueiro obstruido;
- residuo perigoso.

Fluxo de IA:

```text
EcoAlerta com foto -> Gemini
Se Gemini falhar -> Groq Vision
Se IA falhar -> registro para triagem manual
```

### Comunidade

A tela de comunidade consome endpoints reais do backend e exibe:

- ranking de usuarios;
- estatisticas gerais;
- atividade recente de descartes.

### Recuperacao de senha

Existe a tela e rota de "esqueci minha senha". Nesta versao academica, o backend retorna uma mensagem generica por seguranca, mas ainda nao envia e-mail real.

## Como rodar

Instale as dependencias na raiz:

```powershell
cd C:\Dev\EcoScan
npm install
```

Crie o arquivo de ambiente do backend:

```powershell
copy backend\.env.example backend\.env
```

Configure `backend/.env`:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/ecoscan
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d

AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=20000

AI_FALLBACK_PROVIDER=groq
GROQ_API_KEY=
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
GROQ_TIMEOUT_MS=20000

CORS_ORIGIN=http://localhost:8081
```

Inicie backend e mobile juntos em LAN:

```powershell
npm run dev
```

Se precisar usar tunel do Expo:

```powershell
npm run dev:tunnel
```

## Teste em celular fisico

Para Expo Go no celular, PC e celular precisam estar na mesma rede Wi-Fi.

Descubra o IP local do PC e configure `mobile/.env.local`:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000/api
```

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.18.115:3000/api
```

Antes de abrir o app, teste no navegador do celular:

```text
http://SEU_IP_LOCAL:3000/health
```

Se retornar:

```json
{"status":"ok"}
```

o app consegue alcancar o backend.

## Scripts

Na raiz:

```bash
npm run dev
npm run dev:tunnel
npm run typecheck
npm run seed:ecopoints
```

No backend:

```bash
npm run dev --workspace backend
npm run seed:ecopoints --workspace backend
```

No mobile:

```bash
npm run start:lan --workspace mobile
npm run start:tunnel --workspace mobile
npm run typecheck --workspace mobile
```

No frontend web:

```bash
cd frontend
npm run dev
npm run build
```

## Endpoints

Base local:

```text
http://localhost:3000/api
```

| Metodo | Rota | Autenticacao | Descricao |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Nao | Cria conta |
| `POST` | `/auth/login` | Nao | Faz login |
| `POST` | `/auth/forgot-password` | Nao | Solicita recuperacao de senha |
| `GET` | `/auth/me` | Sim | Retorna usuario autenticado |
| `POST` | `/auth/logout` | Sim | Encerra sessao no cliente |
| `POST` | `/scans` | Sim | Cria classificacao de residuo |
| `GET` | `/scans?page=1&limit=20` | Sim | Lista scans do usuario |
| `POST` | `/ecoalerts` | Sim | Cria EcoAlerta |
| `GET` | `/ecoalerts?page=1&limit=20` | Sim | Lista EcoAlertas do usuario |
| `GET` | `/community/overview` | Sim | Retorna ranking, resumo e feed |
| `GET` | `/ecopoints?lat=-7.23&lng=-35.88&radius=5` | Sim | Lista ecopontos proximos |

Rotas protegidas usam:

```http
Authorization: Bearer <token>
```

## Exemplos com curl

Criar usuario:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Aluno Eco\",\"email\":\"aluno@example.com\",\"password\":\"secret123\"}"
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"aluno@example.com\",\"password\":\"secret123\"}"
```

Criar scan por texto:

```bash
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d "{\"wasteType\":\"Garrafa PET\",\"city\":\"Campina Grande, PB\"}"
```

## Banco de dados

O projeto usa MongoDB. Para desenvolvimento local, pode usar:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ecoscan
```

Para MongoDB Atlas, configure a URI em `backend/.env` e libere o IP em **Network Access** no painel do Atlas.

Para popular ecopontos iniciais:

```bash
npm run seed:ecopoints
```

## Seguranca

Arquivos de ambiente reais ficam fora do Git:

```text
.env
backend/.env
mobile/.env.local
```

Use apenas os arquivos `.env.example` como referencia. Nunca coloque chaves do Gemini, Groq, MongoDB Atlas ou JWT diretamente no codigo.

## Status atual

- Backend, mobile e frontend web estao versionados.
- App mobile e o fluxo principal de uso.
- Scanner com imagem usa Gemini e fallback Groq Vision.
- Scanner sem imagem usa Groq texto.
- EcoAlerta registra ocorrencias urbanas com analise visual.
- Comunidade usa endpoints reais do backend.
- Recuperacao de senha existe como fluxo inicial, sem envio real de e-mail.

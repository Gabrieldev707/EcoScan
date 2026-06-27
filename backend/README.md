# EcoScan Backend

Backend Node.js/Express/MongoDB para autenticacao, scans e ecopontos do EcoScan.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Configure `MONGODB_URI` e `JWT_SECRET` antes de iniciar.

## Variaveis

- `PORT`: porta HTTP. Padrao: `3000`.
- `NODE_ENV`: `development` ou `production`.
- `MONGODB_URI`: URI MongoDB obrigatoria.
- `JWT_SECRET`: segredo JWT obrigatorio.
- `JWT_EXPIRES_IN`: validade do token. Padrao: `7d`.
- `CORS_ORIGIN`: origens web permitidas, separadas por virgula.
- `AI_PROVIDER`: use `gemini` para habilitar classificacao via Gemini.
- `GEMINI_API_KEY`: chave do Gemini. Se ausente, a API usa fallback local.
- `GEMINI_MODEL`: modelo Gemini. Padrao: `gemini-2.5-flash`.
- `GEMINI_TIMEOUT_MS`: timeout da chamada Gemini. Padrao: `8000`.

## Scripts

- `npm run dev`: inicia a API com `node --watch`.
- `npm start`: inicia a API sem watcher.
- `npm run seed:ecopoints`: insere/atualiza ecopontos de exemplo.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/scans`
- `GET /api/scans?page=1&limit=20`
- `GET /api/ecopoints?lat=-7.23&lng=-35.88&radius=5`

Rotas de scans e ecopoints exigem `Authorization: Bearer <token>`.

## Classificacao

O scan exige `wasteType` explicitamente. Quando `AI_PROVIDER=gemini` e `GEMINI_API_KEY` estiverem configurados, a classificacao usa Gemini no backend. Se a chamada falhar ou retornar JSON invalido, a API usa fallback local deterministico por palavras-chave. Imagens/base64 ainda nao sao aceitas.

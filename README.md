# EcoScan

EcoScan tem, neste estado, uma API Node.js/Express/MongoDB e um app mobile Expo/React Native integrado a ela. O frontend web existente foi mantido no repositorio, mas o fluxo ativo documentado aqui e backend + mobile.

## Estrutura

```text
EcoScan/
├── backend/   API Express + MongoDB + JWT
├── mobile/    App Expo/React Native
├── frontend/  Web existente, nao integrado neste trabalho
└── package.json
```

## Setup

```bash
npm install
copy backend\.env.example backend\.env
npm run dev
```

Configure `backend/.env` antes de iniciar a API:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ecoscan
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8081
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=8000
```

Para popular ecopontos de exemplo:

```bash
npm run seed:ecopoints
```

## Mobile

O app usa React Navigation, `AuthContext`, Axios e AsyncStorage.

Base URL da API:

- `EXPO_PUBLIC_API_URL` sobrescreve qualquer default.
- Em dev, sem override, o app deriva o host do Expo.
- Android emulator usa `10.0.2.2`.
- iOS simulator usa `localhost`.
- Fora de dev, `EXPO_PUBLIC_API_URL` e obrigatorio.

O scanner nao envia imagem/base64. Enquanto nao houver IA real, ele exige `wasteType` e `city` explicitamente e envia:

```json
{
  "wasteType": "Garrafa PET",
  "city": "Campina Grande, PB"
}
```

A classificacao acontece somente no backend. Se `AI_PROVIDER=gemini` e `GEMINI_API_KEY` estiverem configurados, o backend chama Gemini para classificar o texto. Se a chave estiver ausente, a chamada falhar ou a resposta vier invalida, o backend usa fallback local por palavras-chave.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/scans`
- `GET /api/scans?page=1&limit=20`
- `GET /api/ecopoints?lat=-7.23&lng=-35.88&radius=5`

Rotas protegidas exigem:

```http
Authorization: Bearer <token>
```

Erros da API seguem:

```json
{
  "message": "string",
  "errors": []
}
```

## Scripts

- `npm run dev`: roda backend e mobile juntos.
- `npm run typecheck`: valida TypeScript do mobile.
- `npm run seed:ecopoints`: insere/atualiza ecopontos de exemplo.

## Teste com curl

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Aluno Eco\",\"email\":\"aluno@example.com\",\"password\":\"secret123\"}"
```

Use o token retornado:

```bash
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d "{\"wasteType\":\"Garrafa PET\",\"city\":\"Campina Grande, PB\"}"
```

## Limitações atuais

- A classificacao de residuos usa Gemini quando configurado e fallback local quando nao configurado ou indisponivel.
- Nao ha IA de imagem implementada.
- Ecopontos dependem de dados no MongoDB; use o seed opcional para dados iniciais.
- O frontend web foi preservado, mas nao foi integrado nesta etapa.

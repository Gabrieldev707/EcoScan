# EcoScan

<p align="center">
  <img src="uploads/LogoEcoScan.png" alt="Logo do EcoScan" width="220" />
</p>

Identificação inteligente de resíduos via câmera e IA. Cada descarte correto gera **EcoPoints**, contribui para o ranking da cidade e impacto coletivo mensurável.

> Status: Beta · Campina Grande, PB · v1.0.0 · 2026

---

## Módulos

| Módulo | Tecnologia | Status |
|---|---|---|
| `frontend/` | React + Vite + TypeScript + GSAP | ✅ UC01 |
| `mobile/` | React Native + Expo SDK 53 + TypeScript | ✅ UC01 |
| `backend/` | Node.js + Express + Prisma | 🔜 |

---

## Como rodar

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/
```

> Crie `frontend/.env.local` com `VITE_API_URL=http://localhost:3000/api`

### Mobile

```bash
cd mobile
# Se tiver problema de SSL no npm:
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install
npx expo start       # Expo DevTools
npx expo start --android
npx expo start --ios
```

### Backend (em breve)

```bash
cd backend
npm install
npm run dev          # http://localhost:3000
```

---

## Estrutura

```
EcoScan/
├── frontend/          React portfolio web (GSAP, React Router, Axios)
├── mobile/            App React Native/Expo (UC01–UC05)
├── backend/           API REST (Node.js — em breve)
├── .env.example       Variáveis de ambiente de todos os módulos
└── README.md
```

---

## Stack detalhada

### Frontend
- **React 18** + **TypeScript** + **Vite 5**
- **React Router 6** — rotas protegidas via `AuthContext`
- **GSAP 3.12** + **ScrollTrigger** — cursor, scroll-scrub do vídeo, reveal
- **Axios** — camada de API com interceptors (token, 401 → logout)
- Fontes: **Bebas Neue** (display) · **Syne 700/800** (títulos) · **Barlow** (corpo)

### Mobile
- **Expo SDK 53** + **React Native 0.79** + **TypeScript**
- **React Navigation** — AuthStack + AppNavigator (Bottom Tabs)
- **Expo Linear Gradient** + **Reanimated** + **AsyncStorage**
- Fontes: **Syne_800ExtraBold** (títulos) · **DM Sans** (corpo)

### Paleta compartilhada

| Token | Hex |
|---|---|
| `bg` | `#07090a` |
| `green` | `#1dff8a` |
| `greenDim` | `#0fcc6b` |
| `lime` | `#b8ff3c` |
| `surface` | `#0c1010` |
| `text` | `#e8f5ee` |
| `error` | `#ef4444` |

---

## Casos de uso

| UC | Descrição | Status |
|---|---|---|
| UC01 | Autenticação e Perfil | ✅ |
| UC02 | Scanner com câmera + IA | 🔜 |
| UC03 | Mapa de ecopontos | 🔜 |
| UC04 | Dashboard de impacto | 🔜 |
| UC05 | Chatbot + grupos | 🔜 |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run lint       # eslint src --ext ts,tsx
```

### Mobile

```bash
cd mobile
npm install        # or NODE_TLS_REJECT_UNAUTHORIZED=0 npm install if SSL fails
npx expo start
npx expo start --android
npx expo start --ios
```

### Backend (not yet implemented)

```bash
cd backend
npm install
npm run dev        # http://localhost:3000
```

---

## Architecture

This is a **single-repo** project with two active clients and a backend that does not exist yet.

```
EcoScan/
├── frontend/    React 18 + Vite + TypeScript + Tailwind v4 + GSAP (portfolio-style landing)
├── mobile/      React Native + Expo SDK 53 + TypeScript (app)
└── backend/     Node.js + Express + Prisma (🔜 não implementado)
```

### Frontend

`frontend/src/App.tsx` is a single-page landing that renders sections in sequence (`Hero → Login → Dashboard → Guide → About`) with no React Router — routing is scroll/section-based. It hosts global effects: `CustomCursor`, `ScrollProgress`, `RevealObserver`, `MagneticNavCta`.

Auth state lives in `frontend/src/context/AuthContext.tsx` (rehydrates from `localStorage` on mount). The Axios client in `frontend/src/api/client.ts` injects the token via request interceptor and fires a `ecoscan:session-expired` window event on 401, which the context listens to for auto-logout.

Path alias `@/` maps to `frontend/src/` (configured in `vite.config.ts`). Vite proxies `/api` → `http://localhost:3000`.

Design tokens are centralized in `frontend/src/styles/theme.ts` (colors + typography). The font stack is: **Bebas Neue** (display) · **Syne** (titles) · **Barlow** (body). Background: `#07090a`.

**Backend is absent** — `frontend/src/api/auth.ts` calls real endpoints that don't exist. Until the backend is live, `login` and `register` in `AuthContext` use mock data.

### Mobile

`mobile/App.tsx` bootstraps fonts, wraps in `AuthProvider`, then renders `AuthNavigator` (stack: Login → Register → Profile). After auth, `AppNavigator` provides a bottom-tab shell: Scanner · Mapa · Dashboard · Perfil · Comunidade.

`mobile/src/api/client.ts` uses `10.0.2.2:3000` in `__DEV__` (Android emulator → host localhost) and `https://api.ecoscan.app/api` in production. Auth token persists via `AsyncStorage` (keys: `ecoscan_token`, `ecoscan_user`).

`mobile/src/theme/colors.ts` and `mobile/src/theme/fonts.ts` define the design system; both clients share the same palette (see README palette table).

### Shared contract

Both clients implement the same `AuthPayload` shape:

```typescript
{ token: string; user: { id: string; name: string; email: string; level: number; points: number } }
```

Both use the same storage key names (`ecoscan_token`, `ecoscan_user`) and the same API paths (`/auth/login`, `/auth/register`, `/auth/logout`).

---

## Environment

Frontend: copy `.env.example` values to `frontend/.env.local`. The only required variable is `VITE_API_URL` (defaults to `http://localhost:3000/api` if unset).

Mobile: no `.env` file — `BASE_URL` is hardcoded in `mobile/src/api/client.ts` based on `__DEV__`.

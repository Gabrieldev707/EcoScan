# EcoScan

<p align="center">
  <img src="uploads/LogoEcoScan.png" alt="Logo do EcoScan" width="220" />
</p>

Identificação inteligente de resíduos via câmera e IA. Cada descarte correto gera **EcoPoints**, fortalece rankings locais e ajuda a transformar reciclagem em hábito mensurável.

> Status: Beta · Campina Grande, PB · v1.0.0 · 2026

---

## Módulos

| Módulo | Tecnologia | Status |
|---|---|---|
| `frontend/` | React 18 + Vite 5 + TypeScript + GSAP | Landing web v2 |
| `mobile/` | Expo SDK 54 + React Native 0.81 + TypeScript | App Expo Go com fluxo visual completo |
| `backend/` | Node.js + Express + Prisma | Ainda não implementado |

---

## Como Rodar

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/
```

> Crie `frontend/.env.local` com `VITE_API_URL=http://localhost:3000/api` quando a API estiver disponível.

### Mobile

```bash
cd mobile
npm install
npm start            # Expo DevTools / Expo Go
npm run android
npm run ios
```

Se o Expo Go ficar com fonte ou bundle antigo:

```bash
npx expo start --clear
```

### Backend

O backend ainda não existe neste repositório. As telas e APIs dos clientes usam mocks ou contratos preparados para futura integração.

---

## Estrutura

```text
EcoScan/
├── frontend/          Landing web em React/Vite com GSAP
├── mobile/            App React Native/Expo para Expo Go
├── uploads/           Assets compartilhados, incluindo logo
├── .env.example       Exemplo de variáveis de ambiente
└── README.md
```

---

## Stack Detalhada

### Frontend

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 4** para base utilitária
- **GSAP 3.12** + **ScrollTrigger** para animações, reveal e hero com vídeo
- **Axios** com client preparado para token e expiração de sessão
- Estrutura de landing em seções: `Hero`, `Login`, `Dashboard`, `Guide` e `About`

### Mobile

- **Expo SDK 54** + **React Native 0.81**
- **React Navigation** com `AuthNavigator` e `AppNavigator` em bottom tabs
- **Expo Camera**, **Image Picker** e **Location** para o fluxo de scanner
- **Reanimated** para microinterações e transições do scanner
- **AsyncStorage** para persistência local de sessão mockada
- Telas principais: `Scanner`, `Mapa`, `Dashboard`, `Perfil` e `Comunidade`

---

## Design Compartilhado

O web e o mobile usam a mesma direção visual:

- Display/títulos: **Bebas Neue**
- Corpo/UI: **Barlow**
- Fundo escuro de alto contraste
- Verde neon como cor de ação
- Cards e botões compactos, com cantos quase retos

### Paleta

| Token | Hex |
|---|---|
| `bg` | `#07090a` |
| `surface` | `#0c1010` |
| `surface2` | `#10171a` |
| `green` | `#1dff8a` |
| `greenDim` | `#0fcc6b` |
| `lime` | `#b8ff3c` |
| `accent` | `#00ffcc` |
| `text` | `#e8f5ee` |
| `muted` | `#4a6255` |
| `dim` | `#7a9387` |
| `error` | `#ef4444` |

---

## Casos de Uso

| UC | Descrição | Estado Atual |
|---|---|---|
| UC01 | Autenticação e Perfil | Mock funcional no mobile |
| UC02 | Scanner com câmera + IA | Fluxo visual com câmera, galeria e resultado mockado |
| UC03 | Mapa de ecopontos | Tela mobile mockada com lista de pontos |
| UC04 | Dashboard de impacto | Tela mobile alinhada ao dashboard web |
| UC05 | Comunidade, ranking e recompensas | Tela mobile mockada |

---

## Validação

```bash
cd mobile
npx tsc --noEmit
```

Esse comando valida o TypeScript do app mobile, incluindo navegação, telas e componentes.

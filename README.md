# ContaIQ Web

Frontend del sistema contable ContaIQ — React 19 + TypeScript + Tailwind v4.

## Stack

- **Vite 6** — Build tool
- **React 19** — UI
- **TypeScript 5** — Type safety
- **Tailwind CSS v4** — Styling
- **Zustand 5** — Estado global
- **TanStack Query 5** — Server state
- **React Router 7** — Routing
- **Supabase Auth** — Login/Signup

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar con tu Supabase URL/Key y URL del API

# 3. Iniciar en desarrollo
npm run dev
```

La app estará en `http://localhost:5173`.

## Estructura

```
src/
├── app/                     # App root, router, providers
├── layouts/                 # DashboardLayout
├── modules/
│   ├── auth/pages/          # Login, Register, Onboarding
│   ├── dashboard/pages/     # Dashboard con KPIs
│   └── settings/pages/      # Gestión de usuarios
├── shared/
│   ├── api/                 # Axios client + Supabase client
│   ├── components/          # Sidebar, Header, OrgSwitcher
│   ├── hooks/               # useAuth
│   ├── stores/              # authStore, uiStore (Zustand)
│   ├── lib/                 # utils, formatters
│   └── types/               # TypeScript interfaces
└── styles/                  # Tailwind globals + design tokens
```

## Conexión con API

El frontend se conecta al backend ContaIQ API via Axios. Configura `VITE_API_URL` para apuntar al backend:

- **Local:** `http://localhost:3000/api/v1`
- **Producción:** `https://api.contaiq.com/api/v1`

## Deploy

```bash
# Build para producción
npm run build

# Deploy a Vercel
npx vercel --prod
```

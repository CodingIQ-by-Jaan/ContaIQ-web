# ContaIQ Web

Frontend del sistema contable ContaIQ — React 19 + TypeScript + Tailwind v4.

## Stack

- **Vite 6** — Build tool
- **React 19** — UI
- **TypeScript 5** — Type safety
- **Tailwind CSS v4** — Styling con design tokens
- **Zustand 5** — Estado global
- **TanStack Query 5** — Server state y cache
- **React Router 7** — Routing
- **Axios** — HTTP client
- **Lucide React** — Iconografía
- **Supabase Auth** — Login/Signup

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar en desarrollo
npm run dev
```

La app estará en `http://localhost:5173`.

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Estructura

```
src/
├── app/                         # App root, router, providers
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/                       # Páginas organizadas por dominio
│   ├── auth/                    # Login, Register, Onboarding
│   ├── dashboard/               # Dashboard con KPIs
│   ├── accounts/                # Catálogo de cuentas (árbol jerárquico)
│   ├── journal/                 # Libro Diario, Mayor, Balance Comprobación
│   ├── suppliers/               # Gestión de proveedores
│   ├── customers/               # Gestión de clientes
│   ├── purchases/               # Compras + formulario con ISV
│   ├── sales/                   # Ventas + formulario con ISV + retenciones
│   ├── inventory/               # Productos + stock + Kardex
│   └── settings/                # Usuarios y organización
│
├── layouts/                     # DashboardLayout (Sidebar + Content)
│
├── components/                  # Componentes globales
│   ├── Sidebar.tsx              # Navegación colapsable
│   ├── Header.tsx
│   ├── AuthGuard.tsx            # Protección de rutas
│   ├── OrgSwitcher.tsx          # Cambiar organización activa
│   ├── PlaceholderPage.tsx
│   └── PageHeader.tsx
│
├── hooks/                       # Hooks centralizados
│   ├── useAuth.ts               # Auth + Supabase session
│   ├── useAccounts.ts           # CRUD catálogo de cuentas
│   ├── useJournal.ts            # Asientos, Mayor, Balance
│   ├── useSuppliers.ts          # CRUD proveedores
│   ├── useCustomers.ts          # CRUD clientes
│   ├── usePurchases.ts          # Compras + confirmar
│   ├── useSales.ts              # Ventas + confirmar
│   └── useProducts.ts           # Productos + Kardex
│
├── stores/                      # Zustand stores
│   ├── authStore.ts             # Sesión, perfil, org activa
│   └── uiStore.ts               # Sidebar collapsed
│
├── api/                         # Clientes HTTP
│   ├── client.ts                # Axios con interceptores (token + org_id)
│   └── supabase.ts              # Supabase client (solo auth)
│
├── lib/
│   └── utils.ts                 # cn(), formatLempiras(), formatDate(), formatRtn()
│
├── types/
│   └── index.ts                 # Interfaces TypeScript (independientes del API)
│
├── styles/
│   └── globals.css              # Tailwind v4 + design tokens ContaIQ
│
└── main.tsx                     # Entry point
```

## Rutas

```
/login                  → Login
/register               → Registro
/onboarding             → Wizard crear organización

/dashboard              → KPIs (placeholder datos)
/accounts               → Catálogo de cuentas (árbol + seed hondureño)
/journal                → Libro Diario (listado de asientos)
/journal/new            → Crear asiento manual
/ledger                 → Libro Mayor por cuenta
/trial-balance          → Balance de Comprobación
/suppliers              → CRUD proveedores
/purchases              → Listado de compras
/purchases/new          → Formulario nueva compra (ISV auto)
/customers              → CRUD clientes
/sales                  → Listado de ventas
/sales/new              → Formulario nueva venta (ISV + retención)
/inventory              → Productos + stock
/settings               → Gestión de usuarios + invitaciones
```

## Conexión con API

El frontend se conecta al backend ContaIQ API via Axios. El interceptor agrega automáticamente el JWT y el `X-Organization-Id` a cada request leyendo del Zustand store.

- **Local:** `http://localhost:3000/api/v1`
- **Producción:** `https://api.contaiq.com/api/v1`

## Deploy

```bash
npm run build
npx vercel --prod
```
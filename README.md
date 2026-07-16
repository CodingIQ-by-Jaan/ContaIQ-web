# ContaIQ Web

Frontend del sistema contable ContaIQ — React 19 + TypeScript + Tailwind v4.

## Setup Local

```bash
npm install
cp .env.example .env       # Configurar variables
npm run dev                 # http://localhost:5173
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

En producción (Vercel): `VITE_API_URL=https://contaiq-api-production.up.railway.app/api/v1`

Las variables `VITE_` se inyectan en build time — cambios requieren redeploy.

## Estructura

```
src/
├── app/                         # App root, router, providers
│   ├── App.tsx
│   ├── router.tsx               # Todas las rutas
│   └── providers.tsx            # QueryClient + Toaster
│
├── pages/                       # Páginas por dominio
│   ├── auth/                    # Login, Register, Onboarding
│   ├── dashboard/               # Dashboard con KPIs reales
│   ├── accounts/                # Catálogo de cuentas (árbol)
│   ├── journal/                 # Libro Diario, Mayor, Balance Comprobación
│   ├── suppliers/               # Gestión de proveedores
│   ├── customers/               # Gestión de clientes
│   ├── purchases/               # Compras + formulario (ISV auto)
│   ├── sales/                   # Ventas + formulario (ISV + retención)
│   ├── inventory/               # Productos + stock
│   ├── treasury/                # Cuentas bancarias + movimientos
│   ├── taxes/                   # ISV + retenciones
│   ├── reports/                 # Balance General + Estado de Resultados
│   └── settings/                # Usuarios + organización
│
├── layouts/                     # DashboardLayout (Sidebar + Content)
│
├── components/                  # Componentes globales
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── AuthGuard.tsx
│   ├── OrgSwitcher.tsx
│   ├── PlaceholderPage.tsx
│   └── PageHeader.tsx
│
├── hooks/                       # Todos los hooks centralizados
│   ├── useAuth.ts
│   ├── useAccounts.ts
│   ├── useJournal.ts
│   ├── useSuppliers.ts
│   ├── useCustomers.ts
│   ├── usePurchases.ts
│   ├── useSales.ts
│   ├── useProducts.ts
│   ├── useTreasury.ts
│   ├── useTaxes.ts
│   ├── useReports.ts
│   └── useDashboard.ts
│
├── stores/                      # Zustand
│   ├── authStore.ts
│   └── uiStore.ts
│
├── api/                         # HTTP clients
│   ├── client.ts                # Axios (token + org_id interceptors)
│   └── supabase.ts              # Supabase (solo auth)
│
├── lib/
│   └── utils.ts                 # cn(), formatLempiras(), formatDate()
│
├── types/
│   └── index.ts                 # Interfaces TypeScript
│
├── styles/
│   └── globals.css              # Tailwind v4 + design tokens
│
└── main.tsx
```

## Rutas

```
/login                      → Login
/register                   → Registro (desactivado en producción)
/onboarding                 → Wizard crear organización

/dashboard                  → KPIs, gráfica 12 meses, top productos
/accounts                   → Catálogo de cuentas (árbol + seed)
/journal                    → Libro Diario
/journal/new                → Crear asiento manual
/ledger                     → Libro Mayor por cuenta
/trial-balance              → Balance de Comprobación
/suppliers                  → CRUD proveedores
/purchases                  → Listado de compras
/purchases/new              → Formulario nueva compra
/customers                  → CRUD clientes
/sales                      → Listado de ventas
/sales/new                  → Formulario nueva venta
/inventory                  → Productos + stock
/treasury                   → Cuentas bancarias + movimientos
/taxes                      → ISV + retenciones
/reports/balance-sheet       → Balance General
/reports/income-statement    → Estado de Resultados
/settings                   → Usuarios + invitaciones
```

## Deploy (Vercel)

Requiere `vercel.json` en la raíz:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

```bash
npm run build
npx vercel --prod
```

O push a GitHub — Vercel hace deploy automático.
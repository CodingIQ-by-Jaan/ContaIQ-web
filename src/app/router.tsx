import { createBrowserRouter, Navigate } from 'react-router';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/modules/auth/pages/LoginPage';
import RegisterPage from '@/modules/auth/pages/RegisterPage';
import OnboardingPage from '@/modules/auth/pages/OnboardingPage';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import SettingsPage from '@/modules/settings/pages/SettingsPage';
import PlaceholderPage from '@/shared/components/PlaceholderPage';

const AccountsPage = () => <PlaceholderPage title="Catálogo de Cuentas" phase={2} />;
const JournalPage = () => <PlaceholderPage title="Libro Diario" phase={2} />;
const LedgerPage = () => <PlaceholderPage title="Libro Mayor" phase={2} />;
const PurchasesPage = () => <PlaceholderPage title="Compras" phase={3} />;
const SuppliersPage = () => <PlaceholderPage title="Proveedores" phase={3} />;
const SalesPage = () => <PlaceholderPage title="Ventas" phase={3} />;
const CustomersPage = () => <PlaceholderPage title="Clientes" phase={3} />;
const InventoryPage = () => <PlaceholderPage title="Productos" phase={4} />;
const AdjustmentsPage = () => <PlaceholderPage title="Ajustes de Inventario" phase={4} />;
const TreasuryPage = () => <PlaceholderPage title="Cuentas Bancarias" phase={5} />;
const ReconciliationPage = () => <PlaceholderPage title="Conciliación Bancaria" phase={5} />;
const TaxesIsvPage = () => <PlaceholderPage title="ISV" phase={5} />;
const WithholdingsPage = () => <PlaceholderPage title="Retenciones" phase={5} />;
const ReportsPage = () => <PlaceholderPage title="Reportes Financieros" phase={6} />;

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },

  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'ledger', element: <LedgerPage /> },
      { path: 'purchases', element: <PurchasesPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/adjustments', element: <AdjustmentsPage /> },
      { path: 'treasury', element: <TreasuryPage /> },
      { path: 'treasury/reconciliation', element: <ReconciliationPage /> },
      { path: 'taxes', element: <Navigate to="/taxes/isv" replace /> },
      { path: 'taxes/isv', element: <TaxesIsvPage /> },
      { path: 'taxes/withholdings', element: <WithholdingsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

import { createBrowserRouter, Navigate } from 'react-router';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import PlaceholderPage from '@/components/PlaceholderPage';
import AccountsPage from '@/pages/accounts/AccountsPage';
import JournalPage from '@/pages/journal/JournalPage';
import JournalEntryFormPage from '@/pages/journal/JournalEntryFormPage';
import LedgerPage from '@/pages/journal/LedgerPage';
import TrialBalancePage from '@/pages/journal/TrialBalancePage';
import SuppliersPage from '@/pages/suppliers/SuppliersPage';
import PurchasesPage from '@/pages/purchases/PurchasesPage';
import PurchaseFormPage from '@/pages/purchases/PurchaseFormPage';
import CustomersPage from '@/pages/customers/CustomersPage';
import SalesPage from '@/pages/sales/SalesPage';
import SaleFormPage from '@/pages/sales/SaleFormPage';

import ProductsPage from '@/pages/inventory/ProductsPage';

const AdjustmentsPage = () => <PlaceholderPage title="Ajustes de Inventario" phase={4} />;
const TreasuryPage = () => <PlaceholderPage title="Cuentas Bancarias" phase={5} />;
const ReconciliationPage = () => <PlaceholderPage title="Conciliación Bancaria" phase={5} />;
const TaxesIsvPage = () => <PlaceholderPage title="ISV" phase={5} />;
const WithholdingsPage = () => <PlaceholderPage title="Retenciones" phase={5} />;
const ReportsPage = () => <PlaceholderPage title="Reportes Financieros" phase={6} />;

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/onboarding', element: <AuthGuard><OnboardingPage /></AuthGuard> },

  {
    path: '/',
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },

      // Phase 2
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'journal/new', element: <JournalEntryFormPage /> },
      { path: 'ledger', element: <LedgerPage /> },
      { path: 'trial-balance', element: <TrialBalancePage /> },

      // Phase 3
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'purchases', element: <PurchasesPage /> },
      { path: 'purchases/new', element: <PurchaseFormPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'sales/new', element: <SaleFormPage /> },

      // Phase 4
      { path: 'inventory', element: <ProductsPage /> },
      { path: 'inventory/adjustments', element: <AdjustmentsPage /> },

      // Phase 5+
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

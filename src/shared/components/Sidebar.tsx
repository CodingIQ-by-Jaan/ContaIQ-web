import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, FolderTree, BookOpen, ShoppingCart, Receipt,
  Package, Landmark, FileCheck, BarChart3, Settings, ChevronLeft, LogOut,
} from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';
import { useAuth } from '@/shared/hooks/useAuth';
import OrgSwitcher from '@/shared/components/OrgSwitcher';
import { cn } from '@/shared/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  children?: { label: string; to: string }[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Catálogo de Cuentas', to: '/accounts', icon: FolderTree },
  { label: 'Contabilidad', to: '/journal', icon: BookOpen, children: [
    { label: 'Libro Diario', to: '/journal' },
    { label: 'Libro Mayor', to: '/ledger' },
  ]},
  { label: 'Compras', to: '/purchases', icon: ShoppingCart, children: [
    { label: 'Compras', to: '/purchases' },
    { label: 'Proveedores', to: '/suppliers' },
  ]},
  { label: 'Ventas', to: '/sales', icon: Receipt, children: [
    { label: 'Ventas', to: '/sales' },
    { label: 'Clientes', to: '/customers' },
  ]},
  { label: 'Inventario', to: '/inventory', icon: Package, children: [
    { label: 'Productos', to: '/inventory' },
    { label: 'Ajustes', to: '/inventory/adjustments' },
  ]},
  { label: 'Tesorería', to: '/treasury', icon: Landmark, children: [
    { label: 'Cuentas', to: '/treasury' },
    { label: 'Conciliación', to: '/treasury/reconciliation' },
  ]},
  { label: 'Impuestos', to: '/taxes', icon: FileCheck, children: [
    { label: 'ISV', to: '/taxes/isv' },
    { label: 'Retenciones', to: '/taxes/withholdings' },
  ]},
  { label: 'Reportes', to: '/reports', icon: BarChart3 },
  { label: 'Configuración', to: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { signOut, profile } = useAuth();
  const location = useLocation();

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-surface border-r border-border transition-all duration-200',
      sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-brand-600 tracking-tight">
            Conta<span className="text-brand-800">IQ</span>
          </h1>
        )}
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted transition-colors">
          <ChevronLeft size={18} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Org Switcher */}
      {!sidebarCollapsed && (
        <div className="px-2 py-3 border-b border-border">
          <OrgSwitcher />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || item.children?.some((c) => location.pathname.startsWith(c.to));

            return (
              <li key={item.to}>
                <NavLink to={item.to} className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                )} title={sidebarCollapsed ? item.label : undefined}>
                  <Icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>

                {!sidebarCollapsed && isActive && item.children && (
                  <ul className="ml-9 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink to={child.to} end className={({ isActive: active }) => cn(
                          'block px-3 py-1.5 rounded text-sm transition-colors',
                          active ? 'text-brand-700 font-medium' : 'text-text-muted hover:text-text-secondary',
                        )}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
              {profile?.fullName?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{profile?.fullName}</p>
              <p className="text-xs text-text-muted truncate">{profile?.email}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted hover:text-danger transition-colors" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={signOut} className="w-full flex justify-center p-1.5 rounded-md hover:bg-surface-hover text-text-muted hover:text-danger transition-colors" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

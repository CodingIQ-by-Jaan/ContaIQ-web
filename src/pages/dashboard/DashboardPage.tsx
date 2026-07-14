import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Receipt, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatLempiras } from '@/lib/utils';
import Header from '@/components/Header';

interface KpiCardProps {
  title: string; value: string; change?: string; trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType; iconColor: string; iconBg: string;
}

const KpiCard = ({ title, value, change, trend, icon: Icon, iconColor, iconBg }: KpiCardProps) => (
  <div className="bg-surface rounded-xl border border-border p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-muted">{title}</p>
        <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' && <TrendingUp size={14} className="text-success" />}
            {trend === 'down' && <TrendingDown size={14} className="text-danger" />}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'}`}>{change}</span>
            <span className="text-xs text-text-muted">vs mes anterior</span>
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${iconBg}`}><Icon size={20} className={iconColor} /></div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { profile } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      <Header title={`${greeting}, ${profile?.fullName?.split(' ')[0] ?? ''}`} subtitle="Resumen de tu negocio" />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Ventas del mes" value={formatLempiras(0)} change="+0%" trend="neutral" icon={Receipt} iconColor="text-brand-600" iconBg="bg-brand-50" />
          <KpiCard title="Compras del mes" value={formatLempiras(0)} change="+0%" trend="neutral" icon={ShoppingCart} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <KpiCard title="Utilidad" value={formatLempiras(0)} change="+0%" trend="neutral" icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <KpiCard title="ISV por pagar" value={formatLempiras(0)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Ingresos vs Gastos</h3>
            <div className="h-64 flex items-center justify-center text-text-muted text-sm">
              <div className="text-center">
                <div className="flex items-end justify-center gap-2 h-20 opacity-20">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65].map((h, i) => (
                    <div key={i} className="w-4 bg-brand-400 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="mt-3">Las gráficas aparecerán cuando registres transacciones</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Actividad reciente</h3>
            <div className="h-64 flex items-center justify-center text-text-muted text-sm">
              <div className="text-center">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p>Sin actividad aún</p>
                <p className="text-xs mt-1">Empieza registrando una venta o compra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

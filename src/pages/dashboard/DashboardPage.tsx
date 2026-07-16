import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Receipt, AlertTriangle, Package, CreditCard, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useKpis, useRevenueVsExpenses, useTopProducts } from '@/hooks/useDashboard';
import { formatLempiras } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number; icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
}

const KpiCard = ({ title, value, change, icon: Icon, iconColor, iconBg, subtitle }: KpiCardProps) => (
  <div className="bg-surface rounded-xl border border-border p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-muted">{title}</p>
        <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change > 0 && <TrendingUp size={14} className="text-success" />}
            {change < 0 && <TrendingDown size={14} className="text-danger" />}
            <span className={`text-xs font-medium ${change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-text-muted'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-text-muted">vs mes anterior</span>
          </div>
        )}
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${iconBg}`}><Icon size={20} className={iconColor} /></div>
    </div>
  </div>
);

const SimpleBarChart = ({ data }: { data: { month: string; revenue: number; expenses: number }[] }) => {
  const maxValue = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 1);

  return (
    <div className="flex items-end justify-between gap-1 h-48">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex gap-0.5 items-end w-full justify-center" style={{ height: '180px' }}>
            <div className="w-2.5 bg-brand-400 rounded-t transition-all" style={{ height: `${(d.revenue / maxValue) * 100}%`, minHeight: d.revenue > 0 ? '4px' : '0' }} />
            <div className="w-2.5 bg-amber-400 rounded-t transition-all" style={{ height: `${(d.expenses / maxValue) * 100}%`, minHeight: d.expenses > 0 ? '4px' : '0' }} />
          </div>
          <span className="text-[10px] text-text-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const { profile } = useAuth();
  const { data: kpis } = useKpis();
  const { data: chartData } = useRevenueVsExpenses();
  const { data: topProducts } = useTopProducts();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      <Header title={`${greeting}, ${profile?.fullName?.split(' ')[0] ?? ''}`} subtitle="Resumen de tu negocio" />
      <div className="p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Ventas del mes" value={formatLempiras(kpis?.salesThisMonth ?? 0)} change={kpis?.salesChange} icon={Receipt} iconColor="text-brand-600" iconBg="bg-brand-50" subtitle={kpis ? `${kpis.salesCount} facturas` : undefined} />
          <KpiCard title="Compras del mes" value={formatLempiras(kpis?.purchasesThisMonth ?? 0)} change={kpis?.purchasesChange} icon={ShoppingCart} iconColor="text-amber-600" iconBg="bg-amber-50" subtitle={kpis ? `${kpis.purchasesCount} compras` : undefined} />
          <KpiCard title="Utilidad Bruta" value={formatLempiras(kpis?.grossProfit ?? 0)} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <KpiCard title="ISV por pagar" value={formatLempiras(kpis?.isvPayable ?? 0)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" subtitle={kpis?.isvFavor ? `ISV a favor: ${formatLempiras(kpis.isvFavor)}` : undefined} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50"><CreditCard size={18} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-text-muted">Cuentas por cobrar</p>
              <p className="text-lg font-semibold font-mono">{formatLempiras(kpis?.receivables ?? 0)}</p>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50"><FileText size={18} className="text-orange-600" /></div>
            <div>
              <p className="text-xs text-text-muted">Cuentas por pagar</p>
              <p className="text-lg font-semibold font-mono">{formatLempiras(kpis?.payables ?? 0)}</p>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50"><Package size={18} className="text-red-600" /></div>
            <div>
              <p className="text-xs text-text-muted">Productos bajo stock</p>
              <p className="text-lg font-semibold">{kpis?.lowStockCount ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Ingresos vs Gastos</h3>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-brand-400" /> Ventas</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Compras</span>
              </div>
            </div>
            {chartData && chartData.length > 0 ? (
              <SimpleBarChart data={chartData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">Sin datos suficientes para la gráfica</div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Top Productos (este mes)</h3>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-text-muted w-5">{i + 1}.</span>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">{p.name}</p>
                        <p className="text-xs text-text-muted">{p.quantity} vendidos</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-medium text-text-primary ml-2">{formatLempiras(p.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-text-muted text-sm">
                <div className="text-center">
                  <Package size={24} className="mx-auto mb-2 opacity-30" />
                  <p>Sin ventas este mes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

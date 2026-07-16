import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Check, Receipt } from 'lucide-react';
import Header from '@/components/Header';
import { useSales, useConfirmSale } from '@/hooks/useSales';
import { cn, formatLempiras, formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = { DRAFT: 'Borrador', CONFIRMED: 'Confirmada', VOIDED: 'Anulada' };
const STATUS_COLORS: Record<string, string> = { DRAFT: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-green-100 text-green-700', VOIDED: 'bg-red-100 text-red-700' };

const SalesPage = () => {
  const [page] = useState(1);
  const { data, isLoading } = useSales({ page });
  const confirmMutation = useConfirmSale();
  const sales = data?.data ?? [];

  const handleConfirm = async (id: string) => {
    if (!confirm('¿Confirmar venta? Se actualizará inventario, generarán asientos y calculará costo de venta.')) return;
    try { await confirmMutation.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  return (
    <>
      <Header title="Ventas" subtitle="Registro de ventas a clientes"
        actions={<Link to="/sales/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus size={14} /> Nueva venta</Link>} />
      <div className="p-6">
        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}
        {!isLoading && sales.length === 0 && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Receipt size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin ventas</h3>
            <p className="text-sm text-text-muted mb-6">Registra tu primera venta.</p>
            <Link to="/sales/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"><Plus size={16} /> Nueva venta</Link>
          </div>
        )}
        {sales.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                <th className="px-5 py-3 text-left">Número</th><th className="px-4 py-3 text-left">Fecha</th><th className="px-4 py-3 text-left">Cliente</th><th className="px-4 py-3 text-right">Subtotal</th><th className="px-4 py-3 text-right">ISV</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Estado</th><th className="px-4 py-3 w-12"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {sales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-surface-hover">
                    <td className="px-5 py-3 text-sm font-mono font-medium text-brand-600">{s.saleNumber}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{s.customer?.name ?? 'Consumidor Final'}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(parseFloat(s.subtotal))}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-text-muted">{formatLempiras(parseFloat(s.isvAmount))}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-medium">{formatLempiras(parseFloat(s.total))}</td>
                    <td className="px-4 py-3 text-center"><span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[s.status])}>{STATUS_LABELS[s.status]}</span></td>
                    <td className="px-4 py-3">{s.status === 'DRAFT' && <button onClick={() => handleConfirm(s.id)} className="p-1 rounded hover:bg-green-50 text-text-muted hover:text-success"><Check size={16} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default SalesPage;

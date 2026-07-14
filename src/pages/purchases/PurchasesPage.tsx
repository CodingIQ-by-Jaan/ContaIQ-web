import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import { usePurchases, useConfirmPurchase } from '@/hooks/usePurchases';
import { cn, formatLempiras, formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = { DRAFT: 'Borrador', CONFIRMED: 'Confirmada', VOIDED: 'Anulada' };
const STATUS_COLORS: Record<string, string> = { DRAFT: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-green-100 text-green-700', VOIDED: 'bg-red-100 text-red-700' };

const PurchasesPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePurchases({ page });
  const confirmMutation = useConfirmPurchase();

  const purchases = data?.data ?? [];
  const meta = data?.meta;

  const handleConfirm = async (id: string) => {
    if (!confirm('¿Confirmar compra? Se actualizará inventario y se generarán asientos contables.')) return;
    try { await confirmMutation.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  return (
    <>
      <Header title="Compras" subtitle="Registro de compras a proveedores"
        actions={<Link to="/purchases/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus size={14} /> Nueva compra</Link>} />

      <div className="p-6">
        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}

        {!isLoading && purchases.length === 0 && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin compras</h3>
            <p className="text-sm text-text-muted mb-6">Registra tu primera compra para iniciar el control de inventario.</p>
            <Link to="/purchases/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"><Plus size={16} /> Nueva compra</Link>
          </div>
        )}

        {purchases.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                <th className="px-5 py-3 text-left">Número</th><th className="px-4 py-3 text-left">Fecha</th><th className="px-4 py-3 text-left">Proveedor</th><th className="px-4 py-3 text-right">Subtotal</th><th className="px-4 py-3 text-right">ISV</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Estado</th><th className="px-4 py-3 w-12"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p: any) => (
                  <tr key={p.id} className="hover:bg-surface-hover">
                    <td className="px-5 py-3 text-sm font-mono font-medium text-brand-600">{p.purchaseNumber}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{p.supplier?.name}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(parseFloat(p.subtotal))}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-text-muted">{formatLempiras(parseFloat(p.isvAmount))}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-medium">{formatLempiras(parseFloat(p.total))}</td>
                    <td className="px-4 py-3 text-center"><span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[p.status])}>{STATUS_LABELS[p.status]}</span></td>
                    <td className="px-4 py-3">{p.status === 'DRAFT' && <button onClick={() => handleConfirm(p.id)} className="p-1 rounded hover:bg-green-50 text-text-muted hover:text-success" title="Confirmar"><Check size={16} /></button>}</td>
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

export default PurchasesPage;

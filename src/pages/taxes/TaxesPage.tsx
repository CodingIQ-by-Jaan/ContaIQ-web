import { useState } from 'react';
import { FileCheck, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import Header from '@/components/Header';
import { useIsvSummary, useWithholdings, useCreateWithholding } from '@/hooks/useTaxes';
import { formatLempiras } from '@/lib/utils';

const MONTH_NAMES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const TaxesPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data: isvData, isLoading } = useIsvSummary(year, month);
  const { data: withholdings } = useWithholdings(year, month);
  const createWhMutation = useCreateWithholding();

  const [showWhForm, setShowWhForm] = useState(false);
  const [whForm, setWhForm] = useState({ type: 'ISR_1', date: now.toISOString().split('T')[0], amount: '', withheldBy: '', documentRef: '' });

  const handleCreateWh = async () => {
    if (!whForm.amount) return;
    await createWhMutation.mutateAsync({ ...whForm, amount: parseFloat(whForm.amount) });
    setWhForm({ type: 'ISR_1', date: now.toISOString().split('T')[0], amount: '', withheldBy: '', documentRef: '' });
    setShowWhForm(false);
  };

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Impuestos" subtitle="Control fiscal ISV y retenciones" />
      <div className="p-6">
        {/* Period selector */}
        <div className="flex gap-3 mb-6">
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className={inputClass}>
            {MONTH_NAMES.slice(1).map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} className={inputClass}>
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Calculando ISV...</div>}

        {isvData && (
          <>
            {/* ISV Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-muted">ISV Débito (cobrado)</span>
                  <TrendingUp size={16} className="text-success" />
                </div>
                <p className="text-2xl font-semibold font-mono text-text-primary">{formatLempiras(isvData.sales.isvDebit)}</p>
                <p className="text-xs text-text-muted mt-1">{isvData.sales.count} ventas</p>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-muted">ISV Crédito (pagado)</span>
                  <TrendingDown size={16} className="text-brand-600" />
                </div>
                <p className="text-2xl font-semibold font-mono text-text-primary">{formatLempiras(isvData.purchases.isvCredit)}</p>
                <p className="text-xs text-text-muted mt-1">{isvData.purchases.count} compras</p>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-muted">Retenciones</span>
                  <FileCheck size={16} className="text-amber-600" />
                </div>
                <p className="text-2xl font-semibold font-mono text-text-primary">{formatLempiras(isvData.withholdings.total)}</p>
                <p className="text-xs text-text-muted mt-1">{isvData.withholdings.count} retenciones</p>
              </div>
              <div className={`rounded-xl border p-5 ${isvData.isvPayable > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-muted">{isvData.isvPayable > 0 ? 'ISV a Pagar' : 'ISV a Favor'}</span>
                  <DollarSign size={16} className={isvData.isvPayable > 0 ? 'text-danger' : 'text-success'} />
                </div>
                <p className={`text-2xl font-bold font-mono ${isvData.isvPayable > 0 ? 'text-danger' : 'text-success'}`}>
                  {formatLempiras(isvData.isvPayable > 0 ? isvData.isvPayable : isvData.isvFavor)}
                </p>
                <p className="text-xs text-text-muted mt-1">{MONTH_NAMES[month]} {year}</p>
              </div>
            </div>

            {/* Detail breakdown */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Ventas del período</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Ventas netas:</span><span className="font-mono">{formatLempiras(isvData.sales.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">ISV cobrado (15%):</span><span className="font-mono">{formatLempiras(isvData.sales.isvDebit)}</span></div>
                  <div className="flex justify-between font-medium border-t border-border pt-2"><span>Total facturado:</span><span className="font-mono">{formatLempiras(isvData.sales.subtotal + isvData.sales.isvDebit)}</span></div>
                </div>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Compras del período</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Compras netas:</span><span className="font-mono">{formatLempiras(isvData.purchases.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">ISV pagado (15%):</span><span className="font-mono">{formatLempiras(isvData.purchases.isvCredit)}</span></div>
                  <div className="flex justify-between font-medium border-t border-border pt-2"><span>Total pagado:</span><span className="font-mono">{formatLempiras(isvData.purchases.subtotal + isvData.purchases.isvCredit)}</span></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Withholdings */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Retenciones — {MONTH_NAMES[month]} {year}</h3>
            <button onClick={() => setShowWhForm(!showWhForm)} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"><Plus size={14} /> Agregar</button>
          </div>

          {showWhForm && (
            <div className="p-4 border-b border-border bg-surface-alt">
              <div className="grid grid-cols-5 gap-3 mb-3">
                <select value={whForm.type} onChange={(e) => setWhForm({ ...whForm, type: e.target.value })} className={inputClass}><option value="ISR_1">ISR 1%</option><option value="ISR_12_5">ISR 12.5%</option></select>
                <input type="date" value={whForm.date} onChange={(e) => setWhForm({ ...whForm, date: e.target.value })} className={inputClass} />
                <input type="number" min="0" step="0.01" value={whForm.amount} onChange={(e) => setWhForm({ ...whForm, amount: e.target.value })} placeholder="Monto *" className={`${inputClass} font-mono`} />
                <input value={whForm.withheldBy} onChange={(e) => setWhForm({ ...whForm, withheldBy: e.target.value })} placeholder="Retenido por" className={inputClass} />
                <input value={whForm.documentRef} onChange={(e) => setWhForm({ ...whForm, documentRef: e.target.value })} placeholder="# Constancia" className={inputClass} />
              </div>
              <button onClick={handleCreateWh} disabled={!whForm.amount} className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">Guardar</button>
            </div>
          )}

          {(!withholdings || withholdings.length === 0) ? (
            <div className="p-6 text-center text-text-muted text-sm">Sin retenciones registradas este período.</div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-border text-xs text-text-secondary uppercase">
                <th className="px-5 py-2.5 text-left">Fecha</th><th className="px-4 py-2.5 text-left">Tipo</th><th className="px-4 py-2.5 text-left">Retenido por</th><th className="px-4 py-2.5 text-left"># Constancia</th><th className="px-4 py-2.5 text-right">Monto</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {withholdings.map((w: any) => (
                  <tr key={w.id} className="hover:bg-surface-hover">
                    <td className="px-5 py-2.5 text-sm text-text-secondary">{new Date(w.date).toLocaleDateString('es-HN')}</td>
                    <td className="px-4 py-2.5 text-sm text-text-primary">{w.type === 'ISR_1' ? 'ISR 1%' : 'ISR 12.5%'}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{w.withheldBy ?? '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-text-muted">{w.documentRef ?? '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono font-medium">{formatLempiras(parseFloat(w.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default TaxesPage;

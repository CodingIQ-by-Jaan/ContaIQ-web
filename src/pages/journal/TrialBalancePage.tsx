import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { formatLempiras } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useTrialBalance } from '@/hooks/useJournal';
import Header from '@/components/Header';

const TYPE_LABELS: Record<string, string> = {
  ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Capital',
  REVENUE: 'Ingreso', COST: 'Costo', EXPENSE: 'Gasto',
};

const TrialBalancePage = () => {
  const [endDate, setEndDate] = useState('');
  const { data, isLoading } = useTrialBalance(endDate || undefined);

  const accounts = data?.accounts ?? [];
  const totals = data?.totals ?? { totalDebit: 0, totalCredit: 0 };
  const isBalanced = Math.abs(totals.totalDebit - totals.totalCredit) < 0.01;

  return (
    <>
      <Header title="Balance de Comprobación" subtitle="Resumen de saldos de todas las cuentas" />

      <div className="p-6">
        {/* Filter */}
        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Al cierre de</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {!endDate && (
              <p className="text-sm text-text-muted pb-2">Mostrando todos los movimientos confirmados</p>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Calculando balance...</div>
        )}

        {!isLoading && accounts.length === 0 && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <FileSpreadsheet size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin movimientos</h3>
            <p className="text-sm text-text-muted">Crea y confirma asientos contables para ver el balance de comprobación.</p>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                  <th className="px-5 py-3 text-left w-28">Código</th>
                  <th className="px-4 py-3 text-left">Cuenta</th>
                  <th className="px-4 py-3 text-left w-24">Tipo</th>
                  <th className="px-4 py-3 text-right w-36">Débitos</th>
                  <th className="px-4 py-3 text-right w-36">Créditos</th>
                  <th className="px-5 py-3 text-right w-36">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((acc: any) => (
                  <tr key={acc.id} className="hover:bg-surface-hover">
                    <td className="px-5 py-2.5 text-sm font-mono text-text-secondary">{acc.code}</td>
                    <td className="px-4 py-2.5 text-sm text-text-primary">{acc.name}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{TYPE_LABELS[acc.type]}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono">{formatLempiras(acc.totalDebit)}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono">{formatLempiras(acc.totalCredit)}</td>
                    <td className={cn(
                      'px-5 py-2.5 text-sm text-right font-mono font-medium',
                      acc.balance >= 0 ? 'text-text-primary' : 'text-danger',
                    )}>
                      {formatLempiras(Math.abs(acc.balance))}
                      {acc.balance < 0 ? ' (Cr)' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-surface-alt font-semibold">
                  <td colSpan={3} className="px-5 py-3 text-sm text-right text-text-secondary">Totales</td>
                  <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(totals.totalDebit)}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(totals.totalCredit)}</td>
                  <td className={cn(
                    'px-5 py-3 text-sm text-right font-mono',
                    isBalanced ? 'text-success' : 'text-danger',
                  )}>
                    {isBalanced ? '✓ Cuadra' : `Diferencia: ${formatLempiras(Math.abs(totals.totalDebit - totals.totalCredit))}`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default TrialBalancePage;

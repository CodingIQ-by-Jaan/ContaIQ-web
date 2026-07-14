import { useState } from 'react';
import { BookText } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { formatLempiras, formatDate } from '@/lib/utils';
import Header from '@/components/Header';
import { useLedger } from '@/hooks/useJournal';

const LedgerPage = () => {
  const { data: accounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: ledgerData, isLoading } = useLedger(selectedAccountId, { startDate, endDate });

  const detailAccounts = (accounts ?? []).filter((a: any) => a.isDetail && a.isActive);

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Libro Mayor" subtitle="Movimientos por cuenta con saldo acumulado" />

      <div className="p-6">
        {/* Filters */}
        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Cuenta</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className={`${inputClass} w-full`}
              >
                <option value="">Seleccionar cuenta...</option>
                {detailAccounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Desde</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Hasta</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Content */}
        {!selectedAccountId && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <BookText size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Selecciona una cuenta</h3>
            <p className="text-sm text-text-muted">Elige una cuenta del catálogo para ver sus movimientos en el Libro Mayor.</p>
          </div>
        )}

        {selectedAccountId && isLoading && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando movimientos...</div>
        )}

        {ledgerData && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {/* Account header */}
            <div className="px-5 py-4 border-b border-border bg-surface-alt">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-mono text-text-muted">{ledgerData.account.code}</span>
                  <h3 className="text-base font-semibold text-text-primary">{ledgerData.account.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-muted">Saldo actual</span>
                  <p className="text-lg font-semibold font-mono text-text-primary">
                    {formatLempiras(parseFloat(ledgerData.account.currentBalance))}
                  </p>
                </div>
              </div>
            </div>

            {ledgerData.lines.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                Sin movimientos confirmados en esta cuenta para el período seleccionado.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-text-secondary uppercase">
                    <th className="px-5 py-2.5 text-left w-24">Fecha</th>
                    <th className="px-4 py-2.5 text-left w-16">#</th>
                    <th className="px-4 py-2.5 text-left">Descripción</th>
                    <th className="px-4 py-2.5 text-right w-32">Débito</th>
                    <th className="px-4 py-2.5 text-right w-32">Crédito</th>
                    <th className="px-5 py-2.5 text-right w-36">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ledgerData.lines.map((line: any) => (
                    <tr key={line.id} className="hover:bg-surface-hover">
                      <td className="px-5 py-2.5 text-sm text-text-secondary">{formatDate(line.journalEntry.date)}</td>
                      <td className="px-4 py-2.5 text-sm font-mono text-text-muted">#{line.journalEntry.entryNumber}</td>
                      <td className="px-4 py-2.5 text-sm text-text-primary">{line.description ?? line.journalEntry.description}</td>
                      <td className="px-4 py-2.5 text-sm text-right font-mono">
                        {parseFloat(line.debit) > 0 ? formatLempiras(parseFloat(line.debit)) : ''}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-right font-mono">
                        {parseFloat(line.credit) > 0 ? formatLempiras(parseFloat(line.credit)) : ''}
                      </td>
                      <td className="px-5 py-2.5 text-sm text-right font-mono font-medium">
                        {formatLempiras(line.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LedgerPage;

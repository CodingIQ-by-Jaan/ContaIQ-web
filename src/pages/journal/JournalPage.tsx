import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Check, X, Eye, BookOpen } from 'lucide-react';
import { cn, formatLempiras, formatDate } from '@/lib/utils';
import { useConfirmJournalEntry, useJournalEntries, useVoidJournalEntry } from '@/hooks/useJournal';
import Header from '@/components/Header';

const STATUS_LABELS: Record<string, string> = { DRAFT: 'Borrador', CONFIRMED: 'Confirmado', VOIDED: 'Anulado' };
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  VOIDED: 'bg-red-100 text-red-700',
};

const JournalPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useJournalEntries({ page, limit: 20 });
  const confirmMutation = useConfirmJournalEntry();
  const voidMutation = useVoidJournalEntry();

  const entries = data?.data ?? [];
  const meta = data?.meta;

  const handleConfirm = async (id: string) => {
    if (!confirm('¿Confirmar este asiento? Se actualizarán los saldos de las cuentas.')) return;
    try {
      await confirmMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] ?? 'Error al confirmar');
    }
  };

  const handleVoid = async (id: string) => {
    if (!confirm('¿Anular este asiento? Se revertirán los saldos si estaba confirmado.')) return;
    try {
      await voidMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] ?? 'Error al anular');
    }
  };

  return (
    <>
      <Header
        title="Libro Diario"
        subtitle="Registro cronológico de asientos contables"
        actions={
          <Link
            to="/journal/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus size={14} /> Nuevo asiento
          </Link>
        }
      />

      <div className="p-6">
        {isLoading && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando asientos...</div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <BookOpen size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin asientos contables</h3>
            <p className="text-sm text-text-muted mb-6">Crea tu primer asiento para empezar a registrar movimientos contables.</p>
            <Link to="/journal/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
              <Plus size={16} /> Crear primer asiento
            </Link>
          </div>
        )}

        {entries.length > 0 && (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-text-muted">#{entry.entryNumber}</span>
                    <span className="text-sm font-medium text-text-primary">{entry.description}</span>
                    {entry.reference && (
                      <span className="text-xs text-text-muted">Ref: {entry.reference}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-muted">{formatDate(entry.date)}</span>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[entry.status])}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    {entry.status === 'DRAFT' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleConfirm(entry.id)} className="p-1 rounded hover:bg-green-50 text-text-muted hover:text-success transition-colors" title="Confirmar">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleVoid(entry.id)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger transition-colors" title="Anular">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    {entry.status === 'CONFIRMED' && (
                      <button onClick={() => handleVoid(entry.id)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger transition-colors" title="Anular">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lines */}
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-alt text-xs text-text-secondary uppercase">
                      <th className="px-5 py-2 text-left w-28">Código</th>
                      <th className="px-4 py-2 text-left">Cuenta</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-right w-32">Débito</th>
                      <th className="px-5 py-2 text-right w-32">Crédito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entry.lines.map((line: any) => (
                      <tr key={line.id}>
                        <td className="px-5 py-2 text-sm font-mono text-text-secondary">{line.account.code}</td>
                        <td className="px-4 py-2 text-sm text-text-primary">{line.account.name}</td>
                        <td className="px-4 py-2 text-sm text-text-muted">{line.description ?? ''}</td>
                        <td className="px-4 py-2 text-sm text-right font-mono">
                          {parseFloat(line.debit) > 0 ? formatLempiras(parseFloat(line.debit)) : ''}
                        </td>
                        <td className="px-5 py-2 text-sm text-right font-mono">
                          {parseFloat(line.credit) > 0 ? formatLempiras(parseFloat(line.credit)) : ''}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-surface-alt font-semibold">
                      <td colSpan={3} className="px-5 py-2 text-sm text-right text-text-secondary">Totales</td>
                      <td className="px-4 py-2 text-sm text-right font-mono">{formatLempiras(parseFloat(entry.totalDebit))}</td>
                      <td className="px-5 py-2 text-sm text-right font-mono">{formatLempiras(parseFloat(entry.totalCredit))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50">Anterior</button>
                <span className="px-3 py-1.5 text-sm text-text-muted">Página {meta.page} de {meta.totalPages}</span>
                <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50">Siguiente</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default JournalPage;

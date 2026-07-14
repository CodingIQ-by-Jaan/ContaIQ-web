import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { formatLempiras } from '@/lib/utils';
import { useCreateJournalEntry } from '@/hooks/useJournal';
import Header from '@/components/Header';

interface Line {
  id: string;
  accountId: string;
  description: string;
  debit: string;
  credit: string;
}

const emptyLine = (): Line => ({
  id: crypto.randomUUID(),
  accountId: '',
  description: '',
  debit: '',
  credit: '',
});

const JournalEntryFormPage = () => {
  const navigate = useNavigate();
  const { data: accounts } = useAccounts();
  const createMutation = useCreateJournalEntry();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()]);
  const [error, setError] = useState('');

  const detailAccounts = (accounts ?? []).filter((a: any) => a.isDetail && a.isActive);

  const updateLine = (id: string, field: keyof Line, value: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        // If setting debit, clear credit and vice versa
        if (field === 'debit' && parseFloat(value) > 0) updated.credit = '';
        if (field === 'credit' && parseFloat(value) > 0) updated.debit = '';
        return updated;
      }),
    );
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const difference = totalDebit - totalCredit;

  const handleSubmit = async () => {
    setError('');

    if (!date || !description) {
      setError('Fecha y descripción son requeridos');
      return;
    }

    const validLines = lines.filter((l) => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0));

    if (validLines.length < 2) {
      setError('Se necesitan al menos 2 líneas con montos');
      return;
    }

    if (!isBalanced) {
      setError(`Partida doble no cuadra. Diferencia: ${formatLempiras(Math.abs(difference))}`);
      return;
    }

    try {
      await createMutation.mutateAsync({
        date,
        description,
        reference: reference || undefined,
        lines: validLines.map((l) => ({
          accountId: l.accountId,
          description: l.description || undefined,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })),
      });
      navigate('/journal');
    } catch (err: any) {
      setError(err.response?.data?.message?.[0] ?? 'Error al crear asiento');
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';

  return (
    <>
      <Header title="Nuevo Asiento" subtitle="Crear asiento contable manual" />

      <div className="p-6 max-w-5xl">
        <div className="bg-surface rounded-xl border border-border p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {/* Header fields */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Fecha *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Descripción *</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Compra de mercadería" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Referencia</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ej: FAC-001" className={inputClass} />
            </div>
          </div>

          {/* Lines */}
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary uppercase">
                <th className="px-2 py-2 text-left">Cuenta</th>
                <th className="px-2 py-2 text-left w-48">Descripción</th>
                <th className="px-2 py-2 text-right w-36">Débito</th>
                <th className="px-2 py-2 text-right w-36">Crédito</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-border">
                  <td className="px-2 py-2">
                    <select
                      value={line.accountId}
                      onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Seleccionar cuenta</option>
                      {detailAccounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      placeholder="Opcional"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.debit}
                      onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass} text-right font-mono`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.credit}
                      onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass} text-right font-mono`}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length <= 2}
                      className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addLine} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 mb-6">
            <Plus size={14} /> Agregar línea
          </button>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total débitos:</span>
                <span className="font-mono font-medium">{formatLempiras(totalDebit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total créditos:</span>
                <span className="font-mono font-medium">{formatLempiras(totalCredit)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="text-text-secondary">Diferencia:</span>
                <span className={`font-mono font-semibold ${isBalanced ? 'text-success' : 'text-danger'}`}>
                  {isBalanced ? 'L. 0.00 ✓' : formatLempiras(Math.abs(difference))}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={() => navigate('/journal')} className="px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !isBalanced}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {createMutation.isPending ? 'Guardando...' : 'Guardar asiento'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default JournalEntryFormPage;

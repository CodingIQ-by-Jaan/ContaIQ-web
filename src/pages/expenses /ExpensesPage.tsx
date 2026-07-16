import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Check, X, Wallet, FileText, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { useExpenses, useConfirmExpense, useVoidExpense, useExpenseTemplates, useCreateExpenseTemplate, useDeleteExpenseTemplate } from '@/hooks/useExpenses';
import { cn, formatLempiras, formatDate } from '@/lib/utils';
import { useAccounts } from '@/hooks/useAccounts';
import { useSuppliers } from '@/hooks/useSuppliers';

const STATUS_LABELS: Record<string, string> = { DRAFT: 'Borrador', CONFIRMED: 'Confirmado', VOIDED: 'Anulado' };
const STATUS_COLORS: Record<string, string> = { DRAFT: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-green-100 text-green-700', VOIDED: 'bg-red-100 text-red-700' };

const ExpensesPage = () => {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'expenses' | 'templates'>('expenses');
  const { data, isLoading } = useExpenses({ page });
  const { data: templates } = useExpenseTemplates();
  const { data: accounts } = useAccounts();
  const { data: suppliers } = useSuppliers();
  const confirmMutation = useConfirmExpense();
  const voidMutation = useVoidExpense();
  const createTemplateMutation = useCreateExpenseTemplate();
  const deleteTemplateMutation = useDeleteExpenseTemplate();

  const expenses = data?.data ?? [];
  const expenseAccounts = (accounts ?? []).filter((a: any) => a.type === 'EXPENSE' && a.isDetail);

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', accountId: '', supplierId: '', estimatedAmount: '', applyIsv: false });

  const handleConfirm = async (id: string) => {
    if (!confirm('¿Confirmar gasto? Se generará el asiento contable.')) return;
    try { await confirmMutation.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const handleVoid = async (id: string) => {
    if (!confirm('¿Anular este gasto?')) return;
    try { await voidMutation.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.accountId) return;
    try {
      await createTemplateMutation.mutateAsync({
        ...templateForm,
        supplierId: templateForm.supplierId || undefined,
        estimatedAmount: parseFloat(templateForm.estimatedAmount) || 0,
      });
      setTemplateForm({ name: '', accountId: '', supplierId: '', estimatedAmount: '', applyIsv: false });
      setShowTemplateForm(false);
    } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Gastos" subtitle="Registro y control de gastos operativos"
        actions={
          <Link to="/expenses/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
            <Plus size={14} /> Nuevo gasto
          </Link>
        } />

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-alt p-1 rounded-lg w-fit">
          <button onClick={() => setTab('expenses')} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', tab === 'expenses' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary')}>
            Gastos
          </button>
          <button onClick={() => setTab('templates')} className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', tab === 'templates' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary')}>
            Gastos Fijos
          </button>
        </div>

        {/* Expenses Tab */}
        {tab === 'expenses' && (
          <>
            {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}

            {!isLoading && expenses.length === 0 && (
              <div className="bg-surface rounded-xl border border-border p-12 text-center">
                <Wallet size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Sin gastos registrados</h3>
                <p className="text-sm text-text-muted mb-6">Registra gastos de operación como alquiler, servicios, planilla, etc.</p>
                <Link to="/expenses/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"><Plus size={16} /> Nuevo gasto</Link>
              </div>
            )}

            {expenses.length > 0 && (
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                    <th className="px-5 py-3 text-left">Número</th><th className="px-4 py-3 text-left">Fecha</th><th className="px-4 py-3 text-left">Descripción</th><th className="px-4 py-3 text-left">Cuenta</th><th className="px-4 py-3 text-right">Monto</th><th className="px-4 py-3 text-right">ISV</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Estado</th><th className="px-4 py-3 w-20"></th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {expenses.map((e: any) => (
                      <tr key={e.id} className="hover:bg-surface-hover">
                        <td className="px-5 py-3 text-sm font-mono font-medium text-brand-600">{e.expenseNumber}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(e.date)}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{e.description}</td>
                        <td className="px-4 py-3 text-sm text-text-muted">{e.account?.code} {e.account?.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(parseFloat(e.subtotal))}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-text-muted">{parseFloat(e.isvAmount) > 0 ? formatLempiras(parseFloat(e.isvAmount)) : '—'}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-medium">{formatLempiras(parseFloat(e.total))}</td>
                        <td className="px-4 py-3 text-center"><span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[e.status])}>{STATUS_LABELS[e.status]}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {e.status === 'DRAFT' && (
                              <>
                                <button onClick={() => handleConfirm(e.id)} className="p-1 rounded hover:bg-green-50 text-text-muted hover:text-success" title="Confirmar"><Check size={16} /></button>
                                <button onClick={() => handleVoid(e.id)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger" title="Anular"><X size={16} /></button>
                              </>
                            )}
                            {e.status === 'CONFIRMED' && (
                              <button onClick={() => handleVoid(e.id)} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger" title="Anular"><X size={16} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Templates Tab */}
        {tab === 'templates' && (
          <>
            <div className="mb-4">
              <button onClick={() => setShowTemplateForm(!showTemplateForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover">
                <Plus size={14} /> Nueva plantilla
              </button>
            </div>

            {showTemplateForm && (
              <div className="bg-surface rounded-xl border border-border p-5 mb-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Nueva plantilla de gasto fijo</h3>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="Nombre *" className={inputClass} />
                  <select value={templateForm.accountId} onChange={(e) => setTemplateForm({ ...templateForm, accountId: e.target.value })} className={inputClass}>
                    <option value="">Cuenta de gasto *</option>
                    {expenseAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                  </select>
                  <select value={templateForm.supplierId} onChange={(e) => setTemplateForm({ ...templateForm, supplierId: e.target.value })} className={inputClass}>
                    <option value="">Proveedor (opcional)</option>
                    {(suppliers ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input type="number" min="0" step="0.01" value={templateForm.estimatedAmount} onChange={(e) => setTemplateForm({ ...templateForm, estimatedAmount: e.target.value })} placeholder="Monto estimado" className={`${inputClass} font-mono`} />
                  <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={templateForm.applyIsv} onChange={(e) => setTemplateForm({ ...templateForm, applyIsv: e.target.checked })} className="rounded" /> Con ISV</label>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateTemplate} disabled={!templateForm.name || !templateForm.accountId} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">Guardar</button>
                  <button onClick={() => setShowTemplateForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
                </div>
              </div>
            )}

            {(!templates || templates.length === 0) ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center">
                <FileText size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Sin gastos fijos</h3>
                <p className="text-sm text-text-muted">Crea plantillas para gastos recurrentes como alquiler, servicios públicos, planilla, etc.</p>
              </div>
            ) : (
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                    <th className="px-5 py-3 text-left">Nombre</th><th className="px-4 py-3 text-left">Cuenta</th><th className="px-4 py-3 text-left">Proveedor</th><th className="px-4 py-3 text-right">Monto Estimado</th><th className="px-4 py-3 text-center">ISV</th><th className="px-4 py-3 w-12"></th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {templates.map((t: any) => (
                      <tr key={t.id} className="hover:bg-surface-hover group">
                        <td className="px-5 py-3 text-sm font-medium text-text-primary">{t.name}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{t.account?.code} {t.account?.name}</td>
                        <td className="px-4 py-3 text-sm text-text-muted">{t.supplier?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(parseFloat(t.estimatedAmount))}</td>
                        <td className="px-4 py-3 text-center text-sm">{t.applyIsv ? 'Sí' : 'No'}</td>
                        <td className="px-4 py-3"><button onClick={() => deleteTemplateMutation.mutate(t.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ExpensesPage;

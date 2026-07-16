import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Save } from 'lucide-react';
import Header from '@/components/Header';
import { useAccounts } from '@/hooks/useAccounts';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useBankAccounts } from '@/hooks/useTreasury';
import { formatLempiras } from '@/lib/utils';
import { useCreateExpense, useExpenseTemplates } from '@/hooks/useExpenses';

const ExpenseFormPage = () => {
  const navigate = useNavigate();
  const { data: accounts } = useAccounts();
  const { data: suppliers } = useSuppliers();
  const { data: bankAccounts } = useBankAccounts();
  const { data: templates } = useExpenseTemplates();
  const createMutation = useCreateExpense();

  const [templateId, setTemplateId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isvRate, setIsvRate] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  const expenseAccounts = (accounts ?? []).filter((a: any) => a.type === 'EXPENSE' && a.isDetail);
  
  const subtotal = parseFloat(amount) || 0;
  const isvAmount = +(subtotal * parseFloat(isvRate) / 100).toFixed(2);
  const total = subtotal + isvAmount;

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    if (id) {
      const template = templates?.find((t: any) => t.id === id);
      if (template) {
        setAccountId(template.accountId);
        setSupplierId(template.supplierId ?? '');
        setDescription(template.name);
        setAmount(String(parseFloat(template.estimatedAmount)));
        setIsvRate(String(parseFloat(template.estimatedAmount) > 0 && template.applyIsv ? 15 : 0));
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!accountId) { setError('Selecciona una cuenta de gasto'); return; }
    if (!description) { setError('La descripción es requerida'); return; }
    if (subtotal <= 0) { setError('El monto debe ser mayor a cero'); return; }

    try {
      await createMutation.mutateAsync({
        templateId: templateId || undefined,
        accountId,
        supplierId: supplierId || undefined,
        bankAccountId: bankAccountId || undefined,
        date,
        description,
        amount: subtotal,
        isvRate: parseFloat(isvRate),
        paymentMethod: paymentMethod || undefined,
        reference: reference || undefined,
        notes: notes || undefined,
      });
      navigate('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.message?.[0] ?? 'Error al crear gasto');
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <>
      <Header title="Nuevo Gasto" subtitle="Registrar gasto operativo" />
      <div className="p-6 max-w-3xl">
        <div className="bg-surface rounded-xl border border-border p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          {/* Template selector */}
          {templates && templates.length > 0 && (
            <div className="mb-6 p-4 bg-surface-alt rounded-lg border border-border">
              <label className={labelClass}>Cargar desde gasto fijo</label>
              <select value={templateId} onChange={(e) => handleTemplateChange(e.target.value)} className={inputClass}>
                <option value="">— Seleccionar plantilla (opcional) —</option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} — {formatLempiras(parseFloat(t.estimatedAmount))}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Cuenta de gasto *</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}>
                <option value="">Seleccionar cuenta...</option>
                {expenseAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Descripción *</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Pago de alquiler julio 2026" className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>Monto *</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className={labelClass}>Proveedor / Beneficiario</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
                <option value="">Sin proveedor</option>
                {(suppliers ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pagar desde</label>
              <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className={inputClass}>
                <option value="">Sin pagar aún (genera CxP)</option>
                {(bankAccounts ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.name} ({formatLempiras(parseFloat(a.currentBalance))})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className={labelClass}>Método de pago</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                <option value="">Seleccionar...</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="check">Cheque</option>
                <option value="card">Tarjeta</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Referencia</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="# Recibo, # Cheque" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ISV</label>
              <select value={isvRate} onChange={(e) => setIsvRate(e.target.value)} className={inputClass}>
                <option value="0">Sin ISV</option>
                <option value="15">ISV 15%</option>
                <option value="18">ISV 18%</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Notas</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales (opcional)" className={inputClass} />
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Monto:</span><span className="font-mono">{formatLempiras(subtotal)}</span></div>
              {isvAmount > 0 && <div className="flex justify-between text-sm"><span className="text-text-secondary">ISV ({isvRate}%):</span><span className="font-mono">{formatLempiras(isvAmount)}</span></div>}
              <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold"><span>Total:</span><span className="font-mono">{formatLempiras(total)}</span></div>
              {bankAccountId && <div className="text-xs text-text-muted text-right">Se debitará de la cuenta seleccionada</div>}
              {!bankAccountId && subtotal > 0 && <div className="text-xs text-amber-600 text-right">Se registrará como Cuenta por Pagar</div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={() => navigate('/expenses')} className="px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
              <Save size={14} />{createMutation.isPending ? 'Guardando...' : 'Guardar gasto'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseFormPage;

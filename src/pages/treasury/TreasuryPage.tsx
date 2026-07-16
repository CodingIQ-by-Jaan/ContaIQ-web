import { useState } from 'react';
import { Plus, Landmark, ArrowRightLeft, CheckCircle, Circle } from 'lucide-react';
import Header from '@/components/Header';
import { useBankAccounts, useCreateBankAccount, useTransactions, useCreateTransaction, useCreateTransfer, useToggleReconciled } from '@/hooks/useTreasury';
import { cn, formatLempiras, formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = { INCOME: 'Ingreso', EXPENSE: 'Egreso', TRANSFER_IN: 'Transferencia +', TRANSFER_OUT: 'Transferencia -' };
const TYPE_COLORS: Record<string, string> = { INCOME: 'text-success', EXPENSE: 'text-danger', TRANSFER_IN: 'text-brand-600', TRANSFER_OUT: 'text-amber-600' };
const ACCOUNT_TYPE_LABELS: Record<string, string> = { checking: 'Corriente', savings: 'Ahorro', cash: 'Caja' };

const TreasuryPage = () => {
  const { data: accounts, isLoading } = useBankAccounts();
  const createAccountMutation = useCreateBankAccount();
  const createTxMutation = useCreateTransaction();
  const createTransferMutation = useCreateTransfer();
  const toggleReconciledMutation = useToggleReconciled();

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewTx, setShowNewTx] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', bankName: '', accountNumber: '', accountType: 'checking', initialBalance: '0' });
  const [txForm, setTxForm] = useState({ bankAccountId: '', date: new Date().toISOString().split('T')[0], type: 'INCOME', amount: '', description: '', reference: '', category: '' });
  const [transferForm, setTransferForm] = useState({ fromAccountId: '', toAccountId: '', date: new Date().toISOString().split('T')[0], amount: '', description: '' });

  const { data: txData } = useTransactions(selectedAccountId);
  const transactions = txData?.data ?? [];

  const totalBalance = (accounts ?? []).reduce((s: number, a: any) => s + parseFloat(a.currentBalance), 0);

  const handleCreateAccount = async () => {
    if (!accountForm.name) return;
    await createAccountMutation.mutateAsync({
      ...accountForm,
      initialBalance: parseFloat(accountForm.initialBalance) || 0 },
    );
    setAccountForm({ name: '', bankName: '', accountNumber: '', accountType: 'checking', initialBalance: '0' });
    setShowNewAccount(false);
  };

  const handleCreateTx = async () => {
    if (!txForm.bankAccountId || !txForm.amount || !txForm.description) return;
    await createTxMutation.mutateAsync({ ...txForm, amount: parseFloat(txForm.amount) });
    setTxForm({ bankAccountId: '', date: new Date().toISOString().split('T')[0], type: 'INCOME', amount: '', description: '', reference: '', category: '' });
    setShowNewTx(false);
  };

  const handleTransfer = async () => {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) return;
    try {
      await createTransferMutation.mutateAsync({ ...transferForm, amount: parseFloat(transferForm.amount) });
      setTransferForm({ fromAccountId: '', toAccountId: '', date: new Date().toISOString().split('T')[0], amount: '', description: '' });
      setShowTransfer(false);
    } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Tesorería" subtitle="Cuentas bancarias y flujo de caja"
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowTransfer(!showTransfer)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover"><ArrowRightLeft size={14} /> Transferir</button>
            <button onClick={() => setShowNewTx(!showNewTx)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover"><Plus size={14} /> Movimiento</button>
            <button onClick={() => setShowNewAccount(!showNewAccount)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus size={14} /> Cuenta</button>
          </div>
        } />

      <div className="p-6">
        {/* New Account Form */}
        {showNewAccount && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nueva cuenta bancaria</h3>
            <div className="grid grid-cols-5 gap-3 mb-4">
              <input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} placeholder="Nombre *" className={inputClass} />
              <input value={accountForm.bankName} onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })} placeholder="Banco" className={inputClass} />
              <input value={accountForm.accountNumber} onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })} placeholder="# Cuenta" className={inputClass} />
              <select value={accountForm.accountType} onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })} className={inputClass}><option value="checking">Corriente</option><option value="savings">Ahorro</option><option value="cash">Caja</option></select>
              <input type="number" value={accountForm.initialBalance} onChange={(e) => setAccountForm({ ...accountForm, initialBalance: e.target.value })} placeholder="Saldo inicial" className={`${inputClass} font-mono`} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateAccount} disabled={!accountForm.name} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">Guardar</button>
              <button onClick={() => setShowNewAccount(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
            </div>
          </div>
        )}

        {/* New Transaction Form */}
        {showNewTx && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nuevo movimiento</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <select value={txForm.bankAccountId} onChange={(e) => setTxForm({ ...txForm, bankAccountId: e.target.value })} className={inputClass}><option value="">Cuenta *</option>{(accounts ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              <select value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })} className={inputClass}><option value="INCOME">Ingreso</option><option value="EXPENSE">Egreso</option></select>
              <input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} className={inputClass} />
              <input type="number" min="0" step="0.01" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} placeholder="Monto *" className={`${inputClass} font-mono`} />
              <input value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder="Descripción *" className={`${inputClass} col-span-2`} />
              <input value={txForm.reference} onChange={(e) => setTxForm({ ...txForm, reference: e.target.value })} placeholder="Referencia" className={inputClass} />
              <input value={txForm.category} onChange={(e) => setTxForm({ ...txForm, category: e.target.value })} placeholder="Categoría" className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateTx} disabled={!txForm.bankAccountId || !txForm.amount || !txForm.description} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">Guardar</button>
              <button onClick={() => setShowNewTx(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
            </div>
          </div>
        )}

        {/* Transfer Form */}
        {showTransfer && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Transferencia entre cuentas</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <select value={transferForm.fromAccountId} onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })} className={inputClass}><option value="">Cuenta origen *</option>{(accounts ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.name} ({formatLempiras(parseFloat(a.currentBalance))})</option>)}</select>
              <select value={transferForm.toAccountId} onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })} className={inputClass}><option value="">Cuenta destino *</option>{(accounts ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              <input type="date" value={transferForm.date} onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })} className={inputClass} />
              <input type="number" min="0" step="0.01" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="Monto *" className={`${inputClass} font-mono`} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleTransfer} disabled={!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">Transferir</button>
              <button onClick={() => setShowTransfer(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
            </div>
          </div>
        )}

        {/* Accounts Cards */}
        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}

        {!isLoading && (!accounts || accounts.length === 0) && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Landmark size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin cuentas bancarias</h3>
            <p className="text-sm text-text-muted">Agrega tu primera cuenta bancaria o caja.</p>
          </div>
        )}

        {accounts && accounts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {accounts.map((a: any) => (
                <button key={a.id} onClick={() => setSelectedAccountId(a.id === selectedAccountId ? '' : a.id)}
                  className={cn('bg-surface rounded-xl border p-5 text-left transition-all hover:shadow-sm', a.id === selectedAccountId ? 'border-brand-500 ring-1 ring-brand-200' : 'border-border')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-muted uppercase">{ACCOUNT_TYPE_LABELS[a.accountType] ?? a.accountType}</span>
                    <Landmark size={16} className="text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">{a.name}</p>
                  {a.bankName && <p className="text-xs text-text-muted">{a.bankName}</p>}
                  <p className="text-xl font-semibold font-mono text-text-primary mt-2">{formatLempiras(parseFloat(a.currentBalance))}</p>
                </button>
              ))}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-5">
                <span className="text-xs text-brand-600 uppercase">Saldo Total</span>
                <p className="text-2xl font-bold font-mono text-brand-700 mt-3">{formatLempiras(totalBalance)}</p>
              </div>
            </div>

            {/* Transactions */}
            {selectedAccountId && (
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-surface-alt">
                  <h3 className="text-sm font-semibold text-text-primary">Movimientos</h3>
                </div>
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">Sin movimientos en esta cuenta.</div>
                ) : (
                  <table className="w-full">
                    <thead><tr className="border-b border-border text-xs text-text-secondary uppercase">
                      <th className="px-5 py-2.5 text-left w-24">Fecha</th><th className="px-4 py-2.5 text-left">Descripción</th><th className="px-4 py-2.5 text-left w-28">Tipo</th><th className="px-4 py-2.5 text-left w-24">Ref.</th><th className="px-4 py-2.5 text-right w-32">Monto</th><th className="px-4 py-2.5 text-center w-12">✓</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-surface-hover">
                          <td className="px-5 py-2.5 text-sm text-text-secondary">{formatDate(tx.date)}</td>
                          <td className="px-4 py-2.5 text-sm text-text-primary">{tx.description}</td>
                          <td className={cn('px-4 py-2.5 text-sm font-medium', TYPE_COLORS[tx.type])}>{TYPE_LABELS[tx.type]}</td>
                          <td className="px-4 py-2.5 text-sm text-text-muted">{tx.reference ?? '—'}</td>
                          <td className={cn('px-4 py-2.5 text-sm text-right font-mono font-medium', tx.type === 'INCOME' || tx.type === 'TRANSFER_IN' ? 'text-success' : 'text-danger')}>
                            {tx.type === 'INCOME' || tx.type === 'TRANSFER_IN' ? '+' : '-'}{formatLempiras(parseFloat(tx.amount))}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => toggleReconciledMutation.mutate(tx.id)} className="p-0.5">
                              {tx.isReconciled ? <CheckCircle size={16} className="text-success" /> : <Circle size={16} className="text-text-muted" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TreasuryPage;

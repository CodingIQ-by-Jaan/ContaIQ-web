import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Plus, Download, Trash2,
  FolderTree, FileText, AlertCircle,
} from 'lucide-react';
import { useAccountsTree, useSeedAccounts, useCreateAccount, useDeleteAccount } from '../../hooks/useAccounts';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';

const TYPE_LABELS: Record<string, string> = {
  ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Capital',
  REVENUE: 'Ingreso', COST: 'Costo', EXPENSE: 'Gasto',
};

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-700', LIABILITY: 'bg-red-100 text-red-700',
  EQUITY: 'bg-purple-100 text-purple-700', REVENUE: 'bg-green-100 text-green-700',
  COST: 'bg-amber-100 text-amber-700', EXPENSE: 'bg-orange-100 text-orange-700',
};

interface AccountNode {
  id: string; code: string; name: string; type: string;
  nature: string; isDetail: boolean; currentBalance: string;
  children: AccountNode[];
}

const AccountRow = ({ account, level, onDelete }: { account: AccountNode; level: number; onDelete: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = account.children.length > 0;
  const balance = parseFloat(account.currentBalance);

  return (
    <>
      <tr className="hover:bg-surface-hover transition-colors group">
        <td className="px-4 py-2.5 text-sm" style={{ paddingLeft: `${16 + level * 24}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-border">
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            {account.isDetail ? (
              <FileText size={14} className="text-text-muted" />
            ) : (
              <FolderTree size={14} className="text-brand-500" />
            )}
            <span className="font-mono text-text-secondary">{account.code}</span>
          </div>
        </td>
        <td className="px-4 py-2.5 text-sm text-text-primary">
          <span className={cn(!account.isDetail && 'font-semibold')}>
            {account.name}
          </span>
        </td>
        <td className="px-4 py-2.5 text-sm">
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', TYPE_COLORS[account.type])}>
            {TYPE_LABELS[account.type]}
          </span>
        </td>
        <td className="px-4 py-2.5 text-sm text-right font-mono">
          {account.isDetail && balance !== 0 && (
            <span className={balance >= 0 ? 'text-text-primary' : 'text-danger'}>
              L. {Math.abs(balance).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </span>
          )}
        </td>
        <td className="px-4 py-2.5 text-sm text-right">
          {account.isDetail && !hasChildren && (
            <button
              onClick={() => onDelete(account.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger transition-all"
              title="Eliminar cuenta"
            >
              <Trash2 size={14} />
            </button>
          )}
        </td>
      </tr>
      {expanded && account.children.map((child) => (
        <AccountRow key={child.id} account={child} level={level + 1} onDelete={onDelete} />
      ))}
    </>
  );
};

const AccountsPage = () => {
  const { data: tree, isLoading, error } = useAccountsTree();
  const seedMutation = useSeedAccounts();
  const deleteMutation = useDeleteAccount();
  const [showForm, setShowForm] = useState(false);

  const isEmpty = !isLoading && (!tree || tree.length === 0);

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] ?? 'Error al cargar catálogo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cuenta?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] ?? 'No se puede eliminar');
    }
  };

  return (
    <>
      <Header
        title="Catálogo de Cuentas"
        subtitle="Plan contable de la organización"
        actions={
          <div className="flex gap-2">
            {isEmpty && (
              <button
                onClick={handleSeed}
                disabled={seedMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                <Download size={14} />
                {seedMutation.isPending ? 'Cargando...' : 'Cargar catálogo hondureño'}
              </button>
            )}
          </div>
        }
      />

      <div className="p-6">
        {isLoading && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">
            Cargando catálogo...
          </div>
        )}

        {error && (
          <div className="bg-surface rounded-xl border border-red-200 p-6 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">Error al cargar el catálogo de cuentas</span>
          </div>
        )}

        {isEmpty && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <FolderTree size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin catálogo de cuentas</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              Carga el catálogo base hondureño con un click. Incluye cuentas de activo, pasivo, capital, ingresos, costos y gastos listas para usar.
            </p>
            <button
              onClick={handleSeed}
              disabled={seedMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <Download size={16} />
              {seedMutation.isPending ? 'Cargando catálogo...' : 'Cargar catálogo hondureño'}
            </button>
          </div>
        )}

        {tree && tree.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-48">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-28">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-36">Saldo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tree.map((account: AccountNode) => (
                  <AccountRow key={account.id} account={account} level={0} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountsPage;

import { useState } from 'react';
import Header from '@/components/Header';
import { useBalanceSheet } from '@/hooks/useReports';
import { formatLempiras } from '@/lib/utils';
import { cn } from '@/lib/utils';

const BalanceSheetPage = () => {
  const [endDate, setEndDate] = useState('');
  const { data, isLoading } = useBalanceSheet(endDate || undefined);

  const Section = ({ title, accounts, total }: { title: string; accounts: any[]; total: number }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-text-primary mb-2 uppercase tracking-wider">{title}</h3>
      <div className="space-y-1">
        {accounts.map((a: any) => (
          <div key={a.id} className="flex justify-between py-1 px-2 hover:bg-surface-hover rounded text-sm">
            <span className="text-text-secondary"><span className="font-mono text-text-muted mr-2">{a.code}</span>{a.name}</span>
            <span className="font-mono font-medium">{formatLempiras(a.balance)}</span>
          </div>
        ))}
        <div className="flex justify-between py-2 px-2 border-t border-border font-semibold text-sm">
          <span>Total {title}</span>
          <span className="font-mono">{formatLempiras(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header title="Balance General" subtitle="Estado de situación financiera" />
      <div className="p-6 max-w-3xl">
        <div className="mb-4">
          <label className="text-sm font-medium text-text-secondary mr-2">Al cierre de:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Generando balance...</div>}

        {data && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="text-center mb-6 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Balance General</h2>
              <p className="text-sm text-text-muted">Al {data.date}</p>
            </div>

            <Section title="Activos" accounts={data.assets.accounts} total={data.assets.total} />
            <Section title="Pasivos" accounts={data.liabilities.accounts} total={data.liabilities.total} />
            <Section title="Capital" accounts={data.equity.accounts} total={data.equity.total} />

            <div className="border-t-2 border-border pt-3 mt-4">
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Pasivo + Capital:</span>
                <span className="font-mono">{formatLempiras(data.totalLiabilitiesAndEquity)}</span>
              </div>
              <div className={cn('flex justify-between text-sm font-bold', data.isBalanced ? 'text-success' : 'text-danger')}>
                <span>{data.isBalanced ? '✓ Balance cuadra' : '✗ Balance no cuadra'}</span>
                <span className="font-mono">Activos: {formatLempiras(data.assets.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BalanceSheetPage;

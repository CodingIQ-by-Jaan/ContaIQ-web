import { useState } from 'react';
import Header from '@/components/Header';
import { useIncomeStatement } from '@/hooks/useReports';
import { formatLempiras } from '@/lib/utils';
import { cn } from '@/lib/utils';

const IncomeStatementPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data, isLoading } = useIncomeStatement(startDate || undefined, endDate || undefined);

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500';

  const Section = ({ title, accounts, total }: { title: string; accounts: any[]; total: number }) => (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">{title}</h3>
      {accounts.map((a: any) => (
        <div key={a.id} className="flex justify-between py-1 px-2 hover:bg-surface-hover rounded text-sm">
          <span className="text-text-secondary"><span className="font-mono text-text-muted mr-2">{a.code}</span>{a.name}</span>
          <span className="font-mono">{formatLempiras(a.balance)}</span>
        </div>
      ))}
      <div className="flex justify-between py-1.5 px-2 border-t border-border font-medium text-sm mt-1">
        <span>Total {title}</span>
        <span className="font-mono">{formatLempiras(total)}</span>
      </div>
    </div>
  );

  return (
    <>
      <Header title="Estado de Resultados" subtitle="Pérdidas y ganancias del período" />
      <div className="p-6 max-w-3xl">
        <div className="flex gap-3 mb-4">
          <div><label className="text-sm font-medium text-text-secondary block mb-1">Desde</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} /></div>
          <div><label className="text-sm font-medium text-text-secondary block mb-1">Hasta</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} /></div>
        </div>

        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Generando estado de resultados...</div>}

        {data && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="text-center mb-6 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Estado de Resultados</h2>
              <p className="text-sm text-text-muted">
                {data.period.startDate && data.period.endDate
                  ? `Del ${data.period.startDate} al ${data.period.endDate}`
                  : 'Todos los períodos'}
              </p>
            </div>

            <Section title="Ingresos" accounts={data.revenue.accounts} total={data.revenue.total} />
            <Section title="Costos" accounts={data.costs.accounts} total={data.costs.total} />

            <div className="flex justify-between py-2 px-2 bg-surface-alt rounded-lg mb-4 font-semibold text-sm">
              <span>Utilidad Bruta</span>
              <span className={cn('font-mono', data.grossProfit >= 0 ? 'text-success' : 'text-danger')}>
                {formatLempiras(data.grossProfit)}
              </span>
            </div>

            <Section title="Gastos" accounts={data.expenses.accounts} total={data.expenses.total} />

            <div className={cn('flex justify-between py-3 px-3 rounded-lg font-bold text-base mt-4',
              data.netIncome >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
              <span>{data.netIncome >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'}</span>
              <span className={cn('font-mono', data.netIncome >= 0 ? 'text-success' : 'text-danger')}>
                {formatLempiras(Math.abs(data.netIncome))}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IncomeStatementPage;

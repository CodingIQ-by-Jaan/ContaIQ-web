import { useState } from 'react';
import { Plus, Shield, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { useCaiConfigs, useCaiStatus, useCreateCaiConfig, useDeactivateCaiConfig } from '@/hooks/useInvoicing';
import { cn } from '@/lib/utils';

const DOC_TYPES: Record<string, string> = { '01': 'Factura', '02': 'Nota de Crédito', '03': 'Nota de Débito' };

const CaiConfigPage = () => {
  const { data: configs, isLoading } = useCaiConfigs();
  const { data: statuses } = useCaiStatus();
  const createMutation = useCreateCaiConfig();
  const deactivateMutation = useDeactivateCaiConfig();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    caiNumber: '', rangeStart: '', rangeEnd: '', expirationDate: '',
    establishmentCode: '001', pointOfSale: '001', documentType: '01',
  });
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!form.caiNumber || !form.rangeStart || !form.rangeEnd || !form.expirationDate) {
      setError('Todos los campos son requeridos'); return;
    }
    try {
      await createMutation.mutateAsync(form);
      setForm({ caiNumber: '', rangeStart: '', rangeEnd: '', expirationDate: '', establishmentCode: '001', pointOfSale: '001', documentType: '01' });
      setShowForm(false);
    } catch (err: any) { setError(err.response?.data?.message?.[0] ?? 'Error al registrar CAI'); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Desactivar este CAI? Las ventas futuras no usarán este rango.')) return;
    await deactivateMutation.mutateAsync(id);
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <>
      <Header title="Facturación SAR" subtitle="Configuración de CAI y correlativos fiscales"
        actions={
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
            <Plus size={14} /> Registrar CAI
          </button>
        } />

      <div className="p-6">
        {/* Status Cards */}
        {statuses && statuses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statuses.map((s: any) => (
              <div key={s.id} className={cn(
                'rounded-xl border p-5',
                s.isExpired ? 'bg-red-50 border-red-200' :
                s.isExpiringSoon || s.isLowRange ? 'bg-amber-50 border-amber-200' :
                'bg-green-50 border-green-200',
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">{s.documentTypeLabel}</span>
                  {s.isExpired ? <XCircle size={18} className="text-danger" /> :
                   s.isExpiringSoon || s.isLowRange ? <AlertTriangle size={18} className="text-amber-600" /> :
                   <CheckCircle size={18} className="text-success" />}
                </div>
                <p className="text-xs text-text-muted font-mono mb-3">{s.caiNumber}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Correlativos restantes:</span>
                    <span className={cn('font-mono font-medium', s.isLowRange ? 'text-danger' : 'text-text-primary')}>{s.remaining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Días para vencer:</span>
                    <span className={cn('font-mono font-medium', s.isExpired ? 'text-danger' : s.isExpiringSoon ? 'text-amber-600' : 'text-text-primary')}>
                      {s.isExpired ? 'Vencido' : `${s.daysLeft} días`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Último correlativo:</span>
                    <span className="font-mono text-text-primary">{String(s.currentNumber).padStart(8, '0')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New CAI Form */}
        {showForm && (
          <div className="bg-surface rounded-xl border border-border p-6 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Registrar nuevo CAI del SAR</h3>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className={labelClass}>Clave de Autorización de Impresión (CAI) *</label>
                <input value={form.caiNumber} onChange={(e) => setForm({ ...form, caiNumber: e.target.value })} placeholder="Ej: A1B2C3-D4E5F6-789012" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Rango inicio *</label>
                <input value={form.rangeStart} onChange={(e) => setForm({ ...form, rangeStart: e.target.value })} placeholder="001-001-01-00000001" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Rango fin *</label>
                <input value={form.rangeEnd} onChange={(e) => setForm({ ...form, rangeEnd: e.target.value })} placeholder="001-001-01-00005000" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Fecha límite de emisión *</label>
                <input type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tipo de documento</label>
                <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className={inputClass}>
                  <option value="01">01 — Factura</option>
                  <option value="02">02 — Nota de Crédito</option>
                  <option value="03">03 — Nota de Débito</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Código de establecimiento</label>
                <input value={form.establishmentCode} onChange={(e) => setForm({ ...form, establishmentCode: e.target.value })} placeholder="001" maxLength={3} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Punto de emisión</label>
                <input value={form.pointOfSale} onChange={(e) => setForm({ ...form, pointOfSale: e.target.value })} placeholder="001" maxLength={3} className={`${inputClass} font-mono`} />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={createMutation.isPending} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
                {createMutation.isPending ? 'Guardando...' : 'Registrar CAI'}
              </button>
              <button onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
            </div>
          </div>
        )}

        {/* CAI List */}
        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}

        {!isLoading && (!configs || configs.length === 0) && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Shield size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin CAI registrado</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              Registra tu Clave de Autorización de Impresión (CAI) del SAR para generar facturas fiscales con correlativos automáticos.
            </p>
          </div>
        )}

        {configs && configs.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                <th className="px-5 py-3 text-left">CAI</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Rango</th>
                <th className="px-4 py-3 text-left">Vencimiento</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 w-12"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {configs.map((c: any) => (
                  <tr key={c.id} className="hover:bg-surface-hover group">
                    <td className="px-5 py-3 text-sm font-mono text-text-primary">{c.caiNumber}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{DOC_TYPES[c.documentType] ?? c.documentType}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-muted">{c.rangeStart} → {c.rangeEnd}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{new Date(c.expirationDate).toLocaleDateString('es-HN')}</td>
                    <td className="px-4 py-3 text-center">
                      {c.isActive
                        ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Activo</span>
                        : <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">Inactivo</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.isActive && (
                        <button onClick={() => handleDeactivate(c.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CaiConfigPage;

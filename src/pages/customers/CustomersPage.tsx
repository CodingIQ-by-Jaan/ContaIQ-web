import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import Header from '@/components/Header';
import { useCustomers, useCreateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';

const TYPE_LABELS: Record<string, string> = { FINAL_CONSUMER: 'Consumidor Final', TAXPAYER: 'Contribuyente' };

const CustomersPage = () => {
  const { data: customers, isLoading } = useCustomers();
  const createMutation = useCreateCustomer();
  const deleteMutation = useDeleteCustomer();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rtn: '', type: 'FINAL_CONSUMER', email: '', phone: '', address: '' });

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      await createMutation.mutateAsync(form);
      setForm({ name: '', rtn: '', type: 'FINAL_CONSUMER', email: '', phone: '', address: '' });
      setShowForm(false);
    } catch (err: any) { alert(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este cliente?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Clientes" subtitle="Gestión de clientes"
        actions={<button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus size={14} /> Nuevo</button>} />

      <div className="p-6">
        {showForm && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nuevo cliente</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className={inputClass} />
              <input value={form.rtn} onChange={(e) => setForm({ ...form, rtn: e.target.value })} placeholder="RTN" className={inputClass} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                <option value="FINAL_CONSUMER">Consumidor Final</option>
                <option value="TAXPAYER">Contribuyente</option>
              </select>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputClass} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" className={inputClass} />
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Dirección" className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={!form.name || createMutation.isPending} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">{createMutation.isPending ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
            </div>
          </div>
        )}

        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}

        {!isLoading && (!customers || customers.length === 0) && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Users size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin clientes</h3>
            <p className="text-sm text-text-muted">Agrega tu primer cliente para registrar ventas.</p>
          </div>
        )}

        {customers && customers.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                <th className="px-5 py-3 text-left">Nombre</th><th className="px-4 py-3 text-left">RTN</th><th className="px-4 py-3 text-left">Tipo</th><th className="px-4 py-3 text-left">Teléfono</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 w-12"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-surface-hover group">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary font-mono">{c.rtn ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{TYPE_LABELS[c.type] ?? c.type}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{c.email ?? '—'}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger"><Trash2 size={14} /></button></td>
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

export default CustomersPage;

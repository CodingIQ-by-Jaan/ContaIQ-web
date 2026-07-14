import { useState } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import { useProducts, useCreateProduct } from '@/hooks/useProducts';
import { formatLempiras } from '@/lib/utils';

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const { data: products, isLoading } = useProducts(search || undefined);
  const createMutation = useCreateProduct();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', unit: 'unidad', salePrice: '', minStock: '0', isExempt: false, isService: false });
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!form.code || !form.name) { setError('Código y nombre son requeridos'); return; }
    setError('');
    try {
      await createMutation.mutateAsync({ ...form, salePrice: parseFloat(form.salePrice) || 0, minStock: parseFloat(form.minStock) || 0 });
      setForm({ code: '', name: '', description: '', unit: 'unidad', salePrice: '', minStock: '0', isExempt: false, isService: false });
      setShowForm(false);
    } catch (err: any) { setError(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const inputClass = 'px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Productos" subtitle="Catálogo de productos e inventario"
        actions={<button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus size={14} /> Nuevo</button>} />
      <div className="p-6">
        {/* Search */}
        <div className="mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código o nombre..." className={`${inputClass} w-full max-w-md`} />
        </div>

        {showForm && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nuevo producto</h3>
            {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Código *" className={inputClass} />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className={inputClass} />
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className={inputClass} />
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                <option value="unidad">Unidad</option><option value="lb">Libra</option><option value="kg">Kilogramo</option><option value="caja">Caja</option><option value="docena">Docena</option>
              </select>
              <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="Precio venta" className={`${inputClass} font-mono`} />
              <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="Stock mínimo" className={`${inputClass} font-mono`} />
              <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={form.isExempt} onChange={(e) => setForm({ ...form, isExempt: e.target.checked })} className="rounded" /> Exento ISV</label>
              <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={form.isService} onChange={(e) => setForm({ ...form, isService: e.target.checked })} className="rounded" /> Es servicio</label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={createMutation.isPending} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50">{createMutation.isPending ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-hover">Cancelar</button>
            </div>
          </div>
        )}

        {isLoading && <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando...</div>}

        {!isLoading && (!products || products.length === 0) && (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Package size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Sin productos</h3>
            <p className="text-sm text-text-muted">Agrega productos para controlar tu inventario.</p>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface-alt text-xs text-text-secondary uppercase">
                <th className="px-5 py-3 text-left">Código</th><th className="px-4 py-3 text-left">Nombre</th><th className="px-4 py-3 text-left">Unidad</th><th className="px-4 py-3 text-right">Precio Venta</th><th className="px-4 py-3 text-right">Costo Prom.</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3 text-right">Min.</th><th className="px-4 py-3 text-center">Estado</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {products.map((p: any) => {
                  const stock = parseFloat(p.currentStock);
                  const minStock = parseFloat(p.minStock);
                  const isLow = stock <= minStock && minStock > 0;
                  return (
                    <tr key={p.id} className="hover:bg-surface-hover">
                      <td className="px-5 py-3 text-sm font-mono text-brand-600">{p.code}</td>
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{p.unit}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{formatLempiras(parseFloat(p.salePrice))}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-text-muted">{formatLempiras(parseFloat(p.averageCost))}</td>
                      <td className={`px-4 py-3 text-sm text-right font-mono font-medium ${isLow ? 'text-danger' : 'text-text-primary'}`}>
                        {p.isService ? '—' : stock.toFixed(0)}
                        {isLow && <AlertTriangle size={12} className="inline ml-1" />}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-text-muted">{p.isService ? '—' : minStock.toFixed(0)}</td>
                      <td className="px-4 py-3 text-center">
                        {p.isService ? <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">Servicio</span> : p.isExempt ? <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Exento</span> : <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Gravado</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;

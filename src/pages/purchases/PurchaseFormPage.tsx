import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Save } from 'lucide-react';
import Header from '@/components/Header';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { useCreatePurchase } from '@/hooks/usePurchases';
import { formatLempiras } from '@/lib/utils';

interface Item {
  id: string;
  productId: string;
  description: string;
  quantity: string;
  unitCost: string;
  isvRate: string;
}
const emptyItem = (): Item => ({ id: crypto.randomUUID(), productId: '', description: '', quantity: '', unitCost: '', isvRate: '15' });

const PurchaseFormPage = () => {
  const navigate = useNavigate();
  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  const createMutation = useCreatePurchase();

  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierInvoice, setSupplierInvoice] = useState('');
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [error, setError] = useState('');

  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      if (field === 'productId' && value) {
        const product = products?.find((p: any) => p.id === value);
        if (product) {
          updated.description = product.name;
          updated.unitCost = String(product.averageCost ?? 0);
          updated.isvRate = String(parseFloat(product.isvRate ?? 15));
        }
      }
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitCost) || 0), 0);
  const isvAmount = items.reduce((s, i) => {
    const lineSubtotal = (parseFloat(i.quantity) || 0) * (parseFloat(i.unitCost) || 0);
    const rate = parseFloat(i.isvRate) / 100;
    return s + (lineSubtotal * rate);
  }, 0);
  const total = subtotal + isvAmount;

  const handleSubmit = async () => {
    setError('');
    if (!supplierId) { setError('Selecciona un proveedor'); return; }
    const validItems = items.filter((i) => i.description && parseFloat(i.quantity) > 0 && parseFloat(i.unitCost) >= 0);
    if (!validItems.length) { setError('Agrega al menos un item'); return; }

    try {
      await createMutation.mutateAsync({
        supplierId, date, supplierInvoice: supplierInvoice || undefined,
        items: validItems.map((i) => ({
          productId: i.productId || undefined,
          description: i.description,
          quantity: parseFloat(i.quantity),
          unitCost: parseFloat(i.unitCost),
          isvRate: i.isvRate,
        })),
      });
      navigate('/purchases');
    } catch (err: any) { setError(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Nueva Compra" subtitle="Registrar compra a proveedor" />
      <div className="p-6 max-w-5xl">
        <div className="bg-surface rounded-xl border border-border p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Proveedor *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
                <option value="">Seleccionar...</option>
                {(suppliers ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Fecha *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5"># Factura proveedor</label>
              <input value={supplierInvoice} onChange={(e) => setSupplierInvoice(e.target.value)} placeholder="Opcional" className={inputClass} />
            </div>
          </div>

          <table className="w-full mb-4">
            <thead><tr className="border-b border-border text-xs text-text-secondary uppercase">
              <th className="px-2 py-2 text-left w-[180px]">Producto</th><th className="px-2 py-2 text-left">Descripción</th><th className="px-2 py-2 text-left w-[80px]">Cant.</th><th className="px-2 py-2 text-left w-[120px]">Costo Unit.</th><th className="px-2 py-2 text-left w-[85px]">ISV</th><th className="px-2 py-2 text-right w-[100px]">Subtotal</th><th className="w-10"></th>
            </tr></thead>
            <tbody>
              {items.map((item) => {
                const lineSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
                return (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-2 py-2"><select value={item.productId} onChange={(e) => updateItem(item.id, 'productId', e.target.value)} className={inputClass}>
                      <option value="">Sin producto</option>
                      {(products ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                    </select></td>
                    <td className="px-2 py-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Descripción *" className={inputClass} /></td>
                    <td className="px-2 py-2"><input type="number" min="0" step="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={`${inputClass} text-right font-mono`} /></td>
                    <td className="px-2 py-2"><input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => updateItem(item.id, 'unitCost', e.target.value)} className={`${inputClass} text-right font-mono`} /></td>
                    <td className="px-2 py-2">
                      <select value={item.isvRate} onChange={(e) => updateItem(item.id, 'isvRate', e.target.value)} className={`${inputClass} text-center min-w-[80px]`}>
                        <option value="15">15%</option>
                        <option value="18">18%</option>
                        <option value="0">Exento</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-right text-sm font-mono">{formatLempiras(lineSubtotal)}</td>
                    <td className="px-2 py-2"><button onClick={() => items.length > 1 && setItems(items.filter((i) => i.id !== item.id))} disabled={items.length <= 1} className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger disabled:opacity-30"><Trash2 size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button onClick={() => setItems([...items, emptyItem()])} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 mb-6"><Plus size={14} /> Agregar item</button>

          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Subtotal:</span><span className="font-mono">{formatLempiras(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">ISV (15%):</span><span className="font-mono">{formatLempiras(isvAmount)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold"><span>Total:</span><span className="font-mono">{formatLempiras(total)}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate('/purchases')} className="px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"><Save size={14} />{createMutation.isPending ? 'Guardando...' : 'Guardar compra'}</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseFormPage;

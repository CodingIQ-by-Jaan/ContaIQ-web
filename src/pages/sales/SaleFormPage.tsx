import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Save } from 'lucide-react';
import Header from '@/components/Header';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useCreateSale } from '@/hooks/useSales';
import { formatLempiras } from '@/lib/utils';

const ISV_RATE = 0.15;

interface Item { id: string; productId: string; description: string; quantity: string; unitPrice: string; discountAmount: string; applyIsv: boolean; }
const emptyItem = (): Item => ({ id: crypto.randomUUID(), productId: '', description: '', quantity: '', unitPrice: '', discountAmount: '0', applyIsv: true });

const SaleFormPage = () => {
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const createMutation = useCreateSale();

  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [withholdingAmount, setWithholdingAmount] = useState('0');
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [error, setError] = useState('');

  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      if (field === 'productId' && value) {
        const product = products?.find((p: any) => p.id === value);
        if (product) { updated.description = product.name; updated.unitPrice = String(parseFloat(product.salePrice)); }
      }
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);
  const totalDiscount = items.reduce((s, i) => s + (parseFloat(i.discountAmount) || 0), 0);
  const isvAmount = items.reduce((s, i) => {
    const lineSub = (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0) - (parseFloat(i.discountAmount) || 0);
    return s + (i.applyIsv ? lineSub * ISV_RATE : 0);
  }, 0);
  const withholding = parseFloat(withholdingAmount) || 0;
  const total = subtotal - totalDiscount + isvAmount - withholding;

  const handleSubmit = async () => {
    setError('');
    const validItems = items.filter((i) => i.description && parseFloat(i.quantity) > 0 && parseFloat(i.unitPrice) >= 0);
    if (!validItems.length) { setError('Agrega al menos un item'); return; }

    try {
      await createMutation.mutateAsync({
        customerId: customerId || undefined, date,
        withholdingAmount: withholding > 0 ? withholding : undefined,
        items: validItems.map((i) => ({ productId: i.productId || undefined, description: i.description, quantity: parseFloat(i.quantity), unitPrice: parseFloat(i.unitPrice), discountAmount: parseFloat(i.discountAmount) || 0, applyIsv: i.applyIsv })),
      });
      navigate('/sales');
    } catch (err: any) { setError(err.response?.data?.message?.[0] ?? 'Error'); }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <>
      <Header title="Nueva Venta" subtitle="Registrar venta a cliente" />
      <div className="p-6 max-w-5xl">
        <div className="bg-surface rounded-xl border border-border p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Cliente</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputClass}>
                <option value="">Consumidor Final</option>
                {(customers ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Fecha *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Retención (1%)</label>
              <input type="number" min="0" step="0.01" value={withholdingAmount} onChange={(e) => setWithholdingAmount(e.target.value)} className={`${inputClass} font-mono`} />
            </div>
          </div>

          <table className="w-full mb-4">
            <thead><tr className="border-b border-border text-xs text-text-secondary uppercase">
              <th className="px-2 py-2 text-left">Producto</th><th className="px-2 py-2 text-left">Descripción</th><th className="px-2 py-2 text-right w-20">Cant.</th><th className="px-2 py-2 text-right w-28">Precio</th><th className="px-2 py-2 text-right w-24">Desc.</th><th className="px-2 py-2 text-center w-14">ISV</th><th className="px-2 py-2 text-right w-28">Subtotal</th><th className="w-10"></th>
            </tr></thead>
            <tbody>
              {items.map((item) => {
                const lineSub = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-2 py-2"><select value={item.productId} onChange={(e) => updateItem(item.id, 'productId', e.target.value)} className={inputClass}><option value="">Sin producto</option>{(products ?? []).filter((p: any) => p.isActive).map((p: any) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</select></td>
                    <td className="px-2 py-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Descripción *" className={inputClass} /></td>
                    <td className="px-2 py-2"><input type="number" min="0" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className={`${inputClass} text-right font-mono`} /></td>
                    <td className="px-2 py-2"><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} className={`${inputClass} text-right font-mono`} /></td>
                    <td className="px-2 py-2"><input type="number" min="0" step="0.01" value={item.discountAmount} onChange={(e) => updateItem(item.id, 'discountAmount', e.target.value)} className={`${inputClass} text-right font-mono`} /></td>
                    <td className="px-2 py-2 text-center"><input type="checkbox" checked={item.applyIsv} onChange={(e) => updateItem(item.id, 'applyIsv', e.target.checked)} className="rounded" /></td>
                    <td className="px-2 py-2 text-right text-sm font-mono">{formatLempiras(lineSub)}</td>
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
              {totalDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-text-secondary">Descuento:</span><span className="font-mono text-danger">-{formatLempiras(totalDiscount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-text-secondary">ISV (15%):</span><span className="font-mono">{formatLempiras(isvAmount)}</span></div>
              {withholding > 0 && <div className="flex justify-between text-sm"><span className="text-text-secondary">Retención:</span><span className="font-mono text-danger">-{formatLempiras(withholding)}</span></div>}
              <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold"><span>Total:</span><span className="font-mono">{formatLempiras(total)}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => navigate('/sales')} className="px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"><Save size={14} />{createMutation.isPending ? 'Guardando...' : 'Guardar venta'}</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaleFormPage;

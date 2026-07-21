import { useParams, useNavigate } from 'react-router';
import { Printer, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { useInvoiceData } from '@/hooks/useInvoicing';
import { formatLempiras } from '@/lib/utils';

const InvoiceViewPage = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInvoiceData(saleId ?? '');

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <>
        <Header title="Factura" subtitle="Cargando..." />
        <div className="p-6"><div className="bg-surface rounded-xl border border-border p-12 text-center text-text-muted">Cargando factura...</div></div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header title="Factura" subtitle="Error" />
        <div className="p-6"><div className="bg-surface rounded-xl border border-border p-12 text-center text-danger">No se pudo cargar la factura. Puede que no tenga número fiscal asignado.</div></div>
      </>
    );
  }

  return (
    <>
      {/* Screen header — hidden on print */}
      <div className="print:hidden">
        <Header title={`Factura ${data.factura.numero}`} subtitle={`Venta ${data.factura.saleNumber}`}
          actions={
            <div className="flex gap-2">
              <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover">
                <ArrowLeft size={14} /> Volver
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
                <Printer size={14} /> Imprimir
              </button>
            </div>
          } />
      </div>

      {/* Invoice — print-friendly */}
      <div className="p-6 print:p-0">
        <div className="bg-white rounded-xl border border-border p-8 max-w-3xl mx-auto print:border-none print:rounded-none print:shadow-none print:max-w-none print:mx-0">

          {/* Header */}
          <div className="border-b border-gray-300 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{data.emisor.nombre}</h1>
                <p className="text-sm text-gray-600">RTN: {data.emisor.rtn}</p>
                {data.emisor.direccion && <p className="text-sm text-gray-600">{data.emisor.direccion}</p>}
                {data.emisor.telefono && <p className="text-sm text-gray-600">Tel: {data.emisor.telefono}</p>}
                {data.emisor.email && <p className="text-sm text-gray-600">{data.emisor.email}</p>}
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-gray-900">FACTURA</h2>
                <p className="text-sm font-mono font-semibold text-brand-600">{data.factura.numero}</p>
                <p className="text-sm text-gray-600">Fecha: {new Date(data.factura.fecha).toLocaleDateString('es-HN')}</p>
              </div>
            </div>
          </div>

          {/* CAI Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs text-gray-600 print:bg-white print:border print:border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="font-semibold">CAI:</span> <span className="font-mono">{data.cai.numero}</span></div>
              <div><span className="font-semibold">Fecha Límite:</span> {new Date(data.cai.fechaLimite).toLocaleDateString('es-HN')}</div>
              <div><span className="font-semibold">Rango Autorizado:</span> <span className="font-mono">{data.cai.rangoInicio}</span></div>
              <div className="font-mono">a {data.cai.rangoFin}</div>
            </div>
          </div>

          {/* Customer */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Cliente:</span>
                <span className="ml-2 text-gray-900">{data.cliente.nombre}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">RTN:</span>
                <span className="ml-2 font-mono text-gray-900">{data.cliente.rtn || '—'}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-700">
                <th className="py-2 text-left">Cant.</th>
                <th className="py-2 text-left">Descripción</th>
                <th className="py-2 text-right">P. Unit.</th>
                <th className="py-2 text-right">Desc.</th>
                <th className="py-2 text-center">ISV</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 text-gray-900">{item.cantidad}</td>
                  <td className="py-2 text-gray-900">{item.descripcion}</td>
                  <td className="py-2 text-right font-mono text-gray-900">{formatLempiras(item.precioUnitario)}</td>
                  <td className="py-2 text-right font-mono text-gray-500">{item.descuento > 0 ? formatLempiras(item.descuento) : '—'}</td>
                  <td className="py-2 text-center text-gray-500">{item.isvRate}%</td>
                  <td className="py-2 text-right font-mono font-medium text-gray-900">{formatLempiras(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72">
              {/* ISV breakdown */}
              <div className="space-y-1 text-sm border-b border-gray-200 pb-3 mb-3">
                {data.desglose.exento > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Importe Exento:</span><span className="font-mono">{formatLempiras(data.desglose.exento)}</span></div>
                )}
                {data.desglose.gravado15 > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Importe Gravado 15%:</span><span className="font-mono">{formatLempiras(data.desglose.gravado15)}</span></div>
                )}
                {data.desglose.gravado18 > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Importe Gravado 18%:</span><span className="font-mono">{formatLempiras(data.desglose.gravado18)}</span></div>
                )}
                {data.desglose.isv15 > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">ISV 15%:</span><span className="font-mono">{formatLempiras(data.desglose.isv15)}</span></div>
                )}
                {data.desglose.isv18 > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">ISV 18%:</span><span className="font-mono">{formatLempiras(data.desglose.isv18)}</span></div>
                )}
              </div>

              {/* Summary totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-mono">{formatLempiras(data.totales.subtotal)}</span></div>
                {data.totales.descuento > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Descuento:</span><span className="font-mono text-danger">-{formatLempiras(data.totales.descuento)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-gray-600">ISV:</span><span className="font-mono">{formatLempiras(data.totales.isvTotal)}</span></div>
                {data.totales.retencion > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600">Retención:</span><span className="font-mono text-danger">-{formatLempiras(data.totales.retencion)}</span></div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-base">
                  <span>Total:</span>
                  <span className="font-mono">{formatLempiras(data.totales.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="text-sm font-semibold text-gray-700">{data.leyenda}</p>
            <p className="text-xs text-gray-400 mt-2">Original: Cliente | Copia: Emisor</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceViewPage;

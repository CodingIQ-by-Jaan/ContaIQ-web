import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/authStore';

const DEPARTMENTS = [
  'Atlántida', 'Colón', 'Comayagua', 'Copán', 'Cortés', 'Choluteca',
  'El Paraíso', 'Francisco Morazán', 'Gracias a Dios', 'Intibucá',
  'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque', 'Olancho',
  'Santa Bárbara', 'Valle', 'Yoro',
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { setOrganizations, setActiveOrgId } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', tradeName: '', rtn: '', email: '', phone: '', address: '', city: '', department: '' });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const { data: org } = await api.post('/organizations', form);
      const { data: me } = await api.get('/auth/me');
      setOrganizations(me.organizations);
      setActiveOrgId(org.id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message?.[0] ?? 'Error al crear la organización');
    } finally { setLoading(false); }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600 tracking-tight">Conta<span className="text-brand-800">IQ</span></h1>
          <p className="mt-2 text-text-secondary text-sm">Configura tu primer negocio</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand-500' : 'bg-border'}`} />
          ))}
        </div>

        <div className="bg-surface rounded-xl border border-border p-8 shadow-sm">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-1">Datos del negocio</h2>
              <p className="text-sm text-text-muted mb-6">Información básica de tu empresa</p>
              <div className="space-y-4">
                <div><label htmlFor="name" className={labelClass}>Razón social *</label><input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Comercial López S. de R.L." className={inputClass} /></div>
                <div><label htmlFor="tradeName" className={labelClass}>Nombre comercial</label><input id="tradeName" value={form.tradeName} onChange={(e) => set('tradeName', e.target.value)} placeholder="Tienda López" className={inputClass} /></div>
                <div><label htmlFor="rtn" className={labelClass}>RTN *</label><input id="rtn" value={form.rtn} onChange={(e) => set('rtn', e.target.value)} placeholder="0801-1990-12345" className={inputClass} /><p className="mt-1 text-xs text-text-muted">Formato: 0801-1990-12345</p></div>
                <button type="button" onClick={() => setStep(2)} disabled={!form.name || !form.rtn} className="w-full py-2.5 px-4 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Siguiente</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-1">Contacto y ubicación</h2>
              <p className="text-sm text-text-muted mb-6">Opcional — puedes completar después</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="email" className={labelClass}>Correo</label><input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="info@negocio.hn" className={inputClass} /></div>
                  <div><label htmlFor="phone" className={labelClass}>Teléfono</label><input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+504 9999-9999" className={inputClass} /></div>
                </div>
                <div><label htmlFor="address" className={labelClass}>Dirección</label><input id="address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Bo. El Centro, 3ra Avenida" className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="city" className={labelClass}>Ciudad</label><input id="city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Villanueva" className={inputClass} /></div>
                  <div><label htmlFor="department" className={labelClass}>Departamento</label>
                    <select id="department" value={form.department} onChange={(e) => set('department', e.target.value)} className={inputClass}>
                      <option value="">Seleccionar</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 px-4 rounded-lg border border-border text-text-secondary font-medium hover:bg-surface-hover transition-colors">Atrás</button>
                  <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 px-4 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? 'Creando...' : 'Crear negocio'}</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

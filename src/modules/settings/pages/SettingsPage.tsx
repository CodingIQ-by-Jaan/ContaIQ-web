import { useState, useEffect } from 'react';
import { api } from '@/shared/api/client';
import { useAuth } from '@/shared/hooks/useAuth';
import Header from '@/shared/components/Header';
import { UserPlus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const ROLE_LABELS: Record<string, string> = { OWNER: 'Propietario', ADMIN: 'Administrador', USER: 'Usuario', VIEWER: 'Solo lectura' };
const ROLE_COLORS: Record<string, string> = { OWNER: 'bg-purple-100 text-purple-700', ADMIN: 'bg-blue-100 text-blue-700', USER: 'bg-green-100 text-green-700', VIEWER: 'bg-gray-100 text-gray-600' };

const SettingsPage = () => {
  const { activeOrgId, activeRole } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState('');
  const canManage = activeRole === 'OWNER' || activeRole === 'ADMIN';

  const fetchMembers = async () => {
    try { const { data } = await api.get('/organizations/current/members'); setMembers(data); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (activeOrgId) fetchMembers(); }, [activeOrgId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true); setMessage('');
    try {
      await api.post('/organizations/current/invitations', { email: inviteEmail, role: inviteRole });
      setMessage('Invitación enviada'); setInviteEmail(''); setShowInvite(false);
    } catch (err: any) { setMessage(err.response?.data?.message?.[0] ?? 'Error'); } finally { setInviting(false); }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('¿Remover este miembro?')) return;
    try { await api.delete(`/organizations/current/members/${memberId}`); fetchMembers(); } catch {}
  };

  return (
    <>
      <Header title="Configuración" subtitle="Usuarios y organización" />
      <div className="p-6 max-w-3xl">
        <div className="bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Miembros del equipo</h3>
              <p className="text-xs text-text-muted mt-0.5">{members.length} miembro{members.length !== 1 ? 's' : ''}</p>
            </div>
            {canManage && (
              <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                <UserPlus size={14} /> Invitar
              </button>
            )}
          </div>
          {showInvite && (
            <div className="p-5 border-b border-border bg-surface-alt">
              <div className="flex gap-3">
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="correo@ejemplo.com" className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary">
                  <option value="ADMIN">Administrador</option><option value="USER">Usuario</option><option value="VIEWER">Solo lectura</option>
                </select>
                <button onClick={handleInvite} disabled={inviting || !inviteEmail} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">{inviting ? 'Enviando...' : 'Enviar'}</button>
              </div>
              {message && <p className="mt-2 text-xs text-text-secondary">{message}</p>}
            </div>
          )}
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-text-muted text-sm">Cargando...</div>
            ) : members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">{m.user.fullName?.charAt(0) ?? '?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{m.user.fullName}</p>
                  <p className="text-xs text-text-muted">{m.user.email}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', ROLE_COLORS[m.role])}>{ROLE_LABELS[m.role] ?? m.role}</span>
                {canManage && m.role !== 'OWNER' && (
                  <button onClick={() => handleRemove(m.id)} className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-danger transition-colors" title="Remover"><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { ChevronDown, Check } from 'lucide-react';

const OrgSwitcher = () => {
  const { organizations, activeOrgId, setActiveOrgId } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeOrg = organizations.find((o) => o.organizationId === activeOrgId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (organizations.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
          {activeOrg?.organization.name?.charAt(0) ?? 'C'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary truncate">
            {activeOrg?.organization.name ?? 'Sin organización'}
          </p>
          <p className="text-xs text-text-muted capitalize">
            {activeOrg?.role?.toLowerCase() ?? ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
          {activeOrg?.organization.name?.charAt(0) ?? 'C'}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-text-primary truncate">
            {activeOrg?.organization.name ?? 'Seleccionar'}
          </p>
          <p className="text-xs text-text-muted capitalize">
            {activeOrg?.role?.toLowerCase() ?? ''}
          </p>
        </div>
        <ChevronDown size={16} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 py-1">
          {organizations.map((org) => (
            <button
              key={org.organizationId}
              onClick={() => { setActiveOrgId(org.organizationId); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover transition-colors"
            >
              <div className="w-7 h-7 rounded bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold">
                {org.organization.name.charAt(0)}
              </div>
              <span className="flex-1 text-sm text-text-primary text-left truncate">
                {org.organization.name}
              </span>
              {org.organizationId === activeOrgId && <Check size={14} className="text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgSwitcher;

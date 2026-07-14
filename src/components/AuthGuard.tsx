import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { ShieldX } from 'lucide-react';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, hasOrganization, profile } = useAuth();
  const location = useLocation();

  // Still loading — show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-600 tracking-tight mb-3">
            Conta<span className="text-brand-800">IQ</span>
          </h1>
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-surface rounded-xl border border-border p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 text-danger flex items-center justify-center mx-auto mb-4">
              <ShieldX size={24} />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Sesión no válida
            </h2>
            <p className="text-sm text-text-muted mb-6">
              Tu sesión ha expirado o no has iniciado sesión. Inicia sesión para continuar.
            </p>
            <a
              href="/login"
              className="inline-block w-full py-2.5 px-4 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!hasOrganization && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasOrganization && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
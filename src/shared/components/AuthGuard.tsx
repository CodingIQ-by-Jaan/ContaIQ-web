import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, hasOrganization } = useAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasOrganization && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
import { Outlet } from 'react-router';
import Sidebar from '@/shared/components/Sidebar';
import { useUiStore } from '@/shared/stores/uiStore';
import { cn } from '@/shared/lib/utils';

const DashboardLayout = () => {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className="min-h-screen bg-surface-alt">
      <Sidebar />
      <main className={cn('transition-all duration-200', sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]')}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

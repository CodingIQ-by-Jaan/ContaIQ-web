import { Outlet } from 'react-router';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

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

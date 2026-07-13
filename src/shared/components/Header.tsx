import { Bell, Menu } from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';

interface HeaderProps { title: string; subtitle?: string; actions?: React.ReactNode; }

const Header = ({ title, subtitle, actions }: HeaderProps) => {
  const { toggleSidebar } = useUiStore();
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-surface-hover text-text-muted lg:hidden"><Menu size={20} /></button>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="p-2 rounded-lg hover:bg-surface-hover text-text-muted transition-colors"><Bell size={18} /></button>
      </div>
    </header>
  );
};

export default Header;

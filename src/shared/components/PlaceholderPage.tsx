import { Construction } from 'lucide-react';
import Header from '@/shared/components/Header';

interface PlaceholderPageProps { title: string; phase: number; }

const PlaceholderPage = ({ title, phase }: PlaceholderPageProps) => (
  <>
    <Header title={title} />
    <div className="p-6">
      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <Construction size={48} className="mx-auto text-text-muted opacity-30 mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Este módulo será implementado en la Fase {phase}. Explora los módulos disponibles desde el menú lateral.
        </p>
      </div>
    </div>
  </>
);

export default PlaceholderPage;

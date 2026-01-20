import { ChevronRight, HardDrive } from 'lucide-react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path ? path.split('/') : [];

  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto">
      <button
        onClick={() => onNavigate('')}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors shrink-0"
      >
        <HardDrive className="h-4 w-4 text-amber-400" />
        <span>data</span>
      </button>

      {parts.map((part, index) => {
        const partPath = parts.slice(0, index + 1).join('/');
        return (
          <div key={partPath} className="flex items-center shrink-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => onNavigate(partPath)}
              className="px-2 py-1 rounded hover:bg-muted transition-colors"
            >
              {part}
            </button>
          </div>
        );
      })}
    </div>
  );
}


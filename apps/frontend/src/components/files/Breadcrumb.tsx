import { ChevronRight, HardDrive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path ? path.split('/') : [];

  // For mobile: show truncated path with tooltip if path is long
  const shouldTruncate = parts.length > 2;

  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1 text-sm overflow-x-auto max-w-full">
      <button
        onClick={() => onNavigate('')}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors shrink-0"
      >
        <HardDrive className="h-4 w-4 text-amber-400" />
        <span className="hidden sm:inline">data</span>
      </button>

      {shouldTruncate && (
        <div className="flex items-center shrink-0">
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground">
                ...
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="break-all max-w-xs">{path}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Show last 2 parts or all parts if not truncated */}
      {parts.slice(shouldTruncate ? -2 : 0).map((part, index) => {
        const actualIndex = shouldTruncate ? parts.length - 2 + index : index;
        const partPath = parts.slice(0, actualIndex + 1).join('/');
        return (
          <div key={partPath} className="flex items-center min-w-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavigate(partPath)}
                  className="px-2 py-1 rounded hover:bg-muted transition-colors max-w-[120px] sm:max-w-[200px] truncate"
                >
                  {part}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="break-all max-w-xs">{part}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );

  return renderBreadcrumb();
}


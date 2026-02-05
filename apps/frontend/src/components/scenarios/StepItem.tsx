import { useNavigate } from 'react-router-dom';
import {
  GripVertical,
  FileText,
  Image,
  Video,
  Music2,
  Type,
  Square,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useText } from '@/hooks/useTexts';
import type { ScenarioStep } from '@/types/scenarios';
import { getStepType, getStepValue } from '@/types/scenarios';
import { cn } from '@/lib/utils';

type StepItemProps = {
  step: ScenarioStep;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
};

export function StepItem({
  step,
  index,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: StepItemProps) {
  const navigate = useNavigate();
  const stepType = getStepType(step);
  const stepValue = getStepValue(step);

  // Extract text ID from textRef for fetching actual text
  const textRef = stepType === 'text' ? (stepValue as string) : null;
  const textId = textRef ? textRef.split('__').pop() || null : null;
  const { data: textDoc } = useText(textId);

  const getStepIcon = () => {
    switch (stepType) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music2 className="h-4 w-4" />;
      case 'heading':
        return <Type className="h-4 w-4" />;
      case 'blank':
        return <Square className="h-4 w-4" />;
    }
  };

  const getStepLabel = () => {
    switch (stepType) {
      case 'text':
        // Use actual text title from API if available, otherwise fallback to slug
        if (textDoc) {
          return textDoc.meta.title;
        }
        // Fallback: Extract title from path like "songs/barka__01HXZ..."
        const parts = (stepValue as string).split('/');
        const filename = parts[parts.length - 1];
        const title = filename.split('__')[0];
        return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
      case 'image':
      case 'video':
      case 'audio':
        return stepValue as string;
      case 'heading':
        return stepValue as string;
      case 'blank':
        return 'Pusty slajd';
    }
  };

  const getStepColor = () => {
    switch (stepType) {
      case 'text':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'image':
        return 'text-purple-400 bg-purple-500/10';
      case 'video':
        return 'text-pink-400 bg-pink-500/10';
      case 'audio':
        return 'text-amber-400 bg-amber-500/10';
      case 'heading':
        return 'text-blue-400 bg-blue-500/10';
      case 'blank':
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50',
        isDragOver && 'border-primary border-dashed bg-primary/5',
        !isDragging && !isDragOver && 'bg-card hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <span className="text-sm text-muted-foreground font-mono w-6">{index + 1}</span>

      <div className={cn('w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0', getStepColor())}>
        {getStepIcon()}
      </div>

      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          // Handle navigation based on step type
          if (stepType === 'text' && textId) {
            navigate(`/songs?id=${textId}`);
          } else if (stepType === 'image' || stepType === 'video' || stepType === 'audio') {
            const path = stepValue as string;
            navigate(`/media?path=${encodeURIComponent(path)}`);
          }
        }}
      >
        <p className="font-medium truncate hover:underline">{getStepLabel()}</p>
        <p className="text-xs text-muted-foreground capitalize">{stepType}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}



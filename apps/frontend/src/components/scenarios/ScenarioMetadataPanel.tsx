import { ChevronDown, ChevronUp, Tags } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ScenarioDoc } from '@/types/scenarios';

type ScenarioMetadataPanelProps = {
  scenario: ScenarioDoc;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  hasChanges: boolean;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
};

export function ScenarioMetadataPanel({
  scenario,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  hasChanges,
  isMobile = false,
  isOpen = true,
  onToggle,
}: ScenarioMetadataPanelProps) {
  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tytuł</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Tytuł scenariusza"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Opis</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Opcjonalny opis"
          rows={3}
        />
      </div>
      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-medium mb-2">Informacje</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>ID:</div>
          <div className="font-mono text-xs truncate">{scenario.meta.id}</div>
        </div>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <div className="border-b">
        <button
          onClick={onToggle}
          className="w-full p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Metadane</span>
            {hasChanges && (
              <span className="text-xs text-amber-500">• zmiany</span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isOpen && (
          <div className="p-4 bg-muted/10">
            {content}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="w-80 flex flex-col bg-muted/20">
      <div className="p-3 border-b bg-muted/30">
        <span className="text-sm font-medium">Metadane</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {content}
        </div>
      </ScrollArea>
    </div>
  );
}



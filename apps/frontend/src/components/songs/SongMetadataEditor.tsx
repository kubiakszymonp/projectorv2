import { Plus, X, ChevronDown, ChevronUp, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EditedMeta } from '@/types/songCatalog';

interface SongMetadataEditorProps {
  editedMeta: EditedMeta;
  onMetaChange: (meta: EditedMeta) => void;
  domains: string[] | undefined;
  newCategory: string;
  onNewCategoryChange: (value: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
  allCategories: string[];
  songId: string | undefined;
  slidesCount: number | undefined;
}

export function SongMetadataEditor({
  editedMeta,
  onMetaChange,
  domains,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
  onRemoveCategory,
  onSelectCategory,
  allCategories,
  songId,
  slidesCount,
}: SongMetadataEditorProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl">
        <MetadataContent
          editedMeta={editedMeta}
          onMetaChange={onMetaChange}
          domains={domains}
          newCategory={newCategory}
          onNewCategoryChange={onNewCategoryChange}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
          onSelectCategory={onSelectCategory}
          allCategories={allCategories}
          songId={songId}
          slidesCount={slidesCount}
        />
      </div>
    </ScrollArea>
  );
}

interface MobileMetadataAccordionProps {
  editedMeta: EditedMeta;
  onMetaChange: (meta: EditedMeta) => void;
  domains: string[] | undefined;
  newCategory: string;
  onNewCategoryChange: (value: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
  allCategories: string[];
  songId: string | undefined;
  slidesCount: number | undefined;
  isOpen: boolean;
  onToggle: () => void;
  hasChanges: boolean;
}

export function MobileMetadataAccordion({
  editedMeta,
  onMetaChange,
  domains,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
  onRemoveCategory,
  onSelectCategory,
  allCategories,
  songId,
  slidesCount,
  isOpen,
  onToggle,
  hasChanges,
}: MobileMetadataAccordionProps) {
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
          <MetadataContent
            editedMeta={editedMeta}
            onMetaChange={onMetaChange}
            domains={domains}
            newCategory={newCategory}
            onNewCategoryChange={onNewCategoryChange}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
            onSelectCategory={onSelectCategory}
            allCategories={allCategories}
            songId={songId}
            slidesCount={slidesCount}
          />
        </div>
      )}
    </div>
  );
}

interface MetadataContentProps {
  editedMeta: EditedMeta;
  onMetaChange: (meta: EditedMeta) => void;
  domains: string[] | undefined;
  newCategory: string;
  onNewCategoryChange: (value: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
  allCategories: string[];
  songId: string | undefined;
  slidesCount: number | undefined;
}

function MetadataContent({
  editedMeta,
  onMetaChange,
  domains,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
  onRemoveCategory,
  onSelectCategory,
  allCategories,
  songId,
  slidesCount,
}: MetadataContentProps) {
  const suggestions = newCategory.trim()
    ? allCategories.filter(
        (c) =>
          c.toLowerCase().includes(newCategory.toLowerCase()) &&
          !editedMeta.categories.includes(c)
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tytuł</label>
        <Input
          value={editedMeta.title}
          onChange={(e) => onMetaChange({ ...editedMeta, title: e.target.value })}
          placeholder="Tytuł pieśni"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Opis</label>
        <Textarea
          value={editedMeta.description}
          onChange={(e) => onMetaChange({ ...editedMeta, description: e.target.value })}
          placeholder="Krótki opis pieśni (opcjonalnie)"
          rows={3}
        />
      </div>

      {/* Domain */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Domena</label>
        <div className="relative">
          <select
            value={editedMeta.domain}
            onChange={(e) => onMetaChange({ ...editedMeta, domain: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer capitalize"
          >
            {domains?.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Kategorie</label>

        {/* Current categories */}
        {editedMeta.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {editedMeta.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => onRemoveCategory(cat)}
                  className="hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add category */}
        <div className="relative">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => onNewCategoryChange(e.target.value)}
              placeholder="Dodaj kategorię..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddCategory();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAddCategory}
              disabled={!newCategory.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Category suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-32 overflow-auto">
              {suggestions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors"
                  onClick={() => onSelectCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Wpisz kategorię i naciśnij Enter lub kliknij +
        </p>
      </div>

      {/* Info */}
      <Card className="p-4 bg-muted/30">
        <h4 className="text-sm font-medium mb-2">Informacje</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>ID:</div>
          <div className="font-mono text-xs truncate">{songId}</div>
          <div>Slajdów:</div>
          <div>{slidesCount}</div>
        </div>
      </Card>
    </div>
  );
}



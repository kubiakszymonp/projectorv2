import { Save, X, ListPlus, Loader2, FileText, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongContentEditor } from './SongContentEditor';
import { SongMetadataEditor, MobileMetadataAccordion } from './SongMetadataEditor';
import type { TextDoc } from '@/types/texts';
import type { EditorTab, MobileContentTab, EditedMeta } from '@/types/songCatalog';
import { cn } from '@/lib/utils';

interface SongEditorProps {
  song: TextDoc;
  editedMeta: EditedMeta;
  onMetaChange: (meta: EditedMeta) => void;
  editContent: string;
  onContentChange: (value: string) => void;
  editorTab: EditorTab;
  onEditorTabChange: (tab: EditorTab) => void;
  previewSlide: number | null;
  onPreviewSlideChange: (index: number | null) => void;
  domains: string[] | undefined;
  newCategory: string;
  onNewCategoryChange: (value: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
  allCategories: string[];
  hasChanges: boolean;
  hasMetaChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
  onAddToScenario: () => void;
  isMobile: boolean;
  isMetadataOpen: boolean;
  onMetadataToggle: () => void;
  mobileContentTab: MobileContentTab;
  onMobileContentTabChange: (tab: MobileContentTab) => void;
}

export function SongEditor({
  song,
  editedMeta,
  onMetaChange,
  editContent,
  onContentChange,
  editorTab,
  onEditorTabChange,
  previewSlide,
  onPreviewSlideChange,
  domains,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
  onRemoveCategory,
  onSelectCategory,
  allCategories,
  hasChanges,
  hasMetaChanges,
  isSaving,
  onSave,
  onBack,
  onAddToScenario,
  isMobile,
  isMetadataOpen,
  onMetadataToggle,
  mobileContentTab,
  onMobileContentTabChange,
}: SongEditorProps) {
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header */}
        <MobileEditorHeader
          title={song.meta.title}
          domain={song.meta.domain}
          hasChanges={hasChanges}
          isSaving={isSaving}
          onSave={onSave}
          onBack={onBack}
          onAddToScenario={onAddToScenario}
        />

        {/* Mobile Metadata Accordion */}
        <MobileMetadataAccordion
          editedMeta={editedMeta}
          onMetaChange={onMetaChange}
          domains={domains}
          newCategory={newCategory}
          onNewCategoryChange={onNewCategoryChange}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
          onSelectCategory={onSelectCategory}
          allCategories={allCategories}
          songId={song.meta.id}
          slidesCount={song.slides.length}
          isOpen={isMetadataOpen}
          onToggle={onMetadataToggle}
          hasChanges={hasMetaChanges}
        />

        {/* Mobile Content (text/preview tabs) */}
        <SongContentEditor
          content={editContent}
          onContentChange={onContentChange}
          previewSlide={previewSlide}
          onPreviewSlideChange={onPreviewSlideChange}
          isMobile={true}
          mobileContentTab={mobileContentTab}
          onMobileContentTabChange={onMobileContentTabChange}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Desktop Header */}
      <DesktopEditorHeader
        title={song.meta.title}
        domain={song.meta.domain}
        editorTab={editorTab}
        onEditorTabChange={onEditorTabChange}
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={onSave}
        onBack={onBack}
        onAddToScenario={onAddToScenario}
      />

      {/* Editor content */}
      {editorTab === 'content' ? (
        <SongContentEditor
          content={editContent}
          onContentChange={onContentChange}
          previewSlide={previewSlide}
          onPreviewSlideChange={onPreviewSlideChange}
          isMobile={false}
          mobileContentTab={mobileContentTab}
          onMobileContentTabChange={onMobileContentTabChange}
        />
      ) : (
        <SongMetadataEditor
          editedMeta={editedMeta}
          onMetaChange={onMetaChange}
          domains={domains}
          newCategory={newCategory}
          onNewCategoryChange={onNewCategoryChange}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
          onSelectCategory={onSelectCategory}
          allCategories={allCategories}
          songId={song.meta.id}
          slidesCount={song.slides.length}
        />
      )}
    </div>
  );
}

interface MobileEditorHeaderProps {
  title: string;
  domain: string;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
  onAddToScenario: () => void;
}

function MobileEditorHeader({
  title,
  domain,
  hasChanges,
  isSaving,
  onSave,
  onBack,
  onAddToScenario,
}: MobileEditorHeaderProps) {
  return (
    <div className="p-3 border-b flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-base font-bold truncate">{title}</h1>
          <p className="text-xs text-muted-foreground capitalize">{domain}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onAddToScenario}
        >
          <ListPlus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          className="h-8"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface DesktopEditorHeaderProps {
  title: string;
  domain: string;
  editorTab: EditorTab;
  onEditorTabChange: (tab: EditorTab) => void;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
  onAddToScenario: () => void;
}

function DesktopEditorHeader({
  title,
  domain,
  editorTab,
  onEditorTabChange,
  hasChanges,
  isSaving,
  onSave,
  onBack,
  onAddToScenario,
}: DesktopEditorHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{title}</h1>
          <p className="text-sm text-muted-foreground capitalize">{domain}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EditorTabs activeTab={editorTab} onTabChange={onEditorTabChange} />
        <div className="w-px h-6 bg-border mx-2" />
        <Button variant="outline" size="sm" onClick={onAddToScenario}>
          <ListPlus className="h-4 w-4 mr-2" />
          Do scenariusza
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Zapisz
        </Button>
      </div>
    </div>
  );
}

interface EditorTabsProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
}

function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => onTabChange('content')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeTab === 'content'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="h-4 w-4" />
        Treść
      </button>
      <button
        onClick={() => onTabChange('metadata')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeTab === 'metadata'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Tags className="h-4 w-4" />
        Metadane
      </button>
    </div>
  );
}


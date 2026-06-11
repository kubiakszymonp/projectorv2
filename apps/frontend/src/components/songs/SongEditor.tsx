import { Save, X, ListPlus, FileText, Tags, Monitor, FolderOpen, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ActionBar, type Action } from '@/components/ui/action-bar';
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
  onDuplicate: () => void;
  onProjectToScreen: () => void;
  isProjecting?: boolean;
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
  onDuplicate,
  onProjectToScreen,
  isProjecting,
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
          onDuplicate={onDuplicate}
          onProjectToScreen={onProjectToScreen}
          isProjecting={isProjecting}
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

        {/* Mobile Footer with file link */}
        <div className="border-t p-3 bg-muted/20">
          <Link
            to={`/files?path=${encodeURIComponent(song.filePath)}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Otwórz w edytorze plików</span>
          </Link>
        </div>
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
        onDuplicate={onDuplicate}
        onProjectToScreen={onProjectToScreen}
        isProjecting={isProjecting}
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

      {/* Desktop Footer with file link */}
      <div className="border-t p-3 bg-muted/20">
        <Link
          to={`/files?path=${encodeURIComponent(song.filePath)}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          <span>Otwórz w edytorze plików</span>
        </Link>
      </div>
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
  onDuplicate: () => void;
  onProjectToScreen: () => void;
  isProjecting?: boolean;
}

function editorActions({
  hasChanges,
  isSaving,
  onSave,
  onAddToScenario,
  onDuplicate,
  onProjectToScreen,
  isProjecting,
}: Omit<MobileEditorHeaderProps, 'title' | 'domain' | 'onBack'>): Action[] {
  // Z2: widoczne Zapisz + Rzutuj; Do scenariusza i Duplikuj → menu ⋯
  return [
    {
      key: 'save',
      label: 'Zapisz',
      icon: Save,
      onClick: onSave,
      variant: 'default',
      disabled: isSaving || !hasChanges,
      loading: isSaving,
      alwaysLabel: true,
    },
    {
      key: 'project',
      label: 'Rzutuj',
      icon: Monitor,
      onClick: onProjectToScreen,
      variant: isProjecting ? 'default' : 'outline',
    },
    {
      key: 'scenario',
      label: 'Do scenariusza',
      icon: ListPlus,
      onClick: onAddToScenario,
      variant: 'outline',
    },
    {
      key: 'duplicate',
      label: 'Duplikuj',
      icon: Copy,
      onClick: onDuplicate,
      variant: 'outline',
    },
  ];
}

function MobileEditorHeader({
  title,
  domain,
  hasChanges,
  isSaving,
  onSave,
  onBack,
  onAddToScenario,
  onDuplicate,
  onProjectToScreen,
  isProjecting,
}: MobileEditorHeaderProps) {
  return (
    <div className="p-3 border-b flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onBack}
          title="Zamknij"
          aria-label="Zamknij"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">{title}</h1>
          <p className="text-xs text-muted-foreground capitalize">{domain}</p>
        </div>
      </div>
      <ActionBar
        actions={editorActions({
          hasChanges,
          isSaving,
          onSave,
          onAddToScenario,
          onDuplicate,
          onProjectToScreen,
          isProjecting,
        })}
      />
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
  onDuplicate: () => void;
  onProjectToScreen: () => void;
  isProjecting?: boolean;
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
  onDuplicate,
  onProjectToScreen,
  isProjecting,
}: DesktopEditorHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          title="Zamknij"
          aria-label="Zamknij"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          <p className="text-sm text-muted-foreground capitalize">{domain}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EditorTabs activeTab={editorTab} onTabChange={onEditorTabChange} />
        <div className="w-px h-6 bg-border mx-2" />
        <ActionBar
          actions={editorActions({
            hasChanges,
            isSaving,
            onSave,
            onAddToScenario,
            onDuplicate,
            onProjectToScreen,
            isProjecting,
          })}
        />
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


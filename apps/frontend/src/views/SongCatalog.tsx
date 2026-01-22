import { useIsMobile } from '@/hooks/useIsMobile';
import { useSongEditor } from '@/hooks/useSongEditor';
import { SongList, SongEditor, CreateSongDialog } from '@/components/songs';
import { AddToScenarioModal } from '@/components/scenarios/AddToScenarioModal';
import { createTextReference } from '@/utils/textReference';

export function SongCatalog() {
  const isMobile = useIsMobile();
  const editor = useSongEditor();

  return (
    <div className="h-screen flex flex-col bg-background">
      {editor.viewMode === 'list' ? (
        <SongList
          search={editor.search}
          onSearchChange={editor.setSearch}
          selectedDomain={editor.selectedDomain}
          onDomainChange={editor.setSelectedDomain}
          domains={editor.domains}
          songs={editor.filteredSongs}
          isLoading={editor.isLoadingSongs}
          onSelectSong={editor.handleSelectSong}
          onCreateNew={() => editor.setIsCreateDialogOpen(true)}
        />
      ) : editor.selectedSong && editor.editedMeta ? (
        <SongEditor
          song={editor.selectedSong}
          editedMeta={editor.editedMeta}
          onMetaChange={editor.setEditedMeta}
          editContent={editor.editContent}
          onContentChange={editor.setEditContent}
          editorTab={editor.editorTab}
          onEditorTabChange={editor.setEditorTab}
          previewSlide={editor.previewSlide}
          onPreviewSlideChange={editor.setPreviewSlide}
          domains={editor.domains}
          newCategory={editor.newCategory}
          onNewCategoryChange={editor.setNewCategory}
          onAddCategory={editor.handleAddCategory}
          onRemoveCategory={editor.handleRemoveCategory}
          onSelectCategory={editor.handleSelectCategory}
          allCategories={editor.allCategories}
          hasChanges={editor.hasChanges}
          hasMetaChanges={editor.hasMetaChanges}
          isSaving={editor.updateText.isPending}
          onSave={editor.handleSave}
          onBack={editor.handleBack}
          onAddToScenario={() => editor.setIsAddToScenarioOpen(true)}
          isMobile={isMobile}
          isMetadataOpen={editor.isMetadataOpen}
          onMetadataToggle={() => editor.setIsMetadataOpen(!editor.isMetadataOpen)}
          mobileContentTab={editor.mobileContentTab}
          onMobileContentTabChange={editor.setMobileContentTab}
        />
      ) : null}

      {/* Create dialog */}
      <CreateSongDialog
        open={editor.isCreateDialogOpen}
        onOpenChange={editor.setIsCreateDialogOpen}
        data={editor.newSongData}
        onDataChange={editor.setNewSongData}
        domains={editor.domains}
        onSubmit={editor.handleCreateSong}
        isPending={editor.createText.isPending}
      />

      {/* Add to scenario modal */}
      <AddToScenarioModal
        open={editor.isAddToScenarioOpen}
        onClose={() => editor.setIsAddToScenarioOpen(false)}
        step={editor.selectedSong ? { text: createTextReference(editor.selectedSong) } : null}
        itemTitle={editor.selectedSong?.meta.title}
      />
    </div>
  );
}

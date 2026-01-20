import { useState, useEffect } from 'react';
import { Save, Loader2, FileCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFileContent } from '@/hooks/useFiles';
import { getFileUrl } from '@/api/files';

interface TextEditorModalProps {
  open: boolean;
  filePath: string;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

export function TextEditorModal({
  open,
  filePath,
  onClose,
  onSave,
}: TextEditorModalProps) {
  const { data: originalContent, isLoading } = useFileContent(open ? filePath : null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fileName = filePath.split('/').pop() ?? filePath;

  useEffect(() => {
    if (originalContent !== undefined) {
      setContent(originalContent);
      setHasChanges(false);
    }
  }, [originalContent]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setContent('');
      setHasChanges(false);
    }
  }, [open]);

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== originalContent);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (!confirm('Masz niezapisane zmiany. Czy na pewno chcesz zamknąć?')) {
        return;
      }
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-cyan-400" />
              <span>{fileName}</span>
              {hasChanges && (
                <span className="text-xs text-amber-400 font-normal">
                  • niezapisane zmiany
                </span>
              )}
            </DialogTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="ml-1">Zapisz</span>
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 resize-none font-mono text-sm min-h-0"
            placeholder="Zawartość pliku..."
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FilePreviewModalProps {
  open: boolean;
  filePath: string;
  fileKind: string;
  onClose: () => void;
}

export function FilePreviewModal({
  open,
  filePath,
  fileKind,
  onClose,
}: FilePreviewModalProps) {
  const fileName = filePath.split('/').pop() ?? filePath;
  const fileUrl = getFileUrl(filePath);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center p-4 overflow-auto max-h-[60vh]">
          {fileKind === 'image' && (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          )}
          {fileKind === 'video' && (
            <video src={fileUrl} controls className="max-w-full max-h-full" />
          )}
          {fileKind === 'audio' && <audio src={fileUrl} controls />}
          {!['image', 'video', 'audio'].includes(fileKind) && (
            <div className="text-muted-foreground text-center">
              <p>Podgląd niedostępny dla tego typu pliku</p>
              <a
                href={fileUrl}
                download
                className="text-primary hover:underline mt-2 inline-block"
              >
                Pobierz plik
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

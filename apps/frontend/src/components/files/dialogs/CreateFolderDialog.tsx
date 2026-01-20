import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateFolderDialogProps {
  open: boolean;
  parentPath: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export function CreateFolderDialog({
  open,
  parentPath,
  onClose,
  onConfirm,
  isLoading,
}: CreateFolderDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nowy folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Tworzenie w: <code className="text-foreground">{parentPath || 'data/'}</code>
            </p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa folderu"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Tworzenie...' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


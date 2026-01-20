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

interface RenameDialogProps {
  open: boolean;
  currentName: string;
  isFolder: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  isLoading?: boolean;
}

export function RenameDialog({
  open,
  currentName,
  isFolder,
  onClose,
  onConfirm,
  isLoading,
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== currentName) {
      onConfirm(name.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Zmień nazwę {isFolder ? 'folderu' : 'pliku'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nowa nazwa"
            autoFocus
          />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || name === currentName || isLoading}
            >
              {isLoading ? 'Zapisywanie...' : 'Zmień nazwę'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


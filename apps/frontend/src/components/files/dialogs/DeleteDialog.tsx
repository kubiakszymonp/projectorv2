import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
  open: boolean;
  name: string;
  isFolder: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteDialog({
  open,
  name,
  isFolder,
  onClose,
  onConfirm,
  isLoading,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Usuń {isFolder ? 'folder' : 'plik'}
          </DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć{' '}
            <strong className="text-foreground">{name}</strong>?
            {isFolder && ' Folder wraz z zawartością zostanie przeniesiony do kosza.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


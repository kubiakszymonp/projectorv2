import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type { ScenarioDoc } from '@/types/scenarios';

type CreateScenarioDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onCreate: () => void;
  isPending: boolean;
};

export function CreateScenarioDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onCreate,
  isPending,
}: CreateScenarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nowy scenariusz</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tytuł</label>
            <Input
              placeholder="np. Niedziela 11:00"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            onClick={onCreate}
            disabled={!title.trim() || isPending}
          >
            {isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Utwórz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeleteScenarioDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: ScenarioDoc | null;
  onDelete: () => void;
  isPending: boolean;
};

export function DeleteScenarioDialog({
  open,
  onOpenChange,
  scenario,
  onDelete,
  isPending,
}: DeleteScenarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usuń scenariusz</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć scenariusz "{scenario?.meta.title}"?
            Ta operacja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Usuń
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


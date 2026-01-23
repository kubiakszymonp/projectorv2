import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { NewSongData } from '@/types/songCatalog';

interface CreateSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NewSongData;
  onDataChange: (data: NewSongData) => void;
  domains: string[] | undefined;
  onSubmit: () => void;
  isPending: boolean;
}

export function CreateSongDialog({
  open,
  onOpenChange,
  data,
  onDataChange,
  domains,
  onSubmit,
  isPending,
}: CreateSongDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nowa pieśń</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tytuł</label>
            <Input
              placeholder="Wpisz tytuł pieśni..."
              value={data.title}
              onChange={(e) => onDataChange({ ...data, title: e.target.value })}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Domena</label>
            <Select
              value={data.domain}
              onChange={(e) => onDataChange({ ...data, domain: e.target.value })}
            >
              {domains?.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
              {(!domains || domains.length === 0) && (
                <option value="songs">songs</option>
              )}
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!data.title.trim() || isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Utwórz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



import { useRef, useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { downloadBackup, importBackup } from '@/api/backup';

export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // pozwól wybrać ten sam plik ponownie
    if (!file) return;

    if (
      !window.confirm(
        'Przywrócenie kopii nadpisze obecne dane (pieśni, scenariusze, ustawienia). Kontynuować?',
      )
    ) {
      return;
    }

    setIsImporting(true);
    setMessage(null);
    try {
      await importBackup(file);
      // Odśwież wszystkie dane po imporcie
      await queryClient.invalidateQueries();
      setMessage('Kopia przywrócona. Zalecany restart serwera.');
    } catch {
      setMessage('Błąd przywracania kopii.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 mt-4 border-t border-border/50">
      <p className="text-sm font-medium">Kopia zapasowa</p>
      <p className="text-xs text-muted-foreground">
        Pobierz całość treści (pieśni, scenariusze, ustawienia, media) do pliku
        ZIP lub przywróć z wcześniejszej kopii.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => downloadBackup()}>
          <Download className="h-4 w-4 mr-2" />
          Pobierz kopię zapasową
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImportClick}
          disabled={isImporting}
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Przywróć z kopii
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}

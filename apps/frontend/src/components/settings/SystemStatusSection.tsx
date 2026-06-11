import { Activity, HardDrive, Clock, FileText } from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${mb.toFixed(0)} MB`;
}

export function SystemStatusSection() {
  const { data: health, isLoading, isError } = useHealth();

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <Activity className="h-4 w-4" />
        Brak połączenia z serwerem
      </div>
    );
  }

  const diskUsedPct =
    health?.diskTotalBytes && health.diskFreeBytes != null
      ? Math.round(
          ((health.diskTotalBytes - health.diskFreeBytes) /
            health.diskTotalBytes) *
            100,
        )
      : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Activity
          className={
            health?.status === 'ok'
              ? 'h-4 w-4 text-emerald-400'
              : 'h-4 w-4 text-muted-foreground'
          }
        />
        <span className="text-muted-foreground">Status:</span>
        <span className="font-medium">
          {isLoading ? '…' : health?.status === 'ok' ? 'OK' : '—'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Uptime:</span>
        <span className="font-medium">
          {health ? formatUptime(health.uptimeSeconds) : '…'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Teksty:</span>
        <span className="font-medium">{health ? health.texts : '…'}</span>
      </div>

      {health?.diskFreeBytes != null && (
        <div className="flex items-center gap-2 col-span-2 sm:col-span-3">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Dysk:</span>
          <span className="font-medium">
            {formatBytes(health.diskFreeBytes)} wolne
            {health.diskTotalBytes
              ? ` z ${formatBytes(health.diskTotalBytes)}`
              : ''}
            {diskUsedPct != null ? ` (${diskUsedPct}% zajęte)` : ''}
          </span>
        </div>
      )}
    </div>
  );
}

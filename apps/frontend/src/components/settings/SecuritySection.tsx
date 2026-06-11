import { useState } from 'react';
import { Lock, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus, useSetPin, useLogout } from '@/hooks/useAuth';

export function SecuritySection() {
  const { data: status } = useAuthStatus();
  const setPin = useSetPin();
  const logout = useLogout();
  const [pin, setPin1] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const authEnabled = status?.authRequired ?? false;

  const handleSave = async () => {
    setMessage(null);
    try {
      await setPin.mutateAsync(pin);
      setPin1('');
      setMessage(pin ? 'PIN zapisany.' : 'Autoryzacja wyłączona.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Błąd zapisu PIN.');
    }
  };

  return (
    <div className="space-y-3 pt-4 mt-4 border-t border-border/50">
      <p className="text-sm font-medium flex items-center gap-2">
        <Lock className="h-4 w-4 text-muted-foreground" />
        Zabezpieczenie panelu (PIN)
      </p>
      <p className="text-xs text-muted-foreground">
        {authEnabled
          ? 'Panel jest chroniony PIN-em. Ekran wyświetlania działa bez logowania.'
          : 'Panel jest otwarty. Ustaw PIN, aby ograniczyć dostęp do sterowania i plików.'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin1(e.target.value)}
          placeholder={authEnabled ? 'Nowy PIN (puste = wyłącz)' : 'Ustaw PIN (min. 4 cyfry)'}
          className="px-3 py-2 rounded-md bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={setPin.isPending}
        >
          {setPin.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : authEnabled ? (
            'Zmień PIN'
          ) : (
            'Ustaw PIN'
          )}
        </Button>
        {authEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Wyloguj
          </Button>
        )}
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}

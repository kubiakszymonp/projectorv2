import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStatus, useLogin } from '@/hooks/useAuth';

/**
 * Gates the control panel behind a PIN when one is configured.
 * The public display route (/display) always bypasses the gate.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: status, isLoading } = useAuthStatus();

  // Public screen must never be blocked
  if (location.pathname === '/display') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status?.authRequired && !status.authenticated) {
    return <PinLogin />;
  }

  return <>{children}</>;
}

function PinLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      await login.mutateAsync(pin);
    } catch {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-orange-400" />
          </div>
          <h1 className="text-lg font-semibold">Panel zabezpieczony</h1>
          <p className="text-sm text-muted-foreground">
            Podaj PIN, aby uzyskać dostęp do sterowania.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full px-3 py-2 rounded-md bg-muted/40 border border-border text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {error && (
            <p className="text-sm text-destructive text-center">
              Nieprawidłowy PIN
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={login.isPending || pin.length === 0}
          >
            {login.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Zaloguj'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

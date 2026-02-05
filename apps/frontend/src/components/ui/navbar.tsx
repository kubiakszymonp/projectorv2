import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navbar on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex items-center h-14 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0"
          aria-label="Powrót do strony głównej"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}







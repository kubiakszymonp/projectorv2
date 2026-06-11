import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
  // Surface mutation failures to the operator instead of swallowing them
  mutationCache: new MutationCache({
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Wystąpił błąd';
      toast.error(message);
    },
  }),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" richColors theme="dark" />
    </QueryClientProvider>
  </StrictMode>
);

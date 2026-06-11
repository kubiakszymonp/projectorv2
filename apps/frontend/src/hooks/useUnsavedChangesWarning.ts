import { useEffect } from 'react';

/**
 * Warns (native beforeunload dialog) when the user tries to close/reload the
 * tab while there are unsaved changes.
 */
export function useUnsavedChangesWarning(hasChanges: boolean) {
  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);
}

/**
 * Returns a guarded version of an action that asks for confirmation when there
 * are unsaved changes.
 */
export function confirmIfUnsaved(hasChanges: boolean): boolean {
  if (!hasChanges) return true;
  return window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz wyjść?');
}

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  onQuickBook?: () => void;
  onNewReservation?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onSelectAll?: () => void;
}

/**
 * Global keyboard shortcuts hook for reservations page
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    onQuickBook,
    onNewReservation,
    onSearch,
    onRefresh,
    onExport,
    onSelectAll,
  } = options;

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'q',
      ctrl: true,
      description: 'Quick Book (Express Modal)',
      action: () => {
        if (onQuickBook) {
          onQuickBook();
        }
      },
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New Reservation (Full Wizard)',
      action: () => {
        if (onNewReservation) {
          onNewReservation();
        } else {
          navigate('/reservations/new');
        }
      },
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Focus Search',
      action: () => {
        if (onSearch) {
          onSearch();
        } else {
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[placeholder*="Search"]'
          );
          searchInput?.focus();
        }
      },
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh Data',
      action: () => {
        if (onRefresh) {
          onRefresh();
          toast({
            title: 'Refreshing',
            description: 'Data is being refreshed',
          });
        }
      },
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Export Data',
      action: () => {
        if (onExport) {
          onExport();
        }
      },
    },
    {
      key: 'a',
      ctrl: true,
      description: 'Select All',
      action: () => {
        if (onSelectAll) {
          onSelectAll();
        }
      },
    },
    {
      key: '?',
      shift: true,
      description: 'Show Keyboard Shortcuts',
      action: () => {
        const shortcutsList = shortcuts
          .map((s) => `${s.description}: ${s.ctrl ? 'Ctrl+' : ''}${s.shift ? 'Shift+' : ''}${s.alt ? 'Alt+' : ''}${s.key.toUpperCase()}`)
          .join('\n');
        
        toast({
          title: 'Keyboard Shortcuts',
          description: shortcutsList,
        });
      },
    },
  ];

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow Ctrl+K even when typing (common search shortcut)
      if (isTyping && !(event.ctrlKey && event.key === 'k')) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    shortcuts,
  };
}

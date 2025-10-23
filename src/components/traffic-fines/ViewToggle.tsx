import React from 'react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  currentView: 'integration' | 'contract';
  onViewChange: (view: 'integration' | 'contract') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
      <Button
        variant={currentView === 'integration' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('integration')}
      >
        Integration View
      </Button>
      <Button
        variant={currentView === 'contract' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('contract')}
      >
        Contract View
      </Button>
    </div>
  );
}

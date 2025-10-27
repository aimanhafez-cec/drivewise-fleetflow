import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseWizardKeyboardShortcutsOptions {
  handleNext: () => void;
  handlePrevious: () => void;
  canProceed: () => boolean;
  currentStep: number;
  isLoading?: boolean;
  onSubmit?: () => void;
}

export function useWizardKeyboardShortcuts(options: UseWizardKeyboardShortcutsOptions) {
  const { toast } = useToast();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if modifier keys are pressed (except for ESC)
    if (event.key !== 'Escape' && (event.ctrlKey || event.metaKey || event.altKey)) {
      return;
    }

    const target = event.target as HTMLElement;
    const isInInput = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable;

    // ENTER: Advance step (but not in inputs)
    if (event.key === 'Enter' && !isInInput) {
      event.preventDefault();
      
      if (options.isLoading) return;
      
      // Final step - submit reservation
      if (options.currentStep === 14 && options.onSubmit) {
        options.onSubmit();
        return;
      }
      
      // Check if can proceed
      if (options.canProceed()) {
        options.handleNext();
        toast({
          title: 'Step Advanced',
          description: `Moving to step ${options.currentStep + 1}`,
        });
      } else {
        toast({
          title: 'Cannot Proceed',
          description: 'Please complete all required fields',
          variant: 'destructive',
        });
      }
    }

    // ESC: Go back (works everywhere, even in inputs)
    if (event.key === 'Escape') {
      if (options.currentStep > 1) {
        event.preventDefault();
        options.handlePrevious();
        toast({
          title: 'Step Back',
          description: `Returning to step ${options.currentStep - 1}`,
        });
      }
    }
  }, [options, toast]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

import { useState, useEffect, useCallback } from 'react';
import type { EnhancedWizardData, WizardProgress, StepStatus } from '@/types/agreement-wizard';

interface UseWizardProgressProps {
  storageKey: string;
  initialData: EnhancedWizardData;
  totalSteps: number;
}

export const useWizardProgress = ({
  storageKey,
  initialData,
  totalSteps,
}: UseWizardProgressProps) => {
  const [wizardData, setWizardData] = useState<EnhancedWizardData>(initialData);
  const [progress, setProgress] = useState<WizardProgress>({
    currentStep: 0,
    completedSteps: [],
    canProceed: false,
    lastSaved: undefined,
    stepValidationStatus: {},
    visitedSteps: [],
  });

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.wizardData && parsed.progress) {
            setWizardData(parsed.wizardData);
            // Ensure visitedSteps exists for backward compatibility
            setProgress({
              ...parsed.progress,
              visitedSteps: parsed.progress.visitedSteps || [],
              completedSteps: parsed.progress.completedSteps || [],
              stepValidationStatus: parsed.progress.stepValidationStatus || {},
            });
            console.log('[useWizardProgress] Loaded saved progress:', parsed);
          }
        }
      } catch (error) {
        console.warn('[useWizardProgress] Failed to load saved progress:', error);
      }
    };

    loadSavedProgress();
  }, [storageKey]);

  // Save progress whenever data changes
  useEffect(() => {
    const saveProgress = () => {
      try {
        const dataToSave = {
          wizardData,
          progress: {
            ...progress,
            lastSaved: new Date().toISOString(),
          },
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        console.log('[useWizardProgress] Progress saved');
      } catch (error) {
        console.error('[useWizardProgress] Failed to save progress:', error);
      }
    };

    // Debounce saves
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [wizardData, progress, storageKey]);

  const updateWizardData = useCallback(<K extends keyof EnhancedWizardData>(
    step: K,
    data: Partial<EnhancedWizardData[K]>
  ) => {
    setWizardData(prev => ({
      ...prev,
      [step]: { ...(prev[step] as any), ...(data as any) },
    }));
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const markStepComplete = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])],
    }));
  }, []);

  const setCanProceed = useCallback((canProceed: boolean) => {
    setProgress(prev => ({
      ...prev,
      canProceed,
    }));
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setWizardData(initialData);
      setProgress({
        currentStep: 0,
        completedSteps: [],
        canProceed: false,
        lastSaved: undefined,
        stepValidationStatus: {},
        visitedSteps: [],
      });
      console.log('[useWizardProgress] Progress cleared');
    } catch (error) {
      console.error('[useWizardProgress] Failed to clear progress:', error);
    }
  }, [storageKey, initialData]);

  const getProgressPercentage = useCallback(() => {
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  }, [progress.completedSteps, totalSteps]);

  const canNavigateToStep = useCallback((step: number) => {
    // Can always go back to completed steps
    if (progress.completedSteps.includes(step)) {
      return true;
    }
    // Can go to next step if current step is completed
    if (step === progress.currentStep + 1 && progress.canProceed) {
      return true;
    }
    // Can always go to current step
    if (step === progress.currentStep) {
      return true;
    }
    return false;
  }, [progress]);

  const markStepIncomplete = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: (prev.completedSteps || []).filter(s => s !== step),
      visitedSteps: [...new Set([...(prev.visitedSteps || []), step])],
    }));
  }, []);

  const updateStepStatus = useCallback((step: number, status: StepStatus) => {
    setProgress(prev => ({
      ...prev,
      stepValidationStatus: {
        ...prev.stepValidationStatus,
        [step]: status,
      },
      visitedSteps: [...new Set([...(prev.visitedSteps || []), step])],
    }));
  }, []);

  const getStepStatus = useCallback((step: number): StepStatus => {
    if (progress.completedSteps.includes(step)) {
      return 'complete';
    }
    if (progress.stepValidationStatus[step]) {
      return progress.stepValidationStatus[step];
    }
    if ((progress.visitedSteps || []).includes(step)) {
      return 'incomplete';
    }
    return 'not-visited';
  }, [progress]);

  return {
    wizardData,
    progress,
    updateWizardData,
    setCurrentStep,
    markStepComplete,
    markStepIncomplete,
    updateStepStatus,
    getStepStatus,
    setCanProceed,
    clearProgress,
    getProgressPercentage,
    canNavigateToStep,
  };
};

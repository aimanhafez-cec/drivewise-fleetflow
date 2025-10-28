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
    skippedSteps: [],
    lastModifiedStep: undefined,
    lastModifiedAt: undefined,
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
              skippedSteps: parsed.progress.skippedSteps || [],
              lastModifiedStep: parsed.progress.lastModifiedStep,
              lastModifiedAt: parsed.progress.lastModifiedAt,
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
    
    // Track modification metadata
    setProgress(prev => ({
      ...prev,
      lastModifiedStep: typeof step === 'string' ? parseInt(step.replace('step', '')) : undefined,
      lastModifiedAt: new Date().toISOString(),
    }));
  }, []);

  // Set any top-level wizard field directly (for primitives like source, sourceId)
  const setWizardField = useCallback(<K extends keyof EnhancedWizardData>(
    key: K,
    value: EnhancedWizardData[K]
  ) => {
    setWizardData(prev => ({
      ...prev,
      [key]: value as any,
    }));
    setProgress(prev => ({
      ...prev,
      lastModifiedAt: new Date().toISOString(),
    }));
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      currentStep: step,
      visitedSteps: [...new Set([...(prev.visitedSteps || []), step])], // Auto-track visited steps
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
        skippedSteps: [],
        lastModifiedStep: undefined,
        lastModifiedAt: undefined,
      });
      console.log('[useWizardProgress] Progress cleared');
    } catch (error) {
      console.error('[useWizardProgress] Failed to clear progress:', error);
    }
  }, [storageKey, initialData]);

  const skipStep = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      skippedSteps: [...new Set([...prev.skippedSteps || [], step])],
      completedSteps: (prev.completedSteps || []).filter(s => s !== step),
    }));
  }, []);

  const unskipStep = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      skippedSteps: (prev.skippedSteps || []).filter(s => s !== step),
    }));
  }, []);

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
    // Check if step is skipped
    if ((progress.skippedSteps || []).includes(step)) {
      return 'not-visited';
    }
    // Check if step is completed
    if (progress.completedSteps.includes(step)) {
      return 'complete';
    }
    // Check if step has validation errors
    if (progress.stepValidationStatus[step]) {
      return progress.stepValidationStatus[step];
    }
    // Check if step has been visited
    if ((progress.visitedSteps || []).includes(step)) {
      return 'incomplete';
    }
    return 'not-visited';
  }, [progress]);

  const getAllStepsStatus = useCallback(() => {
    const statuses: Record<number, StepStatus> = {};
    for (let i = 0; i < totalSteps; i++) {
      statuses[i] = getStepStatus(i);
    }
    return statuses;
  }, [totalSteps, getStepStatus]);

  const getProgressSummary = useCallback(() => {
    const completed = progress.completedSteps.length;
    const visited = (progress.visitedSteps || []).length;
    const skipped = (progress.skippedSteps || []).length;
    const hasErrors = Object.values(progress.stepValidationStatus).some(
      status => status === 'has-errors'
    );
    const percentage = Math.round((completed / totalSteps) * 100);

    return {
      completed,
      visited,
      skipped,
      total: totalSteps,
      hasErrors,
      percentage,
      isComplete: completed === totalSteps,
    };
  }, [progress, totalSteps]);

  const validateAllSteps = useCallback((validationFn: (step: number, data: any) => boolean) => {
    const invalidSteps: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      if (!(progress.skippedSteps || []).includes(i) && !validationFn(i, wizardData)) {
        invalidSteps.push(i);
      }
    }
    return {
      isValid: invalidSteps.length === 0,
      invalidSteps,
    };
  }, [totalSteps, progress.skippedSteps, wizardData]);

  const clearStepData = useCallback((stepKey: keyof EnhancedWizardData) => {
    setWizardData(prev => ({
      ...prev,
      [stepKey]: initialData[stepKey],
    }));
  }, [initialData]);

  const resetStepStatus = useCallback((step: number) => {
    setProgress(prev => {
      const newValidationStatus = { ...prev.stepValidationStatus };
      delete newValidationStatus[step];
      
      return {
        ...prev,
        stepValidationStatus: newValidationStatus,
        completedSteps: prev.completedSteps.filter(s => s !== step),
        visitedSteps: (prev.visitedSteps || []).filter(s => s !== step),
      };
    });
  }, []);

  return {
    wizardData,
    progress,
    updateWizardData,
    setWizardField,
    setCurrentStep,
    markStepComplete,
    markStepIncomplete,
    updateStepStatus,
    getStepStatus,
    getAllStepsStatus,
    getProgressSummary,
    validateAllSteps,
    clearStepData,
    resetStepStatus,
    setCanProceed,
    clearProgress,
    getProgressPercentage,
    canNavigateToStep,
    skipStep,
    unskipStep,
  };
};

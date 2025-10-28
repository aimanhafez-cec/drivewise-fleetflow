import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WizardContextType {
  currentStep: number | null;
  expressMode: boolean;
  isRepeatBooking: boolean;
  setWizardState: (state: Partial<Omit<WizardContextType, 'setWizardState'>>) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [expressMode, setExpressMode] = useState(false);
  const [isRepeatBooking, setIsRepeatBooking] = useState(false);

  const setWizardState = (state: Partial<Omit<WizardContextType, 'setWizardState'>>) => {
    if (state.currentStep !== undefined) setCurrentStep(state.currentStep);
    if (state.expressMode !== undefined) setExpressMode(state.expressMode);
    if (state.isRepeatBooking !== undefined) setIsRepeatBooking(state.isRepeatBooking);
  };

  return (
    <WizardContext.Provider value={{ currentStep, expressMode, isRepeatBooking, setWizardState }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizardContext = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context;
};

// Safe version that returns null if used outside provider
export const useWizardContextSafe = () => {
  return useContext(WizardContext);
};

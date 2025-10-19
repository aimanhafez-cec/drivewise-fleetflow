import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ReservationWizardData {
  // Step 1: Reservation Type
  reservationType: 'vehicle_class' | 'make_model' | 'specific_vin' | null;
  
  // Step 2: Customer
  customerId: string;
  customerData: any;
  
  // Step 3: Dates & Locations
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  
  // Step 4: Vehicle Selection
  vehicleClassId?: string;
  makeModel?: string;
  vehicleId?: string;
  vehicleData?: any;
  
  // Step 5: Services & Add-ons
  selectedAddOns: string[];
  addOnPrices: Record<string, number>;
  
  // Step 6: Pricing (calculated)
  baseRate: number;
  addOnsTotal: number;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  downPaymentAmount: number;
  balanceDue: number;
  
  // Step 7: Down Payment
  paymentMethod: string;
  transactionId?: string;
  paymentNotes?: string;
  
  // General
  notes?: string;
}

interface ReservationWizardContextType {
  currentStep: number;
  wizardData: ReservationWizardData;
  updateWizardData: (updates: Partial<ReservationWizardData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
}

const ReservationWizardContext = createContext<ReservationWizardContextType | undefined>(
  undefined
);

const initialWizardData: ReservationWizardData = {
  reservationType: null,
  customerId: '',
  customerData: null,
  pickupDate: '',
  pickupTime: '09:00',
  returnDate: '',
  returnTime: '17:00',
  pickupLocation: '',
  returnLocation: '',
  selectedAddOns: [],
  addOnPrices: {},
  baseRate: 0,
  addOnsTotal: 0,
  subtotal: 0,
  vatAmount: 0,
  totalAmount: 0,
  downPaymentAmount: 0,
  balanceDue: 0,
  paymentMethod: '',
};

export const ReservationWizardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<ReservationWizardData>(initialWizardData);

  const updateWizardData = (updates: Partial<ReservationWizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(Math.max(1, Math.min(step, 8)));
  
  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData(initialWizardData);
  };

  return (
    <ReservationWizardContext.Provider
      value={{
        currentStep,
        wizardData,
        updateWizardData,
        nextStep,
        prevStep,
        goToStep,
        resetWizard,
      }}
    >
      {children}
    </ReservationWizardContext.Provider>
  );
};

export const useReservationWizard = () => {
  const context = useContext(ReservationWizardContext);
  if (!context) {
    throw new Error(
      'useReservationWizard must be used within ReservationWizardProvider'
    );
  }
  return context;
};

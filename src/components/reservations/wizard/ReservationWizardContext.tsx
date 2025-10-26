import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ReservationLine {
  id: string;
  lineNo: number;
  vehicleClassId?: string;
  vehicleId?: string;
  vehicleData?: any;
  drivers: Array<{
    driverId: string;
    role: 'PRIMARY' | 'ADDITIONAL';
    fee?: number;
  }>;
  checkOutDate: string;
  checkOutTime: string;
  checkOutLocationId: string;
  checkInDate: string;
  checkInTime: string;
  checkInLocationId: string;
  selectedAddOns: string[];
  addOnPrices: Record<string, number>;
  baseRate: number;
  lineNet: number;
  taxValue: number;
  lineTotal: number;
}

export interface BillToMeta {
  purchaseOrderNo?: string;
  claimNo?: string;
  policyNo?: string;
  voucherNo?: string;
  costCenter?: string;
  [key: string]: any;
}

export interface ReservationWizardData {
  // Step 1: Reservation Type
  reservationType: 'vehicle_class' | 'specific_vehicle' | null;
  
  // Step 1.5: Business Configuration
  reservationMethodId: string;
  businessUnitId: string;
  paymentTermsId: string;
  currency: string;
  
  // Step 2: Customer
  customerId: string;
  customerData: any;
  
  // Step 2.5: Price List
  priceListId: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  kilometerCharge: number;
  dailyKilometerAllowed: number;
  
  // Step 3: Default Dates & Locations (used for first line)
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  
  // Step 4: Multi-Vehicle Reservation Lines
  reservationLines: ReservationLine[];
  
  // Step 5: Global Add-ons (applied to all lines)
  globalAddOns: string[];
  globalAddOnPrices: Record<string, number>;
  
  // Step 5.5: Airport Information
  enableAirportInfo: boolean;
  airportPickup?: boolean;
  pickupFlightNo?: string;
  pickupFlightTime?: string;
  airportReturn?: boolean;
  returnFlightNo?: string;
  returnFlightTime?: string;
  arrivalFlightNo?: string;
  arrivalAirport?: string;
  arrivalCity?: string;
  arrivalDateTime?: string;
  arrivalAirline?: string;
  arrivalPassengers?: number;
  arrivalTerminal?: string;
  departureFlightNo?: string;
  departureAirport?: string;
  departureCity?: string;
  departureDateTime?: string;
  departureAirline?: string;
  departurePassengers?: number;
  departureTerminal?: string;
  
  // Step 5.6: Insurance Configuration
  insuranceLevelId?: string;
  insuranceGroupId?: string;
  insuranceProviderId?: string;
  
  // Step 5.7: Billing Configuration
  billToType: 'CUSTOMER' | 'CORPORATE' | 'INSURANCE' | 'AGENCY' | 'OTHER';
  billToId?: string;
  billToDisplay?: string;
  billingAddressId?: string;
  billToMeta?: BillToMeta;
  taxLevelId: string;
  taxCodeId: string;
  validityDateTo?: string;
  discountTypeId?: string;
  discountValue: number;
  leaseToOwn: boolean;
  
  // Step 6: Pricing Summary (calculated)
  baseRate: number;
  addOnsTotal: number;
  driverFeesTotal: number;
  subtotal: number;
  preAdjustment: number;
  advancePayment: number;
  securityDepositPaid: number;
  cancellationCharges: number;
  vatAmount: number;
  totalAmount: number;
  downPaymentAmount: number;
  balanceDue: number;
  
  // Step 7: Payment & Deposits
  paymentMethod: string;
  transactionId?: string;
  paymentNotes?: string;
  depositPaymentMethod?: string;
  depositTransactionId?: string;
  
  // Step 7.5: Referral & Notes
  referralCustomerId?: string;
  referralCode?: string;
  referralSource?: string;
  referralDetails?: string;
  internalNotes?: string;
  customerNotes?: string;
  notes?: string;
  specialNotes?: string;
  
  // Step 8: Confirmation (meta)
  draftSaved: boolean;
  draftSavedAt?: string;
}

export type StepStatus = 'complete' | 'incomplete' | 'has-errors' | 'not-visited';

interface ReservationWizardContextType {
  currentStep: number;
  wizardData: ReservationWizardData;
  completedSteps: number[];
  visitedSteps: number[];
  stepValidationStatus: Record<number, StepStatus>;
  updateWizardData: (updates: Partial<ReservationWizardData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  markStepComplete: (stepNumber: number) => void;
  markStepIncomplete: (stepNumber: number) => void;
  getStepStatus: (stepNumber: number) => StepStatus;
  resetWizard: () => void;
}

const ReservationWizardContext = createContext<ReservationWizardContextType | undefined>(
  undefined
);

const initialWizardData: ReservationWizardData = {
  // Step 1
  reservationType: null,
  
  // Step 1.5
  reservationMethodId: '',
  businessUnitId: '',
  paymentTermsId: '',
  currency: 'AED',
  
  // Step 2
  customerId: '',
  customerData: null,
  
  // Step 2.5
  priceListId: '',
  hourlyRate: 0,
  dailyRate: 0,
  weeklyRate: 0,
  monthlyRate: 0,
  kilometerCharge: 0,
  dailyKilometerAllowed: 0,
  
  // Step 3
  pickupDate: '',
  pickupTime: '09:00',
  returnDate: '',
  returnTime: '17:00',
  pickupLocation: '',
  returnLocation: '',
  
  // Step 4
  reservationLines: [],
  
  // Step 5
  globalAddOns: [],
  globalAddOnPrices: {},
  
  // Step 5.5
  enableAirportInfo: false,
  
  // Step 5.6
  insuranceLevelId: undefined,
  insuranceGroupId: undefined,
  insuranceProviderId: undefined,
  
  // Step 5.7
  billToType: 'CUSTOMER',
  billToId: undefined,
  billToDisplay: undefined,
  billingAddressId: undefined,
  billToMeta: undefined,
  taxLevelId: '',
  taxCodeId: '',
  validityDateTo: undefined,
  discountTypeId: undefined,
  discountValue: 0,
  leaseToOwn: false,
  
  // Step 6
  baseRate: 0,
  addOnsTotal: 0,
  driverFeesTotal: 0,
  subtotal: 0,
  preAdjustment: 0,
  advancePayment: 0,
  securityDepositPaid: 0,
  cancellationCharges: 0,
  vatAmount: 0,
  totalAmount: 0,
  downPaymentAmount: 0,
  balanceDue: 0,
  
  // Step 7
  paymentMethod: '',
  transactionId: undefined,
  paymentNotes: undefined,
  depositPaymentMethod: undefined,
  depositTransactionId: undefined,
  
  // Step 7.5
  referralCustomerId: undefined,
  referralCode: undefined,
  referralSource: undefined,
  referralDetails: undefined,
  internalNotes: undefined,
  customerNotes: undefined,
  notes: undefined,
  specialNotes: undefined,
  
  // Step 8
  draftSaved: false,
  draftSavedAt: undefined,
};

export const ReservationWizardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<ReservationWizardData>(initialWizardData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]); // Step 1 is visited by default
  const [stepValidationStatus, setStepValidationStatus] = useState<Record<number, StepStatus>>({});

  const updateWizardData = (updates: Partial<ReservationWizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const markStepComplete = (stepNumber: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(stepNumber)) {
        return [...prev, stepNumber];
      }
      return prev;
    });
    setStepValidationStatus((prev) => ({
      ...prev,
      [stepNumber]: 'complete',
    }));
  };

  const markStepIncomplete = (stepNumber: number) => {
    setCompletedSteps((prev) => prev.filter((step) => step !== stepNumber));
    setStepValidationStatus((prev) => ({
      ...prev,
      [stepNumber]: 'incomplete',
    }));
  };

  const getStepStatus = (stepNumber: number): StepStatus => {
    if (stepValidationStatus[stepNumber]) {
      return stepValidationStatus[stepNumber];
    }
    if (visitedSteps.includes(stepNumber)) {
      return 'incomplete';
    }
    return 'not-visited';
  };

  const nextStep = () => {
    const next = Math.min(currentStep + 1, 14);
    setCurrentStep(next);
    setVisitedSteps((prev) => {
      if (!prev.includes(next)) {
        return [...prev, next];
      }
      return prev;
    });
  };

  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 1);
    setCurrentStep(prev);
    setVisitedSteps((prevVisited) => {
      if (!prevVisited.includes(prev)) {
        return [...prevVisited, prev];
      }
      return prevVisited;
    });
  };

  const goToStep = (step: number) => {
    const targetStep = Math.max(1, Math.min(step, 14));
    setCurrentStep(targetStep);
    setVisitedSteps((prev) => {
      if (!prev.includes(targetStep)) {
        return [...prev, targetStep];
      }
      return prev;
    });
  };
  
  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData(initialWizardData);
    setCompletedSteps([]);
    setVisitedSteps([1]);
    setStepValidationStatus({});
  };

  return (
    <ReservationWizardContext.Provider
      value={{
        currentStep,
        wizardData,
        completedSteps,
        visitedSteps,
        stepValidationStatus,
        updateWizardData,
        nextStep,
        prevStep,
        goToStep,
        markStepComplete,
        markStepIncomplete,
        getStepStatus,
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

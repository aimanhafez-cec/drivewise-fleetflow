import { useState, useCallback } from 'react';
import type { AgreementLine, MultiLineAgreementData } from '@/types/agreement-line';

// Helper function to generate a UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface UseMultiLineAgreementProps {
  enabled: boolean;
  initialData?: Partial<MultiLineAgreementData>;
}

export const useMultiLineAgreement = ({ 
  enabled, 
  initialData 
}: UseMultiLineAgreementProps) => {
  const [multiLineData, setMultiLineData] = useState<MultiLineAgreementData>({
    customerId: initialData?.customerId || '',
    customerVerified: initialData?.customerVerified || false,
    agreementType: initialData?.agreementType || 'daily',
    rentalPurpose: initialData?.rentalPurpose || 'business',
    lines: initialData?.lines || [],
    totalPricing: initialData?.totalPricing || {
      subtotal: 0,
      discount: 0,
      taxableAmount: 0,
      vat: 0,
      total: 0,
    },
    mileagePackage: initialData?.mileagePackage || 'unlimited',
    crossBorderAllowed: initialData?.crossBorderAllowed || false,
    billingType: initialData?.billingType || 'same',
    paymentMethod: initialData?.paymentMethod || '',
    paymentSchedule: initialData?.paymentSchedule || 'upfront',
  });

  const createNewLine = useCallback((): AgreementLine => {
    const lineNumber = multiLineData.lines.length + 1;
    return {
      id: generateId(),
      lineNumber,
      primaryDriverId: multiLineData.customerId,
      additionalDriverIds: [],
      checkOutDateTime: '',
      checkOutLocationId: '',
      checkInDateTime: '',
      checkInLocationId: '',
      baseRate: 0,
      insurancePackage: 'comprehensive',
      excessAmount: 0,
      maintenanceIncluded: false,
      addons: [],
      pricingBreakdown: {
        baseRate: 0,
        insurance: 0,
        maintenance: 0,
        addons: 0,
        subtotal: 0,
        discount: 0,
        taxableAmount: 0,
        vat: 0,
        total: 0,
      },
      isValid: false,
      errors: [],
    };
  }, [multiLineData.lines.length, multiLineData.customerId]);

  const addLine = useCallback(() => {
    const newLine = createNewLine();
    setMultiLineData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine],
    }));
    return newLine;
  }, [createNewLine]);

  const removeLine = useCallback((lineId: string) => {
    setMultiLineData(prev => {
      const newLines = prev.lines
        .filter(line => line.id !== lineId)
        .map((line, index) => ({ ...line, lineNumber: index + 1 }));
      return {
        ...prev,
        lines: newLines,
      };
    });
  }, []);

  const duplicateLine = useCallback((lineId: string) => {
    const lineToDuplicate = multiLineData.lines.find(line => line.id === lineId);
    if (!lineToDuplicate) return;

    const newLine: AgreementLine = {
      ...lineToDuplicate,
      id: generateId(),
      lineNumber: multiLineData.lines.length + 1,
    };

    setMultiLineData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine],
    }));
  }, [multiLineData.lines]);

  const updateLine = useCallback((lineId: string, updates: Partial<AgreementLine>) => {
    setMultiLineData(prev => ({
      ...prev,
      lines: prev.lines.map(line =>
        line.id === lineId ? { ...line, ...updates } : line
      ),
    }));
  }, []);

  const getLine = useCallback((lineId: string): AgreementLine | undefined => {
    return multiLineData.lines.find(line => line.id === lineId);
  }, [multiLineData.lines]);

  const recalculateTotalPricing = useCallback(() => {
    const totals = multiLineData.lines.reduce(
      (acc, line) => ({
        subtotal: acc.subtotal + line.pricingBreakdown.subtotal,
        discount: acc.discount + line.pricingBreakdown.discount,
        taxableAmount: acc.taxableAmount + line.pricingBreakdown.taxableAmount,
        vat: acc.vat + line.pricingBreakdown.vat,
        total: acc.total + line.pricingBreakdown.total,
      }),
      { subtotal: 0, discount: 0, taxableAmount: 0, vat: 0, total: 0 }
    );

    setMultiLineData(prev => ({
      ...prev,
      totalPricing: totals,
    }));

    return totals;
  }, [multiLineData.lines]);

  const validateLine = useCallback((lineId: string): { isValid: boolean; errors: string[] } => {
    const line = getLine(lineId);
    if (!line) return { isValid: false, errors: ['Line not found'] };

    const errors: string[] = [];

    if (!line.vehicleClassId && !line.specificVehicleId) {
      errors.push('Vehicle must be selected');
    }
    if (!line.checkOutDateTime) {
      errors.push('Check-out date/time is required');
    }
    if (!line.checkInDateTime) {
      errors.push('Check-in date/time is required');
    }
    if (!line.checkOutLocationId) {
      errors.push('Check-out location is required');
    }
    if (!line.checkInLocationId) {
      errors.push('Check-in location is required');
    }
    if (line.baseRate <= 0) {
      errors.push('Base rate must be greater than 0');
    }

    // Validate dates
    if (line.checkOutDateTime && line.checkInDateTime) {
      const checkOut = new Date(line.checkOutDateTime);
      const checkIn = new Date(line.checkInDateTime);
      if (checkOut >= checkIn) {
        errors.push('Check-in date must be after check-out date');
      }
    }

    const isValid = errors.length === 0;

    // Update line validation status
    updateLine(lineId, { isValid, errors });

    return { isValid, errors };
  }, [getLine, updateLine]);

  const validateAllLines = useCallback(() => {
    const invalidLines: string[] = [];

    multiLineData.lines.forEach(line => {
      const validation = validateLine(line.id);
      if (!validation.isValid) {
        invalidLines.push(line.id);
      }
    });

    return {
      isValid: invalidLines.length === 0,
      invalidLines,
    };
  }, [multiLineData.lines, validateLine]);

  const updateHeaderData = useCallback(<K extends keyof MultiLineAgreementData>(
    field: K,
    value: MultiLineAgreementData[K]
  ) => {
    setMultiLineData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const clearAllLines = useCallback(() => {
    setMultiLineData(prev => ({
      ...prev,
      lines: [],
    }));
  }, []);

  const reorderLines = useCallback((newOrder: AgreementLine[]) => {
    const reorderedLines = newOrder.map((line, index) => ({
      ...line,
      lineNumber: index + 1,
    }));
    setMultiLineData(prev => ({
      ...prev,
      lines: reorderedLines,
    }));
  }, []);

  return {
    // State
    multiLineData,
    isMultiLineEnabled: enabled,
    
    // Line Management
    addLine,
    removeLine,
    duplicateLine,
    updateLine,
    getLine,
    clearAllLines,
    reorderLines,
    
    // Validation
    validateLine,
    validateAllLines,
    
    // Pricing
    recalculateTotalPricing,
    
    // Header Data
    updateHeaderData,
    
    // Computed
    totalAmount: multiLineData.totalPricing.total,
    lineCount: multiLineData.lines.length,
    validLineCount: multiLineData.lines.filter(l => l.isValid).length,
  };
};

import { useState, useCallback } from 'react';
import { CustodyValidator, ValidationResult } from '@/lib/validation/custody';
import { CustodyStatus } from '@/lib/api/custody';
import { useToast } from '@/hooks/use-toast';

interface UseCustodyValidationReturn {
  validateForSubmission: (custody: any) => ValidationResult;
  validateStatusTransition: (currentStatus: CustodyStatus, newStatus: CustodyStatus, custody: any) => ValidationResult;
  validateVehicleEligibility: (vehicle: any) => ValidationResult;
  validateDocumentRequirements: (custody: any, documents: any[]) => ValidationResult;
  showValidationErrors: (result: ValidationResult) => void;
  showValidationWarnings: (result: ValidationResult) => void;
  isValidating: boolean;
}

export function useCustodyValidation(): UseCustodyValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateForSubmission = useCallback((custody: any): ValidationResult => {
    setIsValidating(true);
    const result = CustodyValidator.validateForSubmission(custody);
    setIsValidating(false);
    return result;
  }, []);

  const validateStatusTransition = useCallback(
    (currentStatus: CustodyStatus, newStatus: CustodyStatus, custody: any): ValidationResult => {
      setIsValidating(true);
      const result = CustodyValidator.validateStatusTransition(currentStatus, newStatus, custody);
      setIsValidating(false);
      return result;
    },
    []
  );

  const validateVehicleEligibility = useCallback((vehicle: any): ValidationResult => {
    setIsValidating(true);
    const result = CustodyValidator.validateVehicleEligibility(vehicle);
    setIsValidating(false);
    return result;
  }, []);

  const validateDocumentRequirements = useCallback(
    (custody: any, documents: any[]): ValidationResult => {
      setIsValidating(true);
      const result = CustodyValidator.validateDocumentRequirements(custody, documents);
      setIsValidating(false);
      return result;
    },
    []
  );

  const showValidationErrors = useCallback(
    (result: ValidationResult) => {
      if (!result.valid && result.errors.length > 0) {
        const errorList = result.errors.map((error, index) => (
          `${index + 1}. ${error}`
        )).join('\n');
        
        toast({
          title: "Validation Errors",
          description: errorList,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const showValidationWarnings = useCallback(
    (result: ValidationResult) => {
      if (result.warnings.length > 0) {
        const warningList = result.warnings.map((warning, index) => (
          `${index + 1}. ${warning}`
        )).join('\n');
        
        toast({
          title: "Validation Warnings",
          description: warningList,
          variant: "default",
        });
      }
    },
    [toast]
  );

  return {
    validateForSubmission,
    validateStatusTransition,
    validateVehicleEligibility,
    validateDocumentRequirements,
    showValidationErrors,
    showValidationWarnings,
    isValidating,
  };
}

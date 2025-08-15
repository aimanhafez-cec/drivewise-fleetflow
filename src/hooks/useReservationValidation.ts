import { useState, useCallback } from 'react';
import { validateReservation, validateHeader, ValidationResult } from '@/lib/validation/reservationSchema';

interface ValidationErrors {
  [key: string]: string;
}

export const useReservationValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);

  const fieldToAccordionMap: Record<string, string> = {
    // Header fields
    'header.entryDate': 'rental-information',
    'header.reservationMethodId': 'rental-information',
    'header.currencyCode': 'rental-information',
    'header.reservationTypeId': 'rental-information',
    'header.businessUnitId': 'rental-information',
    'header.customerId': 'rental-information',
    'header.paymentTermsId': 'rental-information',
    'header.priceListId': 'rate-taxes',
    'header.validityDateTo': 'rental-information',
    'header.taxLevelId': 'rental-information',
    'header.taxCodeId': 'rental-information',
    
    // Billing fields
    'header.billingCustomerName': 'billing',
    'header.billingMail': 'billing',
    'header.billingPhone': 'billing',
    'header.billingAddress': 'billing',
    
    // Airport fields
    'header.arrivalFlightNo': 'airport-info',
    'header.arrivalDateTime': 'airport-info',
    'header.arrivalAirline': 'airport-info',
    'header.departureFlightNo': 'airport-info',
    'header.departureDateTime': 'airport-info',
    'header.departureAirline': 'airport-info',
    
    // Insurance fields
    'header.insuranceLevel': 'insurance-information',
    'header.insuranceProvider': 'insurance-information',
    
    // Payment fields
    'header.advancePayment': 'adjustments-deposits',
    'header.paymentMethod': 'adjustments-deposits',
    'header.securityDepositPaid': 'adjustments-deposits',
    'header.depositMethod': 'adjustments-deposits',
    'header.depositPaymentMethod': 'adjustments-deposits',
    
    // Referral fields
    'header.benefitType': 'referral-information',
    'header.benefitValue': 'referral-information',
    
    // Line fields
    'lines': 'vehicle-driver',
  };

  const applyServerErrors = useCallback((errors: Array<{path: string; message: string; code?: string}>) => {
    const errorMap: ValidationErrors = {};
    const accordionsToExpand = new Set<string>();

    errors.forEach(error => {
      errorMap[error.path] = error.message;
      
      // Map error path to accordion
      const accordion = fieldToAccordionMap[error.path];
      if (accordion) {
        accordionsToExpand.add(accordion);
      }
    });

    setValidationErrors(errorMap);
    setExpandedAccordions(Array.from(accordionsToExpand));

    // Focus first invalid field
    setTimeout(() => {
      const firstErrorPath = errors[0]?.path;
      if (firstErrorPath) {
        focusField(firstErrorPath);
      }
    }, 100);
  }, []);

  const validateForm = useCallback((data: any): ValidationResult => {
    const result = validateReservation(data);
    
    if (!result.success) {
      applyServerErrors(result.errors);
    } else {
      setValidationErrors({});
      setExpandedAccordions([]);
    }
    
    return result;
  }, [applyServerErrors]);

  const validateHeaderOnly = useCallback((data: any): ValidationResult => {
    const result = validateHeader(data);
    
    if (!result.success) {
      applyServerErrors(result.errors);
    } else {
      // Clear only header errors
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('header.')) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
    
    return result;
  }, [applyServerErrors]);

  const clearErrors = useCallback(() => {
    setValidationErrors({});
    setExpandedAccordions([]);
  }, []);

  const clearFieldError = useCallback((path: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[path];
      return newErrors;
    });
  }, []);

  const focusField = useCallback((path: string) => {
    // Convert path to field ID
    const fieldId = path.replace(/\./g, '-').replace(/\[|\]/g, '');
    const element = document.getElementById(fieldId) || document.querySelector(`[name="${path}"]`);
    
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const getFieldError = useCallback((path: string): string | undefined => {
    return validationErrors[path];
  }, [validationErrors]);

  const getFieldsWithPrefix = useCallback((prefix: string): Record<string, string> => {
    const prefixedErrors: Record<string, string> = {};
    Object.entries(validationErrors).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        const shortKey = key.replace(`${prefix}.`, '');
        prefixedErrors[shortKey] = value;
      }
    });
    return prefixedErrors;
  }, [validationErrors]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  return {
    validationErrors,
    expandedAccordions,
    applyServerErrors,
    validateForm,
    validateHeaderOnly,
    clearErrors,
    clearFieldError,
    focusField,
    getFieldError,
    getFieldsWithPrefix,
    hasErrors,
  };
};
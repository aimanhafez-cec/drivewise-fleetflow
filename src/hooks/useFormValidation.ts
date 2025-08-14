import { useState, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  minDate?: Date;
  maxDate?: Date;
  custom?: (value: any) => string | null;
  dependsOn?: string;
  dependsOnValue?: any;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

interface UseFormValidationProps {
  rules: ValidationRules;
  data: Record<string, any>;
}

export const useFormValidation = ({ rules, data }: UseFormValidationProps) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const newErrors: ValidationErrors = {};

    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];
      
      // Check if field is conditionally required
      if (rule.dependsOn && rule.dependsOnValue !== undefined) {
        const dependentValue = data[rule.dependsOn];
        if (dependentValue !== rule.dependsOnValue) {
          return; // Skip validation if dependency not met
        }
      }

      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field] = 'This field is required.';
        return;
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return;
      }

      // Email validation
      if (rule.email && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field] = 'Enter a valid email address.';
          return;
        }
      }

      // Number range validation
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          newErrors[field] = `Value must be at least ${rule.min}.`;
          return;
        }
        if (rule.max !== undefined && value > rule.max) {
          newErrors[field] = `Value must be at most ${rule.max}.`;
          return;
        }
      }

      // Date validation
      if (value instanceof Date) {
        if (rule.minDate && value < rule.minDate) {
          newErrors[field] = `Date must be after ${rule.minDate.toLocaleDateString()}.`;
          return;
        }
        if (rule.maxDate && value > rule.maxDate) {
          newErrors[field] = `Date must be before ${rule.maxDate.toLocaleDateString()}.`;
          return;
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          newErrors[field] = customError;
          return;
        }
      }
    });

    return newErrors;
  }, [rules, data]);

  const touchedErrors = useMemo(() => {
    const result: ValidationErrors = {};
    Object.keys(errors).forEach(field => {
      if (touched[field]) {
        result[field] = errors[field];
      }
    });
    return result;
  }, [errors, touched]);

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const markAllTouched = () => {
    const allFields = Object.keys(rules);
    setTouched(prev => {
      const newTouched = { ...prev };
      allFields.forEach(field => {
        newTouched[field] = true;
      });
      return newTouched;
    });
  };

  const isValid = Object.keys(errors).length === 0;
  const hasVisibleErrors = Object.keys(touchedErrors).length > 0;

  return {
    errors,
    touchedErrors,
    isValid,
    hasVisibleErrors,
    markTouched,
    markAllTouched,
    touched
  };
};
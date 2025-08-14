import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export interface ValidationError {
  field: string;
  message: string;
}

interface AddLineValidationProps {
  errors: ValidationError[];
}

export const AddLineValidation: React.FC<AddLineValidationProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <div className="font-medium">Please fix the following errors:</div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Validation logic
export const validateAddLine = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!formData.vehicleClassId) {
    errors.push({ field: 'vehicleClassId', message: 'Vehicle Class is required' });
  }
  
  if (!formData.vehicleId) {
    errors.push({ field: 'vehicleId', message: 'Vehicle is required' });
  }
  
  if (!formData.checkOutDate) {
    errors.push({ field: 'checkOutDate', message: 'Check-out Date is required' });
  }
  
  if (!formData.checkOutLocationId) {
    errors.push({ field: 'checkOutLocationId', message: 'Check-out Location is required' });
  }
  
  if (!formData.checkInDate) {
    errors.push({ field: 'checkInDate', message: 'Check-in Date is required' });
  }
  
  if (!formData.checkInLocationId) {
    errors.push({ field: 'checkInLocationId', message: 'Check-in Location is required' });
  }

  // Date validation
  if (formData.checkOutDate && formData.checkInDate) {
    if (formData.checkOutDate >= formData.checkInDate) {
      errors.push({ 
        field: 'dates', 
        message: 'Check-out date must be before check-in date' 
      });
    }
  }

  // Vehicle availability validation
  if (formData.vehicleId && formData.checkOutDate && formData.checkInDate && formData.reservationLines) {
    const conflictingLine = formData.reservationLines.find((line: any) => 
      line.vehicleId === formData.vehicleId &&
      line.checkOutDate &&
      line.checkInDate &&
      !(formData.checkInDate <= line.checkOutDate || formData.checkOutDate >= line.checkInDate)
    );
    
    if (conflictingLine) {
      errors.push({ 
        field: 'availability', 
        message: `Vehicle ${formData.vehicleId} is already allocated during this time period (Line ${conflictingLine.lineNo})` 
      });
    }
  }

  return errors;
};
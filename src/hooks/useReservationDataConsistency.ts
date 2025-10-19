import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReservationData {
  reservationType?: string;
  customerId?: string;
  customerData?: any;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  vehicleClassId?: string;
  vehicleId?: string;
  makeModel?: string;
  selectedAddons?: any[];
  totalAmount?: number;
  downPaymentAmount?: number;
  balanceDue?: number;
  paymentMethod?: string;
  transactionId?: string;
}

export const useReservationDataConsistency = () => {
  const { toast } = useToast();

  const checkDataConsistency = useCallback((data: ReservationData): {
    isConsistent: boolean;
    issues: string[];
  } => {
    const issues: string[] = [];

    // Check date/time consistency
    if (data.pickupDate && data.returnDate && data.pickupTime && data.returnTime) {
      const pickup = new Date(`${data.pickupDate}T${data.pickupTime}`);
      const returnDate = new Date(`${data.returnDate}T${data.returnTime}`);
      
      if (pickup >= returnDate) {
        issues.push('Return date/time must be after pickup date/time');
      }

      // Check if dates are in the future (optional warning)
      const now = new Date();
      if (pickup < now && pickup.getTime() < now.getTime() - 86400000) {
        issues.push('Warning: Pickup date is in the past');
      }
    }

    // Check payment consistency
    if (data.totalAmount && data.downPaymentAmount && data.balanceDue) {
      const calculatedBalance = data.totalAmount - data.downPaymentAmount;
      if (Math.abs(calculatedBalance - data.balanceDue) > 0.01) {
        issues.push('Payment amounts are inconsistent');
      }
    }

    // Check vehicle selection consistency
    if (data.reservationType === 'instant' && !data.vehicleId) {
      issues.push('Instant bookings require a specific vehicle');
    }

    // Check if customer data is loaded when customerId exists
    if (data.customerId && !data.customerData) {
      issues.push('Customer data not loaded');
    }

    // Check payment method for non-zero payments
    if (data.downPaymentAmount && data.downPaymentAmount > 0 && !data.paymentMethod) {
      issues.push('Payment method required for down payment');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
    };
  }, []);

  const validateBeforeSubmission = useCallback((data: ReservationData): boolean => {
    const { isConsistent, issues } = checkDataConsistency(data);

    if (!isConsistent) {
      toast({
        title: 'Data Consistency Issues',
        description: issues.join(', '),
        variant: 'destructive',
      });
      return false;
    }

    // Check required fields for submission
    const requiredFields = [
      { field: data.customerId, name: 'Customer' },
      { field: data.pickupDate, name: 'Pickup date' },
      { field: data.returnDate, name: 'Return date' },
      { field: data.pickupLocation, name: 'Pickup location' },
      { field: data.totalAmount, name: 'Total amount' },
    ];

    const missingFields = requiredFields
      .filter(({ field }) => !field)
      .map(({ name }) => name);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please complete: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  }, [checkDataConsistency, toast]);

  const ensureDataIntegrity = useCallback((data: ReservationData): ReservationData => {
    const sanitized = { ...data };

    // Ensure numeric fields are proper numbers
    if (sanitized.totalAmount) {
      sanitized.totalAmount = Number(sanitized.totalAmount);
    }
    if (sanitized.downPaymentAmount) {
      sanitized.downPaymentAmount = Number(sanitized.downPaymentAmount);
    }
    if (sanitized.balanceDue) {
      sanitized.balanceDue = Number(sanitized.balanceDue);
    }

    // Calculate balance if not set
    if (sanitized.totalAmount && sanitized.downPaymentAmount && !sanitized.balanceDue) {
      sanitized.balanceDue = sanitized.totalAmount - sanitized.downPaymentAmount;
    }

    // Set default return location to pickup if not specified
    if (sanitized.pickupLocation && !sanitized.returnLocation) {
      sanitized.returnLocation = sanitized.pickupLocation;
    }

    // Ensure arrays are arrays
    if (!Array.isArray(sanitized.selectedAddons)) {
      sanitized.selectedAddons = [];
    }

    return sanitized;
  }, []);

  return {
    checkDataConsistency,
    validateBeforeSubmission,
    ensureDataIntegrity,
  };
};

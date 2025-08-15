import { z } from 'zod';

export const headerValidationSchema = z.object({
  entryDate: z.date(),
  reservationMethodId: z.string().min(1, 'Reservation Method is required'),
  currencyCode: z.string().min(1, 'Currency is required'),
  reservationTypeId: z.string().min(1, 'Reservation Type is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  customerId: z.string().min(1, 'Customer is required'),
  paymentTermsId: z.string().min(1, 'Payment Terms is required'),
  priceListId: z.string().min(1, 'Price List is required'),
  validityDateTo: z.date().nullable().optional(),
  taxLevelId: z.string().optional(),
  
  // Billing section
  billingType: z.enum(['SAME_AS_CUSTOMER', 'OTHER']).default('SAME_AS_CUSTOMER'),
  billingCustomerName: z.string().optional(),
  billingMail: z.string().optional(),
  billingPhone: z.string().optional(),
  billingAddress: z.string().optional(),
  
  // Airport Information (conditionally required)
  arrivalFlightNo: z.string().optional(),
  arrivalDateTime: z.date().nullable().optional(),
  arrivalAirline: z.string().optional(),
  departureFlightNo: z.string().optional(),
  departureDateTime: z.date().nullable().optional(),
  departureAirline: z.string().optional(),
  
  // Insurance
  insuranceLevel: z.string().optional(),
  insuranceProvider: z.string().optional(),
  
  // Deposits & Payments
  advancePayment: z.number().default(0),
  paymentMethod: z.string().optional(),
  securityDepositPaid: z.number().default(0),
  depositMethod: z.string().optional(),
  depositPaymentMethod: z.string().optional(),
  
  // Referral
  benefitType: z.string().optional(),
  benefitValue: z.number().optional(),
}).superRefine((data, ctx) => {
  // Validity date must be after entry date
  if (data.validityDateTo && data.entryDate && data.validityDateTo <= data.entryDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['validityDateTo'],
      message: 'Validity Date must be after Entry Date'
    });
  }
  
  
  
  // Billing validation when "Other" is selected
  if (data.billingType === 'OTHER') {
    if (!data.billingCustomerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingCustomerName'],
        message: 'Customer Name is required for billing'
      });
    }
    if (!data.billingMail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingMail'],
        message: 'Email is required for billing'
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.billingMail)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingMail'],
        message: 'Enter a valid email address'
      });
    }
    if (!data.billingPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingPhone'],
        message: 'Phone Number is required for billing'
      });
    }
    if (!data.billingAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingAddress'],
        message: 'Address is required for billing'
      });
    }
  }
  
  // Airport Information validation based on reservation method
  const needsArrival = data.reservationMethodId === 'AIRPORT_PICKUP' || data.reservationMethodId === 'AIRPORT_PICKUP_DROP';
  const needsDeparture = data.reservationMethodId === 'AIRPORT_DROP' || data.reservationMethodId === 'AIRPORT_PICKUP_DROP';
  
  if (needsArrival) {
    if (!data.arrivalFlightNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['arrivalFlightNo'],
        message: 'Arrival Flight Number is required'
      });
    }
    if (!data.arrivalDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['arrivalDateTime'],
        message: 'Arrival Date & Time is required'
      });
    }
    if (!data.arrivalAirline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['arrivalAirline'],
        message: 'Arrival Airline is required'
      });
    }
  }
  
  if (needsDeparture) {
    if (!data.departureFlightNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['departureFlightNo'],
        message: 'Departure Flight Number is required'
      });
    }
    if (!data.departureDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['departureDateTime'],
        message: 'Departure Date & Time is required'
      });
    }
    if (!data.departureAirline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['departureAirline'],
        message: 'Departure Airline is required'
      });
    }
  }
  
  // Insurance Provider required when Insurance Level is selected
  if (data.insuranceLevel && !data.insuranceProvider) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['insuranceProvider'],
      message: 'Insurance Provider is required when Insurance Level is selected'
    });
  }
  
  // Payment Method required when Advance Payment > 0
  if (data.advancePayment > 0 && !data.paymentMethod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paymentMethod'],
      message: 'Payment Method is required when Advance Payment is greater than 0'
    });
  }
  
  // Deposit methods required when Security Deposit Paid > 0
  if (data.securityDepositPaid > 0) {
    if (!data.depositMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['depositMethod'],
        message: 'Deposit Method is required when Security Deposit is paid'
      });
    }
    if (!data.depositPaymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['depositPaymentMethod'],
        message: 'Deposit Payment Method is required when Security Deposit is paid'
      });
    }
  }
  
  // Benefit Value required when Benefit Type is selected
  if (data.benefitType && (data.benefitValue === undefined || data.benefitValue === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['benefitValue'],
      message: 'Benefit Value is required when Benefit Type is selected'
    });
  }
  
  // Benefit Value range validation for percentage
  if (data.benefitType === 'PERCENT' && data.benefitValue !== undefined && (data.benefitValue < 0 || data.benefitValue > 100)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['benefitValue'],
      message: 'Benefit Value must be between 0 and 100 for percentage type'
    });
  }
});

export const lineValidationSchema = z.object({
  vehicleClassId: z.string().min(1, 'Vehicle Class is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  checkOutDate: z.date(),
  checkOutLocationId: z.string().min(1, 'Check-out Location is required'),
  checkInDate: z.date(),
  checkInLocationId: z.string().min(1, 'Check-in Location is required'),
}).superRefine((data, ctx) => {
  // Check-out must be before Check-in
  if (data.checkOutDate && data.checkInDate && data.checkOutDate >= data.checkInDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['checkOutDate'],
      message: 'Check-out must be before Check-in'
    });
  }
});

export const reservationValidationSchema = z.object({
  header: headerValidationSchema,
  lines: z.array(lineValidationSchema).min(1, 'At least one reservation line is required')
});

export type ValidationResult = {
  success: boolean;
  errors: Array<{
    path: string;
    message: string;
    code?: string;
  }>;
};

export const validateReservation = (data: any): ValidationResult => {
  try {
    reservationValidationSchema.parse(data);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: [{ path: 'general', message: 'Validation failed', code: 'unknown' }] 
    };
  }
};

export const validateHeader = (data: any): ValidationResult => {
  try {
    headerValidationSchema.parse(data);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => ({
        path: `header.${err.path.join('.')}`,
        message: err.message,
        code: err.code
      }));
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: [{ path: 'header.general', message: 'Header validation failed', code: 'unknown' }] 
    };
  }
};
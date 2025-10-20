import { z } from 'zod';
import { CustodyStatus, CustodianType, CustodyReason, RatePolicyType } from '@/lib/api/custody';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

export const custodyTransactionSchema = z.object({
  // Agreement & Customer
  agreement_id: z.string().uuid().optional(),
  agreement_line_id: z.string().uuid().optional(),
  customer_id: z.string().uuid({
    message: "Customer is required",
  }),
  branch_id: z.string().uuid().optional(),

  // Custodian Information
  custodian_type: z.enum(['customer', 'driver', 'originator']),
  custodian_party_id: z.string().uuid().optional(),
  custodian_name: z.string().min(2, "Custodian name must be at least 2 characters").max(200, "Custodian name is too long"),
  custodian_contact: z.object({
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    address: z.string().optional(),
  }).optional(),

  // Vehicles
  original_vehicle_id: z.string().uuid().optional(),
  replacement_vehicle_id: z.string().uuid().optional(),

  // Reason & Incident
  reason_code: z.enum(['accident', 'breakdown', 'maintenance', 'damage', 'other']),
  reason_subcode: z.string().max(100).optional(),
  incident_date: z.string().datetime({
    message: "Valid incident date is required",
  }),
  incident_ref: z.string().max(50).optional(),
  incident_narrative: z.string().max(2000, "Incident narrative is too long").optional(),
  incident_odometer: z.number().int().min(0, "Odometer must be positive").optional(),
  incident_location: z.any().optional(),

  // Dates
  effective_from: z.string().datetime({
    message: "Valid effective date is required",
  }),
  expected_return_date: z.string().datetime({
    message: "Valid expected return date is required",
  }).optional(),
  until_original_ready: z.boolean().default(false),

  // Rate Policy
  rate_policy: z.enum(['inherit', 'prorate', 'free', 'special_code']),
  special_rate_code: z.string().max(50).optional(),
  deposit_carryover: z.boolean().default(false),
  damage_preauth_hold: z.number().min(0).optional(),
  damage_preauth_card_ref: z.string().max(100).optional(),

  // Additional
  notes: z.string().max(5000, "Notes are too long").optional(),
  tags: z.array(z.string().max(50)).max(20, "Too many tags").optional(),
})
  .refine((data) => {
    // If rate policy is special_code, special_rate_code must be provided
    if (data.rate_policy === 'special_code' && !data.special_rate_code) {
      return false;
    }
    return true;
  }, {
    message: "Special rate code is required when rate policy is 'special_code'",
    path: ['special_rate_code'],
  })
  .refine((data) => {
    // Expected return date must be after effective date
    if (data.expected_return_date && data.effective_from) {
      const effectiveDate = new Date(data.effective_from);
      const returnDate = new Date(data.expected_return_date);
      return returnDate > effectiveDate;
    }
    return true;
  }, {
    message: "Expected return date must be after effective date",
    path: ['expected_return_date'],
  })
  .refine((data) => {
    // Incident date should not be in the future
    const incidentDate = new Date(data.incident_date);
    const now = new Date();
    return incidentDate <= now;
  }, {
    message: "Incident date cannot be in the future",
    path: ['incident_date'],
  });

export const custodyChargeSchema = z.object({
  charge_type: z.enum(['damage', 'upgrade', 'downgrade', 'admin_fee', 'other']),
  item_code: z.string().max(50).optional(),
  description: z.string().min(3, "Description must be at least 3 characters").max(500, "Description is too long"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0").max(10000, "Quantity is too high"),
  unit_price: z.number().min(0, "Price cannot be negative").max(1000000, "Price is too high"),
  tax_rate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").optional(),
  responsibility: z.enum(['customer', 'company', 'insurance', 'third_party']),
  notes: z.string().max(1000).optional(),
});

export const custodyDocumentSchema = z.object({
  document_type: z.enum(['customer_acknowledgment', 'incident_report', 'photos', 'police_report', 'insurance_docs', 'handover_checklist', 'signature']),
  document_category: z.enum(['required', 'optional']).default('optional'),
  file: z.instanceof(File).refine((file) => {
    // Max file size: 10MB
    return file.size <= 10 * 1024 * 1024;
  }, "File size must be less than 10MB")
    .refine((file) => {
      // Allowed file types
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      return allowedTypes.includes(file.type);
    }, "Invalid file type. Allowed: PDF, JPEG, PNG, WebP, DOC, DOCX"),
});

// ==========================================
// BUSINESS RULE VALIDATORS
// ==========================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class CustodyValidator {
  /**
   * Validate custody transaction before submission
   */
  static validateForSubmission(custody: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields check
    if (!custody.customer_id) {
      errors.push("Customer is required");
    }

    if (!custody.custodian_type) {
      errors.push("Custodian type is required");
    }

    if (!custody.custodian_name || custody.custodian_name.trim().length === 0) {
      errors.push("Custodian name is required");
    }

    if (!custody.reason_code) {
      errors.push("Reason code is required");
    }

    if (!custody.incident_date) {
      errors.push("Incident date is required");
    }

    if (!custody.effective_from) {
      errors.push("Effective date is required");
    }

    if (!custody.rate_policy) {
      errors.push("Rate policy is required");
    }

    // Replacement vehicle validation
    if (custody.replacement_vehicle_id && !custody.original_vehicle_id) {
      warnings.push("Replacement vehicle specified without an original vehicle");
    }

    // Date validations
    if (custody.effective_from && custody.expected_return_date) {
      const effectiveDate = new Date(custody.effective_from);
      const returnDate = new Date(custody.expected_return_date);
      
      if (returnDate <= effectiveDate) {
        errors.push("Expected return date must be after effective date");
      }

      // Warn if duration is very short
      const durationDays = Math.ceil((returnDate.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24));
      if (durationDays < 1) {
        warnings.push("Custody duration is less than 1 day");
      }

      // Warn if duration is very long
      if (durationDays > 90) {
        warnings.push("Custody duration exceeds 90 days - please verify");
      }
    }

    // Incident date validation
    if (custody.incident_date) {
      const incidentDate = new Date(custody.incident_date);
      const now = new Date();
      
      if (incidentDate > now) {
        errors.push("Incident date cannot be in the future");
      }

      // Warn if incident is very old
      const daysSinceIncident = Math.ceil((now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceIncident > 30) {
        warnings.push(`Incident date is ${daysSinceIncident} days old - please verify`);
      }
    }

    // Special rate code validation
    if (custody.rate_policy === 'special_code' && !custody.special_rate_code) {
      errors.push("Special rate code is required when rate policy is 'special_code'");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate status transition
   */
  static validateStatusTransition(
    currentStatus: CustodyStatus,
    newStatus: CustodyStatus,
    custody: any
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Define valid transitions
    const validTransitions: Record<CustodyStatus, CustodyStatus[]> = {
      draft: ['pending_approval', 'voided'],
      pending_approval: ['approved', 'draft', 'voided'],
      approved: ['active', 'voided'],
      active: ['closed'],
      closed: [],
      voided: [],
    };

    // Check if transition is valid
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`);
      return { valid: false, errors, warnings };
    }

    // Additional validation based on target status
    switch (newStatus) {
      case 'pending_approval':
        // Validate submission requirements
        const submissionValidation = this.validateForSubmission(custody);
        if (!submissionValidation.valid) {
          errors.push(...submissionValidation.errors);
        }
        warnings.push(...submissionValidation.warnings);
        break;

      case 'approved':
        // Check if approval requirements are met
        if (!custody.approved_by) {
          errors.push("Approver information is required");
        }
        break;

      case 'active':
        // Check if replacement vehicle is assigned (if required)
        if (custody.reason_code !== 'maintenance' && !custody.replacement_vehicle_id) {
          warnings.push("No replacement vehicle assigned");
        }
        break;

      case 'closed':
        // Validate closure requirements
        if (!custody.actual_return_date) {
          errors.push("Actual return date is required for closure");
        }

        // Check for unposted charges
        if (custody.hasUnpostedCharges) {
          warnings.push("There are unposted charges - consider posting before closure");
        }
        break;

      case 'voided':
        // Voiding is allowed from most statuses, but warn if active
        if (currentStatus === 'active') {
          warnings.push("Voiding an active custody transaction - ensure proper handover");
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate vehicle eligibility for custody
   */
  static validateVehicleEligibility(vehicle: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!vehicle) {
      errors.push("Vehicle information is required");
      return { valid: false, errors, warnings };
    }

    // Check vehicle status
    if (vehicle.status === 'maintenance') {
      errors.push("Vehicle is currently in maintenance");
    } else if (vehicle.status === 'out_of_service') {
      errors.push("Vehicle is out of service");
    } else if (vehicle.status === 'rented') {
      warnings.push("Vehicle is currently rented - verify availability");
    }

    // Check vehicle condition
    if (vehicle.condition === 'poor' || vehicle.condition === 'damaged') {
      warnings.push(`Vehicle condition is ${vehicle.condition} - may not be suitable for custody`);
    }

    // Check registration/insurance expiry
    if (vehicle.registration_expiry) {
      const expiryDate = new Date(vehicle.registration_expiry);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        errors.push("Vehicle registration has expired");
      } else if (daysUntilExpiry < 30) {
        warnings.push(`Vehicle registration expires in ${daysUntilExpiry} days`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate document requirements based on custody type
   */
  static validateDocumentRequirements(custody: any, documents: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Define required documents by reason
    const requiredDocuments: Record<CustodyReason, string[]> = {
      accident: ['incident_report', 'photos', 'customer_acknowledgment'],
      breakdown: ['incident_report', 'customer_acknowledgment'],
      maintenance: ['customer_acknowledgment'],
      damage: ['incident_report', 'photos', 'customer_acknowledgment'],
      other: ['customer_acknowledgment'],
    };

    const required = requiredDocuments[custody.reason_code as CustodyReason] || [];
    const uploadedTypes = documents.map(d => d.document_type);

    // Check each required document
    for (const docType of required) {
      if (!uploadedTypes.includes(docType)) {
        errors.push(`Required document missing: ${docType.replace('_', ' ')}`);
      }
    }

    // Additional recommendations
    if (custody.reason_code === 'accident' && !uploadedTypes.includes('police_report')) {
      warnings.push("Police report is recommended for accident cases");
    }

    if (custody.damage_preauth_hold && !uploadedTypes.includes('customer_acknowledgment')) {
      warnings.push("Customer acknowledgment recommended when damage hold is applied");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate and validate SLA timelines
   */
  static calculateSLA(custody: any): {
    approveBy: Date;
    handoverBy: Date;
    breached: boolean;
  } {
    const createdAt = new Date(custody.created_at);
    const now = new Date();

    // Default SLA times (in hours)
    const approvalSLA = 4; // 4 hours
    const handoverSLA = 2; // 2 hours after approval

    const approveBy = new Date(createdAt.getTime() + approvalSLA * 60 * 60 * 1000);
    const handoverBy = custody.approved_at
      ? new Date(new Date(custody.approved_at).getTime() + handoverSLA * 60 * 60 * 1000)
      : new Date(approveBy.getTime() + handoverSLA * 60 * 60 * 1000);

    // Check if SLA is breached
    let breached = false;
    if (custody.status === 'pending_approval' && now > approveBy) {
      breached = true;
    } else if (custody.status === 'approved' && now > handoverBy) {
      breached = true;
    }

    return {
      approveBy,
      handoverBy,
      breached,
    };
  }
}

// Export types
export type CustodyTransactionInput = z.infer<typeof custodyTransactionSchema>;
export type CustodyChargeInput = z.infer<typeof custodyChargeSchema>;
export type CustodyDocumentInput = z.infer<typeof custodyDocumentSchema>;

import { describe, it, expect } from 'vitest';
import { CustodyValidator } from '../custody';
import { CustodyStatus } from '@/lib/api/custody';

describe('CustodyValidator', () => {
  describe('validateForSubmission', () => {
    it('should validate required fields', () => {
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: '2025-10-20T10:00:00Z',
        effective_from: '2025-10-20T10:00:00Z',
        rate_policy: 'inherit',
      };

      const result = CustodyValidator.validateForSubmission(custody);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required fields are missing', () => {
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = CustodyValidator.validateForSubmission(custody);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Custodian type is required');
    });

    it('should validate date logic', () => {
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: '2025-10-20T10:00:00Z',
        effective_from: '2025-10-25T10:00:00Z',
        expected_return_date: '2025-10-20T10:00:00Z', // Before effective_from
        rate_policy: 'inherit',
      };

      const result = CustodyValidator.validateForSubmission(custody);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected return date must be after effective date');
    });

    it('should warn about short duration', () => {
      const now = new Date();
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        effective_from: now.toISOString(),
        expected_return_date: new Date(now.getTime() + 1000 * 60 * 60).toISOString(), // 1 hour
        rate_policy: 'inherit',
      };

      const result = CustodyValidator.validateForSubmission(custody);
      expect(result.warnings).toContain('Custody duration is less than 1 day');
    });

    it('should warn about long duration', () => {
      const now = new Date();
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        effective_from: now.toISOString(),
        expected_return_date: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days
        rate_policy: 'inherit',
      };

      const result = CustodyValidator.validateForSubmission(custody);
      expect(result.warnings).toContain('Custody duration exceeds 90 days - please verify');
    });

    it('should validate special rate code requirement', () => {
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: '2025-10-20T10:00:00Z',
        effective_from: '2025-10-20T10:00:00Z',
        rate_policy: 'special_code',
        // Missing special_rate_code
      };

      const result = CustodyValidator.validateForSubmission(custody);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Special rate code is required when rate policy is \'special_code\'');
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid transitions', () => {
      const custody = {
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: '2025-10-20T10:00:00Z',
        effective_from: '2025-10-20T10:00:00Z',
        rate_policy: 'inherit',
      };

      const result = CustodyValidator.validateStatusTransition(
        'draft' as CustodyStatus,
        'pending_approval' as CustodyStatus,
        custody
      );
      expect(result.valid).toBe(true);
    });

    it('should reject invalid transitions', () => {
      const custody = {};

      const result = CustodyValidator.validateStatusTransition(
        'closed' as CustodyStatus,
        'draft' as CustodyStatus,
        custody
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot transition from closed to draft');
    });

    it('should validate closure requirements', () => {
      const custody = {
        status: 'active',
        // Missing actual_return_date
      };

      const result = CustodyValidator.validateStatusTransition(
        'active' as CustodyStatus,
        'closed' as CustodyStatus,
        custody
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Actual return date is required for closure');
    });

    it('should warn about voiding active custody', () => {
      const custody = {
        status: 'active',
      };

      const result = CustodyValidator.validateStatusTransition(
        'active' as CustodyStatus,
        'voided' as CustodyStatus,
        custody
      );
      expect(result.warnings).toContain('Voiding an active custody transaction - ensure proper handover');
    });
  });

  describe('validateVehicleEligibility', () => {
    it('should accept eligible vehicles', () => {
      const vehicle = {
        status: 'available',
        condition: 'excellent',
        registration_expiry: '2026-10-20',
      };

      const result = CustodyValidator.validateVehicleEligibility(vehicle);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject vehicles in maintenance', () => {
      const vehicle = {
        status: 'maintenance',
        condition: 'good',
      };

      const result = CustodyValidator.validateVehicleEligibility(vehicle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vehicle is currently in maintenance');
    });

    it('should reject out of service vehicles', () => {
      const vehicle = {
        status: 'out_of_service',
        condition: 'poor',
      };

      const result = CustodyValidator.validateVehicleEligibility(vehicle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vehicle is out of service');
    });

    it('should warn about expired registration', () => {
      const vehicle = {
        status: 'available',
        condition: 'good',
        registration_expiry: '2020-01-01',
      };

      const result = CustodyValidator.validateVehicleEligibility(vehicle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vehicle registration has expired');
    });

    it('should warn about soon-to-expire registration', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15); // 15 days from now

      const vehicle = {
        status: 'available',
        condition: 'good',
        registration_expiry: futureDate.toISOString().split('T')[0],
      };

      const result = CustodyValidator.validateVehicleEligibility(vehicle);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toMatch(/Vehicle registration expires in \d+ days/);
    });
  });

  describe('validateDocumentRequirements', () => {
    it('should validate required documents for accident', () => {
      const custody = {
        reason_code: 'accident',
      };
      const documents = [
        { document_type: 'incident_report' },
        { document_type: 'photos' },
        { document_type: 'customer_acknowledgment' },
      ];

      const result = CustodyValidator.validateDocumentRequirements(custody, documents);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required documents are missing', () => {
      const custody = {
        reason_code: 'accident',
      };
      const documents = [
        { document_type: 'photos' },
        // Missing incident_report and customer_acknowledgment
      ];

      const result = CustodyValidator.validateDocumentRequirements(custody, documents);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should recommend police report for accidents', () => {
      const custody = {
        reason_code: 'accident',
      };
      const documents = [
        { document_type: 'incident_report' },
        { document_type: 'photos' },
        { document_type: 'customer_acknowledgment' },
        // Missing police_report
      ];

      const result = CustodyValidator.validateDocumentRequirements(custody, documents);
      expect(result.warnings).toContain('Police report is recommended for accident cases');
    });
  });

  describe('calculateSLA', () => {
    it('should calculate SLA timelines', () => {
      const custody = {
        created_at: '2025-10-20T09:00:00Z',
        status: 'pending_approval',
      };

      const sla = CustodyValidator.calculateSLA(custody);
      expect(sla.approveBy).toBeInstanceOf(Date);
      expect(sla.handoverBy).toBeInstanceOf(Date);
      expect(sla.approveBy.getTime()).toBeGreaterThan(new Date(custody.created_at).getTime());
    });

    it('should detect SLA breach for pending approval', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 10); // 10 hours ago

      const custody = {
        created_at: pastDate.toISOString(),
        status: 'pending_approval',
      };

      const sla = CustodyValidator.calculateSLA(custody);
      expect(sla.breached).toBe(true);
    });

    it('should not breach for recent submissions', () => {
      const custody = {
        created_at: new Date().toISOString(),
        status: 'pending_approval',
      };

      const sla = CustodyValidator.calculateSLA(custody);
      expect(sla.breached).toBe(false);
    });
  });
});

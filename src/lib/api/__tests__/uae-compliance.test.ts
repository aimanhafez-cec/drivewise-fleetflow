import { describe, it, expect } from 'vitest';
import {
  calculateFineDiscount,
  formatAED,
  formatAEDArabic,
  getViolationByCode,
  getTollGate,
  calculateBlackPoints,
  checkLicenseSuspension,
  BLACK_POINTS_THRESHOLDS,
} from '@/lib/constants/uae-compliance';

describe('UAE Compliance Utilities', () => {
  describe('calculateFineDiscount', () => {
    it('should return no discount for payments within 60 days', () => {
      const issuedDate = new Date('2025-01-01');
      const paymentDate = new Date('2025-01-30');
      const result = calculateFineDiscount(500, issuedDate, paymentDate);

      expect(result.discount).toBe(0);
      expect(result.hasLateFee).toBe(false);
      expect(result.lateFee).toBe(0);
      expect(result.amount).toBe(500);
    });

    it('should add late fee for payments after 60 days', () => {
      const issuedDate = new Date('2025-01-01');
      const paymentDate = new Date('2025-03-15'); // 73 days later
      const result = calculateFineDiscount(500, issuedDate, paymentDate);

      expect(result.discount).toBe(0);
      expect(result.hasLateFee).toBe(true);
      expect(result.lateFee).toBe(50); // 10% of 500
      expect(result.amount).toBe(550);
    });
  });

  describe('formatAED', () => {
    it('should format amount as AED currency', () => {
      expect(formatAED(1000)).toMatch(/1,000\.00/);
      expect(formatAED(500.5)).toMatch(/500\.50/);
      expect(formatAED(0)).toMatch(/0\.00/);
    });
  });

  describe('formatAEDArabic', () => {
    it('should format amount as AED currency with Arabic locale', () => {
      const formatted = formatAEDArabic(1000);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('1');
    });
  });

  describe('getViolationByCode', () => {
    it('should return violation details for valid code', () => {
      const violation = getViolationByCode('1-001');

      expect(violation).toBeDefined();
      expect(violation?.code).toBe('1-001');
      expect(violation?.category).toBe('speeding');
      expect(violation?.fine_aed).toBe(3000);
      expect(violation?.black_points).toBe(12);
    });

    it('should return undefined for invalid code', () => {
      const violation = getViolationByCode('INVALID');
      expect(violation).toBeUndefined();
    });
  });

  describe('getTollGate', () => {
    it('should return Salik gate details', () => {
      const gate = getTollGate('AL_MAKTOUM_BRIDGE', 'salik');

      expect(gate).toBeDefined();
      expect(gate?.id).toBe('AL_MAKTOUM_BRIDGE');
      expect(gate?.rate).toBe(4);
    });

    it('should return Darb gate details', () => {
      const gate = getTollGate('ABU_DHABI_MUSSAFAH', 'darb');

      expect(gate).toBeDefined();
      expect(gate?.id).toBe('ABU_DHABI_MUSSAFAH');
      expect(gate?.rate).toBe(4);
    });

    it('should return undefined for invalid gate', () => {
      const gate = getTollGate('INVALID_GATE', 'salik');
      expect(gate).toBeUndefined();
    });
  });

  describe('calculateBlackPoints', () => {
    it('should calculate total black points correctly', () => {
      const violations = [
        { code: '1-001' }, // 12 points
        { code: '2-001' }, // 12 points
        { code: '3-002' }, // 0 points
      ];

      const total = calculateBlackPoints(violations);
      expect(total).toBe(24);
    });

    it('should return 0 for empty violations array', () => {
      const total = calculateBlackPoints([]);
      expect(total).toBe(0);
    });

    it('should handle invalid codes gracefully', () => {
      const violations = [{ code: 'INVALID' }];
      const total = calculateBlackPoints(violations);
      expect(total).toBe(0);
    });
  });

  describe('checkLicenseSuspension', () => {
    it('should not suspend for points below warning threshold', () => {
      const result = checkLicenseSuspension(10);

      expect(result.suspended).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it('should warn at warning threshold', () => {
      const result = checkLicenseSuspension(
        BLACK_POINTS_THRESHOLDS.warning
      );

      expect(result.suspended).toBe(false);
      expect(result.reason).toContain('Warning');
    });

    it('should suspend for 3 months at 24 points', () => {
      const result = checkLicenseSuspension(
        BLACK_POINTS_THRESHOLDS.suspension_3_months
      );

      expect(result.suspended).toBe(true);
      expect(result.duration).toBe('3 months');
      expect(result.reason).toContain('24+');
    });

    it('should suspend for 6 months at 48 points', () => {
      const result = checkLicenseSuspension(
        BLACK_POINTS_THRESHOLDS.suspension_6_months
      );

      expect(result.suspended).toBe(true);
      expect(result.duration).toBe('6 months');
      expect(result.reason).toContain('48+');
    });

    it('should cancel license at 72+ points', () => {
      const result = checkLicenseSuspension(
        BLACK_POINTS_THRESHOLDS.license_cancellation
      );

      expect(result.suspended).toBe(true);
      expect(result.duration).toBe('Permanent until renewal');
      expect(result.reason).toContain('72+');
    });
  });
});

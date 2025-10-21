/**
 * UAE-Specific Compliance Constants
 * Includes Salik, RTA, and other emirate-specific data
 */

export const UAE_EMIRATES = [
  { value: 'dubai', label: 'Dubai', label_ar: 'دبي' },
  { value: 'abu_dhabi', label: 'Abu Dhabi', label_ar: 'أبو ظبي' },
  { value: 'sharjah', label: 'Sharjah', label_ar: 'الشارقة' },
  { value: 'ajman', label: 'Ajman', label_ar: 'عجمان' },
  { value: 'umm_al_quwain', label: 'Umm Al Quwain', label_ar: 'أم القيوين' },
  { value: 'ras_al_khaimah', label: 'Ras Al Khaimah', label_ar: 'رأس الخيمة' },
  { value: 'fujairah', label: 'Fujairah', label_ar: 'الفجيرة' },
] as const;

export const ISSUING_AUTHORITIES = [
  // Dubai Authorities
  { value: 'salik', label: 'Salik (Dubai Toll)', label_ar: 'سالك', emirate: 'dubai', type: 'toll' },
  { value: 'rta_dubai', label: 'RTA Dubai', label_ar: 'هيئة الطرق والمواصلات - دبي', emirate: 'dubai', type: 'fine' },
  { value: 'dubai_police', label: 'Dubai Police', label_ar: 'شرطة دبي', emirate: 'dubai', type: 'fine' },
  
  // Abu Dhabi Authorities
  { value: 'darb', label: 'Darb (Abu Dhabi Toll)', label_ar: 'درب', emirate: 'abu_dhabi', type: 'toll' },
  { value: 'abu_dhabi_police', label: 'Abu Dhabi Police', label_ar: 'شرطة أبوظبي', emirate: 'abu_dhabi', type: 'fine' },
  { value: 'dot_abu_dhabi', label: 'DoT Abu Dhabi', label_ar: 'دائرة النقل - أبوظبي', emirate: 'abu_dhabi', type: 'fine' },
  
  // Sharjah Authorities
  { value: 'sharjah_police', label: 'Sharjah Police', label_ar: 'شرطة الشارقة', emirate: 'sharjah', type: 'fine' },
  
  // Federal Authorities
  { value: 'federal_traffic', label: 'Federal Traffic Police', label_ar: 'الشرطة الاتحادية', emirate: 'all', type: 'fine' },
  { value: 'moi', label: 'Ministry of Interior', label_ar: 'وزارة الداخلية', emirate: 'all', type: 'fine' },
] as const;

export const SALIK_GATES = [
  { id: 'AL_MAKTOUM_BRIDGE', name: 'Al Maktoum Bridge', name_ar: 'جسر آل مكتوم', location: 'Deira - Bur Dubai', rate: 4 },
  { id: 'AL_GARHOUD_BRIDGE', name: 'Al Garhoud Bridge', name_ar: 'جسر القرهود', location: 'Deira - Bur Dubai', rate: 4 },
  { id: 'AL_SHINDAGHA_TUNNEL', name: 'Al Shindagha Tunnel', name_ar: 'نفق الشندغة', location: 'Deira - Bur Dubai', rate: 4 },
  { id: 'AL_MAMZAR', name: 'Al Mamzar', name_ar: 'الممزر', location: 'Al Mamzar - Sharjah Border', rate: 4 },
  { id: 'AL_SAFA', name: 'Al Safa', name_ar: 'الصفا', location: 'Jumeirah - Interchange 2', rate: 4 },
  { id: 'BUSINESS_BAY', name: 'Business Bay', name_ar: 'الخليج التجاري', location: 'Business Bay', rate: 4 },
  { id: 'AL_BARSHA', name: 'Al Barsha', name_ar: 'البرشاء', location: 'Sheikh Zayed Road', rate: 4 },
  { id: 'MAI_DUBAI', name: 'Mai Dubai', name_ar: 'مي دبي', location: 'Sheikh Mohammed Bin Zayed Road', rate: 4 },
] as const;

export const DARB_GATES = [
  { id: 'ABU_DHABI_MUSSAFAH', name: 'Abu Dhabi - Mussafah', name_ar: 'أبوظبي - مصفح', location: 'E11', rate: 4 },
  { id: 'ABU_DHABI_AL_FALAH', name: 'Abu Dhabi - Al Falah', name_ar: 'أبوظبي - الفلاح', location: 'E10', rate: 4 },
  { id: 'ABU_DHABI_SHAHAMA', name: 'Abu Dhabi - Shahama', name_ar: 'أبوظبي - شهامة', location: 'E11', rate: 2 },
  { id: 'AL_AIN_BIDA_BIN_SAUD', name: 'Al Ain - Bida Bin Saud', name_ar: 'العين - بدع بن سعود', location: 'E22', rate: 2 },
] as const;

export const RTA_VIOLATION_CODES = [
  // Speeding Violations
  { code: '1-001', category: 'speeding', description: 'Exceeding speed limit by 60 km/h or more', description_ar: 'تجاوز السرعة المحددة بـ 60 كم/س أو أكثر', black_points: 12, fine_aed: 3000 },
  { code: '1-002', category: 'speeding', description: 'Exceeding speed limit by 40-59 km/h', description_ar: 'تجاوز السرعة المحددة بـ 40-59 كم/س', black_points: 6, fine_aed: 2000 },
  { code: '1-003', category: 'speeding', description: 'Exceeding speed limit by 20-39 km/h', description_ar: 'تجاوز السرعة المحددة بـ 20-39 كم/س', black_points: 6, fine_aed: 1500 },
  { code: '1-004', category: 'speeding', description: 'Exceeding speed limit by less than 20 km/h', description_ar: 'تجاوز السرعة المحددة بأقل من 20 كم/س', black_points: 0, fine_aed: 300 },
  
  // Traffic Light Violations
  { code: '2-001', category: 'traffic_signal', description: 'Jumping red light', description_ar: 'تجاوز الإشارة الحمراء', black_points: 12, fine_aed: 1000 },
  { code: '2-002', category: 'traffic_signal', description: 'Not stopping at stop sign', description_ar: 'عدم التوقف عند إشارة قف', black_points: 6, fine_aed: 500 },
  
  // Parking Violations
  { code: '3-001', category: 'parking', description: 'Parking in disabled zone', description_ar: 'الوقوف في منطقة ذوي الإعاقة', black_points: 6, fine_aed: 1000 },
  { code: '3-002', category: 'parking', description: 'Parking in no parking zone', description_ar: 'الوقوف في منطقة ممنوع الوقوف', black_points: 0, fine_aed: 500 },
  { code: '3-003', category: 'parking', description: 'Parking on sidewalk', description_ar: 'الوقوف على الرصيف', black_points: 0, fine_aed: 200 },
  
  // Vehicle Violations
  { code: '4-001', category: 'vehicle', description: 'Driving without registration', description_ar: 'القيادة بدون رخصة مركبة', black_points: 23, fine_aed: 3000 },
  { code: '4-002', category: 'vehicle', description: 'Expired registration', description_ar: 'انتهاء صلاحية رخصة المركبة', black_points: 4, fine_aed: 500 },
  { code: '4-003', category: 'vehicle', description: 'Tinted windows violation', description_ar: 'مخالفة تظليل الزجاج', black_points: 0, fine_aed: 1500 },
  
  // Driver License Violations
  { code: '5-001', category: 'license', description: 'Driving without valid license', description_ar: 'القيادة بدون رخصة قيادة سارية', black_points: 24, fine_aed: 5000 },
  { code: '5-002', category: 'license', description: 'Expired driver license', description_ar: 'انتهاء صلاحية رخصة القيادة', black_points: 0, fine_aed: 400 },
  
  // Dangerous Driving
  { code: '6-001', category: 'dangerous_driving', description: 'Reckless driving', description_ar: 'القيادة المتهورة', black_points: 23, fine_aed: 2000 },
  { code: '6-002', category: 'dangerous_driving', description: 'Sudden swerving', description_ar: 'الانحراف المفاجئ', black_points: 4, fine_aed: 1000 },
  { code: '6-003', category: 'dangerous_driving', description: 'Not maintaining safe distance', description_ar: 'عدم ترك مسافة أمان', black_points: 4, fine_aed: 400 },
  
  // Mobile Phone
  { code: '7-001', category: 'mobile', description: 'Using mobile while driving', description_ar: 'استخدام الهاتف أثناء القيادة', black_points: 4, fine_aed: 800 },
  
  // Seatbelt
  { code: '8-001', category: 'seatbelt', description: 'Not wearing seatbelt', description_ar: 'عدم ربط حزام الأمان', black_points: 4, fine_aed: 400 },
] as const;

export const VIOLATION_CATEGORIES = [
  { value: 'speeding', label: 'Speeding', label_ar: 'تجاوز السرعة' },
  { value: 'traffic_signal', label: 'Traffic Signal', label_ar: 'إشارات المرور' },
  { value: 'parking', label: 'Parking', label_ar: 'الوقوف' },
  { value: 'vehicle', label: 'Vehicle', label_ar: 'المركبة' },
  { value: 'license', label: 'License', label_ar: 'رخصة القيادة' },
  { value: 'dangerous_driving', label: 'Dangerous Driving', label_ar: 'القيادة الخطرة' },
  { value: 'mobile', label: 'Mobile Phone', label_ar: 'الهاتف المحمول' },
  { value: 'seatbelt', label: 'Seatbelt', label_ar: 'حزام الأمان' },
  { value: 'other', label: 'Other', label_ar: 'أخرى' },
] as const;

export const FINE_PAYMENT_METHODS = [
  { value: 'online', label: 'Online Payment', label_ar: 'الدفع الإلكتروني' },
  { value: 'bank_transfer', label: 'Bank Transfer', label_ar: 'تحويل بنكي' },
  { value: 'cash', label: 'Cash Payment', label_ar: 'دفع نقدي' },
  { value: 'credit_card', label: 'Credit Card', label_ar: 'بطاقة ائتمان' },
  { value: 'company_account', label: 'Company Account', label_ar: 'حساب الشركة' },
] as const;

export const BLACK_POINTS_THRESHOLDS = {
  warning: 12,
  suspension_3_months: 24,
  suspension_6_months: 48,
  license_cancellation: 72,
} as const;

/**
 * Calculate penalty discount based on payment timing (UAE rule)
 * - Within 60 days: No discount
 * - After 60 days: No discount, but may incur additional fees
 */
export function calculateFineDiscount(
  fineAmount: number,
  issuedDate: Date,
  paymentDate: Date = new Date()
): { amount: number; discount: number; hasLateFee: boolean; lateFee: number } {
  const daysDifference = Math.floor(
    (paymentDate.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // No discount in UAE, but check for late fees
  let lateFee = 0;
  let hasLateFee = false;

  // Some authorities charge late fees after 60 days
  if (daysDifference > 60) {
    hasLateFee = true;
    lateFee = Math.floor(fineAmount * 0.1); // 10% late fee
  }

  return {
    amount: fineAmount + lateFee,
    discount: 0,
    hasLateFee,
    lateFee,
  };
}

/**
 * Format UAE currency (AED)
 */
export function formatAED(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format UAE currency with Arabic locale
 */
export function formatAEDArabic(amount: number): string {
  return new Intl.NumberFormat('ar-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get violation details by code
 */
export function getViolationByCode(code: string) {
  return RTA_VIOLATION_CODES.find((v) => v.code === code);
}

/**
 * Get toll gate details by ID
 */
export function getTollGate(gateId: string, system: 'salik' | 'darb' = 'salik') {
  const gates = system === 'salik' ? SALIK_GATES : DARB_GATES;
  return gates.find((g) => g.id === gateId);
}

/**
 * Calculate total black points for a driver
 */
export function calculateBlackPoints(violations: Array<{ code: string }>): number {
  return violations.reduce((total, violation) => {
    const details = getViolationByCode(violation.code);
    return total + (details?.black_points || 0);
  }, 0);
}

/**
 * Check if license should be suspended based on black points
 */
export function checkLicenseSuspension(
  blackPoints: number
): {
  suspended: boolean;
  reason?: string;
  reason_ar?: string;
  duration?: string;
} {
  if (blackPoints >= BLACK_POINTS_THRESHOLDS.license_cancellation) {
    return {
      suspended: true,
      reason: 'License Cancellation - 72+ black points',
      reason_ar: 'إلغاء الرخصة - 72 نقطة سوداء أو أكثر',
      duration: 'Permanent until renewal',
    };
  }

  if (blackPoints >= BLACK_POINTS_THRESHOLDS.suspension_6_months) {
    return {
      suspended: true,
      reason: 'License Suspended - 48+ black points',
      reason_ar: 'تعليق الرخصة - 48 نقطة سوداء أو أكثر',
      duration: '6 months',
    };
  }

  if (blackPoints >= BLACK_POINTS_THRESHOLDS.suspension_3_months) {
    return {
      suspended: true,
      reason: 'License Suspended - 24+ black points',
      reason_ar: 'تعليق الرخصة - 24 نقطة سوداء أو أكثر',
      duration: '3 months',
    };
  }

  if (blackPoints >= BLACK_POINTS_THRESHOLDS.warning) {
    return {
      suspended: false,
      reason: 'Warning - Approaching suspension threshold',
      reason_ar: 'تحذير - اقتراب من عتبة التعليق',
    };
  }

  return { suspended: false };
}

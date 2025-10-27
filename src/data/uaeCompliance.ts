export interface ComplianceRule {
  id: string;
  name_en: string;
  name_ar: string;
  category: 'license' | 'insurance' | 'toll' | 'document' | 'age' | 'security';
  required: boolean;
  applies_to: ('uae_resident' | 'tourist' | 'gcc_resident' | 'all')[];
  description_en: string;
  description_ar: string;
  validation_rules?: {
    min_age?: number;
    min_license_validity_months?: number;
    required_documents?: string[];
  };
}

export const uaeComplianceRules: ComplianceRule[] = [
  {
    id: 'uae_driving_license',
    name_en: 'UAE Driving License',
    name_ar: 'رخصة قيادة إماراتية',
    category: 'license',
    required: true,
    applies_to: ['uae_resident'],
    description_en: 'Valid UAE driving license issued by any UAE emirate (Dubai, Abu Dhabi, Sharjah, etc.)',
    description_ar: 'رخصة قيادة إماراتية سارية صادرة من أي إمارة',
    validation_rules: {
      min_license_validity_months: 3,
    },
  },
  {
    id: 'international_driving_permit',
    name_en: 'International Driving Permit (IDP)',
    name_ar: 'رخصة قيادة دولية',
    category: 'license',
    required: true,
    applies_to: ['tourist'],
    description_en: 'Valid IDP along with home country license for tourists',
    description_ar: 'رخصة قيادة دولية سارية مع رخصة بلد الإقامة للسياح',
    validation_rules: {
      min_license_validity_months: 6,
      required_documents: ['passport', 'visa'],
    },
  },
  {
    id: 'gcc_license_recognition',
    name_en: 'GCC License Recognition',
    name_ar: 'الاعتراف برخصة دول الخليج',
    category: 'license',
    required: true,
    applies_to: ['gcc_resident'],
    description_en: 'Valid GCC country driving license (Saudi, Kuwait, Bahrain, Oman, Qatar)',
    description_ar: 'رخصة قيادة سارية من دول مجلس التعاون الخليجي',
  },
  {
    id: 'emirates_id',
    name_en: 'Emirates ID Verification',
    name_ar: 'التحقق من الهوية الإماراتية',
    category: 'document',
    required: true,
    applies_to: ['uae_resident'],
    description_en: 'Valid Emirates ID for UAE residents',
    description_ar: 'هوية إماراتية سارية للمقيمين في الإمارات',
  },
  {
    id: 'passport_visa',
    name_en: 'Passport & Visa',
    name_ar: 'جواز السفر والتأشيرة',
    category: 'document',
    required: true,
    applies_to: ['tourist'],
    description_en: 'Valid passport with UAE tourist or visit visa',
    description_ar: 'جواز سفر ساري مع تأشيرة سياحية أو زيارة للإمارات',
    validation_rules: {
      required_documents: ['passport', 'visa_stamp'],
    },
  },
  {
    id: 'minimum_insurance',
    name_en: 'Minimum Insurance Coverage',
    name_ar: 'الحد الأدنى من التغطية التأمينية',
    category: 'insurance',
    required: true,
    applies_to: ['all'],
    description_en: 'Third-party liability insurance (minimum AED 1,000,000 coverage)',
    description_ar: 'تأمين المسؤولية تجاه الطرف الثالث (تغطية لا تقل عن مليون درهم)',
  },
  {
    id: 'cdw_insurance',
    name_en: 'Collision Damage Waiver (CDW)',
    name_ar: 'تنازل عن أضرار التصادم',
    category: 'insurance',
    required: false,
    applies_to: ['all'],
    description_en: 'Optional insurance to reduce liability in case of vehicle damage',
    description_ar: 'تأمين اختياري لتقليل المسؤولية في حالة تلف السيارة',
  },
  {
    id: 'salik_toll',
    name_en: 'Salik (Toll) Charges',
    name_ar: 'رسوم سالك',
    category: 'toll',
    required: true,
    applies_to: ['all'],
    description_en: 'AED 4 per toll gate passage (automatic detection)',
    description_ar: 'درهم 4 لكل بوابة سالك (كشف تلقائي)',
  },
  {
    id: 'minimum_age',
    name_en: 'Minimum Age Requirement',
    name_ar: 'الحد الأدنى للعمر',
    category: 'age',
    required: true,
    applies_to: ['all'],
    description_en: 'Minimum 21 years old (25 for luxury/sports vehicles)',
    description_ar: 'الحد الأدنى 21 سنة (25 للسيارات الفاخرة/الرياضية)',
    validation_rules: {
      min_age: 21,
    },
  },
  {
    id: 'security_deposit',
    name_en: 'Security Deposit',
    name_ar: 'مبلغ الضمان',
    category: 'security',
    required: true,
    applies_to: ['all'],
    description_en: 'Refundable security deposit blocked on credit card',
    description_ar: 'مبلغ ضمان قابل للاسترداد محجوز على بطاقة الائتمان',
  },
  {
    id: 'traffic_fines',
    name_en: 'Traffic Fine Responsibility',
    name_ar: 'مسؤولية المخالفات المرورية',
    category: 'security',
    required: true,
    applies_to: ['all'],
    description_en: 'Customer responsible for all traffic fines during rental period',
    description_ar: 'العميل مسؤول عن جميع المخالفات المرورية خلال فترة الإيجار',
  },
  {
    id: 'police_clearance',
    name_en: 'Police Clearance',
    name_ar: 'براءة ذمة من الشرطة',
    category: 'document',
    required: false,
    applies_to: ['all'],
    description_en: 'Required for rentals longer than 30 days',
    description_ar: 'مطلوب للإيجارات أكثر من 30 يوماً',
  },
];

export const getApplicableRules = (customerType: 'uae_resident' | 'tourist' | 'gcc_resident'): ComplianceRule[] => {
  return uaeComplianceRules.filter(rule => 
    rule.applies_to.includes('all') || rule.applies_to.includes(customerType)
  );
};

export const validateCompliance = (
  customerType: 'uae_resident' | 'tourist' | 'gcc_resident',
  customerAge: number,
  licenseValidityMonths: number,
  rentalDurationDays: number,
  vehicleCategory: string
): { valid: boolean; violations: string[]; warnings: string[] } => {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Age validation
  const minAge = vehicleCategory.toLowerCase().includes('luxury') || 
                 vehicleCategory.toLowerCase().includes('sport') ? 25 : 21;
  
  if (customerAge < minAge) {
    violations.push(`Minimum age ${minAge} required for ${vehicleCategory}`);
  }
  
  // License validity
  const rules = getApplicableRules(customerType);
  const licenseRule = rules.find(r => r.category === 'license');
  
  if (licenseRule?.validation_rules?.min_license_validity_months) {
    if (licenseValidityMonths < licenseRule.validation_rules.min_license_validity_months) {
      violations.push(`License must be valid for at least ${licenseRule.validation_rules.min_license_validity_months} months`);
    }
  }
  
  // Police clearance for long-term
  if (rentalDurationDays > 30) {
    warnings.push('Police clearance certificate required for rentals exceeding 30 days');
  }
  
  return {
    valid: violations.length === 0,
    violations,
    warnings,
  };
};

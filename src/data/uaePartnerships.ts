export interface Partnership {
  id: string;
  name: string;
  type: 'corporate' | 'tourism' | 'hotel' | 'government' | 'retail';
  discount_percentage: number;
  discount_code_prefix: string;
  min_rental_days?: number;
  max_discount_amount?: number;
  applicable_vehicle_categories?: string[];
  requires_verification: boolean;
  verification_method?: 'employee_id' | 'emirates_id' | 'hotel_booking' | 'membership_card';
  is_active: boolean;
  description_en: string;
  description_ar: string;
  commission_percentage?: number;
}

export const uaePartnerships: Partnership[] = [
  // Corporate Free Zones
  {
    id: 'dmcc',
    name: 'DMCC (Dubai Multi Commodities Centre)',
    type: 'corporate',
    discount_percentage: 15,
    discount_code_prefix: 'DMCC',
    min_rental_days: 3,
    max_discount_amount: 500,
    requires_verification: true,
    verification_method: 'employee_id',
    is_active: true,
    description_en: 'Special discount for DMCC employees and registered companies',
    description_ar: 'خصم خاص لموظفي وشركات مركز دبي للسلع المتعددة',
  },
  {
    id: 'difc',
    name: 'DIFC (Dubai International Financial Centre)',
    type: 'corporate',
    discount_percentage: 15,
    discount_code_prefix: 'DIFC',
    min_rental_days: 3,
    max_discount_amount: 500,
    requires_verification: true,
    verification_method: 'employee_id',
    is_active: true,
    description_en: 'Exclusive rates for DIFC community members',
    description_ar: 'أسعار حصرية لأعضاء مجتمع مركز دبي المالي العالمي',
  },
  {
    id: 'tecom',
    name: 'TECOM Group',
    type: 'corporate',
    discount_percentage: 12,
    discount_code_prefix: 'TECOM',
    min_rental_days: 2,
    max_discount_amount: 400,
    requires_verification: true,
    verification_method: 'employee_id',
    is_active: true,
    description_en: 'Corporate discount for TECOM Group employees',
    description_ar: 'خصم مؤسسي لموظفي مجموعة تيكوم',
  },
  {
    id: 'jafza',
    name: 'Jebel Ali Free Zone (JAFZA)',
    type: 'corporate',
    discount_percentage: 12,
    discount_code_prefix: 'JAFZA',
    min_rental_days: 3,
    requires_verification: true,
    verification_method: 'employee_id',
    is_active: true,
    description_en: 'Special rates for JAFZA companies',
    description_ar: 'أسعار خاصة لشركات منطقة جبل علي الحرة',
  },
  
  // Tourism Partnerships
  {
    id: 'dubai_tourism',
    name: 'Dubai Tourism',
    type: 'tourism',
    discount_percentage: 10,
    discount_code_prefix: 'DTOUR',
    applicable_vehicle_categories: ['Economy', 'Compact', 'Mid-size SUV'],
    requires_verification: false,
    is_active: true,
    description_en: 'Tourism promotion discount for visitors',
    description_ar: 'خصم ترويج سياحي للزوار',
  },
  {
    id: 'visit_abudhabi',
    name: 'Visit Abu Dhabi',
    type: 'tourism',
    discount_percentage: 10,
    discount_code_prefix: 'VAUH',
    requires_verification: false,
    is_active: true,
    description_en: 'Special offer for Abu Dhabi tourists',
    description_ar: 'عرض خاص لسياح أبوظبي',
  },
  
  // Hotel Partnerships
  {
    id: 'burj_al_arab',
    name: 'Burj Al Arab',
    type: 'hotel',
    discount_percentage: 20,
    discount_code_prefix: 'BAA',
    min_rental_days: 2,
    requires_verification: true,
    verification_method: 'hotel_booking',
    commission_percentage: 8,
    is_active: true,
    description_en: 'VIP rates for Burj Al Arab guests',
    description_ar: 'أسعار كبار الشخصيات لنزلاء برج العرب',
  },
  {
    id: 'atlantis',
    name: 'Atlantis The Palm',
    type: 'hotel',
    discount_percentage: 18,
    discount_code_prefix: 'ATP',
    min_rental_days: 2,
    requires_verification: true,
    verification_method: 'hotel_booking',
    commission_percentage: 8,
    is_active: true,
    description_en: 'Premium discount for Atlantis guests',
    description_ar: 'خصم متميز لنزلاء أتلانتس النخلة',
  },
  {
    id: 'jumeirah_hotels',
    name: 'Jumeirah Hotels & Resorts',
    type: 'hotel',
    discount_percentage: 15,
    discount_code_prefix: 'JUM',
    requires_verification: true,
    verification_method: 'hotel_booking',
    commission_percentage: 7,
    is_active: true,
    description_en: 'Preferred rates for Jumeirah guests',
    description_ar: 'أسعار مفضلة لنزلاء فنادق جميرا',
  },
  
  // Government & Retail
  {
    id: 'emirates_id',
    name: 'UAE Nationals',
    type: 'government',
    discount_percentage: 20,
    discount_code_prefix: 'UAEN',
    requires_verification: true,
    verification_method: 'emirates_id',
    is_active: true,
    description_en: 'Special discount for UAE nationals',
    description_ar: 'خصم خاص لمواطني دولة الإمارات',
  },
  {
    id: 'dubai_mall',
    name: 'The Dubai Mall',
    type: 'retail',
    discount_percentage: 8,
    discount_code_prefix: 'DMALL',
    min_rental_days: 1,
    requires_verification: false,
    is_active: true,
    description_en: 'Mall partnership discount',
    description_ar: 'خصم شراكة المول',
  },
];

export const validatePartnershipDiscount = (
  partnershipId: string,
  rentalDays: number,
  vehicleCategory: string,
  verificationProvided: boolean
): { valid: boolean; error?: string; discount: number } => {
  const partnership = uaePartnerships.find(p => p.id === partnershipId);
  
  if (!partnership) {
    return { valid: false, error: 'Invalid partnership code', discount: 0 };
  }
  
  if (!partnership.is_active) {
    return { valid: false, error: 'Partnership is currently inactive', discount: 0 };
  }
  
  if (partnership.requires_verification && !verificationProvided) {
    return { 
      valid: false, 
      error: `Verification required: ${partnership.verification_method}`, 
      discount: 0 
    };
  }
  
  if (partnership.min_rental_days && rentalDays < partnership.min_rental_days) {
    return { 
      valid: false, 
      error: `Minimum ${partnership.min_rental_days} days rental required`, 
      discount: 0 
    };
  }
  
  if (partnership.applicable_vehicle_categories && 
      !partnership.applicable_vehicle_categories.includes(vehicleCategory)) {
    return { 
      valid: false, 
      error: 'This vehicle category is not eligible for this discount', 
      discount: 0 
    };
  }
  
  return {
    valid: true,
    discount: partnership.discount_percentage,
  };
};

export const calculatePartnershipDiscount = (
  baseAmount: number,
  partnershipId: string
): number => {
  const partnership = uaePartnerships.find(p => p.id === partnershipId);
  
  if (!partnership) return 0;
  
  const discount = (baseAmount * partnership.discount_percentage) / 100;
  
  if (partnership.max_discount_amount) {
    return Math.min(discount, partnership.max_discount_amount);
  }
  
  return discount;
};

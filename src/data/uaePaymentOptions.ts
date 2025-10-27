export interface PaymentOption {
  id: string;
  name_en: string;
  name_ar: string;
  type: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'installment';
  provider?: string;
  icon: string;
  processing_fee_percentage: number;
  min_amount?: number;
  max_amount?: number;
  supported_currencies: string[];
  is_active: boolean;
  description_en: string;
  description_ar: string;
}

export const uaePaymentOptions: PaymentOption[] = [
  {
    id: 'cash_on_delivery',
    name_en: 'Cash on Delivery',
    name_ar: 'الدفع نقداً عند الاستلام',
    type: 'cash',
    icon: '💵',
    processing_fee_percentage: 0,
    supported_currencies: ['AED', 'USD'],
    is_active: true,
    description_en: 'Pay with cash when you pick up the vehicle',
    description_ar: 'ادفع نقداً عند استلام السيارة',
  },
  {
    id: 'credit_card',
    name_en: 'Credit Card',
    name_ar: 'بطاقة ائتمان',
    type: 'card',
    provider: 'Network International',
    icon: '💳',
    processing_fee_percentage: 2.5,
    supported_currencies: ['AED', 'USD', 'EUR', 'GBP'],
    is_active: true,
    description_en: 'Visa, Mastercard, American Express accepted',
    description_ar: 'نقبل فيزا، ماستركارد، أمريكان إكسبريس',
  },
  {
    id: 'debit_card',
    name_en: 'Debit Card',
    name_ar: 'بطاقة خصم',
    type: 'card',
    provider: 'Network International',
    icon: '💳',
    processing_fee_percentage: 1.5,
    supported_currencies: ['AED', 'USD'],
    is_active: true,
    description_en: 'Local and international debit cards',
    description_ar: 'بطاقات الخصم المحلية والدولية',
  },
  {
    id: 'apple_pay',
    name_en: 'Apple Pay',
    name_ar: 'أبل باي',
    type: 'digital_wallet',
    provider: 'Apple',
    icon: '🍎',
    processing_fee_percentage: 2.0,
    supported_currencies: ['AED', 'USD'],
    is_active: true,
    description_en: 'Fast and secure payment with Apple Pay',
    description_ar: 'دفع سريع وآمن مع أبل باي',
  },
  {
    id: 'google_pay',
    name_en: 'Google Pay',
    name_ar: 'جوجل باي',
    type: 'digital_wallet',
    provider: 'Google',
    icon: '🔵',
    processing_fee_percentage: 2.0,
    supported_currencies: ['AED', 'USD'],
    is_active: true,
    description_en: 'Quick checkout with Google Pay',
    description_ar: 'دفع سريع مع جوجل باي',
  },
  {
    id: 'bank_transfer',
    name_en: 'Bank Transfer',
    name_ar: 'تحويل بنكي',
    type: 'bank_transfer',
    icon: '🏦',
    processing_fee_percentage: 0,
    min_amount: 1000,
    supported_currencies: ['AED'],
    is_active: true,
    description_en: 'Direct bank transfer (1-2 business days)',
    description_ar: 'تحويل بنكي مباشر (1-2 يوم عمل)',
  },
  {
    id: 'paytabs',
    name_en: 'PayTabs',
    name_ar: 'باي تابس',
    type: 'card',
    provider: 'PayTabs',
    icon: '💳',
    processing_fee_percentage: 2.85,
    supported_currencies: ['AED', 'USD', 'SAR'],
    is_active: true,
    description_en: 'Secure payment gateway for MENA region',
    description_ar: 'بوابة دفع آمنة لمنطقة الشرق الأوسط',
  },
  {
    id: 'installment_3',
    name_en: '3 Monthly Installments',
    name_ar: 'تقسيط على 3 أشهر',
    type: 'installment',
    provider: 'Tabby',
    icon: '📅',
    processing_fee_percentage: 3.5,
    min_amount: 1000,
    max_amount: 50000,
    supported_currencies: ['AED'],
    is_active: true,
    description_en: 'Split payment into 3 interest-free installments',
    description_ar: 'قسط المبلغ على 3 دفعات بدون فوائد',
  },
  {
    id: 'installment_6',
    name_en: '6 Monthly Installments',
    name_ar: 'تقسيط على 6 أشهر',
    type: 'installment',
    provider: 'Tabby',
    icon: '📅',
    processing_fee_percentage: 4.5,
    min_amount: 3000,
    max_amount: 100000,
    supported_currencies: ['AED'],
    is_active: true,
    description_en: 'Split payment into 6 monthly installments',
    description_ar: 'قسط المبلغ على 6 دفعات شهرية',
  },
];

export const getAvailablePaymentOptions = (amount: number, currency: string = 'AED') => {
  return uaePaymentOptions.filter(option => {
    if (!option.is_active) return false;
    if (!option.supported_currencies.includes(currency)) return false;
    if (option.min_amount && amount < option.min_amount) return false;
    if (option.max_amount && amount > option.max_amount) return false;
    return true;
  });
};

export const calculateProcessingFee = (amount: number, paymentOptionId: string): number => {
  const option = uaePaymentOptions.find(opt => opt.id === paymentOptionId);
  if (!option) return 0;
  return (amount * option.processing_fee_percentage) / 100;
};

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'ar';
type CalendarType = 'gregorian' | 'hijri';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  calendarType: CalendarType;
  setCalendarType: (type: CalendarType) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const translations = {
  en: {
    'leads.title': 'Leads Intake Center',
    'leads.subtitle': 'Centralized inquiry management from all channels',
    'leads.new': 'New',
    'leads.contacted': 'Contacted',
    'leads.quoted': 'Quoted',
    'leads.confirmed': 'Confirmed',
    'leads.rejected': 'Rejected',
    'leads.expired': 'Expired',
    'leads.search': 'Search by lead ID, name, email, phone...',
    'leads.filters.status': 'Status',
    'leads.filters.source': 'Source type',
    'leads.filters.priority': 'Priority',
    'leads.stats.total': 'Total Leads Today',
    'leads.stats.pending': 'Pending Confirmation',
    'leads.stats.confirmed': 'Confirmed Today',
    'leads.stats.conversion': 'Conversion Rate',
    'customer.name': 'Full Name',
    'customer.email': 'Email Address',
    'customer.phone': 'Phone Number',
    'customer.nationality': 'Nationality',
    'customer.language': 'Language Preference',
    'vehicle.category': 'Vehicle Category',
    'vehicle.pickup': 'Pickup',
    'vehicle.return': 'Return',
    'vehicle.duration': 'Rental Duration',
    'pricing.base': 'Base Rate',
    'pricing.addons': 'Available Add-ons',
    'pricing.vat': 'VAT (5%)',
    'pricing.total': 'Estimated Total',
    'actions.confirm': 'Confirm Lead',
    'actions.quote': 'Send Quote',
    'actions.reject': 'Reject',
    'actions.assign': 'Assign Agent',
    'actions.email': 'Email',
    'actions.call': 'Call',
    'actions.whatsapp': 'WhatsApp',
    'payment.cash': 'Cash on Delivery',
    'payment.card': 'Credit/Debit Card',
    'payment.applepay': 'Apple Pay',
    'payment.googlepay': 'Google Pay',
    'payment.bank': 'Bank Transfer',
    'compliance.license': 'UAE Driving License Required',
    'compliance.emirates_id': 'Emirates ID Verification',
    'compliance.insurance': 'Insurance Coverage',
    'compliance.salik': 'Salik (Toll) Charges Apply',
  },
  ar: {
    'leads.title': 'مركز استقبال العملاء المحتملين',
    'leads.subtitle': 'إدارة مركزية للاستفسارات من جميع القنوات',
    'leads.new': 'جديد',
    'leads.contacted': 'تم الاتصال',
    'leads.quoted': 'تم تقديم عرض',
    'leads.confirmed': 'مؤكد',
    'leads.rejected': 'مرفوض',
    'leads.expired': 'منتهي الصلاحية',
    'leads.search': 'البحث برقم العميل، الاسم، البريد الإلكتروني، الهاتف...',
    'leads.filters.status': 'الحالة',
    'leads.filters.source': 'نوع المصدر',
    'leads.filters.priority': 'الأولوية',
    'leads.stats.total': 'إجمالي العملاء اليوم',
    'leads.stats.pending': 'في انتظار التأكيد',
    'leads.stats.confirmed': 'مؤكد اليوم',
    'leads.stats.conversion': 'معدل التحويل',
    'customer.name': 'الاسم الكامل',
    'customer.email': 'البريد الإلكتروني',
    'customer.phone': 'رقم الهاتف',
    'customer.nationality': 'الجنسية',
    'customer.language': 'تفضيل اللغة',
    'vehicle.category': 'فئة السيارة',
    'vehicle.pickup': 'الاستلام',
    'vehicle.return': 'الإرجاع',
    'vehicle.duration': 'مدة الإيجار',
    'pricing.base': 'السعر الأساسي',
    'pricing.addons': 'الإضافات المتاحة',
    'pricing.vat': 'ضريبة القيمة المضافة (5%)',
    'pricing.total': 'الإجمالي المقدر',
    'actions.confirm': 'تأكيد العميل',
    'actions.quote': 'إرسال عرض',
    'actions.reject': 'رفض',
    'actions.assign': 'تعيين موظف',
    'actions.email': 'بريد إلكتروني',
    'actions.call': 'اتصال',
    'actions.whatsapp': 'واتساب',
    'payment.cash': 'الدفع نقداً عند الاستلام',
    'payment.card': 'بطاقة ائتمان/خصم',
    'payment.applepay': 'أبل باي',
    'payment.googlepay': 'جوجل باي',
    'payment.bank': 'تحويل بنكي',
    'compliance.license': 'رخصة قيادة إماراتية مطلوبة',
    'compliance.emirates_id': 'التحقق من الهوية الإماراتية',
    'compliance.insurance': 'تغطية تأمينية',
    'compliance.salik': 'رسوم سالك (الطرق المدفوعة) تطبق',
  },
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [calendarType, setCalendarType] = useState<CalendarType>('gregorian');

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    const savedCalendar = localStorage.getItem('calendarType') as CalendarType;
    
    if (savedLocale) setLocaleState(savedLocale);
    if (savedCalendar) setCalendarType(savedCalendar);
  }, []);

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    
    // Update body class for RTL styling
    if (locale === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const setCalendarTypeWithPersist = (type: CalendarType) => {
    setCalendarType(type);
    localStorage.setItem('calendarType', type);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        calendarType,
        setCalendarType: setCalendarTypeWithPersist,
        isRTL: locale === 'ar',
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};

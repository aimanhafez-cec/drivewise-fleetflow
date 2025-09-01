import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredLabel } from '@/components/ui/required-label';
import { FormError } from '@/components/ui/form-error';
import { ErrorSummary } from '@/components/ui/error-summary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Check, Plus, Trash2, Edit, Copy, Car, User, Plane, DollarSign, FileText, Shield, CreditCard, Users, Calculator } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockApi, DropdownOption, Customer, ReservationFormData, PriceList } from '@/lib/api/reservations';
import { useReservationSummary } from '@/hooks/useReservationSummary';
import { SummaryCard } from '@/components/reservation/SummaryCard';
import { ReservationLineGrid } from '@/components/reservation/ReservationLineGrid';
import { AddLineValidation, validateAddLine, ValidationError } from '@/components/reservation/AddLineValidation';
import { PrefillChips } from '@/components/reservation/PrefillChips';
import { EnhancedDriverPicker } from '@/components/reservation/EnhancedDriverPicker';
import { ConditionalVehicleSelector } from '@/components/reservation/ConditionalVehicleSelector';
import { VehicleClassSelect, LocationSelect, CustomerSelect } from '@/components/ui/select-components';
import { usePricingContext, calculateLinePrice, PricingContext } from '@/hooks/usePricingContext';
import { RepriceBanner } from '@/components/reservation/RepriceBanner';
import { useFormValidation, ValidationRules } from '@/hooks/useFormValidation';
import { useReservationValidation } from '@/hooks/useReservationValidation';
import { BillToSelector, BillToData, BillToType, BillToMeta } from '@/components/ui/bill-to-selector';
import { useVehicles, useVehicleCategories, formatVehicleDisplay } from '@/hooks/useVehicles';
import { Driver } from '@/hooks/useDrivers';
import { availableAddOns, categorizeAddOns, calculateAddOnCost, addOnCategories } from '@/lib/constants/addOns';
const STORAGE_KEY = 'new-reservation-draft';

// Extended interfaces for new sections
export interface ReservationLine {
  id: string;
  lineNo: number;
  reservationTypeId: string;
  vehicleClassId: string;
  vehicleId: string;
  drivers: Array<{
    driverId: string;
    role: 'PRIMARY' | 'ADDITIONAL';
    addlDriverFee?: number;
  }>;
  outAt: Date | null;
  outLocationId: string;
  inAt: Date | null;
  inLocationId: string;
  checkOutDate: Date | null;
  checkInDate: Date | null;
  lineNetPrice: number;
  additionAmount: number;
  discountId: string;
  discountValue: number;
  taxId: string;
  taxValue: number;
  lineTotal: number;
  selected: boolean;
  additions: any[];
  discounts: any[];
  priceSource?: 'panel' | 'pricelist';
}
interface ExtendedFormData extends ReservationFormData {
  // Reservation Lines
  reservationLines: ReservationLine[];

  // Vehicle & Driver
  vehicleClassId: string;
  vehicleId: string;
  checkOutDate: Date | null;
  checkOutLocationId: string;
  checkInDate: Date | null;
  checkInLocationId: string;
  drivers: Driver[];

  // Airport Information
  enableAirportInfo: boolean;
  arrivalFlightNo: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalZipCode: string;
  arrivalDateTime: Date | null;
  arrivalAirline: string;
  arrivalPassengers: number;
  departureFlightNo: string;
  departureAirport: string;
  departureCity: string;
  departureZipCode: string;
  departureDateTime: Date | null;
  departureAirline: string;
  departurePassengers: number;

  // Rate & Taxes
  priceListId: string;
  promotionCode: string;
  hourlyRate: number;
  hourlyQty: number;
  weeklyRate: number;
  weeklyQty: number;
  dailyRate: number;
  dailyQty: number;
  monthlyRate: number;
  monthlyQty: number;
  totalVehiclePrice: number;
  kilometerCharge: number;
  dailyKilometerAllowed: number;
  totalDays: number;
  totalKilometerAllowed: number;

  // Miscellaneous Charges (Add-ons)
  selectedMiscCharges: string[];
  addOnCharges: Record<string, number>;

  // Bill To
  bill_to_type: BillToType;
  bill_to_id: string | null;
  bill_to_display: string;
  payment_terms_id: string;
  billing_address_id?: string | null;
  bill_to_meta?: BillToMeta;

  // Notes
  note: string;
  specialNote: string;

  // Insurance
  insuranceLevelId: string;
  insuranceGroupId: string;
  insuranceProviderId: string;

  // Adjustments & Deposits
  preAdjustment: number;
  advancePayment: number;
  paymentMethodId: string;
  securityDepositPaid: number;
  depositMethodId: string;
  depositPaymentMethodId: string;
  cancellationCharges: number;

  // Referral Information - Loyalty Program
  referralCustomerId: string;
  referralCode: string;

  // Additional rental information fields
  reservationMethodId: string;
  reservationTypeId: string;
  businessUnitId: string;
  paymentTermsId: string;
  validityDateTo: Date | null;
  customerBillToId: string;
  discountTypeId: string;
  discountValue: number;
  contractBillingPlanId: string;
  taxLevelId: string;
  leaseToOwn: boolean;
}
const NewReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<ExtendedFormData>({
    // Original fields
    reservationNo: null,
    entryDate: new Date(),
    reservationMethodId: '',
    currencyCode: 'AED',
    reservationTypeId: '',
    businessUnitId: '',
    customerId: '',
    billToId: '',
    customerBillToId: '',
    paymentTermsId: '',
    validityDateTo: null,
    discountTypeId: '',
    discountValue: 0,
    contractBillingPlanId: '',
    taxLevelId: '',
    leaseToOwn: false,
    // Extended fields
    reservationLines: [],
    vehicleClassId: '',
    vehicleId: '',
    checkOutDate: null,
    checkOutLocationId: '',
    checkInDate: null,
    checkInLocationId: '',
    drivers: [],
    enableAirportInfo: false,
    arrivalFlightNo: '',
    arrivalAirport: '',
    arrivalCity: '',
    arrivalZipCode: '',
    arrivalDateTime: null,
    arrivalAirline: '',
    arrivalPassengers: 0,
    departureFlightNo: '',
    departureAirport: '',
    departureCity: '',
    departureZipCode: '',
    departureDateTime: null,
    departureAirline: '',
    departurePassengers: 0,
    priceListId: '',
    promotionCode: '',
    hourlyRate: 0,
    hourlyQty: 0,
    weeklyRate: 0,
    weeklyQty: 0,
    dailyRate: 0,
    dailyQty: 0,
    monthlyRate: 0,
    monthlyQty: 0,
    totalVehiclePrice: 0,
    kilometerCharge: 0,
    dailyKilometerAllowed: 0,
    totalDays: 0,
    totalKilometerAllowed: 0,
    selectedMiscCharges: [],
    addOnCharges: {},
    bill_to_type: 'CUSTOMER',
    bill_to_id: null,
    bill_to_display: '',
    payment_terms_id: '',
    bill_to_meta: {},
    note: '',
    specialNote: '',
    insuranceLevelId: '',
    insuranceGroupId: '',
    insuranceProviderId: '',
    preAdjustment: 0,
    advancePayment: 0,
    paymentMethodId: '',
    securityDepositPaid: 0,
    depositMethodId: '',
    depositPaymentMethodId: '',
    cancellationCharges: 0,
    // Referral Information - Loyalty Program
    referralCustomerId: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState({
    currencies: false,
    reservationMethods: false,
    reservationTypes: false,
    businessUnits: false,
    customers: false,
    billTo: false,
    paymentTerms: false,
    discountTypes: false,
    discounts: false,
    contractBillingPlans: false,
    taxLevels: false,
    taxCodes: false,
    priceLists: false,
    initialData: false,
    saving: false
  });
  const [options, setOptions] = useState<{
    currencies: DropdownOption[];
    reservationMethods: DropdownOption[];
    reservationTypes: DropdownOption[];
    businessUnits: DropdownOption[];
    customers: Customer[];
    billTo: DropdownOption[];
    paymentTerms: DropdownOption[];
    discountTypes: DropdownOption[];
    discounts: DropdownOption[];
    contractBillingPlans: DropdownOption[];
    taxLevels: DropdownOption[];
    taxCodes: DropdownOption[];
    priceLists: DropdownOption[];
  }>({
    currencies: [],
    reservationMethods: [],
    reservationTypes: [],
    businessUnits: [],
    customers: [],
    billTo: [],
    paymentTerms: [],
    discountTypes: [],
    discounts: [],
    contractBillingPlans: [],
    taxLevels: [],
    taxCodes: [],
    priceLists: []
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({});
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [addLineErrors, setAddLineErrors] = useState<ValidationError[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
  const [showRepriceBanner, setShowRepriceBanner] = useState(false);
  const [lastPricingHash, setLastPricingHash] = useState('');

  // Fetch real vehicle and category data
  const {
    data: vehicles,
    isLoading: vehiclesLoading
  } = useVehicles();
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useVehicleCategories();

  // Prefill data for Add Line functionality
  const getPrefillData = () => ({
    reservationTypeId: formData.reservationTypeId,
    vehicleClassId: formData.vehicleClassId,
    vehicleId: formData.vehicleId,
    checkOutDate: formData.checkOutDate,
    checkOutLocationId: formData.checkOutLocationId,
    checkInDate: formData.checkInDate,
    checkInLocationId: formData.checkInLocationId,
    priceListId: formData.priceListId,
    promotionCode: formData.promotionCode
  });
  const isPrefillComplete = () => {
    const prefill = getPrefillData();
    // Allow adding vehicles with just vehicle class (no specific vehicle required)
    return !!(prefill.vehicleClassId && prefill.checkOutDate && prefill.checkOutLocationId && prefill.checkInDate && prefill.checkInLocationId && prefill.checkOutDate < prefill.checkInDate);
  };

  // State for accordion sections - All collapsed by default
  const [accordionValues, setAccordionValues] = useState<string[]>([]);

  // Check if we're editing an existing reservation
  const editData = location.state?.editData;

  // Auto-populate form with existing reservation data
  useEffect(() => {
    if (editData) {
      setFormData(prev => ({
        ...prev,
        customerId: editData.customerId || '',
        businessUnitId: editData.businessUnit || '',
        paymentTermsId: editData.paymentTerms || '',
        validityDateTo: editData.validityDate || ''
      }));

      // Convert and set reservation lines if they exist
      if (editData.lines && editData.lines.length > 0) {
        const convertedLines: ReservationLine[] = editData.lines.map((line: any, index: number) => ({
          id: line.id || (index + 1).toString(),
          lineNo: index + 1,
          reservationTypeId: line.reservationType || '',
          vehicleClassId: line.vehicleClass || '',
          vehicleId: line.vehicle || '',
          driverName: line.driverName || '',
          checkOutLocationId: '',
          checkInLocationId: '',
          checkOutDate: line.checkOutDate ? new Date(line.checkOutDate) : null,
          checkInDate: line.checkInDate ? new Date(line.checkInDate) : null,
          lineNetPrice: line.lineNetPrice || 0,
          taxValue: line.taxValue || 0,
          lineTotal: line.lineTotal || 0,
          licenseNumber: '',
          checkOutTime: '09:00',
          checkInTime: '17:00',
          vehicleTypeId: '',
          vehicleLocationId: '',
          ratePlanId: '',
          currencyCode: 'AED',
          discountTypeId: '',
          discountValue: line.discountValue || 0,
          taxLevelId: '',
          taxCodeId: '',
          taxLevel: line.tax || '',
          taxCode: '',
          priceListId: '',
          reservationMethod: '',
          vehicleMake: '',
          vehicleModel: '',
          vehicleType: '',
          vehicleLocation: '',
          rateType: '',
          selectedDriverId: '',
          hourlyRate: 0,
          hourlyQty: 0,
          weeklyRate: 0,
          weeklyQty: 0,
          dailyRate: 0,
          dailyQty: 0,
          monthlyRate: 0,
          monthlyQty: 0,
          kilometerCharge: 0,
          totalVehiclePrice: 0,
          dailyKilometerAllowed: 0,
          totalDays: 0,
          totalKilometerAllowed: 0,
          promotionCode: '',
          miscCharges: [],
          netPrice: line.lineNetPrice || 0,
          discount: '',
          tax: line.tax || '',
          total: line.lineTotal || 0
        }));
        setFormData(prev => ({
          ...prev,
          reservationLines: convertedLines
        }));
      }
      toast({
        title: "Editing Reservation",
        description: `Loaded data from reservation ${editData.reservationNo || 'Unknown'}`
      });
    }
  }, [editData, toast]);

  // Auto-open reservation lines section when prefill is complete
  useEffect(() => {
    if (isPrefillComplete() && !accordionValues.includes('reservation-lines')) {
      setAccordionValues(prev => [...prev, 'reservation-lines']);
    }
  }, [formData.vehicleClassId, formData.vehicleId, formData.checkOutDate, formData.checkInDate]);

  // Calculate total days when check-in/check-out dates change
  useEffect(() => {
    if (formData.checkOutDate && formData.checkInDate) {
      const totalHours = Math.ceil((formData.checkInDate.getTime() - formData.checkOutDate.getTime()) / (1000 * 60 * 60));
      const totalDays = Math.ceil(totalHours / 24);
      updateFormData('totalDays', totalDays);

      // Recalculate add-on charges based on new total days
      if (formData.selectedMiscCharges && formData.selectedMiscCharges.length > 0) {
        const newCharges: Record<string, number> = {};
        formData.selectedMiscCharges.forEach(addOnId => {
          const addOn = availableAddOns.find(a => a.id === addOnId);
          if (addOn) {
            newCharges[addOnId] = calculateAddOnCost(addOn, totalDays);
          }
        });
        updateFormData('addOnCharges', newCharges);
      }
    }
  }, [formData.checkOutDate, formData.checkInDate]);

  // Monitor pricing context changes to show reprice banner
  useEffect(() => {
    const pricingHash = JSON.stringify({
      priceListId: formData.priceListId,
      promotionCode: formData.promotionCode,
      hourlyRate: formData.hourlyRate,
      dailyRate: formData.dailyRate,
      weeklyRate: formData.weeklyRate,
      monthlyRate: formData.monthlyRate,
      kilometerCharge: formData.kilometerCharge,
      dailyKilometerAllowed: formData.dailyKilometerAllowed
    });
    if (lastPricingHash && lastPricingHash !== pricingHash && formData.reservationLines.length > 0) {
      setShowRepriceBanner(true);
    }
    setLastPricingHash(pricingHash);
  }, [formData.priceListId, formData.promotionCode, formData.hourlyRate, formData.dailyRate, formData.weeklyRate, formData.monthlyRate, formData.kilometerCharge, formData.dailyKilometerAllowed, formData.reservationLines.length]);

  // Use comprehensive validation system
  const validation = useReservationValidation();

  // Field labels for error mapping
  const fieldLabels = {
    'header.entryDate': 'Reservation Entry Date',
    'header.reservationMethodId': 'Reservation Method',
    'header.currencyCode': 'Currency',
    'header.reservationTypeId': 'Reservation Type',
    'header.businessUnitId': 'Business Unit',
    'header.customerId': 'Customer Name',
    'header.paymentTermsId': 'Payment Terms',
    'header.priceListId': 'Price List',
    'header.validityDateTo': 'Validity Date To',
    'header.taxLevelId': 'Tax Level',
    'header.billingCustomerName': 'Billing Customer Name',
    'header.billingMail': 'Billing Email',
    'header.billingPhone': 'Billing Phone',
    'header.billingAddress': 'Billing Address',
    'header.arrivalFlightNo': 'Arrival Flight Number',
    'header.arrivalDateTime': 'Arrival Date & Time',
    'header.arrivalAirline': 'Arrival Airline',
    'header.departureFlightNo': 'Departure Flight Number',
    'header.departureDateTime': 'Departure Date & Time',
    'header.departureAirline': 'Departure Airline',
    'header.insuranceLevel': 'Insurance Level',
    'header.insuranceProvider': 'Insurance Provider',
    'header.paymentMethod': 'Payment Method',
    'header.depositMethod': 'Deposit Method',
    'header.depositPaymentMethod': 'Deposit Payment Method',
    'header.benefitType': 'Benefit Type',
    'header.benefitValue': 'Benefit Value',
    'lines': 'Reservation Lines'
  };

  // Use the new summary hook and pricing context
  const summary = useReservationSummary(formData);
  const selectedCustomer = options.customers.find(c => c.id === formData.customerId);
  const pricingContext = usePricingContext({
    priceListId: formData.priceListId,
    promotionCode: formData.promotionCode,
    hourlyRate: formData.hourlyRate,
    dailyRate: formData.dailyRate,
    weeklyRate: formData.weeklyRate,
    monthlyRate: formData.monthlyRate,
    kilometerCharge: formData.kilometerCharge,
    dailyKilometerAllowed: formData.dailyKilometerAllowed
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  const loadInitialData = async () => {
    // Set currency to only AED
    setOptions(prev => ({
      ...prev,
      currencies: [{
        id: 'AED',
        label: 'AED - Arab Emirates Dirahm',
        value: 'AED'
      }]
    }));

    // Set AED as default currency
    setFormData(prev => ({
      ...prev,
      currencyCode: 'AED'
    }));
    const loadTasks = [{
      key: 'reservationMethods',
      fn: mockApi.getReservationMethods
    }, {
      key: 'reservationTypes',
      fn: mockApi.getReservationTypes
    }, {
      key: 'businessUnits',
      fn: mockApi.getBusinessUnits
    }, {
      key: 'paymentTerms',
      fn: mockApi.getPaymentTerms
    }, {
      key: 'discountTypes',
      fn: mockApi.getDiscountTypes
    }, {
      key: 'contractBillingPlans',
      fn: mockApi.getContractBillingPlans
    }, {
      key: 'taxLevels',
      fn: mockApi.getTaxLevels
    }, {
      key: 'priceLists',
      fn: mockApi.getPriceLists
    } // Added price lists
    ];
    await Promise.all(loadTasks.map(async ({
      key,
      fn
    }) => {
      setLoading(prev => ({
        ...prev,
        [key]: true
      }));
      try {
        const data = await fn();
        setOptions(prev => ({
          ...prev,
          [key]: data
        }));
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
      } finally {
        setLoading(prev => ({
          ...prev,
          [key]: false
        }));
      }
    }));

    // Load customers separately
    searchCustomers('');
  };
  const searchCustomers = async (query: string) => {
    setLoading(prev => ({
      ...prev,
      customers: true
    }));
    try {
      const customers = await mockApi.searchCustomers(query);
      setOptions(prev => ({
        ...prev,
        customers
      }));
    } catch (error) {
      console.error('Failed to search customers:', error);
    } finally {
      setLoading(prev => ({
        ...prev,
        customers: false
      }));
    }
  };

  // Load tax codes when tax level changes
  useEffect(() => {
    const loadTaxCodes = async () => {
      if (formData.taxLevelId) {
        setLoading(prev => ({
          ...prev,
          taxCodes: true
        }));
        try {
          const taxCodes = await mockApi.getTaxCodes(formData.taxLevelId);
          setOptions(prev => ({
            ...prev,
            taxCodes
          }));
        } catch (error) {
          console.error('Failed to load tax codes:', error);
        } finally {
          setLoading(prev => ({
            ...prev,
            taxCodes: false
          }));
        }
      } else {
        // Clear tax codes when no tax level is selected
        setOptions(prev => ({
          ...prev,
          taxCodes: []
        }));
      }
    };
    loadTaxCodes();
  }, [formData.taxLevelId]);
  const updateFormData = (field: keyof ExtendedFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field as keyof ReservationFormData]) {
      setErrors(prev => ({
        ...prev,
        [field as keyof ReservationFormData]: undefined
      }));
    }
  };

  // Handle price list selection and auto-fill rates
  const handlePriceListChange = async (priceListId: string) => {
    updateFormData('priceListId', priceListId);
    if (priceListId) {
      try {
        const rates = await mockApi.getPriceListRates(priceListId);
        if (rates) {
          // Auto-fill the rate fields with price list data
          updateFormData('hourlyRate', rates.hourly);
          updateFormData('dailyRate', rates.daily);
          updateFormData('weeklyRate', rates.weekly);
          updateFormData('monthlyRate', rates.monthly);
          updateFormData('kilometerCharge', rates.kilometerCharge);
          updateFormData('dailyKilometerAllowed', rates.dailyKilometerAllowed);
          console.log('✅ Auto-filled rates from price list:', {
            priceListId,
            rates
          });
          toast({
            title: "Rates Auto-filled",
            description: `Rates have been loaded from ${options.priceLists.find(p => p.id === priceListId)?.label || 'price list'} and can be edited.`
          });
        }
      } catch (error) {
        console.error('Failed to load price list rates:', error);
        toast({
          title: "Error",
          description: "Failed to load price list rates.",
          variant: "destructive"
        });
      }
    }
  };

  // Helper functions
  const addReservationLine = () => {
    console.log('addReservationLine called');
    console.log('isPrefillComplete():', isPrefillComplete());
    if (!isPrefillComplete()) {
      toast({
        title: "Incomplete Information",
        description: "Please complete vehicle and date information before adding a line.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const validationErrors = validateAddLine(formData);
    if (validationErrors.length > 0) {
      setAddLineErrors(validationErrors);
      return;
    }

    // Clear any previous errors
    setAddLineErrors([]);

    // Calculate pricing using pricing context - only use fallbacks if no panel rates are set
    const priceResult = calculateLinePrice(pricingContext, formData.checkOutDate!, formData.checkInDate!,
    // Only use fallback rates if all panel rates are null/undefined
    !pricingContext.hourly && !pricingContext.daily && !pricingContext.weekly && !pricingContext.monthly ? {
      hourly: 25,
      // fallback rates from price list
      daily: 50,
      weekly: 300,
      monthly: 1200
    } : undefined);
    let basePrice = priceResult.lineNetPrice;

    // Apply driver-related charges
    const driverLineData = selectedDrivers.map(driver => ({
      driverId: driver.id,
      role: driver.role || 'ADDITIONAL',
      addlDriverFee: driver.role === 'ADDITIONAL' ? 15.00 : 0 // $15 per additional driver
    }));

    // Add additional driver fees to base price
    const additionalDriverFees = driverLineData.reduce((sum, driver) => sum + (driver.addlDriverFee || 0), 0);
    basePrice += additionalDriverFees;

    // Add underage driver fees if applicable
    const underageFees = selectedDrivers.reduce((sum, driver) => {
      if (driver.date_of_birth) {
        const age = new Date().getFullYear() - new Date(driver.date_of_birth).getFullYear();
        return sum + (age < 25 ? 20.00 : 0); // $20 underage fee
      }
      return sum;
    }, 0);
    basePrice += underageFees;
    const taxValue = basePrice * 0.1; // 10% tax
    const lineTotal = basePrice + taxValue;
    const newLine: ReservationLine = {
      id: Date.now().toString(),
      lineNo: (formData.reservationLines || []).length + 1,
      reservationTypeId: formData.reservationTypeId || 'standard',
      vehicleClassId: formData.vehicleClassId || '',
      vehicleId: formData.vehicleId || '',
      drivers: driverLineData,
      outAt: formData.checkOutDate,
      outLocationId: formData.checkOutLocationId,
      inAt: formData.checkInDate,
      inLocationId: formData.checkInLocationId,
      checkOutDate: formData.checkOutDate,
      checkInDate: formData.checkInDate,
      lineNetPrice: basePrice,
      additionAmount: 0,
      discountId: '',
      discountValue: 0,
      taxId: 'standard',
      taxValue: taxValue,
      lineTotal: lineTotal,
      selected: false,
      additions: [],
      discounts: [],
      priceSource: priceResult.source
    };
    setFormData(prev => ({
      ...prev,
      reservationLines: [...(prev.reservationLines || []), newLine]
    }));

    // Reset editor with smart defaults
    setFormData(prev => ({
      ...prev,
      vehicleId: ''
    }));
    setSelectedDrivers([]);

    // Show success toast
    const driverCount = selectedDrivers.length;
    toast({
      title: "Line added",
      description: `Line #${newLine.lineNo} added with ${driverCount} driver(s). ${priceResult.source === 'panel' ? '(from Rate & Taxes)' : '(from Price List)'}`
    });
  };
  const handleRepriceLines = () => {
    setFormData(prev => ({
      ...prev,
      reservationLines: prev.reservationLines.map(line => {
        if (line.checkOutDate && line.checkInDate) {
          const priceResult = calculateLinePrice(pricingContext, line.checkOutDate, line.checkInDate,
          // Only use fallback rates if all panel rates are null/undefined
          !pricingContext.hourly && !pricingContext.daily && !pricingContext.weekly && !pricingContext.monthly ? {
            hourly: 25,
            daily: 50,
            weekly: 300,
            monthly: 1200
          } : undefined);
          const newLineNetPrice = priceResult.lineNetPrice;
          const newTaxValue = newLineNetPrice * 0.1;
          const newLineTotal = newLineNetPrice + newTaxValue;
          return {
            ...line,
            lineNetPrice: newLineNetPrice,
            taxValue: newTaxValue,
            lineTotal: newLineTotal,
            priceSource: priceResult.source
          };
        }
        return line;
      })
    }));
    setShowRepriceBanner(false);
    toast({
      title: "Lines repriced",
      description: "All reservation lines have been updated with new rates."
    });
  };
  const handleLineUpdate = (lineId: string, updates: Partial<ReservationLine>) => {
    setFormData(prev => ({
      ...prev,
      reservationLines: prev.reservationLines.map(line => line.id === lineId ? {
        ...line,
        ...updates,
        // Recalculate totals if price changed
        lineTotal: updates.lineNetPrice !== undefined ? (updates.lineNetPrice || 0) + (updates.taxValue || line.taxValue || 0) : line.lineTotal
      } : line)
    }));
  };
  const handleLineRemove = (lineId: string) => {
    setFormData(prev => ({
      ...prev,
      reservationLines: prev.reservationLines.filter(line => line.id !== lineId).map((line, index) => ({
        ...line,
        lineNo: index + 1
      })) // Renumber lines
    }));
    setSelectedLines(prev => prev.filter(id => id !== lineId));
  };
  const handleLineDuplicate = (lineId: string) => {
    const lineToDuplicate = formData.reservationLines.find(line => line.id === lineId);
    if (lineToDuplicate) {
      const newLine: ReservationLine = {
        ...lineToDuplicate,
        id: Date.now().toString(),
        lineNo: formData.reservationLines.length + 1,
        vehicleId: '',
        // Clear vehicle for new selection
        drivers: [],
        // Clear drivers
        selected: false
      };
      setFormData(prev => ({
        ...prev,
        reservationLines: [...prev.reservationLines, newLine]
      }));
      toast({
        title: "Line duplicated",
        description: `Line #${newLine.lineNo} has been created as a copy.`
      });
    }
  };

  // Auto-populate header fields from reservation lines
  const populateHeaderFromLines = () => {
    if (!formData.reservationLines || formData.reservationLines.length === 0) {
      return;
    }
    const firstLine = formData.reservationLines[0];
    const updatedFormData: Partial<ExtendedFormData> = {};

    // Auto-populate from first line if not already set
    if (!formData.reservationTypeId && firstLine.reservationTypeId) {
      updatedFormData.reservationTypeId = firstLine.reservationTypeId;
    }

    // Set smart defaults for required fields if not already set
    if (!formData.reservationMethodId && options.reservationMethods.length > 0) {
      // Default to first available method (e.g., "walk-in")
      updatedFormData.reservationMethodId = options.reservationMethods[0].id;
    }
    if (!formData.businessUnitId && options.businessUnits.length > 0) {
      // Default to first business unit
      updatedFormData.businessUnitId = options.businessUnits[0].id;
    }
    if (!formData.paymentTermsId && options.paymentTerms.length > 0) {
      // Default to first payment terms (e.g., "prepaid")
      updatedFormData.paymentTermsId = options.paymentTerms[0].id;
    }
    if (!formData.priceListId && options.priceLists.length > 0) {
      // Default to first price list
      updatedFormData.priceListId = options.priceLists[0].id;
    }
    if (!formData.taxLevelId && options.taxLevels.length > 0) {
      // Default to first tax level
      updatedFormData.taxLevelId = options.taxLevels[0].id;
    }

    // Set validity date from first line's check-in date if not set
    if (!formData.validityDateTo && firstLine.checkInDate) {
      updatedFormData.validityDateTo = firstLine.checkInDate;
    }

    // Update form data if we have changes
    if (Object.keys(updatedFormData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...updatedFormData
      }));
      return updatedFormData;
    }
    return null;
  };

  // Validate form data before saving
  const validateBeforeSave = (status: 'DRAFT' | 'ACTIVE') => {
    if (status === 'DRAFT') return {
      success: true,
      errors: []
    };

    // Auto-populate header fields from reservation lines before validation
    const autoPopulatedData = populateHeaderFromLines();

    // Use current form data plus any auto-populated data for validation
    const currentFormData = autoPopulatedData ? {
      ...formData,
      ...autoPopulatedData
    } : formData;

    // Prepare data for validation
    const validationData = {
      header: {
        entryDate: currentFormData.entryDate,
        reservationMethodId: currentFormData.reservationMethodId,
        currencyCode: currentFormData.currencyCode,
        reservationTypeId: currentFormData.reservationTypeId,
        businessUnitId: currentFormData.businessUnitId,
        customerId: currentFormData.customerId,
        paymentTermsId: currentFormData.paymentTermsId,
        priceListId: currentFormData.priceListId,
        validityDateTo: currentFormData.validityDateTo,
        taxLevelId: currentFormData.taxLevelId,
        bill_to_type: currentFormData.bill_to_type,
        bill_to_id: currentFormData.bill_to_id,
        bill_to_display: currentFormData.bill_to_display,
        bill_to_meta: currentFormData.bill_to_meta,
        arrivalFlightNo: currentFormData.arrivalFlightNo,
        arrivalDateTime: currentFormData.arrivalDateTime,
        arrivalAirline: currentFormData.arrivalAirline,
        departureFlightNo: currentFormData.departureFlightNo,
        departureDateTime: currentFormData.departureDateTime,
        departureAirline: currentFormData.departureAirline,
        insuranceLevel: currentFormData.insuranceLevelId,
        insuranceProvider: currentFormData.insuranceProviderId,
        advancePayment: currentFormData.advancePayment,
        paymentMethod: currentFormData.paymentMethodId,
        securityDepositPaid: currentFormData.securityDepositPaid,
        depositMethod: currentFormData.depositMethodId,
        depositPaymentMethod: currentFormData.depositPaymentMethodId,
        referralCustomer: currentFormData.referralCustomerId,
        referralCode: currentFormData.referralCode
      },
      lines: currentFormData.reservationLines?.map(line => ({
        vehicleClassId: line.vehicleClassId,
        vehicleId: line.vehicleId,
        checkOutDate: line.checkOutDate,
        checkOutLocationId: line.outLocationId,
        checkInDate: line.checkInDate,
        checkInLocationId: line.inLocationId
      })) || []
    };
    return validation.validateForm(validationData);
  };
  const handleSave = async (status: 'DRAFT' | 'ACTIVE') => {
    setLoading(prev => ({
      ...prev,
      saving: true
    }));
    try {
      // Check if we have reservation lines for active reservations
      if (status === 'ACTIVE' && (!formData.reservationLines || formData.reservationLines.length === 0)) {
        toast({
          title: "No Reservation Lines",
          description: "Please add at least one reservation line before saving",
          variant: "destructive"
        });
        setLoading(prev => ({
          ...prev,
          saving: false
        }));
        return;
      }

      // Auto-populate header fields from reservation lines for active status
      if (status === 'ACTIVE') {
        const autoPopulatedData = populateHeaderFromLines();
        if (autoPopulatedData && Object.keys(autoPopulatedData).length > 0) {
          toast({
            title: "Auto-populated Fields",
            description: "Some header fields were automatically filled from your reservation lines"
          });
        }
      }

      // Validate form after auto-population
      const validationResult = validateBeforeSave(status);
      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: "Please correct the errors before continuing",
          variant: "destructive"
        });
        return;
      }

      // Create idempotency key
      const idempotencyKey = `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Mock API call to create reservation
      const response = await mockApi.createReservation(formData, status);
      if (response.id) {
        toast({
          title: status === 'DRAFT' ? "Draft Saved" : "Reservation Created",
          description: status === 'DRAFT' ? "Your reservation draft has been saved." : `Reservation ${response.reservationNo} has been created successfully.`
        });

        // Clear draft from localStorage if successfully created as ACTIVE
        if (status === 'ACTIVE') {
          localStorage.removeItem(STORAGE_KEY);
          // Navigate to reservation details page
          navigate(`/reservations/${response.id}?created=1`);
        }
      } else {
        throw new Error('Failed to save reservation');
      }
    } catch (error: any) {
      console.error('Save error:', error);

      // Handle structured validation errors from server
      if (error.status === 422 && error.errors) {
        validation.applyServerErrors(error.errors);
        toast({
          title: "Validation Error",
          description: "Please correct the errors highlighted below",
          variant: "destructive"
        });
      } else if (error.status === 409) {
        toast({
          title: "Conflict Error",
          description: "Vehicle not available for selected dates",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save reservation. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(prev => ({
        ...prev,
        saving: false
      }));
    }
  };
  const addDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      label: '',
      full_name: '',
      license_no: '',
      phone: '',
      email: '',
      date_of_birth: '',
      license_expiry: '',
      status: 'active',
      additional_driver_fee: 25.00
    };
    setSelectedDrivers(prev => [...prev, newDriver]);
  };

  // Handle validate now functionality
  const handleValidateNow = () => {
    const validationData = {
      header: {
        entryDate: formData.entryDate,
        reservationMethodId: formData.reservationMethodId,
        currencyCode: formData.currencyCode,
        reservationTypeId: formData.reservationTypeId,
        businessUnitId: formData.businessUnitId,
        customerId: formData.customerId,
        paymentTermsId: formData.paymentTermsId,
        priceListId: formData.priceListId,
        validityDateTo: formData.validityDateTo,
        taxLevelId: formData.taxLevelId,
        bill_to_type: formData.bill_to_type,
        bill_to_id: formData.bill_to_id,
        bill_to_display: formData.bill_to_display,
        bill_to_meta: formData.bill_to_meta,
        arrivalFlightNo: formData.arrivalFlightNo,
        arrivalDateTime: formData.arrivalDateTime,
        arrivalAirline: formData.arrivalAirline,
        departureFlightNo: formData.departureFlightNo,
        departureDateTime: formData.departureDateTime,
        departureAirline: formData.departureAirline,
        insuranceLevel: formData.insuranceLevelId,
        insuranceProvider: formData.insuranceProviderId,
        advancePayment: formData.advancePayment,
        paymentMethod: formData.paymentMethodId,
        securityDepositPaid: formData.securityDepositPaid,
        depositMethod: formData.depositMethodId,
        depositPaymentMethod: formData.depositPaymentMethodId,
        referralCustomer: formData.referralCustomerId,
        referralCode: formData.referralCode
      },
      lines: formData.reservationLines?.map(line => ({
        vehicleClassId: line.vehicleClassId,
        vehicleId: line.vehicleId,
        checkOutDate: line.checkOutDate,
        checkOutLocationId: line.outLocationId,
        checkInDate: line.checkInDate,
        checkInLocationId: line.inLocationId
      })) || []
    };
    validation.validateForm(validationData);
  };
  return <div className="flex flex-col lg:flex-row gap-6 h-full white-cards-page" data-page="new-reservation">
      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0 overflow-y-auto">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/reservations">Reservations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>New</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Reservation</h1>
          <p className="text-sm mt-2 text-foreground">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Error Summary */}
        {validation.hasErrors && <div id="error-summary">
            <ErrorSummary errors={validation.validationErrors} fieldLabels={fieldLabels} onFieldFocus={validation.focusField} />
          </div>}

        {/* Validation Actions */}
        <div className="flex justify-between items-center">
          <Button id="btn-validate" variant="outline" onClick={handleValidateNow} className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Validate Now
          </Button>
        </div>

        {/* Accordion Sections - REORDERED */}
        <Accordion type="multiple" value={[...accordionValues, ...validation.expandedAccordions]} onValueChange={setAccordionValues} className="space-y-4">
          
          {/* 1) Rental Information */}
          <AccordionItem value="rental-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold text-foreground">Rental Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Reservation No. */}
                <div className="space-y-2">
                  <Label htmlFor="reservationNo" className="text-foreground">Reservation no.</Label>
                  <Input id="reservationNo" value={formData.reservationNo || ''} disabled placeholder="Auto-generated on save" className="bg-muted text-white placeholder:text-white/70" />
                </div>

                {/* Entry Date */}
                <div className="space-y-2">
                  <Label className="text-foreground">Reservation Entry Date <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-foreground", !formData.entryDate && "text-foreground", errors.entryDate && "border-destructive")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.entryDate ? format(formData.entryDate, "PPP") : <span>Pick entry date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={formData.entryDate} onSelect={date => updateFormData('entryDate', date || new Date())} initialFocus />
                    </PopoverContent>
                  </Popover>
                  {errors.entryDate && <p className="text-sm text-destructive">{errors.entryDate}</p>}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="text-foreground">Currency <span className="text-destructive">*</span></Label>
                  {loading.currencies ? <Skeleton className="h-10 w-full" /> : <Select value={formData.currencyCode} onValueChange={value => updateFormData('currencyCode', value)}>
                      <SelectTrigger className={errors.currencyCode ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.currencies.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                  {errors.currencyCode && <p className="text-sm text-destructive">{errors.currencyCode}</p>}
                </div>

                {/* Customer - with search */}
                <div className="space-y-2">
                  <Label className="text-foreground">Customer <span className="text-destructive">*</span></Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={customerSearchOpen} className={cn("w-full justify-between text-foreground", !formData.customerId && "text-foreground", errors.customerId && "border-destructive")}>
                        {formData.customerId ? options.customers.find(customer => customer.id === formData.customerId)?.name : "Select customer..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search customers..." value={customerSearchQuery} onValueChange={value => {
                        setCustomerSearchQuery(value);
                        searchCustomers(value);
                      }} />
                        <CommandList>
                          <CommandEmpty>
                            {loading.customers ? "Loading..." : "No customers found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {options.customers.map(customer => <CommandItem key={customer.id} value={customer.id} onSelect={() => {
                            updateFormData('customerId', customer.id);
                            setCustomerSearchOpen(false);
                            setCustomerSearchQuery('');
                          }}>
                                <Check className={cn("mr-2 h-4 w-4", formData.customerId === customer.id ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                  <span className="font-medium">{customer.name}</span>
                                  <span className="text-sm text-foreground">{customer.email}</span>
                                </div>
                              </CommandItem>)}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.customerId && <p className="text-sm text-destructive">{errors.customerId}</p>}
                </div>

                {/* Reservation Method */}
                <div className="space-y-2">
                  <RequiredLabel>Reservation Method</RequiredLabel>
                  {loading.reservationMethods ? <Skeleton className="h-10 w-full" /> : <Select value={formData.reservationMethodId} onValueChange={value => updateFormData('reservationMethodId', value)}>
                      <SelectTrigger className={validation.getFieldError('header.reservationMethodId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.reservationMethods.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                  <FormError message={validation.getFieldError('header.reservationMethodId')} />
                </div>

                {/* Reservation Type */}
                <div className="space-y-2">
                  <RequiredLabel>Reservation Type</RequiredLabel>
                  {loading.reservationTypes ? <Skeleton className="h-10 w-full" /> : <Select value={formData.reservationTypeId} onValueChange={value => updateFormData('reservationTypeId', value)}>
                      <SelectTrigger className={validation.getFieldError('header.reservationTypeId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.reservationTypes.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                  <FormError message={validation.getFieldError('header.reservationTypeId')} />
                </div>

                {/* Business Unit */}
                <div className="space-y-2">
                  <RequiredLabel>Business Unit</RequiredLabel>
                  {loading.businessUnits ? <Skeleton className="h-10 w-full" /> : <Select value={formData.businessUnitId} onValueChange={value => updateFormData('businessUnitId', value)}>
                      <SelectTrigger className={validation.getFieldError('header.businessUnitId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select business unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.businessUnits.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                  <FormError message={validation.getFieldError('header.businessUnitId')} />
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <RequiredLabel>Payment Terms</RequiredLabel>
                  {loading.paymentTerms ? <Skeleton className="h-10 w-full" /> : <Select value={formData.paymentTermsId} onValueChange={value => updateFormData('paymentTermsId', value)}>
                      <SelectTrigger className={validation.getFieldError('header.paymentTermsId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.paymentTerms.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                  <FormError message={validation.getFieldError('header.paymentTermsId')} />
                </div>

                {/* Validity Date To */}
                <div className="space-y-2">
                  <Label className="text-foreground">Validity Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-foreground", !formData.validityDateTo && "text-foreground", validation.getFieldError('header.validityDateTo') && "border-destructive")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.validityDateTo ? format(formData.validityDateTo, "PPP") : <span>Select validity date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={formData.validityDateTo} onSelect={date => updateFormData('validityDateTo', date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormError message={validation.getFieldError('header.validityDateTo')} />
                </div>

                {/* Customer Bill To */}
                

                {/* Discount Type */}
                <div className="space-y-2">
                  <Label className="text-foreground">Discount Type</Label>
                  {loading.discountTypes ? <Skeleton className="h-10 w-full" /> : <Select value={formData.discountTypeId} onValueChange={value => updateFormData('discountTypeId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.discountTypes.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <Label className="text-foreground">Discount Value</Label>
                  <Input type="number" value={formData.discountValue || ''} onChange={e => updateFormData('discountValue', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                </div>

                {/* Contract Billing Plan */}
                <div className="space-y-2">
                  <Label className="text-foreground">Contract Billing Plan</Label>
                  {loading.contractBillingPlans ? <Skeleton className="h-10 w-full" /> : <Select value={formData.contractBillingPlanId} onValueChange={value => updateFormData('contractBillingPlanId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.contractBillingPlans.map(option => <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>}
                </div>

                {/* Tax Level */}
                <div className="space-y-2">
                  <Label className="text-foreground">Tax Level</Label>
                  {loading.taxLevels ? <Skeleton className="h-10 w-full" /> : <Select value={formData.taxLevelId} onValueChange={value => updateFormData('taxLevelId', value)}>
                      <SelectTrigger className={validation.getFieldError('header.taxLevelId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select tax level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-vat-standard">5% VAT – Standard Rental & Add-ons</SelectItem>
                        <SelectItem value="no-vat-deposit">No VAT – Security Deposit (Refundable)</SelectItem>
                        <SelectItem value="5-vat-forfeited">5% VAT – Forfeited Deposit / Damage Charges</SelectItem>
                        <SelectItem value="5-vat-tolls">5% VAT – Tolls, Late Fees, Extra Charges</SelectItem>
                        <SelectItem value="exempt-transport">Exempt – Domestic Passenger Transport (Taxi, Bus, etc.)</SelectItem>
                        <SelectItem value="0-vat-exports">0% VAT – International Exports / Cross-border Transport</SelectItem>
                      </SelectContent>
                    </Select>}
                  <FormError message={validation.getFieldError('header.taxLevelId')} />
                </div>

                {/* Tax Code */}
                {/* Lease to Own */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="lease-to-own" checked={formData.leaseToOwn || false} onCheckedChange={checked => updateFormData('leaseToOwn', checked)} />
                    <Label htmlFor="lease-to-own" className="text-foreground">Lease to Own</Label>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2) Bill To */}
          <AccordionItem value="billing" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="font-semibold text-foreground">Bill To</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <BillToSelector value={{
              bill_to_type: formData.bill_to_type,
              bill_to_id: formData.bill_to_id,
              bill_to_display: formData.bill_to_display,
              payment_terms_id: formData.payment_terms_id,
              billing_address_id: formData.billing_address_id,
              bill_to_meta: formData.bill_to_meta
            }} onChange={billToData => {
              updateFormData('bill_to_type', billToData.bill_to_type);
              updateFormData('bill_to_id', billToData.bill_to_id);
              updateFormData('bill_to_display', billToData.bill_to_display);
              updateFormData('payment_terms_id', billToData.payment_terms_id);
              updateFormData('billing_address_id', billToData.billing_address_id);
              updateFormData('bill_to_meta', billToData.bill_to_meta);
            }} errors={validation.getFieldsWithPrefix('bill_to')} currentCustomerId={formData.customerId} currentCustomerName={selectedCustomer?.name} />
            </AccordionContent>
          </AccordionItem>

          {/* 3) Vehicle & Driver */}
          <AccordionItem value="vehicles-drivers" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span className="font-semibold text-foreground">Vehicle & Driver</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Tabs defaultValue="vehicles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vehicles" className="text-slate-950">Vehicle Information</TabsTrigger>
                  <TabsTrigger value="drivers">Driver Information</TabsTrigger>
                </TabsList>
                
                <TabsContent value="vehicles" className="space-y-6">
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {/* Dates */}
                    <div className="space-y-2">
                      <Label className="text-foreground">Check Out Date <span className="text-destructive">*</span></Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-foreground", !formData.checkOutDate && "text-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : <span>Pick check out date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={formData.checkOutDate} onSelect={date => {
                          updateFormData('checkOutDate', date);
                          // Clear vehicle selection when dates change
                          if (formData.vehicleId) {
                            updateFormData('vehicleId', '');
                          }
                        }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-foreground">Check In Date <span className="text-destructive">*</span></Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-foreground", !formData.checkInDate && "text-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkInDate ? format(formData.checkInDate, "PPP") : <span>Pick check in date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={formData.checkInDate} onSelect={date => {
                          updateFormData('checkInDate', date);
                          // Clear vehicle selection when dates change
                          if (formData.vehicleId) {
                            updateFormData('vehicleId', '');
                          }
                        }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Locations */}
                    <LocationSelect value={formData.checkOutLocationId} onChange={locationId => {
                    updateFormData('checkOutLocationId', locationId);
                    // Clear vehicle selection when location changes
                    if (formData.vehicleId) {
                      updateFormData('vehicleId', '');
                    }
                  }} placeholder="Select check out location" className="w-full" />
                    
                    <LocationSelect value={formData.checkInLocationId} onChange={locationId => {
                    updateFormData('checkInLocationId', locationId);
                    // Clear vehicle selection when location changes
                    if (formData.vehicleId) {
                      updateFormData('vehicleId', '');
                    }
                  }} placeholder="Select check in location" className="w-full" />

                    {/* Vehicle Class */}
                    <VehicleClassSelect value={formData.vehicleClassId} onChange={classId => {
                    updateFormData('vehicleClassId', classId);
                    // Clear vehicle selection when class changes
                    if (formData.vehicleId) {
                      updateFormData('vehicleId', '');
                    }
                  }} placeholder="Select vehicle class" className="w-full" />
                    
                    {/* Enhanced Vehicle Selector with Dependencies - Optional */}
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <Label className="text-foreground">Specific Vehicle <span className="text-white">(Optional - leave empty to assign later in agreement)</span></Label>
                        <ConditionalVehicleSelector value={formData.vehicleId} onChange={vehicleId => updateFormData('vehicleId', vehicleId)} checkOutDate={formData.checkOutDate} checkInDate={formData.checkInDate} checkOutLocationId={formData.checkOutLocationId} checkInLocationId={formData.checkInLocationId} vehicleClassId={formData.vehicleClassId} className="w-full" placeholder="Select specific vehicle (optional)" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button id="btn-add-line-vehicle" onClick={addReservationLine} disabled={!isPrefillComplete()} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Vehicle
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="drivers" className="space-y-6">
                  <EnhancedDriverPicker selectedDrivers={formData.drivers} onDriversChange={drivers => updateFormData('drivers', drivers)} className="w-full" />
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>

          {/* 4) Airport Information */}
          <AccordionItem value="airport-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                <span className="font-semibold text-foreground">Airport Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Enable Airport Information Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="enable-airport-info" checked={formData.enableAirportInfo} onCheckedChange={checked => updateFormData('enableAirportInfo', checked)} />
                  <Label htmlFor="enable-airport-info" className="text-foreground">Enable Airport Information</Label>
                </div>

                {formData.enableAirportInfo && <>
                    {/* Arrival Information */}
                    <div>
                      <h4 className="font-medium mb-4 text-foreground">Arrival Information</h4>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-foreground">Flight No.</Label>
                          <Input value={formData.arrivalFlightNo} onChange={e => updateFormData('arrivalFlightNo', e.target.value)} placeholder="e.g., AA1234" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Date & Time</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-foreground", !formData.arrivalDateTime && "text-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.arrivalDateTime ? format(formData.arrivalDateTime, "PPP p") : <span>Select arrival date & time</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={formData.arrivalDateTime} onSelect={date => updateFormData('arrivalDateTime', date)} initialFocus className="p-3 pointer-events-auto" />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Airline</Label>
                          <Input value={formData.arrivalAirline} onChange={e => updateFormData('arrivalAirline', e.target.value)} placeholder="e.g., American Airlines" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Airport</Label>
                          <Input value={formData.arrivalAirport} onChange={e => updateFormData('arrivalAirport', e.target.value)} placeholder="e.g., LAX International" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">City</Label>
                          <Input value={formData.arrivalCity} onChange={e => updateFormData('arrivalCity', e.target.value)} placeholder="e.g., Los Angeles" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Zip Code</Label>
                          <Input value={formData.arrivalZipCode} onChange={e => updateFormData('arrivalZipCode', e.target.value)} placeholder="e.g., 90045" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Passengers</Label>
                          <Input type="number" value={formData.arrivalPassengers || ''} onChange={e => updateFormData('arrivalPassengers', parseInt(e.target.value) || 0)} placeholder="Number of passengers" min="0" className="text-white placeholder:text-white/70" />
                        </div>
                      </div>
                    </div>

                    {/* Departure Information */}
                    <div>
                      <h4 className="font-medium mb-4 text-foreground">Departure Information</h4>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-foreground">Flight No.</Label>
                          <Input value={formData.departureFlightNo} onChange={e => updateFormData('departureFlightNo', e.target.value)} placeholder="e.g., AA5678" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Date & Time</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-foreground", !formData.departureDateTime && "text-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.departureDateTime ? format(formData.departureDateTime, "PPP p") : <span>Select departure date & time</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={formData.departureDateTime} onSelect={date => updateFormData('departureDateTime', date)} initialFocus className="p-3 pointer-events-auto" />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Airline</Label>
                          <Input value={formData.departureAirline} onChange={e => updateFormData('departureAirline', e.target.value)} placeholder="e.g., American Airlines" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Airport</Label>
                          <Input value={formData.departureAirport} onChange={e => updateFormData('departureAirport', e.target.value)} placeholder="e.g., LAX International" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">City</Label>
                          <Input value={formData.departureCity} onChange={e => updateFormData('departureCity', e.target.value)} placeholder="e.g., Los Angeles" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Zip Code</Label>
                          <Input value={formData.departureZipCode} onChange={e => updateFormData('departureZipCode', e.target.value)} placeholder="e.g., 90045" className="text-white placeholder:text-white/70" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Passengers</Label>
                          <Input type="number" value={formData.departurePassengers || ''} onChange={e => updateFormData('departurePassengers', parseInt(e.target.value) || 0)} placeholder="Number of passengers" min="0" className="text-white placeholder:text-white/70" />
                        </div>
                      </div>
                    </div>
                  </>}

                {!formData.enableAirportInfo && <div className="text-sm text-foreground bg-muted/50 p-4 rounded-lg">
                    Check the box above to enable airport information fields.
                  </div>}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4) Insurance Information */}
          <AccordionItem value="insurance" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold text-foreground">Insurance Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-foreground">Insurance Level</Label>
                  <Select value={formData.insuranceLevelId} onValueChange={value => updateFormData('insuranceLevelId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Coverage</SelectItem>
                      <SelectItem value="standard">Standard Coverage</SelectItem>
                      <SelectItem value="premium">Premium Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Insurance Group</Label>
                  <Select value={formData.insuranceGroupId} onValueChange={value => updateFormData('insuranceGroupId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group-a">Group A</SelectItem>
                      <SelectItem value="group-b">Group B</SelectItem>
                      <SelectItem value="group-c">Group C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Insurance Provider</Label>
                  <Select value={formData.insuranceProviderId} onValueChange={value => updateFormData('insuranceProviderId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provider-1">Provider A</SelectItem>
                      <SelectItem value="provider-2">Provider B</SelectItem>
                      <SelectItem value="provider-3">Provider C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5) Miscellaneous Charges */}
          <AccordionItem value="misc-charges" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span className="font-semibold text-foreground">Miscellaneous Charges</span>
                {(formData.selectedMiscCharges || []).length > 0 && <Badge variant="secondary" className="ml-2">
                    {(formData.selectedMiscCharges || []).length} selected
                  </Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Add-ons Selection */}
                <div className="space-y-8">
                  {addOnCategories.map(category => {
                  const categoryAddOns = categorizeAddOns(category);
                  if (categoryAddOns.length === 0) return null;
                  return <div key={category} className="space-y-4">
                        <h3 className="font-semibold text-lg text-card-foreground border-b border-card-foreground/20 pb-2">
                          {category}
                        </h3>
                        <div className="grid gap-4">
                          {categoryAddOns.map(addOn => {
                        const isSelected = (formData.selectedMiscCharges || []).includes(addOn.id);
                        const rentalDays = formData.totalDays || 1;
                        const cost = calculateAddOnCost(addOn, rentalDays);
                        const IconComponent = addOn.icon;
                        return <div key={addOn.id} className={`
                                  relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                                  ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-card-foreground/20 bg-card hover:border-primary/50'}
                                `} onClick={() => {
                          if (isSelected) {
                            const newSelected = (formData.selectedMiscCharges || []).filter(id => id !== addOn.id);
                            const newCharges = {
                              ...formData.addOnCharges
                            };
                            delete newCharges[addOn.id];
                            updateFormData('selectedMiscCharges', newSelected);
                            updateFormData('addOnCharges', newCharges);
                          } else {
                            const newSelected = [...(formData.selectedMiscCharges || []), addOn.id];
                            const newCharges = {
                              ...formData.addOnCharges,
                              [addOn.id]: cost
                            };
                            updateFormData('selectedMiscCharges', newSelected);
                            updateFormData('addOnCharges', newCharges);
                          }
                        }}>
                                <div className="flex items-start gap-4">
                                  <Checkbox checked={isSelected} onChange={() => {}} // Controlled by parent click
                            className="mt-1" />
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <IconComponent className="h-5 w-5 text-white" />
                                      <h4 className="font-medium text-card-foreground">{addOn.name}</h4>
                                      {addOn.popular && <Badge variant="secondary" className="text-xs">
                                          Popular
                                        </Badge>}
                                    </div>
                                    <p className="text-sm text-card-foreground/70 mb-3">
                                      {addOn.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="text-lg font-bold text-red-600">
                                        AED {cost.toFixed(0)}
                                        {addOn.isFlat ? <span className="text-xs text-card-foreground/70 ml-1">(flat rate)</span> : <span className="text-xs text-card-foreground/70 ml-1">
                                            ({rentalDays} day{rentalDays > 1 ? 's' : ''} × AED {addOn.amount})
                                          </span>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>;
                      })}
                        </div>
                      </div>;
                })}
                </div>

                {/* Selected Add-ons Summary */}
                {(formData.selectedMiscCharges || []).length > 0 && <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg text-card-foreground">Selected Add-ons Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(formData.selectedMiscCharges || []).map(addOnId => {
                      const addOn = availableAddOns.find(a => a.id === addOnId);
                      if (!addOn) return null;
                      const rentalDays = formData.totalDays || 1;
                      const cost = calculateAddOnCost(addOn, rentalDays);
                      const IconComponent = addOn.icon;
                      return <div key={addOnId} className="flex items-center justify-between p-3 bg-card-foreground/5 rounded-lg border border-card-foreground/10">
                              <div className="flex items-center gap-2 flex-1">
                                <IconComponent className="h-4 w-4 text-white" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate text-card-foreground">{addOn.name}</p>
                                  <p className="text-xs text-card-foreground/70">
                                    {addOn.isFlat ? 'Flat rate' : `AED ${addOn.amount}/day`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-red-600">AED {cost.toFixed(0)}</p>
                              </div>
                            </div>;
                    })}
                        
                        <div className="border-t border-card-foreground/20 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-card-foreground">Add-ons Total:</span>
                            <span className="font-bold text-lg text-red-600">
                              AED {Object.values(formData.addOnCharges || {}).reduce((sum, amount) => sum + amount, 0).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6) Rate & Taxes */}
          <AccordionItem value="rate-taxes" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span className="font-semibold text-foreground">Rate & Taxes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Price List</Label>
                    {loading.priceLists ? <Skeleton className="h-10 w-full" /> : <Select value={formData.priceListId} onValueChange={handlePriceListChange}>
                        <SelectTrigger id="select-price-list">
                          <SelectValue placeholder="Select price list" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          {options.priceLists.map(option => <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Promotion Code</Label>
                    <div className="flex gap-2">
                      <Input id="input-promo" value={formData.promotionCode} onChange={e => updateFormData('promotionCode', e.target.value)} placeholder="Enter promo code" className="text-white placeholder:text-white/70" />
                      <Button variant="outline" size="icon">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Rates</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Hourly Rate</Label>
                      <Input id="rate-hourly" type="number" step="0.01" value={formData.hourlyRate} onChange={e => updateFormData('hourlyRate', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Daily Rate</Label>
                      <Input id="rate-daily" type="number" step="0.01" value={formData.dailyRate} onChange={e => updateFormData('dailyRate', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Weekly Rate</Label>
                      <Input id="rate-weekly" type="number" step="0.01" value={formData.weeklyRate} onChange={e => updateFormData('weeklyRate', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Monthly Rate</Label>
                      <Input id="rate-monthly" type="number" step="0.01" value={formData.monthlyRate} onChange={e => updateFormData('monthlyRate', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Kilometer Charge</Label>
                    <Input id="rate-km-charge" type="number" step="0.01" value={formData.kilometerCharge} onChange={e => updateFormData('kilometerCharge', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Daily Kilometer Allowed</Label>
                    <Input id="rate-daily-km-allowed" type="number" value={formData.dailyKilometerAllowed} onChange={e => updateFormData('dailyKilometerAllowed', parseInt(e.target.value) || 0)} placeholder="0" className="text-white placeholder:text-white/70" />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7) Adjustments & Deposits */}
          <AccordionItem value="adjustments-deposits" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold text-foreground">Adjustments & Deposits</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-foreground">Pre-adjustment</Label>
                    <Input type="number" step="0.01" value={formData.preAdjustment} onChange={e => updateFormData('preAdjustment', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Advance Payment</Label>
                    <Input type="number" step="0.01" value={formData.advancePayment} onChange={e => updateFormData('advancePayment', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                    {validation.getFieldError('header.advancePayment') && <FormError message={validation.getFieldError('header.advancePayment')} />}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Security Deposit Paid</Label>
                    <Input type="number" step="0.01" value={formData.securityDepositPaid} onChange={e => updateFormData('securityDepositPaid', parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-white placeholder:text-white/70" />
                    {validation.getFieldError('header.securityDepositPaid') && <FormError message={validation.getFieldError('header.securityDepositPaid')} />}
                  </div>
                </div>

                {/* Payment Method Section - Shows when advance payment > 0 */}
                {formData.advancePayment > 0 && <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium text-foreground">Payment Method (Required for Advance Payment)</h4>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <RequiredLabel>Payment Method</RequiredLabel>
                        <Select value={formData.paymentMethodId} onValueChange={value => updateFormData('paymentMethodId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit-card">Credit Card</SelectItem>
                            <SelectItem value="debit-card">Debit Card</SelectItem>
                            <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                        {validation.getFieldError('header.paymentMethod') && <FormError message={validation.getFieldError('header.paymentMethod')} />}
                      </div>
                    </div>
                  </div>}

                {/* Deposit Method Section - Shows when security deposit > 0 */}
                {formData.securityDepositPaid > 0 && <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium text-foreground">Deposit Payment Details (Required for Security Deposit)</h4>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <RequiredLabel>Deposit Method</RequiredLabel>
                        <Select value={formData.depositMethodId} onValueChange={value => updateFormData('depositMethodId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deposit method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hold">Credit Card Hold</SelectItem>
                            <SelectItem value="cash-deposit">Cash Deposit</SelectItem>
                            <SelectItem value="bank-guarantee">Bank Guarantee</SelectItem>
                          </SelectContent>
                        </Select>
                        {validation.getFieldError('header.depositMethod') && <FormError message={validation.getFieldError('header.depositMethod')} />}
                      </div>
                      <div className="space-y-2">
                        <RequiredLabel>Deposit Payment Method</RequiredLabel>
                        <Select value={formData.depositPaymentMethodId} onValueChange={value => updateFormData('depositPaymentMethodId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit-card">Credit Card</SelectItem>
                            <SelectItem value="debit-card">Debit Card</SelectItem>
                            <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                        {validation.getFieldError('header.depositPaymentMethod') && <FormError message={validation.getFieldError('header.depositPaymentMethod')} />}
                      </div>
                    </div>
                  </div>}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8) Referral Information - Loyalty Program */}
          <AccordionItem value="referral-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold text-foreground">Referral Information - Loyalty Program</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground">Referred by Customer</Label>
                  <CustomerSelect value={formData.referralCustomerId} onChange={value => updateFormData('referralCustomerId', value)} placeholder="Select referring customer" className="w-full" />
                  <p className="text-sm text-card-foreground/70">
                    Select the existing customer who referred this reservation
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Referral Code</Label>
                  <Input value={formData.referralCode} onChange={e => updateFormData('referralCode', e.target.value)} placeholder="Enter referral code (optional)" className="text-white placeholder:text-white/70" />
                  <p className="text-sm text-card-foreground/70">
                    Optional code for tracking referral campaigns
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 9) Notes */}
          <AccordionItem value="notes" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold text-foreground">Notes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground">Note</Label>
                  <Textarea value={formData.note} onChange={e => updateFormData('note', e.target.value)} placeholder="General notes about the reservation..." rows={4} maxLength={500} className="text-white placeholder:text-white/70" />
                  <p className="text-xs text-foreground">{(formData.note || '').length}/500 characters</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Special Note</Label>
                  <Textarea value={formData.specialNote} onChange={e => updateFormData('specialNote', e.target.value)} placeholder="Special instructions or requirements..." rows={4} maxLength={500} className="text-white placeholder:text-white/70" />
                  <p className="text-xs text-foreground">{(formData.specialNote || '').length}/500 characters</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 11) Reservation Lines */}
          <AccordionItem value="reservation-lines" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span className="font-semibold text-foreground">Reservation Lines</span>
                {(formData.reservationLines || []).length > 0 && <Badge variant="secondary" className="ml-2">
                    {(formData.reservationLines || []).length} lines
                  </Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <RepriceBanner show={showRepriceBanner} onReprice={handleRepriceLines} onDismiss={() => setShowRepriceBanner(false)} />
                
                <div id="grid-reservation-lines">
                  <ReservationLineGrid lines={formData.reservationLines || []} onLineUpdate={handleLineUpdate} onLineRemove={handleLineRemove} onLineDuplicate={handleLineDuplicate} selectedLines={selectedLines} onSelectionChange={setSelectedLines} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Action Buttons - Fixed Bottom */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-4 mt-8">
          <div className="flex justify-end gap-4 max-w-7xl mx-auto">
            <Button variant="outline" onClick={() => handleSave('DRAFT')} disabled={loading.saving}>
              {loading.saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button id="btn-save-continue" onClick={() => handleSave('ACTIVE')} disabled={loading.saving} className="min-w-32" title={validation.hasErrors || (formData.reservationLines || []).length === 0 ? "Complete required fields first" : undefined}>
              {loading.saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Summary */}
      <div className="lg:w-96 lg:flex-shrink-0">
        <div className="sticky top-4">
          <SummaryCard summary={summary} currencyCode="AED" />
        </div>
      </div>
    </div>;
};
export default NewReservation;
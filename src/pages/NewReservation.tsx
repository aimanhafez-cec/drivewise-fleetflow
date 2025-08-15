import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockApi, DropdownOption, Customer, ReservationFormData } from '@/lib/api/reservations';
import { useReservationSummary } from '@/hooks/useReservationSummary';
import { SummaryCard } from '@/components/reservation/SummaryCard';
import { ReservationLineGrid } from '@/components/reservation/ReservationLineGrid';
import { AddLineValidation, validateAddLine, ValidationError } from '@/components/reservation/AddLineValidation';
import { PrefillChips } from '@/components/reservation/PrefillChips';
import { DriverPicker } from '@/components/reservation/DriverPicker';
import { usePricingContext, calculateLinePrice, PricingContext } from '@/hooks/usePricingContext';
import { RepriceBanner } from '@/components/reservation/RepriceBanner';
import { useFormValidation, ValidationRules } from '@/hooks/useFormValidation';
import { useReservationValidation } from '@/hooks/useReservationValidation';
import { BillToSelector, BillToData, BillToType, BillToMeta } from '@/components/ui/bill-to-selector';
import { useVehicles, useVehicleCategories, formatVehicleDisplay } from '@/hooks/useVehicles';

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

export interface Driver {
  id: string;
  fullName: string;
  licenseNo: string;
  phone: string;
  email: string;
  dob: Date | null;
  role?: 'PRIMARY' | 'ADDITIONAL';
  addlDriverFee?: number;
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
  
  // Miscellaneous Charges
  selectedMiscCharges: string[];
  
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
  
  // Referral Information
  referralNameId: string;
  referralContactNameId: string;
  referralAddress: string;
  referralPhone: string;
  referralBenefitTypeId: string;
  referralValue: number;
  
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
  taxCodeId: string;
  leaseToOwn: boolean;
}

const NewReservation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ExtendedFormData>({
    // Original fields
    reservationNo: null,
    entryDate: new Date(),
    reservationMethodId: '',
    currencyCode: '',
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
    taxCodeId: '',
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
    referralNameId: '',
    referralContactNameId: '',
    referralAddress: '',
    referralPhone: '',
    referralBenefitTypeId: '',
    referralValue: 0,
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
    saving: false,
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
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: categories, isLoading: categoriesLoading } = useVehicleCategories();

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
    return !!(
      prefill.vehicleClassId &&
      prefill.vehicleId &&
      prefill.checkOutDate &&
      prefill.checkOutLocationId &&
      prefill.checkInDate &&
      prefill.checkInLocationId &&
      prefill.checkOutDate < prefill.checkInDate
    );
  };

  // State for accordion sections - REORDERED per requirements
  const [accordionValues, setAccordionValues] = useState([
    'rental-info',
    'billing',
    'airport-info',
    'insurance',
    'misc-charges',
    'rate-taxes',
    'adjustments-deposits',
    'referral-info',
    'notes',
    'vehicles-drivers',
    'reservation-lines'
  ]);

  // Auto-open reservation lines section when prefill is complete
  useEffect(() => {
    if (isPrefillComplete() && !accordionValues.includes('reservation-lines')) {
      setAccordionValues(prev => [...prev, 'reservation-lines']);
    }
  }, [formData.vehicleClassId, formData.vehicleId, formData.checkOutDate, formData.checkInDate]);

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
      dailyKilometerAllowed: formData.dailyKilometerAllowed,
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
    'header.taxCodeId': 'Tax Code',
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
    dailyKilometerAllowed: formData.dailyKilometerAllowed,
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // Set currencies to only EGP & SAR
    setOptions(prev => ({ 
      ...prev, 
      currencies: [
        { id: 'EGP', label: 'EGP - Egyptian Pound', value: 'EGP' },
        { id: 'SAR', label: 'SAR - Saudi Riyal', value: 'SAR' }
      ]
    }));

    const loadTasks = [
      { key: 'reservationMethods', fn: mockApi.getReservationMethods },
      { key: 'reservationTypes', fn: mockApi.getReservationTypes },
      { key: 'businessUnits', fn: mockApi.getBusinessUnits },
      { key: 'paymentTerms', fn: mockApi.getPaymentTerms },
      { key: 'discountTypes', fn: mockApi.getDiscountTypes },
      { key: 'contractBillingPlans', fn: mockApi.getContractBillingPlans },
      { key: 'taxLevels', fn: mockApi.getTaxLevels },
    ];

    await Promise.all(
      loadTasks.map(async ({ key, fn }) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        try {
          const data = await fn();
          setOptions(prev => ({ ...prev, [key]: data }));
        } catch (error) {
          console.error(`Failed to load ${key}:`, error);
        } finally {
          setLoading(prev => ({ ...prev, [key]: false }));
        }
      })
    );

    // Load customers separately
    searchCustomers('');
  };

  const searchCustomers = async (query: string) => {
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const customers = await mockApi.searchCustomers(query);
      setOptions(prev => ({ ...prev, customers }));
    } catch (error) {
      console.error('Failed to search customers:', error);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  // Load tax codes when tax level changes
  useEffect(() => {
    const loadTaxCodes = async () => {
      if (formData.taxLevelId) {
        setLoading(prev => ({ ...prev, taxCodes: true }));
        try {
          const taxCodes = await mockApi.getTaxCodes(formData.taxLevelId);
          setOptions(prev => ({ ...prev, taxCodes }));
        } catch (error) {
          console.error('Failed to load tax codes:', error);
        } finally {
          setLoading(prev => ({ ...prev, taxCodes: false }));
        }
      } else {
        // Clear tax codes when no tax level is selected
        setOptions(prev => ({ ...prev, taxCodes: [] }));
        // Clear selected tax code
        updateFormData('taxCodeId', '');
      }
    };

    loadTaxCodes();
  }, [formData.taxLevelId]);

  const updateFormData = (field: keyof ExtendedFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ReservationFormData]) {
      setErrors(prev => ({ ...prev, [field as keyof ReservationFormData]: undefined }));
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

    // Calculate pricing using pricing context
    const priceResult = calculateLinePrice(
      pricingContext,
      formData.checkOutDate!,
      formData.checkInDate!,
      {
        hourly: 25, // fallback rates from price list
        daily: 50,
        weekly: 300,
        monthly: 1200
      }
    );
    
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
      if (driver.dob) {
        const age = new Date().getFullYear() - driver.dob.getFullYear();
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
      description: `Line #${newLine.lineNo} added with ${driverCount} driver(s). ${priceResult.source === 'panel' ? '(from Rate & Taxes)' : '(from Price List)'}`,
    });
  };

  const handleRepriceLines = () => {
    setFormData(prev => ({
      ...prev,
      reservationLines: prev.reservationLines.map(line => {
        if (line.checkOutDate && line.checkInDate) {
          const priceResult = calculateLinePrice(
            pricingContext,
            line.checkOutDate,
            line.checkInDate,
            {
              hourly: 25,
              daily: 50,
              weekly: 300,
              monthly: 1200
            }
          );
          
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
      description: "All reservation lines have been updated with new rates.",
    });
  };

  const handleLineUpdate = (lineId: string, updates: Partial<ReservationLine>) => {
    setFormData(prev => ({
      ...prev,
      reservationLines: prev.reservationLines.map(line => 
        line.id === lineId 
          ? { 
              ...line, 
              ...updates,
              // Recalculate totals if price changed
              lineTotal: updates.lineNetPrice !== undefined 
                ? (updates.lineNetPrice || 0) + (updates.taxValue || line.taxValue || 0)
                : line.lineTotal
            }
          : line
      )
    }));
  };

  const handleLineRemove = (lineId: string) => {
    setFormData(prev => ({
      ...prev,
      reservationLines: prev.reservationLines.filter(line => line.id !== lineId)
        .map((line, index) => ({ ...line, lineNo: index + 1 })) // Renumber lines
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
        vehicleId: '', // Clear vehicle for new selection
        drivers: [], // Clear drivers
        selected: false
      };
      
      setFormData(prev => ({
        ...prev,
        reservationLines: [...prev.reservationLines, newLine]
      }));

      toast({
        title: "Line duplicated",
        description: `Line #${newLine.lineNo} has been created as a copy.`,
      });
    }
  };

  // Validate form data before saving
  const validateBeforeSave = (status: 'DRAFT' | 'ACTIVE') => {
    if (status === 'DRAFT') return { success: true, errors: [] };

    // Prepare data for validation
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
        taxCodeId: formData.taxCodeId,
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
        benefitType: formData.referralBenefitTypeId,
        benefitValue: formData.referralValue,
      },
      lines: formData.reservationLines?.map(line => ({
        vehicleClassId: line.vehicleClassId,
        vehicleId: line.vehicleId,
        checkOutDate: line.checkOutDate,
        checkOutLocationId: line.outLocationId,
        checkInDate: line.checkInDate,
        checkInLocationId: line.inLocationId,
      })) || []
    };

    return validation.validateForm(validationData);
  };

  const handleSave = async (status: 'DRAFT' | 'ACTIVE') => {
    setLoading(prev => ({ ...prev, saving: true }));
    
    try {
      // Validate form before saving
      const validationResult = validateBeforeSave(status);
      
      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: "Please correct the errors before continuing",
          variant: "destructive",
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
          description: status === 'DRAFT' 
            ? "Your reservation draft has been saved." 
            : `Reservation ${response.reservationNo} has been created successfully.`,
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
          variant: "destructive",
        });
      } else if (error.status === 409) {
        toast({
          title: "Conflict Error",
          description: "Vehicle not available for selected dates",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save reservation. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const addDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      fullName: '',
      licenseNo: '',
      phone: '',
      email: '',
      dob: null,
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
        taxCodeId: formData.taxCodeId,
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
        benefitType: formData.referralBenefitTypeId,
        benefitValue: formData.referralValue,
      },
      lines: formData.reservationLines?.map(line => ({
        vehicleClassId: line.vehicleClassId,
        vehicleId: line.vehicleId,
        checkOutDate: line.checkOutDate,
        checkOutLocationId: line.outLocationId,
        checkInDate: line.checkInDate,
        checkInLocationId: line.inLocationId,
      })) || []
    };
    
    validation.validateForm(validationData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
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
          <h1 className="text-3xl font-bold tracking-tight">New Reservation</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Error Summary */}
        {validation.hasErrors && (
          <div id="error-summary">
            <ErrorSummary
              errors={validation.validationErrors}
              fieldLabels={fieldLabels}
              onFieldFocus={validation.focusField}
            />
          </div>
        )}

        {/* Validation Actions */}
        <div className="flex justify-between items-center">
          <Button
            id="btn-validate"
            variant="outline"
            onClick={handleValidateNow}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Validate Now
          </Button>
        </div>

        {/* Accordion Sections - REORDERED */}
        <Accordion 
          type="multiple" 
          value={[...accordionValues, ...validation.expandedAccordions]} 
          onValueChange={setAccordionValues} 
          className="space-y-4"
        >
          
          {/* 1) Rental Information */}
          <AccordionItem value="rental-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Rental Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Reservation No. */}
                <div className="space-y-2">
                  <Label htmlFor="reservationNo">Reservation no.</Label>
                  <Input
                    id="reservationNo"
                    value={formData.reservationNo || ''}
                    disabled
                    placeholder="Auto-generated on save"
                    className="bg-muted"
                  />
                </div>

                {/* Entry Date */}
                <div className="space-y-2">
                  <Label>Reservation Entry Date <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.entryDate && "text-muted-foreground",
                          errors.entryDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.entryDate ? format(formData.entryDate, "PPP") : <span>Pick entry date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.entryDate}
                        onSelect={(date) => updateFormData('entryDate', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.entryDate && <p className="text-sm text-destructive">{errors.entryDate}</p>}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>Currency <span className="text-destructive">*</span></Label>
                  {loading.currencies ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.currencyCode} 
                      onValueChange={(value) => updateFormData('currencyCode', value)}
                    >
                      <SelectTrigger className={errors.currencyCode ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.currencies.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.currencyCode && <p className="text-sm text-destructive">{errors.currencyCode}</p>}
                </div>

                {/* Customer - with search */}
                <div className="space-y-2">
                  <Label>Customer <span className="text-destructive">*</span></Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className={cn(
                          "w-full justify-between",
                          !formData.customerId && "text-muted-foreground",
                          errors.customerId && "border-destructive"
                        )}
                      >
                        {formData.customerId
                          ? options.customers.find(customer => customer.id === formData.customerId)?.name
                          : "Select customer..."
                        }
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search customers..."
                          value={customerSearchQuery}
                          onValueChange={(value) => {
                            setCustomerSearchQuery(value);
                            searchCustomers(value);
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {loading.customers ? "Loading..." : "No customers found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {options.customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.id}
                                onSelect={() => {
                                  updateFormData('customerId', customer.id);
                                  setCustomerSearchOpen(false);
                                  setCustomerSearchQuery('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.customerId === customer.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{customer.name}</span>
                                  <span className="text-sm text-muted-foreground">{customer.email}</span>
                                </div>
                              </CommandItem>
                            ))}
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
                  {loading.reservationMethods ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.reservationMethodId} 
                      onValueChange={(value) => updateFormData('reservationMethodId', value)}
                    >
                      <SelectTrigger className={validation.getFieldError('header.reservationMethodId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.reservationMethods.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormError message={validation.getFieldError('header.reservationMethodId')} />
                </div>

                {/* Reservation Type */}
                <div className="space-y-2">
                  <RequiredLabel>Reservation Type</RequiredLabel>
                  {loading.reservationTypes ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.reservationTypeId} 
                      onValueChange={(value) => updateFormData('reservationTypeId', value)}
                    >
                      <SelectTrigger className={validation.getFieldError('header.reservationTypeId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.reservationTypes.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormError message={validation.getFieldError('header.reservationTypeId')} />
                </div>

                {/* Business Unit */}
                <div className="space-y-2">
                  <RequiredLabel>Business Unit</RequiredLabel>
                  {loading.businessUnits ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.businessUnitId} 
                      onValueChange={(value) => updateFormData('businessUnitId', value)}
                    >
                      <SelectTrigger className={validation.getFieldError('header.businessUnitId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select business unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.businessUnits.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormError message={validation.getFieldError('header.businessUnitId')} />
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <RequiredLabel>Payment Terms</RequiredLabel>
                  {loading.paymentTerms ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.paymentTermsId} 
                      onValueChange={(value) => updateFormData('paymentTermsId', value)}
                    >
                      <SelectTrigger className={validation.getFieldError('header.paymentTermsId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.paymentTerms.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormError message={validation.getFieldError('header.paymentTermsId')} />
                </div>

                {/* Validity Date To */}
                <div className="space-y-2">
                  <Label>Validity Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.validityDateTo && "text-muted-foreground",
                          validation.getFieldError('header.validityDateTo') && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.validityDateTo ? format(formData.validityDateTo, "PPP") : <span>Select validity date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.validityDateTo}
                        onSelect={(date) => updateFormData('validityDateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormError message={validation.getFieldError('header.validityDateTo')} />
                </div>

                {/* Customer Bill To */}
                <div className="space-y-2">
                  <Label>Customer Bill To</Label>
                  {loading.billTo ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.customerBillToId} 
                      onValueChange={(value) => updateFormData('customerBillToId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bill to" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.billTo.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Discount Type */}
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  {loading.discountTypes ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.discountTypeId} 
                      onValueChange={(value) => updateFormData('discountTypeId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.discountTypes.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input 
                    type="number"
                    value={formData.discountValue || ''} 
                    onChange={(e) => updateFormData('discountValue', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                {/* Contract Billing Plan */}
                <div className="space-y-2">
                  <Label>Contract Billing Plan</Label>
                  {loading.contractBillingPlans ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.contractBillingPlanId} 
                      onValueChange={(value) => updateFormData('contractBillingPlanId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.contractBillingPlans.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Tax Level */}
                <div className="space-y-2">
                  <Label>Tax Level</Label>
                  {loading.taxLevels ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.taxLevelId} 
                      onValueChange={(value) => updateFormData('taxLevelId', value)}
                    >
                      <SelectTrigger className={validation.getFieldError('header.taxLevelId') ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select tax level" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.taxLevels.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormError message={validation.getFieldError('header.taxLevelId')} />
                </div>

                {/* Tax Code */}
                <div className="space-y-2">
                  <Label className={formData.taxLevelId ? "flex items-center gap-1" : ""}>
                    Tax Code
                    {formData.taxLevelId && <span className="text-destructive">*</span>}
                  </Label>
                  {loading.taxCodes ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.taxCodeId} 
                      onValueChange={(value) => updateFormData('taxCodeId', value)}
                      disabled={!formData.taxLevelId}
                    >
                      <SelectTrigger className={validation.getFieldError('header.taxCodeId') ? "border-destructive" : ""}>
                        <SelectValue placeholder={formData.taxLevelId ? "Select tax code" : "Select tax level first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50 max-h-60 overflow-auto">
                        {options.taxCodes.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormError message={validation.getFieldError('header.taxCodeId')} />
                </div>

                {/* Lease to Own */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lease-to-own"
                      checked={formData.leaseToOwn || false}
                      onCheckedChange={(checked) => updateFormData('leaseToOwn', checked)}
                    />
                    <Label htmlFor="lease-to-own">Lease to Own</Label>
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
                <span className="font-semibold">Bill To</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <BillToSelector
                value={{
                  bill_to_type: formData.bill_to_type,
                  bill_to_id: formData.bill_to_id,
                  bill_to_display: formData.bill_to_display,
                  payment_terms_id: formData.payment_terms_id,
                  billing_address_id: formData.billing_address_id,
                  bill_to_meta: formData.bill_to_meta
                }}
                onChange={(billToData) => {
                  updateFormData('bill_to_type', billToData.bill_to_type);
                  updateFormData('bill_to_id', billToData.bill_to_id);
                  updateFormData('bill_to_display', billToData.bill_to_display);
                  updateFormData('payment_terms_id', billToData.payment_terms_id);
                  updateFormData('billing_address_id', billToData.billing_address_id);
                  updateFormData('bill_to_meta', billToData.bill_to_meta);
                }}
                errors={{}}
                currentCustomerId={formData.customerId}
                currentCustomerName={selectedCustomer?.name}
              />
            </AccordionContent>
          </AccordionItem>

          {/* 3) Airport Information */}
          <AccordionItem value="airport-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                <span className="font-semibold">Airport Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Show conditional message based on reservation method */}
                {!['AIRPORT_PICKUP', 'AIRPORT_DROP', 'AIRPORT_PICKUP_DROP'].includes(formData.reservationMethodId) && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    Select a reservation method with airport service to configure flight information.
                  </div>
                )}

                {/* Arrival Information - Show when method includes pickup */}
                {(formData.reservationMethodId === 'AIRPORT_PICKUP' || formData.reservationMethodId === 'AIRPORT_PICKUP_DROP') && (
                  <>
                    <div>
                      <h4 className="font-medium mb-4">Arrival Information</h4>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <RequiredLabel>Flight No.</RequiredLabel>
                          <Input 
                            value={formData.arrivalFlightNo} 
                            onChange={(e) => updateFormData('arrivalFlightNo', e.target.value)}
                            placeholder="e.g., AA1234"
                            className={validation.getFieldError('header.arrivalFlightNo') ? "border-destructive" : ""}
                          />
                          <FormError message={validation.getFieldError('header.arrivalFlightNo')} />
                        </div>
                        
                        <div className="space-y-2">
                          <RequiredLabel>Date & Time</RequiredLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.arrivalDateTime && "text-muted-foreground",
                                  validation.getFieldError('header.arrivalDateTime') && "border-destructive"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.arrivalDateTime ? format(formData.arrivalDateTime, "PPP p") : <span>Select arrival date & time</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.arrivalDateTime}
                                onSelect={(date) => updateFormData('arrivalDateTime', date)}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormError message={validation.getFieldError('header.arrivalDateTime')} />
                        </div>
                        
                        <div className="space-y-2">
                          <RequiredLabel>Airline</RequiredLabel>
                          <Input 
                            value={formData.arrivalAirline} 
                            onChange={(e) => updateFormData('arrivalAirline', e.target.value)}
                            placeholder="e.g., American Airlines"
                            className={validation.getFieldError('header.arrivalAirline') ? "border-destructive" : ""}
                          />
                          <FormError message={validation.getFieldError('header.arrivalAirline')} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Airport</Label>
                          <Input 
                            value={formData.arrivalAirport} 
                            onChange={(e) => updateFormData('arrivalAirport', e.target.value)}
                            placeholder="e.g., LAX International"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input 
                            value={formData.arrivalCity} 
                            onChange={(e) => updateFormData('arrivalCity', e.target.value)}
                            placeholder="e.g., Los Angeles"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Zip Code</Label>
                          <Input 
                            value={formData.arrivalZipCode} 
                            onChange={(e) => updateFormData('arrivalZipCode', e.target.value)}
                            placeholder="e.g., 90045"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Passengers</Label>
                          <Input 
                            type="number"
                            value={formData.arrivalPassengers || ''} 
                            onChange={(e) => updateFormData('arrivalPassengers', parseInt(e.target.value) || 0)}
                            placeholder="Number of passengers"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Departure Information - Show when method includes drop */}
                {(formData.reservationMethodId === 'AIRPORT_DROP' || formData.reservationMethodId === 'AIRPORT_PICKUP_DROP') && (
                  <>
                    <div>
                      <h4 className="font-medium mb-4">Departure Information</h4>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <RequiredLabel>Flight No.</RequiredLabel>
                          <Input 
                            value={formData.departureFlightNo} 
                            onChange={(e) => updateFormData('departureFlightNo', e.target.value)}
                            placeholder="e.g., AA5678"
                            className={validation.getFieldError('header.departureFlightNo') ? "border-destructive" : ""}
                          />
                          <FormError message={validation.getFieldError('header.departureFlightNo')} />
                        </div>
                        
                        <div className="space-y-2">
                          <RequiredLabel>Date & Time</RequiredLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.departureDateTime && "text-muted-foreground",
                                  validation.getFieldError('header.departureDateTime') && "border-destructive"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.departureDateTime ? format(formData.departureDateTime, "PPP p") : <span>Select departure date & time</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.departureDateTime}
                                onSelect={(date) => updateFormData('departureDateTime', date)}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormError message={validation.getFieldError('header.departureDateTime')} />
                        </div>
                        
                        <div className="space-y-2">
                          <RequiredLabel>Airline</RequiredLabel>
                          <Input 
                            value={formData.departureAirline} 
                            onChange={(e) => updateFormData('departureAirline', e.target.value)}
                            placeholder="e.g., American Airlines"
                            className={validation.getFieldError('header.departureAirline') ? "border-destructive" : ""}
                          />
                          <FormError message={validation.getFieldError('header.departureAirline')} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Airport</Label>
                          <Input 
                            value={formData.departureAirport} 
                            onChange={(e) => updateFormData('departureAirport', e.target.value)}
                            placeholder="e.g., LAX International"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input 
                            value={formData.departureCity} 
                            onChange={(e) => updateFormData('departureCity', e.target.value)}
                            placeholder="e.g., Los Angeles"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Zip Code</Label>
                          <Input 
                            value={formData.departureZipCode} 
                            onChange={(e) => updateFormData('departureZipCode', e.target.value)}
                            placeholder="e.g., 90045"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Passengers</Label>
                          <Input 
                            type="number"
                            value={formData.departurePassengers || ''} 
                            onChange={(e) => updateFormData('departurePassengers', parseInt(e.target.value) || 0)}
                            placeholder="Number of passengers"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4) Insurance Information */}
          <AccordionItem value="insurance" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Insurance Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Insurance Level</Label>
                  <Select value={formData.insuranceLevelId} onValueChange={(value) => updateFormData('insuranceLevelId', value)}>
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
                  <Label>Insurance Group</Label>
                  <Select value={formData.insuranceGroupId} onValueChange={(value) => updateFormData('insuranceGroupId', value)}>
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
                  <Label>Insurance Provider</Label>
                  <Select value={formData.insuranceProviderId} onValueChange={(value) => updateFormData('insuranceProviderId', value)}>
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
                <span className="font-semibold">Miscellaneous Charges</span>
                {(formData.selectedMiscCharges || []).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {(formData.selectedMiscCharges || []).length} selected
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {[
                  { id: 'ldw', name: 'LDW (Per Day - No Tax)', amount: '25.00' },
                  { id: 'drop-fee', name: 'Drop Fee (Fixed)', amount: '50.00' },
                  { id: 'under-age', name: 'Under Age Fee (No Tax)', amount: '15.00' },
                  { id: 'valet', name: 'Valet (Per Day)', amount: '10.00' },
                  { id: 'sli', name: 'SLI (Fixed)', amount: '75.00' }
                ].map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={(formData.selectedMiscCharges || []).includes(charge.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData('selectedMiscCharges', [...(formData.selectedMiscCharges || []), charge.id]);
                          } else {
                            updateFormData('selectedMiscCharges', (formData.selectedMiscCharges || []).filter(id => id !== charge.id));
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium">{charge.name}</p>
                      </div>
                    </div>
                    <span className="font-medium">${charge.amount}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6) Rate & Taxes */}
          <AccordionItem value="rate-taxes" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span className="font-semibold">Rate & Taxes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Price List</Label>
                    <Select value={formData.priceListId} onValueChange={(value) => updateFormData('priceListId', value)}>
                      <SelectTrigger id="select-price-list">
                        <SelectValue placeholder="Select price list" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Rates</SelectItem>
                        <SelectItem value="premium">Premium Rates</SelectItem>
                        <SelectItem value="corporate">Corporate Rates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Promotion Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="input-promo"
                        value={formData.promotionCode} 
                        onChange={(e) => updateFormData('promotionCode', e.target.value)}
                        placeholder="Enter promo code"
                      />
                      <Button variant="outline" size="icon">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Rates</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Hourly Rate</Label>
                      <Input 
                        id="rate-hourly"
                        type="number"
                        step="0.01"
                        value={formData.hourlyRate}
                        onChange={(e) => updateFormData('hourlyRate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Rate</Label>
                      <Input 
                        id="rate-daily"
                        type="number"
                        step="0.01"
                        value={formData.dailyRate}
                        onChange={(e) => updateFormData('dailyRate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weekly Rate</Label>
                      <Input 
                        id="rate-weekly"
                        type="number"
                        step="0.01"
                        value={formData.weeklyRate}
                        onChange={(e) => updateFormData('weeklyRate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Rate</Label>
                      <Input 
                        id="rate-monthly"
                        type="number"
                        step="0.01"
                        value={formData.monthlyRate}
                        onChange={(e) => updateFormData('monthlyRate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Kilometer Charge</Label>
                    <Input 
                      id="rate-km-charge"
                      type="number"
                      step="0.01"
                      value={formData.kilometerCharge}
                      onChange={(e) => updateFormData('kilometerCharge', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Kilometer Allowed</Label>
                    <Input 
                      id="rate-daily-km-allowed"
                      type="number"
                      value={formData.dailyKilometerAllowed}
                      onChange={(e) => updateFormData('dailyKilometerAllowed', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
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
                <span className="font-semibold">Adjustments & Deposits</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Pre-adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.preAdjustment} 
                    onChange={(e) => updateFormData('preAdjustment', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advance Payment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.advancePayment} 
                    onChange={(e) => updateFormData('advancePayment', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit Paid</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.securityDepositPaid} 
                    onChange={(e) => updateFormData('securityDepositPaid', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8) Referral Information */}
          <AccordionItem value="referral-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Referral Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Referral Name</Label>
                  <Select value={formData.referralNameId} onValueChange={(value) => updateFormData('referralNameId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select referral" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referral-1">Corporate Partner A</SelectItem>
                      <SelectItem value="referral-2">Travel Agency B</SelectItem>
                      <SelectItem value="referral-3">Hotel Chain C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Select value={formData.referralContactNameId} onValueChange={(value) => updateFormData('referralContactNameId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact-1">John Smith</SelectItem>
                      <SelectItem value="contact-2">Jane Doe</SelectItem>
                      <SelectItem value="contact-3">Bob Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone No.</Label>
                  <Input 
                    value={formData.referralPhone} 
                    onChange={(e) => updateFormData('referralPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 9) Notes */}
          <AccordionItem value="notes" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Notes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea 
                    value={formData.note} 
                    onChange={(e) => updateFormData('note', e.target.value)}
                    placeholder="General notes about the reservation..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{(formData.note || '').length}/500 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>Special Note</Label>
                  <Textarea 
                    value={formData.specialNote} 
                    onChange={(e) => updateFormData('specialNote', e.target.value)}
                    placeholder="Special instructions or requirements..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{(formData.specialNote || '').length}/500 characters</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 10) Vehicle & Driver */}
          <AccordionItem value="vehicles-drivers" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span className="font-semibold">Vehicle & Driver</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Tabs defaultValue="vehicles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vehicles">Vehicle Information</TabsTrigger>
                  <TabsTrigger value="drivers">Driver Information</TabsTrigger>
                </TabsList>
                
                <TabsContent value="vehicles" className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Vehicle Class</Label>
                      <Select value={formData.vehicleClassId} onValueChange={(value) => updateFormData('vehicleClassId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="__loading__" disabled>Loading categories...</SelectItem>
                          ) : categories?.length === 0 ? (
                            <SelectItem value="__no_categories__" disabled>No categories available</SelectItem>
                          ) : (
                            categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle</Label>
                      <Select value={formData.vehicleId} onValueChange={(value) => updateFormData('vehicleId', value)}>
                        <SelectTrigger data-id="vehicle-select">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehiclesLoading ? (
                            <SelectItem value="__loading__" disabled>Loading vehicles...</SelectItem>
                          ) : vehicles?.length === 0 ? (
                            <SelectItem value="__no_vehicles__" disabled>No vehicles available</SelectItem>
                          ) : (
                            vehicles?.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {formatVehicleDisplay(vehicle)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Check Out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkOutDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : <span>Pick date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkOutDate}
                            onSelect={(date) => updateFormData('checkOutDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Check In Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkInDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkInDate ? format(formData.checkInDate, "PPP") : <span>Pick date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkInDate}
                            onSelect={(date) => updateFormData('checkInDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Check Out Location</Label>
                      <Select value={formData.checkOutLocationId} onValueChange={(value) => updateFormData('checkOutLocationId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">Main Office - Downtown</SelectItem>
                          <SelectItem value="loc2">Airport Branch - LAX</SelectItem>
                          <SelectItem value="loc3">Hotel Pickup - Beverly Hills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Check In Location</Label>
                      <Select value={formData.checkInLocationId} onValueChange={(value) => updateFormData('checkInLocationId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loc1">Main Office - Downtown</SelectItem>
                          <SelectItem value="loc2">Airport Branch - LAX</SelectItem>
                          <SelectItem value="loc3">Hotel Pickup - Beverly Hills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      id="btn-add-line-vehicle"
                      onClick={addReservationLine}
                      disabled={!isPrefillComplete()}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Line
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="drivers" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Driver Information</h4>
                    <Button variant="outline" onClick={addDriver} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Driver
                    </Button>
                  </div>
                  
                  {selectedDrivers.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDrivers.map((driver, index) => (
                        <div key={driver.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">Driver {index + 1}</h5>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDrivers(prev => prev.filter(d => d.id !== driver.id))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <Input placeholder="Full Name" value={driver.fullName} onChange={(e) => 
                              setSelectedDrivers(prev => prev.map(d => d.id === driver.id ? {...d, fullName: e.target.value} : d))
                            } />
                            <Input placeholder="License No." value={driver.licenseNo} onChange={(e) => 
                              setSelectedDrivers(prev => prev.map(d => d.id === driver.id ? {...d, licenseNo: e.target.value} : d))
                            } />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No drivers added yet. Click "Add Driver" to get started.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>

          {/* 11) Reservation Lines */}
          <AccordionItem value="reservation-lines" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span className="font-semibold">Reservation Lines</span>
                {(formData.reservationLines || []).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {(formData.reservationLines || []).length} lines
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <RepriceBanner
                  show={showRepriceBanner}
                  onReprice={handleRepriceLines}
                  onDismiss={() => setShowRepriceBanner(false)}
                />
                
                <div id="grid-reservation-lines">
                  <ReservationLineGrid
                    lines={formData.reservationLines || []}
                    onLineUpdate={handleLineUpdate}
                    onLineRemove={handleLineRemove}
                    onLineDuplicate={handleLineDuplicate}
                    selectedLines={selectedLines}
                    onSelectionChange={setSelectedLines}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Action Buttons - Fixed Bottom */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-4 mt-8">
          <div className="flex justify-end gap-4 max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => handleSave('DRAFT')}
              disabled={loading.saving}
            >
              {loading.saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              id="btn-save-continue"
              onClick={() => handleSave('ACTIVE')}
              disabled={loading.saving}
              className="min-w-32"
              title={validation.hasErrors || (formData.reservationLines || []).length === 0 ? "Complete required fields first" : undefined}
            >
              {loading.saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Summary */}
      <div className="lg:w-96 space-y-6">
        <div className="sticky top-6">
          <SummaryCard
            summary={summary}
            currencyCode={formData.currencyCode}
          />
        </div>
      </div>
    </div>
  );
};

export default NewReservation;
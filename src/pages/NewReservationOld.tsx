import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  
  // Billing
  billingType: 'same' | 'other';
  billingCustomerName: string;
  billingMail: string;
  billingPhone: string;
  billingAddress: string;
  
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
}

const NewReservation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    paymentTermsId: '',
    validityDateTo: null,
    discountTypeId: null,
    discountValue: null,
    contractBillingPlanId: null,
    taxLevelId: null,
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
    billingType: 'same',
    billingCustomerName: '',
    billingMail: '',
    billingPhone: '',
    billingAddress: '',
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

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData({
          ...parsedDraft,
          entryDate: new Date(parsedDraft.entryDate),
          validityDateTo: parsedDraft.validityDateTo ? new Date(parsedDraft.validityDateTo) : null,
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage whenever form changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load bill-to options when customer changes
  useEffect(() => {
    if (formData.customerId) {
      loadBillToOptions(formData.customerId);
    } else {
      setOptions(prev => ({ ...prev, billTo: [] }));
      setFormData(prev => ({ ...prev, billToId: '' }));
    }
  }, [formData.customerId]);

  // Load discount options when discount type changes
  useEffect(() => {
    if (formData.discountTypeId === 'program') {
      loadDiscountOptions('program');
    } else {
      setOptions(prev => ({ ...prev, discounts: [] }));
      if (formData.discountTypeId !== 'percentage') {
        setFormData(prev => ({ ...prev, discountValue: null }));
      }
    }
  }, [formData.discountTypeId]);

  // Load tax codes when tax level changes
  useEffect(() => {
    if (formData.taxLevelId) {
      loadTaxCodes(formData.taxLevelId);
    } else {
      setOptions(prev => ({ ...prev, taxCodes: [] }));
      setFormData(prev => ({ ...prev, taxCodeId: null }));
    }
  }, [formData.taxLevelId]);

  const loadInitialData = async () => {
    const loadTasks = [
      { key: 'currencies', fn: mockApi.getCurrencies },
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

  const loadBillToOptions = async (customerId: string) => {
    setLoading(prev => ({ ...prev, billTo: true }));
    try {
      const billToOptions = await mockApi.getCustomerBillTo(customerId);
      setOptions(prev => ({ ...prev, billTo: billToOptions }));
    } catch (error) {
      console.error('Failed to load bill-to options:', error);
    } finally {
      setLoading(prev => ({ ...prev, billTo: false }));
    }
  };

  const loadDiscountOptions = async (type: string) => {
    setLoading(prev => ({ ...prev, discounts: true }));
    try {
      const discounts = await mockApi.getDiscounts(type);
      setOptions(prev => ({ ...prev, discounts }));
    } catch (error) {
      console.error('Failed to load discount options:', error);
    } finally {
      setLoading(prev => ({ ...prev, discounts: false }));
    }
  };

  const loadTaxCodes = async (levelId: string) => {
    setLoading(prev => ({ ...prev, taxCodes: true }));
    try {
      const taxCodes = await mockApi.getTaxCodes(levelId);
      setOptions(prev => ({ ...prev, taxCodes }));
    } catch (error) {
      console.error('Failed to load tax codes:', error);
    } finally {
      setLoading(prev => ({ ...prev, taxCodes: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReservationFormData, string>> = {};

    if (!formData.entryDate) newErrors.entryDate = 'Entry date is required';
    if (!formData.reservationMethodId) newErrors.reservationMethodId = 'Reservation method is required';
    if (!formData.currencyCode) newErrors.currencyCode = 'Currency is required';
    if (!formData.reservationTypeId) newErrors.reservationTypeId = 'Reservation type is required';
    if (!formData.businessUnitId) newErrors.businessUnitId = 'Business unit is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.paymentTermsId) newErrors.paymentTermsId = 'Payment terms is required';

    if (formData.validityDateTo && formData.entryDate && formData.validityDateTo < formData.entryDate) {
      newErrors.validityDateTo = 'Validity date must be after entry date';
    }

    if (formData.discountTypeId === 'percentage' && formData.discountValue) {
      const discountNum = Number(formData.discountValue);
      if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
        newErrors.discountValue = 'Discount percentage must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'DRAFT' | 'ACTIVE') => {
    if (status === 'ACTIVE' && !validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before saving",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, saving: true }));

    try {
      const response = await mockApi.createReservation(formData, status);
      
      setFormData(prev => ({ ...prev, reservationNo: response.reservationNo }));
      
      if (status === 'DRAFT') {
        toast({
          title: "Draft Saved",
          description: `Reservation ${response.reservationNo} saved as draft`,
        });
      } else {
        toast({
          title: "Reservation Created",
          description: `Reservation ${response.reservationNo} created successfully`,
        });
        localStorage.removeItem(STORAGE_KEY);
        navigate(`/reservations/${response.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save reservation",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const updateFormData = (field: keyof ExtendedFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ReservationFormData]) {
      setErrors(prev => ({ ...prev, [field as keyof ReservationFormData]: undefined }));
    }
  };

  // State for accordion sections - reordered per requirements
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

  // Auto-save effect
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.reservationNo) {
        // Only auto-save if already has reservation number (is a draft)
        handleSave('DRAFT');
      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Helper functions
  const addReservationLine = () => {
    console.log('addReservationLine called');
    console.log('isPrefillComplete():', isPrefillComplete());
    console.log('formData:', {
      vehicleClassId: formData.vehicleClassId,
      vehicleId: formData.vehicleId,
      checkOutDate: formData.checkOutDate,
      checkInDate: formData.checkInDate,
      checkOutLocationId: formData.checkOutLocationId,
      checkInLocationId: formData.checkInLocationId
    });
    
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
      // Store pricing source info for display
      priceSource: priceResult.source
    } as ReservationLine & { priceSource: 'panel' | 'pricelist' };
    
    console.log('Before adding line, current reservationLines:', formData.reservationLines);
    console.log('New line to add:', newLine);
    
    setFormData(prev => {
      console.log('In setFormData, prev.reservationLines:', prev.reservationLines);
      const updatedLines = [...(prev.reservationLines || []), newLine];
      console.log('Updated lines array:', updatedLines);
      return {
        ...prev,
        reservationLines: updatedLines
      };
    });

    // Reset editor with smart defaults (keep dates/locations/price list, clear vehicle & driver)
    setFormData(prev => ({
      ...prev,
      vehicleId: ''
    }));
    setSelectedDrivers([]);

    // Show success toast
    const driverCount = selectedDrivers.length;
    toast({
      title: "Line added",
      description: `Line #${newLine.lineNo} added with ${driverCount} driver(s).`,
    });

    // Auto-save draft
    saveDraftToStorage();

    // Auto-scroll to the grid and highlight the new row
    setTimeout(() => {
      const gridElement = document.getElementById('grid-reservation-lines');
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Highlight the new row
        const newRowElement = document.querySelector(`[data-id="row-${newLine.lineNo}"]`);
        if (newRowElement) {
          newRowElement.classList.add('bg-primary/10', 'animate-pulse');
          setTimeout(() => {
            newRowElement.classList.remove('bg-primary/10', 'animate-pulse');
          }, 1500);
        }
      }
      
      // Focus on vehicle field for next entry
      const vehicleField = document.querySelector('[data-id="vehicle-select"]');
      if (vehicleField) {
        (vehicleField as HTMLElement).focus();
      }
    }, 100);
  };

  // Remove old calculateLinePrice function as we now use the one from the hook

  const saveDraftToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
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

  const handleBulkAction = (action: string) => {
    if (selectedLines.length === 0) {
      toast({
        title: "No lines selected",
        description: "Please select lines to perform bulk actions.",
        variant: "destructive"
      });
      return;
    }

    switch (action) {
      case 'duplicate':
        selectedLines.forEach(lineId => handleLineDuplicate(lineId));
        setSelectedLines([]);
        toast({
          title: "Lines duplicated",
          description: `${selectedLines.length} lines have been duplicated.`,
        });
        break;
      case 'remove':
        selectedLines.forEach(lineId => handleLineRemove(lineId));
        setSelectedLines([]);
        toast({
          title: "Lines removed",
          description: `${selectedLines.length} lines have been removed.`,
        });
        break;
      case 'apply-rate':
        // Implement bulk rate application
        toast({
          title: "Feature coming soon",
          description: "Bulk rate application will be available soon.",
        });
        break;
      case 'apply-discount':
        // Implement bulk discount application
        toast({
          title: "Feature coming soon",
          description: "Bulk discount application will be available soon.",
        });
        break;
      case 'apply-misc':
        // Implement bulk misc charge application
        toast({
          title: "Feature coming soon",
          description: "Bulk misc charge application will be available soon.",
        });
        break;
      default:
        break;
    }
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
          } as ReservationLine & { priceSource: 'panel' | 'pricelist' };
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

  const handlePrefillEdit = () => {
    // Focus on the first incomplete section (vehicles panel)
    const vehiclesSection = document.querySelector('[value="vehicles-drivers"]');
    if (vehiclesSection) {
      vehiclesSection.scrollIntoView({ behavior: 'smooth' });
      if (!accordionValues.includes('vehicles-drivers')) {
        setAccordionValues(prev => [...prev, 'vehicles-drivers']);
      }
    }
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
        </div>

        {/* Accordion Sections - REORDERED */}
        <Accordion type="multiple" value={accordionValues} onValueChange={setAccordionValues} className="space-y-4">
          
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
                {/* All existing rental info fields here */}
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

                {/* Reservation Entry Date */}
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
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.entryDate && <p className="text-sm text-destructive">{errors.entryDate}</p>}
                </div>

                {/* Reservation Method */}
                <div className="space-y-2">
                  <Label>Reservation Method <span className="text-destructive">*</span></Label>
                  {loading.reservationMethods ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.reservationMethodId} 
                      onValueChange={(value) => updateFormData('reservationMethodId', value)}
                    >
                      <SelectTrigger className={errors.reservationMethodId ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select reservation method" />
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
                  {errors.reservationMethodId && <p className="text-sm text-destructive">{errors.reservationMethodId}</p>}
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

                {/* Reservation Type */}
                <div className="space-y-2">
                  <Label>Reservation Type <span className="text-destructive">*</span></Label>
                  {loading.reservationTypes ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.reservationTypeId} 
                      onValueChange={(value) => updateFormData('reservationTypeId', value)}
                    >
                      <SelectTrigger className={errors.reservationTypeId ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select reservation type" />
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
                  {errors.reservationTypeId && <p className="text-sm text-destructive">{errors.reservationTypeId}</p>}
                </div>

                {/* Business Unit */}
                <div className="space-y-2">
                  <Label>Business Unit <span className="text-destructive">*</span></Label>
                  {loading.businessUnits ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.businessUnitId} 
                      onValueChange={(value) => updateFormData('businessUnitId', value)}
                    >
                      <SelectTrigger className={errors.businessUnitId ? "border-destructive" : ""}>
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
                  {errors.businessUnitId && <p className="text-sm text-destructive">{errors.businessUnitId}</p>}
                </div>

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label>Customer Name <span className="text-destructive">*</span></Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className={cn(
                          "w-full justify-between",
                          errors.customerId && "border-destructive"
                        )}
                      >
                        {selectedCustomer ? selectedCustomer.name : "Select customer..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
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
                          {loading.customers ? (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full" />
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No customers found.</CommandEmpty>
                              <CommandGroup>
                                {options.customers.map((customer) => (
                                  <CommandItem
                                    key={customer.id}
                                    value={customer.id}
                                    onSelect={() => {
                                      updateFormData('customerId', customer.id);
                                      setCustomerSearchOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.customerId === customer.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div>
                                      <div className="font-medium">{customer.name}</div>
                                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.customerId && <p className="text-sm text-destructive">{errors.customerId}</p>}
                </div>

                {/* Customer Bill to */}
                <div className="space-y-2">
                  <Label>Customer Bill to</Label>
                  {loading.billTo ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.billToId} 
                      onValueChange={(value) => updateFormData('billToId', value)}
                      disabled={!formData.customerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing account" />
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

                {/* Payment Terms */}
                <div className="space-y-2">
                  <Label>Payment Terms <span className="text-destructive">*</span></Label>
                  {loading.paymentTerms ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select 
                      value={formData.paymentTermsId} 
                      onValueChange={(value) => updateFormData('paymentTermsId', value)}
                    >
                      <SelectTrigger className={errors.paymentTermsId ? "border-destructive" : ""}>
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
                  {errors.paymentTermsId && <p className="text-sm text-destructive">{errors.paymentTermsId}</p>}
                </div>

                {/* Lease to Own */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="leaseToOwn"
                      checked={formData.leaseToOwn}
                      onCheckedChange={(checked) => updateFormData('leaseToOwn', Boolean(checked))}
                    />
                    <Label htmlFor="leaseToOwn">Lease to Own</Label>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>


          {/* B) Vehicle(s) & Driver(s) */}
          <AccordionItem value="vehicles-drivers" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Vehicle(s) & Driver(s)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Tabs defaultValue="vehicles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vehicles">Vehicle(s)</TabsTrigger>
                  <TabsTrigger value="drivers">Driver(s)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="vehicles" className="space-y-4">
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Vehicle Information - Left Side */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Vehicle Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Vehicle Class <span className="text-destructive">*</span></Label>
                              <Select value={formData.vehicleClassId} onValueChange={(value) => updateFormData('vehicleClassId', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle class" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="economy">Economy</SelectItem>
                                  <SelectItem value="compact">Compact</SelectItem>
                                  <SelectItem value="midsize">Midsize</SelectItem>
                                  <SelectItem value="fullsize">Full Size</SelectItem>
                                  <SelectItem value="luxury">Luxury</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Vehicle <span className="text-destructive">*</span></Label>
                              <Select value={formData.vehicleId} onValueChange={(value) => updateFormData('vehicleId', value)}>
                                <SelectTrigger data-id="vehicle-select">
                                  <SelectValue placeholder="Select vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="car1">Toyota Camry</SelectItem>
                                  <SelectItem value="car2">Honda Accord</SelectItem>
                                  <SelectItem value="car3">Nissan Altima</SelectItem>
                                  <SelectItem value="car4">BMW 3 Series</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Check out Date <span className="text-destructive">*</span></Label>
                              <Input 
                                type="datetime-local" 
                                value={formData.checkOutDate ? format(formData.checkOutDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => updateFormData('checkOutDate', e.target.value ? new Date(e.target.value) : null)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Check out Location <span className="text-destructive">*</span></Label>
                              <Select value={formData.checkOutLocationId} onValueChange={(value) => updateFormData('checkOutLocationId', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="loc1">Downtown</SelectItem>
                                  <SelectItem value="loc2">Airport Terminal 1</SelectItem>
                                  <SelectItem value="loc3">Airport Terminal 2</SelectItem>
                                  <SelectItem value="loc4">City Center</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Check in Date <span className="text-destructive">*</span></Label>
                              <Input 
                                type="datetime-local" 
                                value={formData.checkInDate ? format(formData.checkInDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => updateFormData('checkInDate', e.target.value ? new Date(e.target.value) : null)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Check in Location <span className="text-destructive">*</span></Label>
                              <Select value={formData.checkInLocationId} onValueChange={(value) => updateFormData('checkInLocationId', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="loc1">Downtown</SelectItem>
                                  <SelectItem value="loc2">Airport Terminal 1</SelectItem>
                                  <SelectItem value="loc3">Airport Terminal 2</SelectItem>
                                  <SelectItem value="loc4">City Center</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Driver Picker - Right Side */}
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Driver Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DriverPicker
                            selectedDrivers={selectedDrivers}
                            onDriversChange={setSelectedDrivers}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Add Line Validation */}
                  <AddLineValidation errors={addLineErrors} />
                  
                  {/* Add Line Button */}
                  <div className="flex justify-center pt-4">
                    <Button 
                      id="btn-add-line-vehicle" 
                      onClick={addReservationLine}
                      disabled={!isPrefillComplete()}
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="drivers" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Drivers</h4>
                    <Button size="sm" onClick={addDriver}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Driver
                    </Button>
                  </div>
                  
                  {(formData.drivers || []).length > 0 ? (
                    <div className="space-y-4">
                      {(formData.drivers || []).map((driver, index) => (
                        <Card key={driver.id}>
                          <CardContent className="pt-6">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={driver.fullName} placeholder="Enter full name" />
                              </div>
                              <div className="space-y-2">
                                <Label>License No</Label>
                                <Input value={driver.licenseNo} placeholder="Enter license number" />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={driver.phone} placeholder="Enter phone number" />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={driver.email} placeholder="Enter email" />
                              </div>
                              <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" />
                              </div>
                              <div className="space-y-2">
                                <Label>Vehicle / Line No</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select line" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(formData.reservationLines || []).map((line) => (
                                      <SelectItem key={line.id} value={line.id}>
                                        Line {line.lineNo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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

          {/* Reservation Lines Grid - Directly below Vehicle & Driver */}
          <div className="space-y-4">
            <Card className="border rounded-lg">
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    <CardTitle className="text-lg">Reservation Lines</CardTitle>
                    {(formData.reservationLines || []).length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {(formData.reservationLines || []).length} lines
                      </Badge>
                    )}
                  </div>
                  
                  {/* Bulk actions - only show when there are lines */}
                  {(formData.reservationLines || []).length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleBulkAction}>
                        <SelectTrigger id="lines-action" className="w-48">
                          <SelectValue placeholder="Bulk actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duplicate">Duplicate Selected</SelectItem>
                          <SelectItem value="remove">Remove Selected</SelectItem>
                          <SelectItem value="apply-rate">Apply Rate</SelectItem>
                          <SelectItem value="apply-discount">Apply Discount</SelectItem>
                          <SelectItem value="apply-misc">Apply Misc Charge</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('apply')}
                        disabled={selectedLines.length === 0}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ReservationLineGrid
                  lines={formData.reservationLines || []}
                  onLineUpdate={handleLineUpdate}
                  onLineRemove={handleLineRemove}
                  onLineDuplicate={handleLineDuplicate}
                  onSelectionChange={setSelectedLines}
                  selectedLines={selectedLines}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* D) Airport Information */}
          <AccordionItem value="airport-info" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                <span className="font-semibold">Airport Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Arrival Information</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Flight No.</Label>
                      <Input 
                        value={formData.arrivalFlightNo} 
                        onChange={(e) => updateFormData('arrivalFlightNo', e.target.value)}
                        placeholder="e.g., AA123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name of The Airport</Label>
                      <Input 
                        value={formData.arrivalAirport} 
                        onChange={(e) => updateFormData('arrivalAirport', e.target.value)}
                        placeholder="e.g., JFK International"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={formData.arrivalCity} 
                        onChange={(e) => updateFormData('arrivalCity', e.target.value)}
                        placeholder="e.g., New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zip Code</Label>
                      <Input 
                        value={formData.arrivalZipCode} 
                        onChange={(e) => updateFormData('arrivalZipCode', e.target.value)}
                        placeholder="e.g., 11430"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Flight Arrival Date & Time</Label>
                      <Input 
                        type="datetime-local"
                        value={formData.arrivalDateTime ? format(formData.arrivalDateTime, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => updateFormData('arrivalDateTime', e.target.value ? new Date(e.target.value) : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Airline</Label>
                      <Input 
                        value={formData.arrivalAirline} 
                        onChange={(e) => updateFormData('arrivalAirline', e.target.value)}
                        placeholder="e.g., American Airlines"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Passengers</Label>
                      <Input 
                        type="number"
                        min={0}
                        value={formData.arrivalPassengers} 
                        onChange={(e) => updateFormData('arrivalPassengers', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Departure Information</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Flight No.</Label>
                      <Input 
                        value={formData.departureFlightNo} 
                        onChange={(e) => updateFormData('departureFlightNo', e.target.value)}
                        placeholder="e.g., AA456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name of The Airport</Label>
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
                      <Label>Flight Departure Date & Time</Label>
                      <Input 
                        type="datetime-local"
                        value={formData.departureDateTime ? format(formData.departureDateTime, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => updateFormData('departureDateTime', e.target.value ? new Date(e.target.value) : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Airline</Label>
                      <Input 
                        value={formData.departureAirline} 
                        onChange={(e) => updateFormData('departureAirline', e.target.value)}
                        placeholder="e.g., American Airlines"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Passengers</Label>
                      <Input 
                        type="number"
                        min={0}
                        value={formData.departurePassengers} 
                        onChange={(e) => updateFormData('departurePassengers', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* E) Rate & Taxes */}
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
                      <div className="flex gap-2">
                        <Input 
                          id="rate-hourly"
                          type="number"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={(e) => updateFormData('hourlyRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        <Input 
                          type="number"
                          value={formData.hourlyQty}
                          onChange={(e) => updateFormData('hourlyQty', parseInt(e.target.value) || 0)}
                          placeholder="x qty"
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Rate</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="rate-daily"
                          type="number"
                          step="0.01"
                          value={formData.dailyRate}
                          onChange={(e) => updateFormData('dailyRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        <Input 
                          type="number"
                          value={formData.dailyQty}
                          onChange={(e) => updateFormData('dailyQty', parseInt(e.target.value) || 0)}
                          placeholder="x qty"
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Weekly Rate</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="rate-weekly"
                          type="number"
                          step="0.01"
                          value={formData.weeklyRate}
                          onChange={(e) => updateFormData('weeklyRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        <Input 
                          type="number"
                          value={formData.weeklyQty}
                          onChange={(e) => updateFormData('weeklyQty', parseInt(e.target.value) || 0)}
                          placeholder="x qty"
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Rate</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="rate-monthly"
                          type="number"
                          step="0.01"
                          value={formData.monthlyRate}
                          onChange={(e) => updateFormData('monthlyRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        <Input 
                          type="number"
                          value={formData.monthlyQty}
                          onChange={(e) => updateFormData('monthlyQty', parseInt(e.target.value) || 0)}
                          placeholder="x qty"
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Total Vehicle Price</Label>
                    <Input 
                      type="number"
                      value={formData.totalVehiclePrice}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label>Total Days</Label>
                    <Input 
                      type="number"
                      value={formData.totalDays}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Kilometer Allowed</Label>
                    <Input 
                      type="number"
                      value={formData.totalKilometerAllowed}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">Edit</Button>
                  <Button>Save</Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* F) Miscellaneous Charges */}
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
                    <span className="font-medium">AED {charge.amount}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* G) Billing */}
          <AccordionItem value="billing" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="font-semibold">Billing</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="billing-same" 
                        name="billing" 
                        checked={formData.billingCustomerName !== ''}
                        onChange={() => updateFormData('billingCustomerName', '')}
                      />
                      <Label htmlFor="billing-same">Same As Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="billing-other" 
                        name="billing" 
                        checked={formData.billingCustomerName === ''}
                        onChange={() => updateFormData('billingCustomerName', 'other')}
                      />
                      <Label htmlFor="billing-other">Other</Label>
                    </div>
                  </div>
                </div>

                {formData.billingCustomerName === 'other' && (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Select value={formData.billingCustomerName} onValueChange={(value) => updateFormData('billingCustomerName', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mail</Label>
                      <Input 
                        type="email"
                        value={formData.billingMail} 
                        onChange={(e) => updateFormData('billingMail', e.target.value)}
                        placeholder="customer@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone No.</Label>
                      <Input 
                        value={formData.billingPhone} 
                        onChange={(e) => updateFormData('billingPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Textarea 
                        value={formData.billingAddress} 
                        onChange={(e) => updateFormData('billingAddress', e.target.value)}
                        placeholder="123 Main St, City, State 12345"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* H) Notes */}
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

          {/* I) Insurance Information */}
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
                  <Label>Insurance / DW Level</Label>
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
                  <Label>Insurance / DW Group</Label>
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
                      <SelectItem value="provider-1">Provider 1</SelectItem>
                      <SelectItem value="provider-2">Provider 2</SelectItem>
                      <SelectItem value="provider-3">Provider 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* J) Adjustments & Deposits */}
          <AccordionItem value="adjustments-deposits" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span className="font-semibold">Adjustments & Deposits</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Pre-Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
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
                    min="0"
                    value={formData.advancePayment} 
                    onChange={(e) => updateFormData('advancePayment', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethodId} onValueChange={(value) => updateFormData('paymentMethodId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit Paid</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.securityDepositPaid} 
                    onChange={(e) => updateFormData('securityDepositPaid', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deposit Method</Label>
                  <Select value={formData.depositMethodId} onValueChange={(value) => updateFormData('depositMethodId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit Card Hold</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deposit Payment Method</Label>
                  <Select value={formData.depositPaymentMethodId} onValueChange={(value) => updateFormData('depositPaymentMethodId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cancellation Charges</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cancellationCharges} 
                    onChange={(e) => updateFormData('cancellationCharges', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* K) Referral Information */}
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
                  <Label>Address</Label>
                  <Input 
                    value={formData.referralAddress} 
                    onChange={(e) => updateFormData('referralAddress', e.target.value)}
                    placeholder="Referral address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone No.</Label>
                  <Input 
                    value={formData.referralPhone} 
                    onChange={(e) => updateFormData('referralPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Benefit Type</Label>
                  <Select value={formData.referralBenefitTypeId} onValueChange={(value) => updateFormData('referralBenefitTypeId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select benefit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.referralBenefitTypeId === 'percentage' ? 100 : undefined}
                      value={formData.referralValue} 
                      onChange={(e) => updateFormData('referralValue', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    {formData.referralBenefitTypeId === 'percentage' && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>


        </Accordion>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 md:justify-end md:space-x-4 sticky bottom-0 bg-background p-4 border-t md:border-t-0 md:bg-transparent md:p-0">
          <Button 
            id="btn-cancel"
            type="button" 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              navigate('/reservations');
            }}
            className="order-3 md:order-1"
          >
            Cancel
          </Button>
          <Button 
            id="btn-save-draft"
            type="button"
            variant="secondary"
            onClick={() => handleSave('DRAFT')}
            disabled={loading.saving}
            className="order-1 md:order-2"
          >
            {loading.saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            id="btn-save-continue"
            type="button"
            onClick={() => handleSave('ACTIVE')}
            disabled={loading.saving}
            className="order-2 md:order-3"
          >
            {loading.saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>

      {/* Summary Panel - Desktop: Right sidebar, Mobile: Below form */}
      <div className="lg:w-80 lg:sticky lg:top-6 lg:h-fit order-first lg:order-last">
        <SummaryCard 
          summary={summary} 
          currencyCode={formData.currencyCode || 'AED'}
          className="lg:sticky lg:top-6"
        />
      </div>
    </div>
  );
};

export default NewReservation;
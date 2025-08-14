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
import { CalendarIcon, ChevronDown, Check, Plus, Trash2, Edit, Copy, Car, User, Plane, DollarSign, FileText, Shield, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockApi, DropdownOption, Customer, ReservationFormData } from '@/lib/api/reservations';

const STORAGE_KEY = 'new-reservation-draft';

// Extended interfaces for new sections
interface ReservationLine {
  id: string;
  lineNo: number;
  reservationTypeId: string;
  vehicleClassId: string;
  vehicleId: string;
  driverName: string;
  checkOutDate: Date;
  checkInDate: Date;
  lineNetPrice: number;
  additionAmount: number;
  discountId: string;
  discountValue: number;
  taxId: string;
  taxValue: number;
  lineTotal: number;
  selected: boolean;
}

interface Driver {
  id: string;
  fullName: string;
  licenseNo: string;
  phone: string;
  email: string;
  dob: Date | null;
  vehicleLineId: string;
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
    currencyCode: '',
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
    taxCodeId: null,
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

  // State for accordion sections
  const [accordionValues, setAccordionValues] = useState([
    'rental-info',
    'reservation-lines',
    'vehicles-drivers',
    'rate-taxes',
    'referral-info'
  ]);

  // Summary calculations
  const calculateSummary = () => {
    const subtotal = formData.reservationLines.reduce((sum, line) => sum + line.lineNetPrice, 0);
    const charges = formData.selectedMiscCharges.length * 50; // Mock calculation
    const discounts = formData.reservationLines.reduce((sum, line) => sum + line.discountValue, 0);
    const tax = formData.reservationLines.reduce((sum, line) => sum + line.taxValue, 0);
    const deposits = formData.securityDepositPaid + formData.advancePayment;
    const grandTotal = subtotal + charges - discounts + tax - deposits + formData.preAdjustment + formData.cancellationCharges;
    
    return { subtotal, charges, discounts, tax, deposits, grandTotal };
  };

  const summary = calculateSummary();
  const selectedCustomer = options.customers.find(c => c.id === formData.customerId);

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
    const newLine: ReservationLine = {
      id: Date.now().toString(),
      lineNo: formData.reservationLines.length + 1,
      reservationTypeId: formData.vehicleClassId || '',
      vehicleClassId: formData.vehicleClassId || '',
      vehicleId: formData.vehicleId || '',
      driverName: '',
      checkOutDate: formData.checkOutDate || new Date(),
      checkInDate: formData.checkInDate || new Date(),
      lineNetPrice: 0,
      additionAmount: 0,
      discountId: '',
      discountValue: 0,
      taxId: '',
      taxValue: 0,
      lineTotal: 0,
      selected: false,
    };
    
    setFormData(prev => ({
      ...prev,
      reservationLines: [...prev.reservationLines, newLine]
    }));
  };

  const addDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      fullName: '',
      licenseNo: '',
      phone: '',
      email: '',
      dob: null,
      vehicleLineId: '',
    };
    
    setFormData(prev => ({
      ...prev,
      drivers: [...prev.drivers, newDriver]
    }));
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
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

        {/* Accordion Sections */}
        <Accordion type="multiple" value={accordionValues} onValueChange={setAccordionValues} className="space-y-4">
          
          {/* A) Rental Information */}
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

          {/* B) Reservation Lines */}
          <AccordionItem value="reservation-lines" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span className="font-semibold">Reservation Lines</span>
                {formData.reservationLines.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {formData.reservationLines.length} lines
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger id="lines-action" className="w-48">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add-vehicle">Add Vehicle</SelectItem>
                      <SelectItem value="duplicate">Duplicate Selected</SelectItem>
                      <SelectItem value="remove">Remove Selected</SelectItem>
                      <SelectItem value="apply-rate">Apply Rate</SelectItem>
                      <SelectItem value="apply-discount">Apply Discount</SelectItem>
                      <SelectItem value="apply-misc">Apply Misc Charge</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">Apply</Button>
                  <div className="ml-auto">
                    <Button size="sm" onClick={addReservationLine}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>
                </div>

                {/* Lines Table */}
                {formData.reservationLines.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Line No.</TableHead>
                          <TableHead>Reservation Type</TableHead>
                          <TableHead>Vehicle Class</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Driver Name</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Line Net Price</TableHead>
                          <TableHead>Line Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.reservationLines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>{line.lineNo}</TableCell>
                            <TableCell>
                              <Select>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="economy">Economy</SelectItem>
                                  <SelectItem value="compact">Compact</SelectItem>
                                  <SelectItem value="midsize">Midsize</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="car1">Toyota Camry</SelectItem>
                                  <SelectItem value="car2">Honda Accord</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input placeholder="Driver name" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input type="datetime-local" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input type="datetime-local" className="w-full" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" value={line.lineNetPrice} className="w-full" readOnly />
                            </TableCell>
                            <TableCell>
                              <Input type="number" value={line.lineTotal} className="w-full" readOnly />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No reservation lines added yet. Click "Add Line" to get started.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* C) Vehicle(s) & Driver(s) */}
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Vehicle Class</Label>
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
                          <Label>Vehicle</Label>
                          <Select value={formData.vehicleId} onValueChange={(value) => updateFormData('vehicleId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="car1">Toyota Camry</SelectItem>
                              <SelectItem value="car2">Honda Accord</SelectItem>
                              <SelectItem value="car3">Nissan Altima</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Check out Date</Label>
                          <Input 
                            type="datetime-local" 
                            value={formData.checkOutDate ? format(formData.checkOutDate, "yyyy-MM-dd'T'HH:mm") : ''}
                            onChange={(e) => updateFormData('checkOutDate', e.target.value ? new Date(e.target.value) : null)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Check out Location</Label>
                          <Select value={formData.checkOutLocationId} onValueChange={(value) => updateFormData('checkOutLocationId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="downtown">Downtown</SelectItem>
                              <SelectItem value="airport">Airport</SelectItem>
                              <SelectItem value="suburban">Suburban</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Check in Date</Label>
                          <Input 
                            type="datetime-local" 
                            value={formData.checkInDate ? format(formData.checkInDate, "yyyy-MM-dd'T'HH:mm") : ''}
                            onChange={(e) => updateFormData('checkInDate', e.target.value ? new Date(e.target.value) : null)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Check in Location</Label>
                          <Select value={formData.checkInLocationId} onValueChange={(value) => updateFormData('checkInLocationId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="downtown">Downtown</SelectItem>
                              <SelectItem value="airport">Airport</SelectItem>
                              <SelectItem value="suburban">Suburban</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button onClick={addReservationLine}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Vehicle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="drivers" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Drivers</h4>
                    <Button size="sm" onClick={addDriver}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Driver
                    </Button>
                  </div>
                  
                  {formData.drivers.length > 0 ? (
                    <div className="space-y-4">
                      {formData.drivers.map((driver, index) => (
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
                                    {formData.reservationLines.map((line) => (
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

          {/* Continuation of accordion sections will be added in next part due to size constraints */}
          
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

      {/* Summary Panel */}
      <div className="w-80 space-y-4 sticky top-6 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Charges:</span>
              <span>${summary.charges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discounts:</span>
              <span>-${summary.discounts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${summary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Deposits:</span>
              <span>-${summary.deposits.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Grand Total:</span>
              <span>${summary.grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewReservation;
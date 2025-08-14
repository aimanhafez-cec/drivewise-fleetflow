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
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockApi, DropdownOption, Customer, ReservationFormData } from '@/lib/api/reservations';

const STORAGE_KEY = 'new-reservation-draft';

const NewReservation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ReservationFormData>({
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

  const updateFormData = (field: keyof ReservationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedCustomer = options.customers.find(c => c.id === formData.customerId);

  return (
    <div className="space-y-6">
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Information</CardTitle>
        </CardHeader>
        <CardContent>
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
                      errors.validityDateTo && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.validityDateTo ? format(formData.validityDateTo, "PPP") : <span>Pick validity date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.validityDateTo || undefined}
                    onSelect={(date) => updateFormData('validityDateTo', date)}
                    disabled={(date) => date < formData.entryDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.validityDateTo && <p className="text-sm text-destructive">{errors.validityDateTo}</p>}
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <Label>Discount Type</Label>
              {loading.discountTypes ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select 
                  value={formData.discountTypeId || ''} 
                  onValueChange={(value) => updateFormData('discountTypeId', value || null)}
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

            {/* Discount */}
            <div className="space-y-2">
              <Label>Discount</Label>
              {formData.discountTypeId === 'percentage' ? (
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountValue as number || ''}
                    onChange={(e) => updateFormData('discountValue', Number(e.target.value))}
                    placeholder="Enter percentage"
                    className={errors.discountValue ? "border-destructive" : ""}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              ) : formData.discountTypeId === 'program' ? (
                loading.discounts ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select 
                    value={formData.discountValue as string || ''} 
                    onValueChange={(value) => updateFormData('discountValue', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount program" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.discounts.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : (
                <Input disabled placeholder="Select discount type first" />
              )}
              {errors.discountValue && <p className="text-sm text-destructive">{errors.discountValue}</p>}
            </div>

            {/* Contract Billing Plan */}
            <div className="space-y-2">
              <Label>Contract Billing Plan</Label>
              {loading.contractBillingPlans ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select 
                  value={formData.contractBillingPlanId || ''} 
                  onValueChange={(value) => updateFormData('contractBillingPlanId', value || null)}
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
                  value={formData.taxLevelId || ''} 
                  onValueChange={(value) => updateFormData('taxLevelId', value || null)}
                >
                  <SelectTrigger>
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
            </div>

            {/* Tax Code */}
            <div className="space-y-2">
              <Label>Tax Code</Label>
              {loading.taxCodes ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select 
                  value={formData.taxCodeId || ''} 
                  onValueChange={(value) => updateFormData('taxCodeId', value || null)}
                  disabled={!formData.taxLevelId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax code" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.taxCodes.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
        </CardContent>
      </Card>

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
  );
};

export default NewReservation;
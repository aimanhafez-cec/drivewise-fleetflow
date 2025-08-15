import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarIcon, Clock, MapPin, User, CreditCard, FileText, Car } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomerSelect } from '@/components/ui/select-components';
import { mockApi, type ReservationFormData, type DropdownOption, type Customer } from '@/lib/api/reservations';

// Validation schema for the reservation form
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[\s(-]?[0-9]{3}))?([-]?[\s]?[0-9]{3})?([-]?[\s]?[0-9]{4})?$/
);

const contactSchema = z.object({
  firstName: z.string().min(2, {
    message: "First Name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  phone: z.string().regex(phoneRegex, {
    message: "Please enter a valid phone number.",
  }),
});

const vehicleSchema = z.object({
  vehicleClass: z.string().min(1, {
    message: "Vehicle Class is required",
  }),
  vehicleMake: z.string().min(1, {
    message: "Vehicle Make is required",
  }),
  vehicleModel: z.string().min(1, {
    message: "Vehicle Model is required",
  }),
  year: z.string().min(4, {
    message: "Vehicle Year is required",
  }),
  licensePlate: z.string().min(5, {
    message: "License Plate is required",
  }),
  vin: z.string().min(17, {
    message: "VIN is required",
  }),
});

const locationSchema = z.object({
  pickupLocation: z.string().min(3, {
    message: "Pickup Location is required",
  }),
  returnLocation: z.string().min(3, {
    message: "Return Location is required",
  }),
  pickupDate: z.date({
    required_error: "Pickup Date is required.",
  }),
  returnDate: z.date({
    required_error: "Return Date is required.",
  }),
});

const reservationSchema = z.object({
  // Basic Information
  reservationNo: z.string().nullable(),
  entryDate: z.date(),
  reservationMethodId: z.string().min(1, 'Reservation method is required'),
  currencyCode: z.string().min(1, 'Currency is required'),
  
  // Reservation Details
  reservationTypeId: z.string().min(1, 'Reservation type is required'),
  businessUnitId: z.string().min(1, 'Business unit is required'),
  
  // Customer Information
  customerId: z.string().min(1, 'Customer is required'),
  billToId: z.string().min(1, 'Bill to is required'),
  billingType: z.string().min(1, 'Billing type is required'),
  paymentTermsId: z.string().min(1, 'Payment terms are required'),
  
  // Contract Details
  validityDateTo: z.date().nullable(),
  discountTypeId: z.string().nullable(),
  discountValue: z.union([z.number(), z.string()]).nullable(),
  contractBillingPlanId: z.string().nullable(),
  
  // Tax Information
  taxLevelId: z.string().nullable(),
  taxCodeId: z.string().nullable(),
  
  // Additional Options
  leaseToOwn: z.boolean().default(false),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface FormOptions {
  currencies: DropdownOption[];
  reservationMethods: DropdownOption[];
  reservationTypes: DropdownOption[];
  businessUnits: DropdownOption[];
  customers: Customer[];
  billToOptions: DropdownOption[];
  billingTypes: DropdownOption[];
  paymentTerms: DropdownOption[];
  discountTypes: DropdownOption[];
  discountOptions: DropdownOption[];
  contractBillingPlans: DropdownOption[];
  taxLevels: DropdownOption[];
  taxCodes: DropdownOption[];
}

const billingTypeOptions: DropdownOption[] = [
  { id: 'same_customer', label: 'Same as Customer', value: 'same_customer' },
  { id: 'corporate', label: 'Corporate Account / Employer', value: 'corporate' },
  { id: 'insurance', label: 'Insurance Company', value: 'insurance' },
  { id: 'travel_agency', label: 'Travel Agency / Tour Operator', value: 'travel_agency' },
  { id: 'government', label: 'Government Department / Public Sector', value: 'government' },
  { id: 'fleet_management', label: 'Fleet Management Company', value: 'fleet_management' },
  { id: 'event_organizer', label: 'Event Organizer / Production Company', value: 'event_organizer' },
  { id: 'long_term_lease', label: 'Long-Term Lease Agreement Holder', value: 'long_term_lease' },
  { id: 'third_party', label: 'Third-Party Individual (not the driver)', value: 'third_party' },
  { id: 'partner', label: 'Partner Organization / Franchise', value: 'partner' },
];

export default function NewReservation() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<FormOptions>({
    currencies: [],
    reservationMethods: [],
    reservationTypes: [],
    businessUnits: [],
    customers: [],
    billToOptions: [],
    billingTypes: billingTypeOptions,
    paymentTerms: [],
    discountTypes: [],
    discountOptions: [],
    contractBillingPlans: [],
    taxLevels: [],
    taxCodes: [],
  });

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      reservationNo: null,
      entryDate: new Date(),
      reservationMethodId: '',
      currencyCode: 'EGP', // Default to EGP
      reservationTypeId: '',
      businessUnitId: '',
      customerId: '',
      billToId: '',
      billingType: 'same_customer', // Default to "Same as Customer"
      paymentTermsId: '',
      validityDateTo: null,
      discountTypeId: null,
      discountValue: null,
      contractBillingPlanId: null,
      taxLevelId: null,
      taxCodeId: null,
      leaseToOwn: false,
    },
  });

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

    try {
      const results = await Promise.allSettled(loadTasks.map(task => task.fn()));
      
      const newOptions = { ...options };
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const key = loadTasks[index].key as keyof FormOptions;
          (newOptions as any)[key] = result.value;
        }
      });
      
      setOptions(newOptions);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleCustomerChange = async (customerId: string) => {
    if (!customerId) {
      setOptions(prev => ({ ...prev, billToOptions: [] }));
      return;
    }

    try {
      const billToOptions = await mockApi.getCustomerBillTo(customerId);
      setOptions(prev => ({ ...prev, billToOptions }));
      
      // Auto-select first bill-to option if available
      if (billToOptions.length > 0) {
        form.setValue('billToId', billToOptions[0].id);
      }
    } catch (error) {
      console.error('Error loading bill-to options:', error);
      toast.error('Failed to load billing options');
    }
  };

  const handleDiscountTypeChange = async (typeId: string) => {
    if (!typeId) {
      setOptions(prev => ({ ...prev, discountOptions: [] }));
      form.setValue('discountValue', null);
      return;
    }

    try {
      const discountOptions = await mockApi.getDiscounts(typeId);
      setOptions(prev => ({ ...prev, discountOptions }));
      
      // Clear previous discount value
      form.setValue('discountValue', null);
    } catch (error) {
      console.error('Error loading discount options:', error);
      toast.error('Failed to load discount options');
    }
  };

  const handleTaxLevelChange = async (levelId: string) => {
    if (!levelId) {
      setOptions(prev => ({ ...prev, taxCodes: [] }));
      form.setValue('taxCodeId', null);
      return;
    }

    try {
      const taxCodes = await mockApi.getTaxCodes(levelId);
      setOptions(prev => ({ ...prev, taxCodes }));
      
      // Clear previous tax code selection
      form.setValue('taxCodeId', null);
    } catch (error) {
      console.error('Error loading tax codes:', error);
      toast.error('Failed to load tax codes');
    }
  };

  const onSubmit = async (data: ReservationFormValues) => {
    setIsLoading(true);
    try {
      console.log('Creating reservation with data:', data);
      
      const response = await mockApi.createReservation(data, 'DRAFT');
      
      toast.success(`Reservation ${response.reservationNo} created successfully!`);
      navigate('/reservations');
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast.error(error.message || 'Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Reservation</h1>
          <p className="text-gray-600 mt-1">Create a new vehicle reservation</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <FileText className="w-4 h-4 mr-2" />
            DRAFT
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="multiple" defaultValue={["basic", "customer", "contract"]} className="space-y-4">
            {/* Basic Information Section */}
            <AccordionItem value="basic">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Basic Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Entry Date */}
                      <FormField
                        control={form.control}
                        name="entryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Entry Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reservation Method */}
                      <FormField
                        control={form.control}
                        name="reservationMethodId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reservation Method *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.reservationMethods.map((method) => (
                                  <SelectItem key={method.id} value={method.id}>
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Currency */}
                      <FormField
                        control={form.control}
                        name="currencyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.currencies.map((currency) => (
                                  <SelectItem key={currency.id} value={currency.id}>
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reservation Type */}
                      <FormField
                        control={form.control}
                        name="reservationTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reservation Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.reservationTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Business Unit */}
                      <FormField
                        control={form.control}
                        name="businessUnitId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Unit *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.businessUnits.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Customer & Billing Information Section */}
            <AccordionItem value="customer">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Customer & Billing Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Customer */}
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer *</FormLabel>
                            <FormControl>
                              <CustomerSelect
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  if (value) {
                                    handleCustomerChange(value as string);
                                  }
                                }}
                                placeholder="Search and select customer"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Billing Type */}
                      <FormField
                        control={form.control}
                        name="billingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select billing type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.billingTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Bill To */}
                      <FormField
                        control={form.control}
                        name="billToId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bill To *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bill to" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.billToOptions.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Terms */}
                      <FormField
                        control={form.control}
                        name="paymentTermsId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Terms *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment terms" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.paymentTerms.map((term) => (
                                  <SelectItem key={term.id} value={term.id}>
                                    {term.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Contract & Pricing Details Section */}
            <AccordionItem value="contract">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Contract & Pricing Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Validity Date To */}
                      <FormField
                        control={form.control}
                        name="validityDateTo"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Validity Date To</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Discount Type */}
                      <FormField
                        control={form.control}
                        name="discountTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleDiscountTypeChange(value);
                              }}
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.discountTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Discount Value */}
                      {form.watch('discountTypeId') && (
                        <FormField
                          control={form.control}
                          name="discountValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch('discountTypeId') === 'percentage' ? 'Discount %' : 'Discount Program'}
                              </FormLabel>
                              {form.watch('discountTypeId') === 'percentage' ? (
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="Enter percentage"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                              ) : (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value as string || ''}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {options.discountOptions.map((option) => (
                                      <SelectItem key={option.id} value={option.id}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Contract Billing Plan */}
                      <FormField
                        control={form.control}
                        name="contractBillingPlanId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contract Billing Plan</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select billing plan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.contractBillingPlans.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tax Level */}
                      <FormField
                        control={form.control}
                        name="taxLevelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Level</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleTaxLevelChange(value);
                              }}
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {options.taxLevels.map((level) => (
                                  <SelectItem key={level.id} value={level.id}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tax Code */}
                      {form.watch('taxLevelId') && (
                        <FormField
                          control={form.control}
                          name="taxCodeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax Code</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select tax code" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {options.taxCodes.map((code) => (
                                    <SelectItem key={code.id} value={code.id}>
                                      {code.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <Separator className="my-6" />

                    {/* Additional Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Additional Options</h3>
                      <FormField
                        control={form.control}
                        name="leaseToOwn"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Lease to Own</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Enable lease-to-own option for this reservation
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/reservations')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Reservation'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

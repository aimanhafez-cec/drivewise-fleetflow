import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle, Zap, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReservationTypeSelector from '@/components/instant-booking/wizard/ReservationTypeSelector';
import CustomerIdentification from '@/components/instant-booking/wizard/CustomerIdentification';
import DatesLocations from '@/components/instant-booking/wizard/DatesLocations';
import VehicleSelection from '@/components/instant-booking/wizard/VehicleSelection';
import ServicesAddOns from '@/components/instant-booking/wizard/ServicesAddOns';
import PricingSummary from '@/components/instant-booking/wizard/PricingSummary';
import DemoPayment from '@/components/instant-booking/DemoPayment';
import WizardBookingConfirmation from '@/components/instant-booking/wizard/WizardBookingConfirmation';
import { useInstantBooking } from '@/hooks/useInstantBooking';

export interface BookingWizardData {
  // Step 1: Reservation Type
  reservationType: 'vehicle_class' | 'make_model' | 'specific_vin' | null;
  
  // Step 2: Customer
  customerId: string;
  customerType: 'Person' | 'Company';
  customerName: string;
  
  // Step 3: Dates & Locations
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  
  // Step 4: Vehicle Selection
  vehicleClassId?: string;
  vehicleClassName?: string;
  makeModel?: string;
  specificVehicleId?: string;
  
  // Step 5: Services & Add-ons
  selectedAddOns: string[];
  addOnCharges: Record<string, number>;
  
  // Step 6: Pricing
  pricing: {
    baseAmount: number;
    addOnsTotal: number;
    oneWayFee?: number;
    taxAmount: number;
    totalAmount: number;
    downPaymentRequired: number;
    balanceDue: number;
  } | null;
  
  // Step 7: Payment
  paymentMethod: string;
  paymentTransactionId?: string;
  
  // Step 8: Created Agreement
  agreementNo?: string;
  agreementId?: string;
}

const NewInstantBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [expressMode, setExpressMode] = useState(false);
  const { createInstantBooking } = useInstantBooking();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingData, setBookingData] = useState<BookingWizardData>({
    reservationType: null,
    customerId: '',
    customerType: 'Person',
    customerName: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    pickupLocation: '',
    returnLocation: '',
    selectedAddOns: [],
    addOnCharges: {},
    pricing: null,
    paymentMethod: 'card',
  });

  const totalSteps = 8;

  const stepTitles = [
    'Reservation Type',
    'Customer Details',
    'Dates & Locations',
    'Vehicle Selection',
    'Services & Add-ons',
    'Pricing Summary',
    'Down Payment',
    'Confirmation'
  ];

  const updateBookingData = (updates: Partial<BookingWizardData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.reservationType !== null;
      case 2:
        return bookingData.customerId !== '';
      case 3:
        return bookingData.pickupDate && bookingData.pickupTime && 
               bookingData.returnDate && bookingData.returnTime &&
               bookingData.pickupLocation && bookingData.returnLocation;
      case 4:
        if (bookingData.reservationType === 'vehicle_class') {
          return !!bookingData.vehicleClassId;
        } else if (bookingData.reservationType === 'make_model') {
          return !!bookingData.makeModel;
        } else if (bookingData.reservationType === 'specific_vin') {
          return !!bookingData.specificVehicleId;
        }
        return false;
      case 5:
        return true; // Add-ons are optional
      case 6:
        return bookingData.pricing !== null && bookingData.pricing.totalAmount > 0;
      case 7:
        return !!bookingData.paymentTransactionId;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      // Skip add-ons step (step 5) if in express mode
      if (expressMode && currentStep === 4) {
        setCurrentStep(6); // Jump to pricing summary
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Skip add-ons step (step 5) when going back if in express mode
      if (expressMode && currentStep === 6) {
        setCurrentStep(4); // Jump back to vehicle selection
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/instant-booking');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Enter key - proceed to next step
      if (e.key === 'Enter' && canProceed() && currentStep < 8) {
        e.preventDefault();
        handleNext();
      }

      // Escape key - go back
      if (e.key === 'Escape' && currentStep > 1 && currentStep < 8) {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, bookingData, expressMode]);

  // Handle express mode toggle
  const handleExpressModeToggle = (checked: boolean) => {
    setExpressMode(checked);
    toast({
      title: checked ? "Express Mode Enabled ⚡" : "Express Mode Disabled",
      description: checked 
        ? "Add-ons step will be skipped for faster booking" 
        : "All steps will be shown",
    });
  };

  const handlePaymentComplete = async () => {
    setIsCreatingBooking(true);
    
    try {
      // Create the booking and agreement
      const result = await createInstantBooking({
        pickupDate: `${bookingData.pickupDate}T${bookingData.pickupTime}`,
        returnDate: `${bookingData.returnDate}T${bookingData.returnTime}`,
        pickupLocation: bookingData.pickupLocation,
        returnLocation: bookingData.returnLocation,
        vehicleId: bookingData.specificVehicleId || '',
        customerId: bookingData.customerId,
        customerType: bookingData.customerType,
        selectedAddOns: bookingData.selectedAddOns,
        addOnCharges: bookingData.addOnCharges,
        pricing: bookingData.pricing,
      });

      // Update booking data with agreement details
      updateBookingData({
        agreementNo: result.agreementNo,
        agreementId: result.agreement.id,
      });

      // Move to confirmation step
      setCurrentStep(8);
    } catch (error) {
      console.error('Booking creation failed:', error);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">New Instant Booking</h1>
              <p className="text-muted-foreground mt-1">
                Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Express Mode Toggle */}
              {currentStep <= 4 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <Label htmlFor="express-mode" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    Express Mode
                  </Label>
                  <Switch
                    id="express-mode"
                    checked={expressMode}
                    onCheckedChange={handleExpressModeToggle}
                  />
                </div>
              )}
              
              {/* Keyboard Shortcuts Hint */}
              {currentStep < 8 && (
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <Keyboard className="h-3 w-3" />
                  <span className="font-mono">Enter</span> to continue
                  <span className="mx-1">•</span>
                  <span className="font-mono">Esc</span> to go back
                </div>
              )}
              
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {stepTitles.map((title, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 ${
                    index + 1 === currentStep
                      ? 'text-primary font-semibold'
                      : index + 1 < currentStep
                      ? 'text-emerald-600'
                      : ''
                  }`}
                >
                  {index + 1 < currentStep && <CheckCircle className="h-3 w-3" />}
                  <span className="hidden lg:inline">{title}</span>
                  <span className="lg:hidden">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <ReservationTypeSelector
                    selectedType={bookingData.reservationType}
                    onTypeSelect={(type) => updateBookingData({ reservationType: type })}
                  />
                )}
                
                {currentStep === 2 && (
                  <CustomerIdentification
                    selectedCustomerId={bookingData.customerId}
                    onCustomerSelect={(customer) => 
                      updateBookingData({ 
                        customerId: customer.id,
                        customerType: customer.customer_type,
                        customerName: customer.full_name 
                      })
                    }
                  />
                )}
                
                {currentStep === 3 && (
                  <DatesLocations
                    data={{
                      pickupDate: bookingData.pickupDate,
                      pickupTime: bookingData.pickupTime,
                      returnDate: bookingData.returnDate,
                      returnTime: bookingData.returnTime,
                      pickupLocation: bookingData.pickupLocation,
                      returnLocation: bookingData.returnLocation,
                    }}
                    onUpdate={updateBookingData}
                  />
                )}
                
                {currentStep === 4 && (
                  <VehicleSelection
                    reservationType={bookingData.reservationType!}
                    pickupDate={`${bookingData.pickupDate}T${bookingData.pickupTime}`}
                    returnDate={`${bookingData.returnDate}T${bookingData.returnTime}`}
                    selectedVehicleClassId={bookingData.vehicleClassId}
                    selectedMakeModel={bookingData.makeModel}
                    selectedVehicleId={bookingData.specificVehicleId}
                    onSelect={updateBookingData}
                  />
                )}
                
                {currentStep === 5 && (
                  <ServicesAddOns
                    selectedAddOns={bookingData.selectedAddOns}
                    addOnCharges={bookingData.addOnCharges}
                    rentalDays={
                      bookingData.pickupDate && bookingData.returnDate
                        ? Math.ceil(
                            (new Date(`${bookingData.returnDate}T${bookingData.returnTime}`).getTime() -
                              new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 1
                    }
                    onUpdate={updateBookingData}
                  />
                )}
                
                {currentStep === 6 && (
                  <PricingSummary
                    bookingData={bookingData}
                    onPricingCalculated={(pricing) => updateBookingData({ pricing })}
                  />
                )}
                
                {currentStep === 7 && bookingData.pricing && !isCreatingBooking && (
                  <DemoPayment
                    amount={bookingData.pricing.downPaymentRequired}
                    agreementNo="Pending..."
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
                
                {isCreatingBooking && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Creating Your Booking...</h3>
                    <p className="text-muted-foreground">Please wait while we finalize your agreement</p>
                  </div>
                )}
                
                {currentStep === 8 && (
                  <WizardBookingConfirmation
                    bookingData={bookingData}
                    onComplete={() => navigate('/instant-booking')}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Booking Summary</h3>
                
                {bookingData.reservationType && (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Reservation Type</p>
                    <p className="font-medium text-foreground capitalize">
                      {bookingData.reservationType.replace('_', ' ')}
                    </p>
                  </div>
                )}
                
                {bookingData.customerName && (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">{bookingData.customerName}</p>
                  </div>
                )}
                
                {bookingData.pickupDate && bookingData.returnDate && (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {Math.ceil(
                        (new Date(`${bookingData.returnDate}T${bookingData.returnTime || '12:00'}`).getTime() -
                          new Date(`${bookingData.pickupDate}T${bookingData.pickupTime || '12:00'}`).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </p>
                  </div>
                )}
                
                {bookingData.pickupLocation && (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Pickup Location</p>
                    <p className="font-medium text-foreground">{bookingData.pickupLocation}</p>
                  </div>
                )}
                
                {bookingData.pricing && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Amount</span>
                      <span className="font-medium">AED {bookingData.pricing.baseAmount.toFixed(2)}</span>
                    </div>
                    {bookingData.pricing.addOnsTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Add-ons</span>
                        <span className="font-medium">AED {bookingData.pricing.addOnsTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (5%)</span>
                      <span className="font-medium">AED {bookingData.pricing.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">AED {bookingData.pricing.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Down Payment Required</span>
                      <span className="font-semibold">AED {bookingData.pricing.downPaymentRequired.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentStep < 8 && (
          <div className="flex justify-between mt-6 max-w-7xl mx-auto lg:max-w-[calc(66.666%-1.5rem)]">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {currentStep === totalSteps - 1 ? 'Complete Booking' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewInstantBooking;

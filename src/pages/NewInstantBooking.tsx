import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle, Zap, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CustomerAndType from '@/components/instant-booking/wizard/CustomerAndType';
import DatesLocations from '@/components/instant-booking/wizard/DatesLocations';
import VehicleSelection from '@/components/instant-booking/wizard/VehicleSelection';
import AddOnsWithPricing from '@/components/instant-booking/wizard/AddOnsWithPricing';
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

  const totalSteps = 5; // Reduced from 8 to 5

  const stepTitles = [
    'Customer & Type',
    'Dates & Locations',
    'Vehicle Selection',
    'Add-ons & Pricing',
    'Confirmation'
  ];

  const updateBookingData = (updates: Partial<BookingWizardData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.reservationType !== null && bookingData.customerId !== '';
      case 2:
        return bookingData.pickupDate && bookingData.pickupTime && 
               bookingData.returnDate && bookingData.returnTime &&
               bookingData.pickupLocation && bookingData.returnLocation;
      case 3:
        if (bookingData.reservationType === 'vehicle_class') {
          return !!bookingData.vehicleClassId;
        } else if (bookingData.reservationType === 'make_model') {
          return !!bookingData.makeModel;
        } else if (bookingData.reservationType === 'specific_vin') {
          return !!bookingData.specificVehicleId;
        }
        return false;
      case 4:
        return bookingData.pricing !== null && bookingData.pricing.totalAmount > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      // Skip add-ons step (step 4) if in express mode
      if (expressMode && currentStep === 3) {
        // Move directly to payment after vehicle selection
        handlePaymentDirect();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentDirect = async () => {
    // For express mode, calculate pricing quickly and move to confirmation
    setIsCreatingBooking(true);
    
    try {
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

      updateBookingData({
        agreementNo: result.agreementNo,
        agreementId: result.agreement.id,
        paymentTransactionId: 'express-mode',
      });

      setCurrentStep(5);
    } catch (error) {
      console.error('Express booking creation failed:', error);
    } finally {
      setIsCreatingBooking(false);
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
      if (e.key === 'Enter' && canProceed() && currentStep < 5) {
        e.preventDefault();
        handleNext();
      }

      // Escape key - go back
      if (e.key === 'Escape' && currentStep > 1 && currentStep < 5) {
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
        ? "Add-ons & pricing step will be skipped for faster booking" 
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
      setCurrentStep(5);
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
              {currentStep <= 3 && (
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
              {currentStep < 5 && (
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
        <div className="grid grid-cols-1 gap-6">
          {/* Step Content - Full Width for merged steps */}
          <div className={currentStep === 4 ? 'w-full' : 'lg:max-w-5xl lg:mx-auto w-full'}>
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <CustomerAndType
                    selectedCustomerId={bookingData.customerId}
                    customerName={bookingData.customerName}
                    reservationType={bookingData.reservationType}
                    onCustomerSelect={(customer) => 
                      updateBookingData({ 
                        customerId: customer.id,
                        customerType: customer.customer_type,
                        customerName: customer.full_name 
                      })
                    }
                    onTypeSelect={(type) => updateBookingData({ reservationType: type })}
                    onAutoAdvance={handleNext}
                  />
                )}
                
                {currentStep === 2 && (
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
                
                {currentStep === 3 && (
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
                
                {currentStep === 4 && (
                  <AddOnsWithPricing
                    bookingData={bookingData}
                    onUpdate={updateBookingData}
                  />
                )}
                
                {isCreatingBooking && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Creating Your Booking...</h3>
                    <p className="text-muted-foreground">Please wait while we finalize your agreement</p>
                  </div>
                )}
                
                {currentStep === 5 && !isCreatingBooking && (
                  <WizardBookingConfirmation
                    bookingData={bookingData}
                    onComplete={() => navigate('/instant-booking')}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-6 max-w-7xl mx-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isCreatingBooking}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={currentStep === 4 ? handlePaymentComplete : handleNext}
              disabled={!canProceed() || isCreatingBooking}
              className="gap-2"
            >
              {currentStep === 4 ? (
                <>
                  Complete Booking
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewInstantBooking;

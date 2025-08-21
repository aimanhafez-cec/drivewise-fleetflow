import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import QuickVehicleSelector from '@/components/instant-booking/QuickVehicleSelector';
import CustomerDetector from '@/components/instant-booking/CustomerDetector';
import AddOnsSelector from '@/components/instant-booking/AddOnsSelector';
import PricingCalculatorInstant from '@/components/instant-booking/PricingCalculatorInstant';
import BookingConfirmation from '@/components/instant-booking/BookingConfirmation';
import DemoPayment from '@/components/instant-booking/DemoPayment';
import { useInstantBooking } from '@/hooks/useInstantBooking';

const InstantBooking = () => {
  const navigate = useNavigate();
  const { createInstantBooking, isLoading } = useInstantBooking();
  const [step, setStep] = useState(1);
  const [agreementData, setAgreementData] = useState<{agreementNo: string; agreementId: string} | null>(null);
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    returnLocation: '',
    vehicleId: '',
    customerId: '',
    customerType: 'B2C' as 'B2B' | 'B2C' | 'CORPORATE',
    selectedAddOns: [] as string[],
    addOnCharges: {} as Record<string, number>,
    pricing: null as any,
  });

  const handleDataChange = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAddOnToggle = (addOnId: string) => {
    const availableAddOns = [
      { id: 'additional_driver', amount: 25, isFlat: false },
      { id: 'child_seat', amount: 20, isFlat: false },
      { id: 'gps_navigation', amount: 15, isFlat: false },
      { id: 'wifi_hotspot', amount: 50, isFlat: false },
      { id: 'cdw_scdw', amount: 45, isFlat: false },
      { id: 'roadside_assistance', amount: 10, isFlat: false },
      { id: 'off_road_insurance', amount: 50, isFlat: false },
      { id: 'delivery_collection', amount: 100, isFlat: true },
      { id: 'young_driver', amount: 50, isFlat: false }
    ];

    const addOn = availableAddOns.find(a => a.id === addOnId);
    if (!addOn) return;

    const isSelected = bookingData.selectedAddOns.includes(addOnId);
    const rentalDays = bookingData.pickupDate && bookingData.returnDate 
      ? Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    
    if (isSelected) {
      setBookingData(prev => ({
        ...prev,
        selectedAddOns: prev.selectedAddOns.filter(id => id !== addOnId),
        addOnCharges: Object.fromEntries(
          Object.entries(prev.addOnCharges).filter(([key]) => key !== addOnId)
        )
      }));
    } else {
      const cost = addOn.isFlat ? addOn.amount : addOn.amount * rentalDays;
      setBookingData(prev => ({
        ...prev,
        selectedAddOns: [...prev.selectedAddOns, addOnId],
        addOnCharges: { ...prev.addOnCharges, [addOnId]: cost }
      }));
    }
  };

  const handleInstantBook = async () => {
    try {
      const result = await createInstantBooking(bookingData);
      setAgreementData({
        agreementNo: result.agreementNo,
        agreementId: result.agreement.id
      });
      setStep(7); // Move to payment step
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePaymentComplete = () => {
    navigate(`/agreements/${agreementData?.agreementId}`);
  };

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return bookingData.pickupDate && bookingData.returnDate && 
                     bookingData.pickupLocation && bookingData.returnLocation;
      case 2: return bookingData.vehicleId;
      case 3: return bookingData.customerId;
      case 4: return true; // Add-ons are optional
      case 5: return bookingData.pricing?.totalAmount > 0;
      case 6: return true; // Confirmation step
      case 7: return true; // Payment step
      default: return false;
    }
  };

  const stepTitles = [
    'Location & Date',
    'Vehicle Selection', 
    'Customer Details',
    'Add-ons',
    'Pricing Review',
    'Confirmation',
    'Payment'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">Instant Booking</h1>
          <p className="text-card-foreground/70">Book your vehicle in minutes</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Area */}
          <div className="lg:col-span-3">
            {step === 1 && (
              <Card className="shadow-card">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-card-foreground">Location & Date Selection</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-card-foreground">Pickup Date & Time</label>
                        <input
                          type="datetime-local"
                          value={bookingData.pickupDate}
                          onChange={(e) => handleDataChange('pickupDate', e.target.value)}
                          className="w-full p-2 border rounded-lg text-card-foreground bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-card-foreground">Return Date & Time</label>
                        <input
                          type="datetime-local"
                          value={bookingData.returnDate}
                          onChange={(e) => handleDataChange('returnDate', e.target.value)}
                          className="w-full p-2 border rounded-lg text-card-foreground bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-card-foreground">Pickup Location</label>
                        <select
                          value={bookingData.pickupLocation}
                          onChange={(e) => handleDataChange('pickupLocation', e.target.value)}
                          className="w-full p-2 border rounded-lg text-card-foreground bg-background"
                        >
                          <option value="">Select pickup location</option>
                          <option value="airport-terminal-1">Airport Terminal 1</option>
                          <option value="airport-terminal-2">Airport Terminal 2</option>
                          <option value="downtown-branch">Downtown Branch</option>
                          <option value="mall-branch">Mall Branch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-card-foreground">Return Location</label>
                        <select
                          value={bookingData.returnLocation}
                          onChange={(e) => handleDataChange('returnLocation', e.target.value)}
                          className="w-full p-2 border rounded-lg text-card-foreground bg-background"
                        >
                          <option value="">Select return location</option>
                          <option value="airport-terminal-1">Airport Terminal 1</option>
                          <option value="airport-terminal-2">Airport Terminal 2</option>
                          <option value="downtown-branch">Downtown Branch</option>
                          <option value="mall-branch">Mall Branch</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <QuickVehicleSelector
                pickupDate={bookingData.pickupDate}
                returnDate={bookingData.returnDate}
                pickupLocation={bookingData.pickupLocation}
                selectedVehicleId={bookingData.vehicleId}
                onVehicleSelect={(vehicleId) => handleDataChange('vehicleId', vehicleId)}
              />
            )}

            {step === 3 && (
              <CustomerDetector
                onCustomerSelect={(customer) => {
                  handleDataChange('customerId', customer.id);
                  handleDataChange('customerType', customer.customer_type);
                }}
                selectedCustomerId={bookingData.customerId}
              />
            )}

            {step === 4 && (
              <AddOnsSelector
                selectedAddOns={bookingData.selectedAddOns}
                addOnCharges={bookingData.addOnCharges}
                onAddOnToggle={handleAddOnToggle}
                rentalDays={bookingData.pickupDate && bookingData.returnDate 
                  ? Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 1
                }
              />
            )}

            {step === 5 && (
              <PricingCalculatorInstant
                bookingData={bookingData}
                onPricingUpdate={(pricing) => handleDataChange('pricing', pricing)}
              />
            )}

            {step === 6 && (
              <BookingConfirmation
                bookingData={bookingData}
                onConfirm={handleInstantBook}
                isLoading={isLoading}
              />
            )}

            {step === 7 && agreementData && (
              <DemoPayment
                amount={bookingData.pricing?.totalAmount || 0}
                agreementNo={agreementData.agreementNo}
                onPaymentComplete={handlePaymentComplete}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground">Progress</span>
                <span className="text-sm text-card-foreground/70">{step}/{step === 7 ? '7' : '6'}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${(step / (step === 7 ? 7 : 6)) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step */}
            <Card className="shadow-card">
              <CardContent className="p-4">
                <h3 className="font-medium text-card-foreground mb-2">
                  Step {step}: {stepTitles[step - 1]}
                </h3>
                <div className="space-y-2 text-sm text-card-foreground/70">
                  {step === 1 && <p>Choose your rental dates and locations</p>}
                  {step === 2 && <p>Select your preferred vehicle</p>}
                  {step === 3 && <p>Identify or add customer details</p>}
                  {step === 4 && <p>Add optional services and equipment</p>}
                  {step === 5 && <p>Review pricing and get quote</p>}
                  {step === 6 && <p>Confirm your booking details</p>}
                  {step === 7 && <p>Complete payment to finalize</p>}
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            {bookingData.pickupDate && (
              <Card className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium text-card-foreground">Booking Summary</h3>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="text-sm text-card-foreground">
                      {bookingData.pickupDate && bookingData.returnDate && (
                        <span>
                          {Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {bookingData.pickupLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="text-sm text-card-foreground">
                        {bookingData.pickupLocation.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                  )}

                  {bookingData.pricing?.totalAmount > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-card-foreground">Total:</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          AED {bookingData.pricing.totalAmount.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            {step < 7 && (
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous Step
                  </Button>
                )}
                
                {step < 6 && (
                  <Button
                    onClick={handleNextStep}
                    disabled={!isStepComplete(step)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantBooking;
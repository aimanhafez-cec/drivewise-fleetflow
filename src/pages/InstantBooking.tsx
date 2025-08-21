import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Zap, CheckCircle, Car, Users, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import QuickVehicleSelector from '@/components/instant-booking/QuickVehicleSelector';
import CustomerDetector from '@/components/instant-booking/CustomerDetector';
import PricingCalculatorInstant from '@/components/instant-booking/PricingCalculatorInstant';
import AddOnsSelector from '@/components/instant-booking/AddOnsSelector';
import BookingConfirmation from '@/components/instant-booking/BookingConfirmation';
import { useInstantBooking } from '@/hooks/useInstantBooking';
import { LocationSelect } from '@/components/ui/select-components';
const InstantBooking = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({
    pickupDate: null,
    returnDate: null,
    pickupLocation: '',
    returnLocation: '',
    vehicleId: null,
    customerId: null,
    customerType: 'B2C',
    selectedAddOns: [],
    addOnCharges: {}
  });
  const {
    createInstantBooking,
    isLoading,
    calculateInstantPrice,
    checkAutoApproval
  } = useInstantBooking();
  const handleDataChange = (field: string, value: any) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
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
      // Remove add-on
      setBookingData(prev => ({
        ...prev,
        selectedAddOns: prev.selectedAddOns.filter((id: string) => id !== addOnId),
        addOnCharges: Object.fromEntries(
          Object.entries(prev.addOnCharges).filter(([key]) => key !== addOnId)
        )
      }));
    } else {
      // Add add-on
      const cost = addOn.isFlat ? addOn.amount : addOn.amount * rentalDays;
      setBookingData(prev => ({
        ...prev,
        selectedAddOns: [...prev.selectedAddOns, addOnId],
        addOnCharges: {
          ...prev.addOnCharges,
          [addOnId]: cost
        }
      }));
    }
  };
  const handleInstantBook = async () => {
    try {
      const result = await createInstantBooking(bookingData);
      toast({
        title: "Booking Confirmed!",
        description: `Reservation ${result.ro_number} created successfully`
      });
      navigate(`/reservations/${result.id}`);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };
  const isStepComplete = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return bookingData.pickupDate && bookingData.returnDate && bookingData.pickupLocation;
      case 2:
        return bookingData.vehicleId;
      case 3:
        return bookingData.customerId;
      case 4:
        return true; // Add-ons are optional
      case 5:
        return true; // Pricing step is always complete when reached
      default:
        return false;
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            
          </div>
          
        </div>

        {/* Progress Steps */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
            {[{
              num: 1,
              title: 'Location & Date',
              icon: MapPin
            }, {
              num: 2,
              title: 'Vehicle',
              icon: Car
            }, {
              num: 3,
              title: 'Customer',
              icon: Users
            }, {
              num: 4,
              title: 'Add-ons',
              icon: Plus
            }, {
              num: 5,
              title: 'Pricing',
              icon: DollarSign
            }, {
              num: 6,
              title: 'Confirm',
              icon: CheckCircle
            }].map((stepInfo, index) => <div key={stepInfo.num} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                    ${step >= stepInfo.num ? 'bg-teal-600 text-white shadow-elegant' : step === stepInfo.num ? 'bg-teal-100 text-teal-700 border-2 border-teal-600' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {isStepComplete(stepInfo.num) ? <CheckCircle className="h-5 w-5" /> : <stepInfo.icon className="h-5 w-5" />}
                  </div>
                  <p className={`text-sm font-medium ${step >= stepInfo.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stepInfo.title}
                  </p>
                  {index < 5 && <div className={`h-0.5 w-full mt-3 ${step > stepInfo.num ? 'bg-primary' : 'bg-muted'}`} />}
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 1 && <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Date Selection
                  </CardTitle>
                  <CardDescription>
                    Choose your pickup and return details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup-date">Pickup Date & Time</Label>
                      <Input id="pickup-date" type="datetime-local" value={bookingData.pickupDate} onChange={e => handleDataChange('pickupDate', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="return-date">Return Date & Time</Label>
                      <Input id="return-date" type="datetime-local" value={bookingData.returnDate} onChange={e => handleDataChange('returnDate', e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup-location">Pickup Location</Label>
                      <LocationSelect value={bookingData.pickupLocation} onChange={locationId => handleDataChange('pickupLocation', locationId)} placeholder="Select pickup location..." className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="return-location">Return Location</Label>
                      <LocationSelect value={bookingData.returnLocation} onChange={locationId => handleDataChange('returnLocation', locationId)} placeholder="Select return location..." className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>}

            {step === 2 && <QuickVehicleSelector pickupDate={bookingData.pickupDate} returnDate={bookingData.returnDate} pickupLocation={bookingData.pickupLocation} selectedVehicleId={bookingData.vehicleId} onVehicleSelect={vehicleId => handleDataChange('vehicleId', vehicleId)} />}

            {step === 3 && <CustomerDetector onCustomerSelect={customer => {
            handleDataChange('customerId', customer.id);
            handleDataChange('customerType', customer.customer_type);
          }} selectedCustomerId={bookingData.customerId} />}

            {step === 4 && <AddOnsSelector 
              selectedAddOns={bookingData.selectedAddOns}
              addOnCharges={bookingData.addOnCharges}
              onAddOnToggle={handleAddOnToggle}
              rentalDays={bookingData.pickupDate && bookingData.returnDate 
                ? Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
                : 1
              }
            />}

            {step === 5 && <PricingCalculatorInstant bookingData={bookingData} onPricingUpdate={pricing => handleDataChange('pricing', pricing)} />}

            {step === 6 && <BookingConfirmation 
              bookingData={bookingData}
              onConfirm={handleInstantBook}
              isLoading={isLoading}
            />}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {bookingData.pickupDate && bookingData.returnDate ? `${Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days` : 'Select dates'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {bookingData.pickupLocation || 'Select location'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    Instant Booking
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="space-y-2">
              {step > 1 && <Button variant="outline" onClick={handlePreviousStep} className="w-full">
                  Previous Step
                </Button>}
              {step < 6 && isStepComplete(step) && <Button onClick={handleNextStep} className="w-full bg-primary hover:bg-primary/90">
                  Continue
                </Button>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default InstantBooking;
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Car, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BookingConfirmationProps {
  bookingData: {
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    returnLocation: string;
    vehicleId: string;
    customerId: string;
    customerType: 'B2B' | 'B2C' | 'CORPORATE';
    selectedAddOns: string[];
    addOnCharges: Record<string, number>;
    pricing?: {
      totalAmount: number;
      baseAmount: number;
      addOnTotal?: number;
      vatAmount: number;
      autoApproved: boolean;
    };
  };
  onConfirm: () => void;
  isLoading: boolean;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  onConfirm,
  isLoading
}) => {
  // Fetch vehicle details
  const { data: vehicle } = useQuery({
    queryKey: ['vehicle-confirmation', bookingData.vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', bookingData.vehicleId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingData.vehicleId
  });

  // Fetch customer details
  const { data: customer } = useQuery({
    queryKey: ['customer-confirmation', bookingData.customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', bookingData.customerId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingData.customerId
  });

  const rentalDays = Math.ceil(
    (new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) 
    / (1000 * 60 * 60 * 24)
  );

  const addOnCount = bookingData.selectedAddOns?.length || 0;
  const totalAmount = bookingData.pricing?.totalAmount || 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Booking Confirmation
        </CardTitle>
        <CardDescription className="text-card-foreground">
          Review your booking details and confirm your instant reservation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-muted/30 p-6 rounded-lg space-y-4">
          {/* Rental Period */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Rental Period</p>
                <p className="text-sm text-card-foreground/70">{rentalDays} day{rentalDays > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-card-foreground/70">
                {new Date(bookingData.pickupDate).toLocaleDateString()} - {new Date(bookingData.returnDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-card-foreground/60">
                {new Date(bookingData.pickupDate).toLocaleTimeString()} - {new Date(bookingData.returnDate).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Locations */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Locations</p>
                <p className="text-sm text-card-foreground/70">
                  {bookingData.pickupLocation === bookingData.returnLocation ? 'Same location' : 'Different locations'}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-card-foreground/70">
              <p>Pickup: {bookingData.pickupLocation}</p>
              <p>Return: {bookingData.returnLocation}</p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Vehicle</p>
                {vehicle && (
                  <p className="text-sm text-card-foreground/70">{vehicle.category?.name} Class</p>
                )}
              </div>
            </div>
            <div className="text-right">
              {vehicle ? (
                <>
                  <p className="font-medium text-card-foreground">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-sm text-card-foreground/70">{vehicle.license_plate}</p>
                </>
              ) : (
                <p className="text-card-foreground/70">Loading vehicle details...</p>
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Customer</p>
                <p className="text-sm text-card-foreground/70">{bookingData.customerType} Account</p>
              </div>
            </div>
            <div className="text-right">
              {customer ? (
                <>
                  <p className="font-medium text-card-foreground">{customer.full_name}</p>
                  <p className="text-sm text-card-foreground/70">{customer.email}</p>
                </>
              ) : (
                <p className="text-card-foreground/70">Loading customer details...</p>
              )}
            </div>
          </div>

          {/* Add-ons */}
          {addOnCount > 0 && (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-card-foreground">Add-ons</p>
                  <p className="text-sm text-card-foreground/70">{addOnCount} selected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">
                  AED {bookingData.pricing?.addOnTotal?.toFixed(2) || Object.values(bookingData.addOnCharges).reduce((sum, amount) => sum + amount, 0).toFixed(2)}
                </p>
                <p className="text-xs text-card-foreground/60">Add-ons total</p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Total Amount</h3>
            {bookingData.pricing?.autoApproved && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Auto-Approved
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-card-foreground/70">Base rental ({rentalDays} days)</span>
              <span className="text-card-foreground">AED {bookingData.pricing?.baseAmount?.toFixed(2) || '0.00'}</span>
            </div>
            
            {addOnCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-card-foreground/70">Add-ons</span>
                <span className="text-red-600">AED {(bookingData.pricing?.addOnTotal || Object.values(bookingData.addOnCharges).reduce((sum, amount) => sum + amount, 0)).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-card-foreground/70">VAT (5%)</span>
              <span className="text-card-foreground">AED {bookingData.pricing?.vatAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <div className="border-t border-primary/20 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-card-foreground">Total:</span>
              <span className="text-2xl font-bold text-red-600">
                AED {totalAmount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-card-foreground/70 mt-1">
              Effective daily rate: AED {rentalDays > 0 ? (totalAmount / rentalDays).toFixed(0) : '0'}
            </p>
          </div>
        </div>

        {/* Confirmation Button */}
        <Button 
          onClick={onConfirm} 
          className="w-full bg-background hover:opacity-90 text-white py-6 text-lg font-semibold" 
          disabled={isLoading || totalAmount === 0}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Booking...
            </div>
          ) : (
            `Confirm Instant Booking - AED ${totalAmount.toFixed(2)}`
          )}
        </Button>

        {totalAmount === 0 && (
          <p className="text-center text-destructive text-sm">
            Please go back and ensure pricing has been calculated properly.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingConfirmation;
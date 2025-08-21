import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InstantBookingData {
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  vehicleId: string;
  customerId: string;
  customerType: 'B2B' | 'B2C' | 'CORPORATE';
  selectedAddOns?: string[];
  addOnCharges?: Record<string, number>;
  pricing?: any;
}

export const useInstantBooking = () => {
  const { toast } = useToast();

  const createInstantBooking = useMutation({
    mutationFn: async (bookingData: InstantBookingData) => {
      // First generate reservation number
      const { data: reservationNumber, error: numberError } = await supabase
        .rpc('generate_reservation_no');

      if (numberError) throw numberError;

      // Create the reservation
      const reservationPayload = {
        ro_number: reservationNumber,
        customer_id: bookingData.customerId,
        vehicle_id: bookingData.vehicleId,
        start_datetime: bookingData.pickupDate,
        end_datetime: bookingData.returnDate,
        pickup_location: bookingData.pickupLocation,
        return_location: bookingData.returnLocation,
        total_amount: bookingData.pricing?.totalAmount || 0,
        add_ons: bookingData.selectedAddOns || [],
        booking_type: 'INSTANT' as const,
        auto_approved: bookingData.pricing?.autoApproved || false,
        instant_booking_score: 100, // High score for instant bookings
        status: bookingData.pricing?.autoApproved ? 'confirmed' as const : 'pending' as const,
      };

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationPayload])
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Create instant booking profile if it doesn't exist
      await supabase
        .from('instant_booking_profiles')
        .upsert({
          customer_id: bookingData.customerId,
          preferred_locations: [bookingData.pickupLocation],
          default_rental_duration: `${Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
        });

      return reservation;
    },
    onSuccess: (data) => {
      toast({
        title: "Instant Booking Successful!",
        description: `Reservation ${data.ro_number} has been created`,
      });
    },
    onError: (error) => {
      console.error('Instant booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to complete instant booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateInstantPrice = async (bookingData: Partial<InstantBookingData>) => {
    if (!bookingData.vehicleId || !bookingData.pickupDate || !bookingData.returnDate) {
      return null;
    }

    try {
      // Get vehicle details
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', bookingData.vehicleId)
        .single();

      if (vehicleError) throw vehicleError;

      const days = Math.ceil(
        (new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) 
        / (1000 * 60 * 60 * 24)
      );

      const baseAmount = days * (vehicle.daily_rate || 100);
      const taxAmount = baseAmount * 0.05; // 5% VAT
      const totalAmount = baseAmount + taxAmount;

      return {
        days,
        baseAmount,
        taxAmount,
        totalAmount,
        dailyRate: vehicle.daily_rate || 100
      };
    } catch (error) {
      console.error('Price calculation error:', error);
      return null;
    }
  };

  const checkAutoApproval = async (customerId: string, amount: number) => {
    try {
      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      // Get booking rules
      const { data: rules, error: rulesError } = await supabase
        .from('instant_booking_rules')
        .select('*')
        .eq('customer_type', customer.customer_type)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (rulesError) throw rulesError;

      if (rules.length === 0) {
        return { approved: false, reason: 'No booking rules found' };
      }

      const rule = rules[0];
      const creditLimit = customer.credit_limit || 1000;
      const ruleLimit = rule.max_auto_approve_amount;
      const effectiveLimit = Math.min(creditLimit, ruleLimit);

      return {
        approved: amount <= effectiveLimit,
        limit: effectiveLimit,
        reason: amount > effectiveLimit ? `Amount exceeds limit of AED ${effectiveLimit}` : undefined
      };
    } catch (error) {
      console.error('Auto-approval check error:', error);
      return { approved: false, reason: 'Error checking approval status' };
    }
  };

  return {
    createInstantBooking: createInstantBooking.mutateAsync,
    isLoading: createInstantBooking.isPending,
    calculateInstantPrice,
    checkAutoApproval,
  };
};
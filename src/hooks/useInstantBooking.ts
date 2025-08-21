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

  // Convert booking to agreement and create demo payment flow
  const convertToAgreement = async (bookingData: InstantBookingData) => {
    try {
      // First create the reservation
      const { data: reservationNumber, error: numberError } = await supabase
        .rpc('generate_reservation_no');

      if (numberError) throw numberError;

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
        instant_booking_score: 100,
        status: 'confirmed' as const,
      };

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationPayload])
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Generate agreement number
      const { data: agreementNo, error: agreementNoError } = await supabase
        .rpc('generate_agreement_no');

      if (agreementNoError) throw agreementNoError;

      // Create agreement with auto-filled details
      const { data: agreement, error: agreementError } = await supabase
        .from('agreements')
        .insert({
          agreement_no: agreementNo,
          customer_id: bookingData.customerId,
          vehicle_id: bookingData.vehicleId,
          reservation_id: reservation.id,
          agreement_date: new Date().toISOString().split('T')[0],
          checkout_datetime: bookingData.pickupDate,
          return_datetime: bookingData.returnDate,
          total_amount: bookingData.pricing?.totalAmount || 0,
          status: 'active',
          add_ons: bookingData.selectedAddOns || [],
        })
        .select()
        .single();

      if (agreementError) throw agreementError;

      // Create agreement line
      await supabase
        .from('agreement_lines')
        .insert({
          agreement_id: agreement.id,
          vehicle_id: bookingData.vehicleId,
          check_out_at: bookingData.pickupDate,
          check_in_at: bookingData.returnDate,
          line_net: bookingData.pricing?.baseAmount || 0,
          line_total: bookingData.pricing?.totalAmount || 0,
        });

      // Update reservation with agreement reference
      await supabase
        .from('reservations')
        .update({ converted_agreement_id: agreement.id })
        .eq('id', reservation.id);

      // Create instant booking profile
      await supabase
        .from('instant_booking_profiles')
        .upsert({
          customer_id: bookingData.customerId,
          preferred_locations: [bookingData.pickupLocation],
          default_rental_duration: `${Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
        });

      return {
        reservation,
        agreement,
        agreementNo
      };
    } catch (error) {
      console.error('Agreement creation error:', error);
      throw error;
    }
  };

  const createInstantBooking = useMutation({
    mutationFn: convertToAgreement,
    onSuccess: (data) => {
      toast({
        title: "Agreement Created!",
        description: `Agreement ${data.agreementNo} has been created and is ready for payment`,
      });
    },
    onError: (error) => {
      console.error('Agreement creation error:', error);
      toast({
        title: "Agreement Creation Failed",
        description: "Unable to create agreement. Please try again.",
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
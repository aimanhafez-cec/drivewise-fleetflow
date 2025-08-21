import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Calculator, Clock, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
interface PricingCalculatorInstantProps {
  bookingData: {
    pickupDate: string;
    returnDate: string;
    vehicleId: string;
    customerId: string;
    customerType: 'B2B' | 'B2C' | 'CORPORATE';
    selectedAddOns?: string[];
    addOnCharges?: Record<string, number>;
  };
  onPricingUpdate: (pricing: any) => void;
}
const PricingCalculatorInstant: React.FC<PricingCalculatorInstantProps> = ({
  bookingData,
  onPricingUpdate
}) => {
  const [calculatedPricing, setCalculatedPricing] = useState<any>(null);
  const [autoApprovalStatus, setAutoApprovalStatus] = useState<{
    approved: boolean;
    reason?: string;
    limit?: number;
  }>({
    approved: true
  });

  // Get vehicle details
  const {
    data: vehicle
  } = useQuery({
    queryKey: ['vehicle-pricing', bookingData.vehicleId],
    queryFn: async () => {
      if (!bookingData.vehicleId) return null;
      const {
        data,
        error
      } = await supabase.from('vehicles').select(`
          *,
          category:categories(*)
        `).eq('id', bookingData.vehicleId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingData.vehicleId
  });

  // Get customer details
  const {
    data: customer
  } = useQuery({
    queryKey: ['customer-pricing', bookingData.customerId],
    queryFn: async () => {
      if (!bookingData.customerId) return null;
      const {
        data,
        error
      } = await supabase.from('customers').select('*').eq('id', bookingData.customerId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingData.customerId
  });

  // Get instant booking rules
  const {
    data: bookingRules
  } = useQuery({
    queryKey: ['booking-rules', bookingData.customerType],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('instant_booking_rules').select('*').eq('customer_type', bookingData.customerType).eq('is_active', true).order('created_at', {
        ascending: false
      }).limit(1);
      if (error) throw error;
      return data[0];
    },
    enabled: !!bookingData.customerType
  });

  // Calculate pricing and auto-approval
  const pricingCalculation = useMemo(() => {
    if (!vehicle || !bookingData.pickupDate || !bookingData.returnDate) {
      return null;
    }
    const startDate = new Date(bookingData.pickupDate);
    const endDate = new Date(bookingData.returnDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Base calculation
    const dailyRate = vehicle.daily_rate || 100;
    const weeklyRate = vehicle.weekly_rate;
    const monthlyRate = vehicle.monthly_rate;
    let baseAmount = 0;
    let rateType = 'daily';

    // Determine best rate
    if (days >= 30 && monthlyRate) {
      const months = Math.ceil(days / 30);
      baseAmount = months * monthlyRate;
      rateType = 'monthly';
    } else if (days >= 7 && weeklyRate) {
      const weeks = Math.ceil(days / 7);
      baseAmount = weeks * weeklyRate;
      rateType = 'weekly';
    } else {
      baseAmount = days * dailyRate;
      rateType = 'daily';
    }

    // Add-ons total
    const addOnTotal = Object.values(bookingData.addOnCharges || {}).reduce((sum: number, amount: number) => sum + amount, 0);

    // Apply customer type discounts (only on base amount, not add-ons)
    let customerDiscount = 0;
    if (bookingData.customerType === 'B2B') {
      customerDiscount = baseAmount * 0.1; // 10% B2B discount
    } else if (bookingData.customerType === 'CORPORATE') {
      customerDiscount = baseAmount * 0.15; // 15% corporate discount
    }
    
    const discountedAmount = baseAmount - customerDiscount;
    const subtotalWithAddOns = discountedAmount + addOnTotal;

    // Calculate tax (5% VAT) on subtotal including add-ons
    const taxAmount = subtotalWithAddOns * 0.05;
    const totalAmount = subtotalWithAddOns + taxAmount;
    
    return {
      days,
      baseAmount,
      addOnTotal,
      customerDiscount,
      discountedAmount,
      subtotalWithAddOns,
      taxAmount,
      totalAmount,
      rateType,
      dailyRate
    };
  }, [vehicle, bookingData.pickupDate, bookingData.returnDate, bookingData.customerType, bookingData.addOnCharges]);

  // Check auto-approval status
  useEffect(() => {
    if (!pricingCalculation || !bookingRules || !customer) return;
    const {
      totalAmount
    } = pricingCalculation;
    const customerCreditLimit = customer.credit_limit || 1000;
    const ruleLimit = bookingRules.max_auto_approve_amount || 500;
    const effectiveLimit = Math.min(customerCreditLimit, ruleLimit);
    if (totalAmount <= effectiveLimit) {
      setAutoApprovalStatus({
        approved: true,
        limit: effectiveLimit
      });
    } else {
      setAutoApprovalStatus({
        approved: false,
        reason: `Amount exceeds auto-approval limit of AED ${effectiveLimit}`,
        limit: effectiveLimit
      });
    }
  }, [pricingCalculation, bookingRules, customer]);

  // Update parent component
  useEffect(() => {
    if (pricingCalculation && autoApprovalStatus) {
      onPricingUpdate({
        ...pricingCalculation,
        autoApproved: autoApprovalStatus.approved,
        approvalLimit: autoApprovalStatus.limit
      });
      setCalculatedPricing({
        ...pricingCalculation,
        autoApprovalStatus
      });
    }
  }, [pricingCalculation, autoApprovalStatus, onPricingUpdate]);
  if (!vehicle || !pricingCalculation) {
    return <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Calculating pricing...</p>
        </CardContent>
      </Card>;
  }
  return <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing & Approval
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vehicle Summary */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h3 className="font-semibold">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.license_plate} • {vehicle.category?.name}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pricingCalculation.days} days
          </Badge>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Base Rate ({pricingCalculation.rateType}) - {pricingCalculation.days} days
            </span>
            <span>AED {pricingCalculation.baseAmount.toFixed(2)}</span>
          </div>

          {pricingCalculation.customerDiscount > 0 && <div className="flex justify-between items-center text-green-600">
              <span className="flex items-center gap-1">
                {bookingData.customerType} Discount
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {bookingData.customerType === 'B2B' ? '10%' : '15%'}
                </Badge>
              </span>
              <span>-AED {pricingCalculation.customerDiscount.toFixed(2)}</span>
            </div>}

          {pricingCalculation.addOnTotal > 0 && <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Add-ons Total</span>
              <span>AED {pricingCalculation.addOnTotal.toFixed(2)}</span>
            </div>}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span>AED {pricingCalculation.subtotalWithAddOns.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">VAT (5%)</span>
            <span>AED {pricingCalculation.taxAmount.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount</span>
            <span>AED {pricingCalculation.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Auto-Approval Status */}
        <div className={`p-4 rounded-lg border-2 ${autoApprovalStatus.approved ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-center gap-3">
            {autoApprovalStatus.approved ? <CheckCircle className="h-6 w-6 text-green-600" /> : <AlertTriangle className="h-6 w-6 text-amber-600" />}
            <div className="flex-1 text-slate-50">
              <h4 className={`font-semibold ${autoApprovalStatus.approved ? 'text-green-800' : 'text-amber-800'}`}>
                {autoApprovalStatus.approved ? 'Auto-Approved' : 'Manual Approval Required'}
              </h4>
              <p className={`text-sm ${autoApprovalStatus.approved ? 'text-green-600' : 'text-amber-600'}`}>
                {autoApprovalStatus.approved ? `This booking is within your instant booking limit of AED ${autoApprovalStatus.limit}` : autoApprovalStatus.reason}
              </p>
            </div>
            <Zap className={`h-5 w-5 ${autoApprovalStatus.approved ? 'text-green-600' : 'text-amber-600'}`} />
          </div>
        </div>

        {/* Rate Details */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[#000a0e]/[0.53]">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              AED {pricingCalculation.dailyRate}
            </p>
            <p className="text-sm text-card-foreground">Daily Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              AED {(pricingCalculation.totalAmount / pricingCalculation.days).toFixed(0)}
            </p>
            <p className="text-sm text-foreground">Effective Daily</p>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default PricingCalculatorInstant;
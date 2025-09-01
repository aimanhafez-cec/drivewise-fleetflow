import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Import wizard steps
import { CarSubscriptionStep1 } from './wizard/CarSubscriptionStep1';
import { CarSubscriptionStep2 } from './wizard/CarSubscriptionStep2';
import { CarSubscriptionStep3 } from './wizard/CarSubscriptionStep3';
import { CarSubscriptionStep4 } from './wizard/CarSubscriptionStep4';
import { CarSubscriptionStep5 } from './wizard/CarSubscriptionStep5';
import { CarSubscriptionStep6 } from './wizard/CarSubscriptionStep6';
import { CarSubscriptionStep7 } from './wizard/CarSubscriptionStep7';
import { CarSubscriptionStep8 } from './wizard/CarSubscriptionStep8';
import { CarSubscriptionStep9 } from './wizard/CarSubscriptionStep9';
import { CarSubscriptionStep10 } from './wizard/CarSubscriptionStep10';

const carSubscriptionSchema = z.object({
  // Agreement & Parties
  customer_type: z.enum(['B2C', 'B2B']),
  customer_id: z.string().min(1, "Customer is required"),
  bill_to_contact: z.string().optional(),
  
  // Vehicle / Class
  subscription_model: z.enum(['By Class', 'By Specific VIN']),
  vehicle_class_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  
  // Terms & Flexibility
  start_date: z.string().min(1, "Start date is required"),
  renewal_cycle: z.enum(['Monthly (anniversary)', '3-Monthly']),
  minimum_commitment: z.enum(['None', '1', '3', '6']),
  cancellation_notice: z.enum(['0', '7', '14', '30']),
  swap_allowed: z.boolean(),
  swap_frequency: z.enum(['1 per month', '1 per quarter', 'None']),
  pause_freeze_allowed: z.boolean(),
  pause_freeze_limit: z.number().optional(),
  
  // Pricing & Billing
  plan: z.enum(['Essential', 'Standard', 'Premium', 'Custom']),
  monthly_fee: z.number().min(0, "Monthly fee must be positive"),
  included_km_month: z.number().min(0, "Included KM must be positive"),
  excess_km_rate: z.number().min(0, "Excess KM rate must be positive"),
  extra_drivers_included: z.number().min(0, "Extra drivers must be non-negative"),
  delivery_collection: z.string(),
  upgrade_downgrade_fee: z.number().optional(),
  joining_setup_fee: z.number().optional(),
  vat_code: z.string(),
  billing_day: z.enum(['Anniversary', '1st', '15th']),
  
  // Inclusions
  insurance: z.enum(['Comprehensive', 'Basic', "Customer's Own"]),
  maintenance: z.enum(['Included', 'Excluded']),
  tyres: z.enum(['Included', 'Excluded']),
  roadside_assistance: z.enum(['Included', 'Excluded']),
  registration_renewal: z.enum(['Included', 'Excluded']),
  replacement_vehicle: z.enum(['Included', 'Excluded']),
  replacement_sla: z.number().optional(),
  
  // Tolls & Fines
  salik_darb_handling: z.enum(['Rebill Actual', 'Included Allowance']),
  salik_darb_allowance_cap: z.number().optional(),
  admin_fee_model: z.string().optional(),
  traffic_fines_handling: z.string(),
  admin_fee_per_fine: z.number().optional(),
  
  // Payments & Collections
  security_deposit: z.string(),
  deposit_amount: z.number().optional(),
  payment_method: z.enum(['Card Autopay', 'Direct Debit', 'Invoice (Corporate)']),
  auto_charge_retries: z.number(),
  
  // Usage & Policy
  geo_restrictions: z.enum(['UAE-only', 'GCC Allowed', 'Off-road Prohibited']),
  mileage_rollover: z.enum(['No', 'Yes']),
  vehicle_swap_rules: z.enum(['Same class', 'Up to +1 class (fee)']),
  early_cancellation_fee: z.enum(['None', 'Fixed AED', '% of remaining month']),
  early_cancellation_amount: z.number().optional(),
  
  // Operations & Service
  maintenance_trigger: z.enum(['Every X km', 'Every Y months', 'Both (first due)']),
  maintenance_km_interval: z.number().optional(),
  maintenance_month_interval: z.number().optional(),
  auto_create_service_jobs: z.boolean(),
  preferred_workshop: z.enum(['OEM', 'In-house', 'Partner']),
  telematics_device: z.boolean(),
  telematics_device_id: z.string().optional(),
  tracking_consent: z.boolean().optional(),
  condition_report_cadence: z.enum(['On start', 'On swap', 'Monthly', 'On start and swap']),
  
  // Renewal / Swap / Exit
  auto_renew: z.boolean(),
  swap_request_flow: z.enum(['Self-service App', 'Call Center', 'Branch']),
  exit_inspection: z.boolean(),
  buyout_offer: z.boolean(),
  buyout_amount: z.number().optional(),
  final_billing: z.enum(['Pro-rata', 'Full month']),
  
  // Handover (conditional)
  odometer_out: z.number().optional(),
  fuel_level_out: z.string().optional(),
  
  notes: z.string().optional()
});

type CarSubscriptionFormData = z.infer<typeof carSubscriptionSchema>;

const STEPS = [
  { title: "Agreement & Parties", component: CarSubscriptionStep1 },
  { title: "Vehicle / Class", component: CarSubscriptionStep2 },
  { title: "Terms & Flexibility", component: CarSubscriptionStep3 },
  { title: "Pricing & Billing", component: CarSubscriptionStep4 },
  { title: "Inclusions", component: CarSubscriptionStep5 },
  { title: "Tolls & Fines", component: CarSubscriptionStep6 },
  { title: "Payments & Collections", component: CarSubscriptionStep7 },
  { title: "Usage & Policy", component: CarSubscriptionStep8 },
  { title: "Operations & Service", component: CarSubscriptionStep9 },
  { title: "Handover", component: CarSubscriptionStep10 }
];

export const CarSubscriptionWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CarSubscriptionFormData>({
    resolver: zodResolver(carSubscriptionSchema),
    defaultValues: {
      customer_type: 'B2C',
      customer_id: '',
      subscription_model: 'By Class',
      start_date: '',
      renewal_cycle: 'Monthly (anniversary)',
      minimum_commitment: 'None',
      cancellation_notice: '14',
      swap_allowed: true,
      swap_frequency: '1 per month',
      pause_freeze_allowed: false,
      plan: 'Standard',
      monthly_fee: 2500,
      included_km_month: 2500,
      excess_km_rate: 0.5,
      extra_drivers_included: 0,
      delivery_collection: 'Included',
      vat_code: '5% (standard)',
      billing_day: 'Anniversary',
      insurance: 'Comprehensive',
      maintenance: 'Included',
      tyres: 'Included',
      roadside_assistance: 'Included',
      registration_renewal: 'Included',
      replacement_vehicle: 'Included',
      salik_darb_handling: 'Rebill Actual',
      traffic_fines_handling: 'Auto Rebill + Admin Fee',
      admin_fee_per_fine: 50,
      security_deposit: 'Waived',
      payment_method: 'Card Autopay',
      auto_charge_retries: 2,
      geo_restrictions: 'UAE-only',
      mileage_rollover: 'No',
      vehicle_swap_rules: 'Same class',
      early_cancellation_fee: 'Fixed AED',
      early_cancellation_amount: 300,
      maintenance_trigger: 'Both (first due)',
      maintenance_km_interval: 10000,
      maintenance_month_interval: 12,
      auto_create_service_jobs: true,
      preferred_workshop: 'Partner',
      telematics_device: false,
      tracking_consent: false,
      condition_report_cadence: 'On start and swap',
      auto_renew: true,
      swap_request_flow: 'Self-service App',
      exit_inspection: true,
      buyout_offer: false,
      final_billing: 'Pro-rata'
    }
  });

  const getCurrentStepFields = (): (keyof CarSubscriptionFormData)[] => {
    const stepFields: Record<number, (keyof CarSubscriptionFormData)[]> = {
      0: ['customer_type', 'customer_id', 'bill_to_contact'],
      1: ['subscription_model', 'vehicle_class_id', 'vehicle_id'],
      2: ['start_date', 'renewal_cycle', 'minimum_commitment', 'cancellation_notice', 'swap_allowed', 'swap_frequency', 'pause_freeze_allowed', 'pause_freeze_limit'],
      3: ['plan', 'monthly_fee', 'included_km_month', 'excess_km_rate', 'extra_drivers_included', 'delivery_collection', 'upgrade_downgrade_fee', 'joining_setup_fee', 'vat_code', 'billing_day'],
      4: ['insurance', 'maintenance', 'tyres', 'roadside_assistance', 'registration_renewal', 'replacement_vehicle', 'replacement_sla'],
      5: ['salik_darb_handling', 'salik_darb_allowance_cap', 'admin_fee_model', 'traffic_fines_handling', 'admin_fee_per_fine'],
      6: ['security_deposit', 'deposit_amount', 'payment_method', 'auto_charge_retries'],
      7: ['geo_restrictions', 'mileage_rollover', 'vehicle_swap_rules', 'early_cancellation_fee', 'early_cancellation_amount'],
      8: ['maintenance_trigger', 'maintenance_km_interval', 'maintenance_month_interval', 'auto_create_service_jobs', 'preferred_workshop', 'telematics_device', 'telematics_device_id', 'tracking_consent', 'condition_report_cadence'],
      9: ['auto_renew', 'swap_request_flow', 'exit_inspection', 'buyout_offer', 'buyout_amount', 'final_billing', 'odometer_out', 'fuel_level_out']
    };
    
    return stepFields[currentStep] || [];
  };

  const handleNext = async () => {
    console.log('CarSubscription: Next button clicked, current step:', currentStep);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      
      // Generate subscription ID
      const { data: subscriptionId } = await supabase.rpc('generate_subscription_id');
      
      const { error } = await supabase
        .from('car_subscriptions')
        .insert({
          ...formData,
          subscription_id: subscriptionId,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Car subscription created successfully"
      });

      navigate('/car-subscriptions');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to create car subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>New Car Subscription</CardTitle>
          <CardDescription className="text-card-foreground">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <CurrentStepComponent form={form} />
              
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {currentStep === STEPS.length - 1 ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Creating...' : 'Create Subscription'}
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
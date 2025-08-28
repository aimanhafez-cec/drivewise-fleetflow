import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { CorporateLeasingStep1 } from './wizard/CorporateLeasingStep1';
import { CorporateLeasingStep2 } from './wizard/CorporateLeasingStep2';
import { CorporateLeasingStep3 } from './wizard/CorporateLeasingStep3';
import { CorporateLeasingStep4 } from './wizard/CorporateLeasingStep4';
import { CorporateLeasingStep5 } from './wizard/CorporateLeasingStep5';
import { CorporateLeasingStep6 } from './wizard/CorporateLeasingStep6';

// Form schema for corporate leasing agreement
const corporateLeasingSchema = z.object({
  // A1: Parties & Commercials
  legal_entity_id: z.string().min(1, 'Legal entity is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  customer_segment: z.enum(['SME', 'Enterprise', 'Government']).optional(),
  bill_to_site_id: z.string().min(1, 'Bill-to site is required'),
  contract_manager_id: z.string().optional(),
  customer_po_no: z.string().optional(),
  credit_terms: z.enum(['Net 15', 'Net 30', 'Net 45', 'Custom']),
  credit_limit: z.number().positive().optional(),
  approver_customer_name: z.string().optional(),
  approver_customer_email: z.string().email().optional(),
  cost_allocation_mode: z.enum(['Per Vehicle', 'Per Cost Center', 'Project']),

  // A2: Contract Scope & Term
  framework_model: z.enum(['Rate Card by Class', 'Fixed Rate per VIN']),
  committed_fleet_size: z.number().positive().optional(),
  master_term: z.enum(['12 months', '24 months', '36 months', '48 months', 'Open-ended']),
  co_terminus_lines: z.boolean().default(false),
  off_hire_notice_period: z.number().positive().default(30),
  early_termination_allowed: z.boolean().default(false),
  early_termination_rule: z.string().optional(),
  renewal_option: z.string().optional(),

  // A3: Billing & Invoicing
  billing_day: z.enum(['1st', '15th', 'Month-End', 'Anniversary']),
  invoice_format: z.enum(['Consolidated', 'Per Vehicle', 'Per Cost Center']),
  line_item_granularity: z.enum(['Base Rent', 'Base Rent + Add-ons', 'Base Rent + Add-ons + Variable']),
  discount_schema: z.any().optional(),

  // A4: Responsibilities & Inclusions
  insurance_responsibility: z.enum(['Included (Lessor)', 'Customer Own Policy']),
  insurance_excess_aed: z.number().positive().optional(),
  maintenance_policy: z.enum(['Basic PM', 'Full (PM+wear)', 'Customer']),
  tyres_policy: z.string().optional(),
  tyres_included_after_km: z.number().positive().optional(),
  roadside_assistance_included: z.boolean().default(true),
  registration_responsibility: z.string().default('Lessor'),
  replacement_vehicle_included: z.boolean().default(true),
  replacement_sla_hours: z.number().positive().optional(),
  workshop_preference: z.string().default('OEM'),

  // A5: Tolls, Fines & Fuel
  salik_darb_handling: z.string().default('Rebill Actual (monthly)'),
  tolls_admin_fee_model: z.string().default('Per-invoice'),
  traffic_fines_handling: z.string().default('Auto Rebill + Admin Fee'),
  admin_fee_per_fine_aed: z.number().positive().default(25),
  fuel_handling: z.string().default('Customer Fuel'),

  // A6: Financial Security & Compliance
  security_instrument: z.enum(['None', 'Deposit per Vehicle', 'Bank Guarantee']).default('None'),
  deposit_amount_aed: z.number().positive().optional(),
  sla_credits_enabled: z.boolean().default(false),
  sla_credits_percentage: z.number().min(0).max(100).optional(),
  telematics_consent: z.boolean().default(false),

  // Additional fields
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
  notes: z.string().optional()
});

type CorporateLeasingFormData = z.infer<typeof corporateLeasingSchema>;

const STEPS = [
  { title: 'Parties & Commercials', description: 'Basic agreement setup' },
  { title: 'Contract Scope & Term', description: 'Fleet size and contract terms' },
  { title: 'Billing & Invoicing', description: 'Financial setup' },
  { title: 'Responsibilities & Inclusions', description: 'Policy definitions' },
  { title: 'Tolls, Fines & Fuel', description: 'Operational policies' },
  { title: 'Financial Security & Compliance', description: 'Security and consent' }
];

export const CorporateLeasingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<CorporateLeasingFormData>({
    resolver: zodResolver(corporateLeasingSchema),
    defaultValues: {
      credit_terms: 'Net 30',
      cost_allocation_mode: 'Per Vehicle',
      framework_model: 'Rate Card by Class',
      master_term: '24 months',
      co_terminus_lines: false,
      off_hire_notice_period: 30,
      early_termination_allowed: false,
      billing_day: 'Anniversary',
      invoice_format: 'Consolidated',
      line_item_granularity: 'Base Rent + Add-ons',
      insurance_responsibility: 'Included (Lessor)',
      maintenance_policy: 'Full (PM+wear)',
      roadside_assistance_included: true,
      registration_responsibility: 'Lessor',
      replacement_vehicle_included: true,
      workshop_preference: 'OEM',
      salik_darb_handling: 'Rebill Actual (monthly)',
      tolls_admin_fee_model: 'Per-invoice',
      traffic_fines_handling: 'Auto Rebill + Admin Fee',
      admin_fee_per_fine_aed: 25,
      fuel_handling: 'Customer Fuel',
      security_instrument: 'None',
      sla_credits_enabled: false,
      telematics_consent: false
    }
  });

  const handleNext = async () => {
    const currentStepFields = getCurrentStepFields();
    const isValid = await form.trigger(currentStepFields);
    
    if (isValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepFields = (): (keyof CorporateLeasingFormData)[] => {
    switch (currentStep) {
      case 0:
        return ['legal_entity_id', 'customer_id', 'bill_to_site_id', 'credit_terms', 'cost_allocation_mode'];
      case 1:
        return ['framework_model', 'master_term'];
      case 2:
        return ['billing_day', 'invoice_format', 'line_item_granularity'];
      case 3:
        return ['insurance_responsibility', 'maintenance_policy'];
      case 4:
        return ['salik_darb_handling', 'tolls_admin_fee_model', 'traffic_fines_handling', 'fuel_handling'];
      case 5:
        return ['security_instrument'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate agreement number
      const { data: agreementNo } = await supabase.rpc('generate_corporate_lease_no');
      
      const formData = form.getValues();
      
      const { error } = await supabase
        .from('corporate_leasing_agreements')
        .insert({
          ...formData,
          agreement_no: agreementNo,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Corporate leasing agreement created successfully",
      });

      navigate('/corporate-leasing');
    } catch (error) {
      console.error('Error creating corporate leasing agreement:', error);
      toast({
        title: "Error",
        description: "Failed to create corporate leasing agreement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <CorporateLeasingStep1 form={form} />;
      case 1:
        return <CorporateLeasingStep2 form={form} />;
      case 2:
        return <CorporateLeasingStep3 form={form} />;
      case 3:
        return <CorporateLeasingStep4 form={form} />;
      case 4:
        return <CorporateLeasingStep5 form={form} />;
      case 5:
        return <CorporateLeasingStep6 form={form} />;
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Corporate Leasing Agreement</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-foreground">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-foreground">
              {STEPS[currentStep].title}: {STEPS[currentStep].description}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {renderCurrentStep()}

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {currentStep === STEPS.length - 1 ? (
                    isSubmitting ? 'Creating...' : 'Create Agreement'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
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
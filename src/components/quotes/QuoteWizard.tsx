import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { QuoteWizardStep1 } from "./wizard/QuoteWizardStep1";
import { QuoteWizardStep2 } from "./wizard/QuoteWizardStep2";
import { QuoteWizardStep3 } from "./wizard/QuoteWizardStep3";
import { QuoteWizardStep4 } from "./wizard/QuoteWizardStep4";
import { QuoteWizardStep5 } from "./wizard/QuoteWizardStep5";

interface QuoteData {
  customer_id: string;
  pickup_at: string;
  pickup_location: string;
  return_at: string;
  return_location: string;
  vehicle_type_id?: string;
  vehicle_id?: string;
  items: Array<{
    description: string;
    qty: number;
    rate: number;
  }>;
  tax_rate: number;
  notes: string;
  expires_at: string;
}

const steps = [
  { id: 1, title: "Customer", description: "Select customer" },
  { id: 2, title: "Trip Details", description: "Pickup & return info" },
  { id: 3, title: "Vehicle", description: "Choose vehicle type" },
  { id: 4, title: "Pricing", description: "Rates & add-ons" },
  { id: 5, title: "Review", description: "Final review & send" },
];

export const QuoteWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState<Partial<QuoteData>>({
    items: [],
    tax_rate: 0.08,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Check if we're duplicating, revising a quote, or creating from RFQ
  const duplicateId = searchParams.get("duplicate");
  const reviseId = searchParams.get("revise");
  const fromRfqId = searchParams.get("fromRfq");

  const { data: existingQuote } = useQuery({
    queryKey: ["quote", duplicateId || reviseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", duplicateId || reviseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(duplicateId || reviseId),
  });

  const { data: sourceRfq } = useQuery({
    queryKey: ["rfq", fromRfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", fromRfqId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!fromRfqId,
  });

  useEffect(() => {
    if (existingQuote) {
      setQuoteData({
        customer_id: existingQuote.customer_id,
        vehicle_id: existingQuote.vehicle_id,
        items: Array.isArray(existingQuote.items) ? existingQuote.items as Array<{description: string; qty: number; rate: number}> : [],
        tax_rate: 0.08,
        notes: existingQuote.notes || "",
      });
    } else if (sourceRfq) {
      setQuoteData({
        customer_id: sourceRfq.customer_id,
        pickup_at: sourceRfq.pickup_at,
        pickup_location: sourceRfq.pickup_loc_id,
        return_at: sourceRfq.return_at,
        return_location: sourceRfq.return_loc_id,
        vehicle_type_id: sourceRfq.vehicle_type_id,
        items: [],
        tax_rate: 0.08,
        notes: sourceRfq.notes || "",
      });
    }
  }, [existingQuote, sourceRfq]);

  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteData) => {
      const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
      const taxAmount = subtotal * data.tax_rate;
      const total = subtotal + taxAmount;

      const { data: quote, error } = await supabase
        .from("quotes")
        .insert({
          customer_id: data.customer_id,
          vehicle_id: data.vehicle_id,
          items: data.items,
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          valid_until: data.expires_at,
          notes: data.notes,
          quote_number: `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
          status: "draft",
          rfq_id: fromRfqId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return quote;
    },
    onSuccess: async (quote) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      // Update RFQ status to 'quoted' if this quote was created from an RFQ
      if (fromRfqId) {
        await supabase
          .from("rfqs")
          .update({ status: "quoted" })
          .eq("id", fromRfqId);
        queryClient.invalidateQueries({ queryKey: ["rfq", fromRfqId] });
        queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      }
      
      toast({ title: "Success", description: "Quote created successfully" });
      navigate(`/quotes/${quote.id}`);
    },
    onError: (error) => {
      console.error("Failed to create quote:", error);
      toast({ title: "Error", description: "Failed to create quote", variant: "destructive" });
    },
  });

  const updateQuoteData = (step: number, data: Partial<QuoteData>) => {
    setQuoteData(prev => ({ ...prev, ...data }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!quoteData.customer_id) {
          newErrors.customer = "Customer is required";
        }
        break;
      case 2:
        if (!quoteData.pickup_at) newErrors.pickup_at = "Pickup date/time is required";
        if (!quoteData.pickup_location) newErrors.pickup_location = "Pickup location is required";
        if (!quoteData.return_at) newErrors.return_at = "Return date/time is required";
        if (!quoteData.return_location) newErrors.return_location = "Return location is required";
        break;
      case 3:
        if (!quoteData.vehicle_type_id && !quoteData.vehicle_id) {
          newErrors.vehicle = "Vehicle or vehicle type is required";
        }
        break;
      case 4:
        if (!quoteData.items || quoteData.items.length === 0) {
          newErrors.items = "At least one line item is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep) && quoteData.customer_id) {
      createQuoteMutation.mutate(quoteData as QuoteData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <QuoteWizardStep1
            data={quoteData}
            onChange={(data) => updateQuoteData(1, data)}
            errors={errors}
          />
        );
      case 2:
        return (
          <QuoteWizardStep2
            data={quoteData}
            onChange={(data) => updateQuoteData(2, data)}
            errors={errors}
          />
        );
      case 3:
        return (
          <QuoteWizardStep3
            data={quoteData}
            onChange={(data) => updateQuoteData(3, data)}
            errors={errors}
          />
        );
      case 4:
        return (
          <QuoteWizardStep4
            data={quoteData}
            onChange={(data) => updateQuoteData(4, data)}
            errors={errors}
          />
        );
      case 5:
        return (
          <QuoteWizardStep5
            data={quoteData}
            onChange={(data) => updateQuoteData(5, data)}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {reviseId ? "Revise Quote" : duplicateId ? "Duplicate Quote" : fromRfqId ? "Prepare Quote from RFQ" : "New Quote"}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/quotes")}>
          Cancel
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center ${
                    step.id === currentStep
                      ? "text-primary font-medium"
                      : step.id < currentStep
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <div id={`wiz-step-${step.title.toLowerCase().replace(" ", "-")}`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {renderStep()}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quoteData.items && quoteData.items.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {quoteData.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span>{item.description}</span>
                          <span>AED {(item.qty * item.rate).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>
                        ${quoteData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({((quoteData.tax_rate || 0) * 100).toFixed(0)}%)</span>
                      <span>
                        ${(quoteData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * (quoteData.tax_rate || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total</span>
                      <span>
                        ${(quoteData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * (1 + (quoteData.tax_rate || 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No items added yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          id="btn-wiz-back"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < steps.length ? (
          <Button
            id="btn-wiz-next"
            onClick={handleNext}
            disabled={Object.keys(errors).length > 0}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            id="btn-send"
            onClick={handleSubmit}
            disabled={createQuoteMutation.isPending || Object.keys(errors).length > 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        )}
      </div>
    </div>
  );
};
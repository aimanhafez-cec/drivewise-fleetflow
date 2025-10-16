import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuotePrintLayout } from "../QuotePrintLayout";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, DollarSign, Car, Calendar, Calculator, AlertCircle, CheckCircle, Send, Printer, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useCostSheets, useCostSheet } from "@/hooks/useCostSheet";
import { CostSheetStatusBadge } from "../costsheet/CostSheetStatusBadge";
import { formatCurrency } from "@/lib/utils/currency";
import { useSubmitQuote, useGenerateQuotePDF, useSendQuoteToCustomer } from "@/hooks/useQuote";
import { useToast } from "@/hooks/use-toast";
import { addMonths, format } from "date-fns";
import { SendQuoteToCustomerDialog } from "../SendQuoteToCustomerDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuoteWizardStep4Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep5_Summary: React.FC<QuoteWizardStep4Props> = ({
  data,
  onChange,
  errors,
}) => {
  const isCorporate = (data.quote_type || '').toLowerCase() === 'corporate lease';
  const { data: costSheets } = useCostSheets(data.id);
  const latestCostSheetId = costSheets?.[0]?.id; // Get latest cost sheet ID
  const { data: costSheet } = useCostSheet(latestCostSheetId); // Fetch full details
  const { toast } = useToast();
  
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  
  const submitQuoteMutation = useSubmitQuote();
  const generatePDFMutation = useGenerateQuotePDF();
  const sendQuoteMutation = useSendQuoteToCustomer();

  // Fetch customer and contact person details
  const { data: customerData } = useQuery({
    queryKey: ['customer', data.customer_id],
    queryFn: async () => {
      if (!data.customer_id) return null;
      const { data: customer } = await supabase
        .from('customers')
        .select('full_name, email')
        .eq('id', data.customer_id)
        .single();
      return customer;
    },
    enabled: !!data.customer_id,
  });

  const { data: contactPersonData } = useQuery({
    queryKey: ['contact_person', data.contact_person_id],
    queryFn: async () => {
      if (!data.contact_person_id) return null;
      const { data: contact } = await supabase
        .from('contact_persons')
        .select('full_name, email')
        .eq('id', data.contact_person_id)
        .single();
      return contact;
    },
    enabled: !!data.contact_person_id,
  });

  const handleSubmitForApproval = () => {
    console.log('🔘 Submit button clicked!', {
      hasId: !!data.id,
      quoteId: data.id,
      isCorporate,
      costSheetStatus: costSheet?.status,
      quoteStatus: data.status
    });

    if (!data.id) {
      console.warn('⚠️ No quote ID found!');
      toast({
        title: 'Error',
        description: 'Please save the quote as draft first',
        variant: 'destructive',
      });
      return;
    }

    console.log('📤 Submitting quote:', data.id);
    submitQuoteMutation.mutate({
      quote_id: data.id,
      notes: 'Submitted from Quote Wizard Summary',
    });
  };

  const handlePrintPDF = () => {
    generatePDFMutation.mutate(data);
  };

  const handleSendToCustomer = () => {
    if (!data.id) {
      toast({
        title: 'Error',
        description: 'Please save the quote as draft first',
        variant: 'destructive',
      });
      return;
    }
    
    if (!contactPersonData?.email && !customerData?.email) {
      toast({
        title: 'Error',
        description: 'Customer email is missing',
        variant: 'destructive',
      });
      return;
    }
    
    setSendDialogOpen(true);
  };
  
  // Helper to calculate end date from start date + duration
  const calculateEndDate = (startDate: string | null | undefined, durationMonths: number | null | undefined): string => {
    if (!startDate || !durationMonths) return 'N/A';
    
    try {
      const start = new Date(startDate);
      const end = addMonths(start, durationMonths);
      return format(end, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error calculating end date:', error);
      return 'N/A';
    }
  };
  
  // Helper to get current quote rate for a line
  const getCurrentLineRate = (lineNo: number): number => {
    const quoteLine = data.quote_items?.find((item: any) => item.line_no === lineNo);
    return quoteLine?.monthly_rate || 0;
  };
  
  // State to track which sections are open
  const [openSections, setOpenSections] = React.useState({
    costSheet: true,
    vehicleLines: true,
    tollFines: true,
    financialTerms: true,
    initialFees: true,
    addOns: true,
    grandTotal: true,
    notes: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Calculate totals
  const calculateTotals = () => {
    if (isCorporate && data.quote_items) {
      // Helper functions for flexible add-on schema
      const getAddonType = (a: any) => a.pricing_model || a.type;
      const getAddonTotal = (a: any) => (a.total ?? a.amount ?? 0);
      
      const totalDeposits = data.quote_items.reduce((sum: number, line: any) => 
        sum + (line.deposit_amount || 0), 0);
      const totalAdvance = data.quote_items.reduce((sum: number, line: any) => 
        sum + ((line.advance_rent_months || 0) * (line.monthly_rate || 0)), 0);
      
      // Add delivery/collection fees
      const totalDeliveryFees = data.quote_items.reduce((sum: number, line: any) => 
        sum + (line.delivery_fee || 0), 0);
      const totalCollectionFees = data.quote_items.reduce((sum: number, line: any) => 
        sum + (line.collection_fee || 0), 0);
      
      // Add one-time add-ons
      const oneTimeAddOns = data.quote_items.reduce((sum: number, line: any) => {
        const lineOneTimeAddOns = (line.addons || [])
          .filter((a: any) => getAddonType(a) === 'one-time')
          .reduce((s: number, a: any) => s + getAddonTotal(a), 0);
        return sum + lineOneTimeAddOns;
      }, 0);
      
      // Calculate monthly recurring rental
      const monthlyRecurringRental = data.quote_items.reduce((sum: number, line: any) => {
        const baseRate = line.monthly_rate || 0;
        const monthlyAddOnsCost = (line.addons || [])
          .filter((a: any) => getAddonType(a) === 'monthly')
          .reduce((s: number, a: any) => s + getAddonTotal(a), 0);
        return sum + baseRate + monthlyAddOnsCost;
      }, 0);
      
      const initialFees = (data.initial_fees || []).reduce((sum: number, fee: any) => 
        sum + (parseFloat(fee.amount) || 0), 0);
      
      // Deposits are NOT taxable in UAE
      const taxableSubtotal = totalAdvance + totalDeliveryFees + totalCollectionFees + initialFees + oneTimeAddOns;
      const vat = taxableSubtotal * ((data.vat_percentage || 0) / 100);
      
      return {
        deposits: totalDeposits,
        advance: totalAdvance,
        deliveryFees: totalDeliveryFees,
        collectionFees: totalCollectionFees,
        initialFees,
        oneTimeAddOns,
        monthlyRecurringRental,
        taxableSubtotal,
        subtotal: totalDeposits + taxableSubtotal,
        vat,
        grandTotal: totalDeposits + taxableSubtotal + vat,
      };
    }
    
    // Legacy single vehicle
    return {
      deposits: data.default_deposit_amount || 0,
      advance: 0,
      deliveryFees: 0,
      collectionFees: 0,
      initialFees: 0,
      oneTimeAddOns: 0,
      monthlyRecurringRental: 0,
      taxableSubtotal: 0,
      subtotal: 0,
      vat: 0,
      grandTotal: 0,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Hidden Print Layout - Only visible when printing */}
      <div className="print-only hidden">
        <QuotePrintLayout data={data} totals={totals} costSheet={costSheet} />
      </div>

      {/* Screen UI - Hidden when printing */}
      <div className="no-print space-y-6">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 -m-6 mb-6 print:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold">{data.quote_number || 'New Quote'}</h2>
            <p className="text-sm text-muted-foreground">
              {data.account_name} • {data.quote_date || 'Draft'}
            </p>
          </div>
          <div className="flex gap-2">
            {data.status === 'draft' && (
              <Button 
                size="lg" 
                onClick={handleSubmitForApproval}
                disabled={submitQuoteMutation.isPending || (isCorporate && costSheet?.status !== 'approved')}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Submit for Approval
              </Button>
            )}
            {data.status === 'approved' && (
              <>
                <Button size="lg" variant="outline" onClick={handlePrintPDF}>
                  <Printer className="mr-2 h-5 w-5" />
                  Print PDF
                </Button>
                <Button size="lg" onClick={handleSendToCustomer}>
                  <Mail className="mr-2 h-5 w-5" />
                  Send to Customer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {data.status === 'approved' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Quote Approved</strong> - This quote has been approved and is ready to be sent to the customer.
            {data.approved_at && ` Approved on ${new Date(data.approved_at).toLocaleDateString()}`}
          </AlertDescription>
        </Alert>
      )}

      {isCorporate && costSheet?.status !== 'approved' && data.status === 'draft' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cost Sheet Required:</strong> Corporate leasing quotes require an approved cost sheet before submission.
            Current status: <CostSheetStatusBadge status={costSheet?.status || 'draft'} />
          </AlertDescription>
        </Alert>
      )}

      {/* Executive Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Grand Total</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(totals.grandTotal, data.currency || 'AED')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly Recurring</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totals.monthlyRecurringRental, data.currency || 'AED')}
              </p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Vehicle Lines</p>
              <p className="text-3xl font-bold">{data.quote_items?.length || 1}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Contract Term</p>
              <p className="text-3xl font-bold">
                {data.duration_days ? Math.floor(data.duration_days / 30) : 'N/A'}
                <span className="text-lg font-normal ml-1">months</span>
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Quote Valid Until</span>
              <p className="font-medium">{data.validity_date_to || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Contract Start</span>
              <p className="font-medium">{data.contract_effective_from || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Contract End</span>
              <p className="font-medium">{data.contract_effective_to || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Sheet Status (Corporate only) */}
      {isCorporate && data.id && (
        <Collapsible open={openSections.costSheet} onOpenChange={() => toggleSection('costSheet')}>
          <Card className={costSheet?.status === 'approved' ? 'border-green-500' : costSheet?.status === 'pending_approval' ? 'border-yellow-500' : ''}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    <CardTitle className="text-left">Cost Sheet & Profitability</CardTitle>
                    {costSheet && <CostSheetStatusBadge status={costSheet.status} />}
                  </div>
                  {openSections.costSheet ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            {!costSheet ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No cost sheet has been prepared yet. Return to Step 4 (Vehicles) to calculate profitability.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target Margin:</span>
                    <p className="font-semibold">{costSheet.target_margin_percent}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Financing Rate:</span>
                    <p className="font-semibold">{costSheet.financing_rate_percent}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Overhead:</span>
                    <p className="font-semibold">{costSheet.overhead_percent}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle Lines:</span>
                    <p className="font-semibold">{costSheet.lines?.length || 0}</p>
                  </div>
                </div>

                {costSheet.lines && costSheet.lines.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Line Margins</h4>
                      {costSheet.lines.map((line) => {
                        const currentRate = getCurrentLineRate(line.line_no);
                        const currentMarginPercent = currentRate > 0 
                          ? ((currentRate - line.total_cost_per_month_aed) / currentRate) * 100 
                          : 0;
                        
                        return (
                          <div key={line.id} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Line {line.line_no}:</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono">
                                Cost: {formatCurrency(line.total_cost_per_month_aed, 'AED')}
                              </span>
                              <span className="font-mono">
                                Rate: {formatCurrency(currentRate, 'AED')}
                              </span>
                              <Badge 
                                variant={
                                  currentMarginPercent >= costSheet.target_margin_percent 
                                    ? 'default' 
                                    : currentMarginPercent >= 10 
                                    ? 'outline' 
                                    : 'destructive'
                                }
                                className={
                                  currentMarginPercent >= costSheet.target_margin_percent
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : currentMarginPercent >= 10
                                    ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
                                    : ''
                                }
                              >
                                {currentMarginPercent.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {costSheet.status === 'draft' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cost sheet is still in draft. Submit for approval before finalizing the quote.
                    </AlertDescription>
                  </Alert>
                )}

                {costSheet.status === 'pending_approval' && (
                  <Alert className="border-yellow-500">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      Submitted by {costSheet.submitter?.full_name || 'Unknown'} on {costSheet.submitted_at ? format(new Date(costSheet.submitted_at), 'MMM dd, yyyy') : 'N/A'}. Cost sheet is pending approval. Quote cannot be finalized until approved.
                    </AlertDescription>
                  </Alert>
                )}

                {costSheet.status === 'approved' && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Cost sheet approved by {costSheet.approver?.full_name || 'Unknown'} on {costSheet.approved_at ? format(new Date(costSheet.approved_at), 'MMM dd, yyyy') : 'N/A'}
                      {costSheet.approval_notes && ` — ${costSheet.approval_notes}`}
                    </AlertDescription>
                  </Alert>
                )}

                {costSheet.notes_assumptions && (
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">Notes: </span>
                    <p className="text-sm mt-1">{costSheet.notes_assumptions}</p>
                  </div>
                )}
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Vehicle Lines Summary (Corporate) */}
      {isCorporate && data.quote_items && data.quote_items.length > 0 && (
        <Collapsible open={openSections.vehicleLines} onOpenChange={() => toggleSection('vehicleLines')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    <CardTitle>Vehicle Lines ({data.quote_items.length})</CardTitle>
                  </div>
                  {openSections.vehicleLines ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <div className="space-y-4">
              {data.quote_items.map((line: any) => (
                <div key={line.line_no} className="border-2 rounded-lg p-5 hover:border-primary/30 transition-colors">
                  {/* Header with badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="text-xs">
                          Line {line.line_no}
                        </Badge>
                        {line.duration_months && (
                          <Badge variant="outline" className="text-xs">
                            {line.duration_months} months
                          </Badge>
                        )}
                      </div>
                      
                      {/* Vehicle Name/Model */}
                      <p className="text-base font-semibold text-foreground mb-1">
                        {line._vehicleMeta?.make && line._vehicleMeta?.model 
                          ? `${line._vehicleMeta.make} ${line._vehicleMeta.model}${line._vehicleMeta.year ? ` (${line._vehicleMeta.year})` : ''}`
                          : line._vehicleMeta?.category_name 
                          ? `${line._vehicleMeta.category_name} Class`
                          : line.vehicle_class_name || 'Vehicle'}
                      </p>
                      
                      {/* Additional Details */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {line._vehicleMeta?.color && (
                          <span>• {line._vehicleMeta.color}</span>
                        )}
                        {line._vehicleMeta?.item_code && (
                          <span>• Code: {line._vehicleMeta.item_code}</span>
                        )}
                        {line.vin && (
                          <span>• VIN: {line.vin}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contract & Mileage Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Contract Terms Section */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contract Terms</h5>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Start Date</span>
                        <p className="font-medium">{line.pickup_at || 'TBD'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">End Date</span>
                        <p className="font-medium">
                          {line.end_date || calculateEndDate(line.pickup_at, line.duration_months)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Duration</span>
                        <p className="font-medium">{line.duration_months} months</p>
                      </div>
                    </div>
                    
                    {/* Mileage Terms Section */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mileage Package</h5>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Included KM/Month</span>
                        <p className="font-medium">{line.mileage_package_km?.toLocaleString() || 'Unlimited'} km</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Excess Rate</span>
                        <p className="font-medium">{line.excess_km_rate?.toFixed(2) || '0.00'} AED/km</p>
                      </div>
                      {line.odometer && (
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Current Odometer</span>
                          <p className="font-medium">{line.odometer.toLocaleString()} km</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Financial Terms Section */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Financial Details</h5>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Monthly Rate</span>
                        <p className="font-semibold text-lg">{formatCurrency(line.monthly_rate, 'AED')}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Deposit</span>
                        <p className="font-medium">{formatCurrency(line.deposit_amount, 'AED')}</p>
                      </div>
                      {line.location_id && (
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Location</span>
                          <p className="font-medium text-xs">{line.location_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Upfront Costs Breakdown */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <h5 className="text-sm font-semibold mb-3">Upfront Costs</h5>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Security Deposit</span>
                      <span className="font-medium">{formatCurrency(line.deposit_amount, 'AED')}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Advance Rent ({line.advance_rent_months || 0} {line.advance_rent_months === 1 ? 'month' : 'months'})
                      </span>
                      <span className="font-medium">
                        {formatCurrency((line.advance_rent_months || 0) * (line.monthly_rate || 0), 'AED')}
                      </span>
                    </div>
                    
                    {line.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className="font-medium">{formatCurrency(line.delivery_fee, 'AED')}</span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-bold text-base">
                      <span>Line {line.line_no} Total Upfront</span>
                      <span className="text-primary text-lg">
                        {formatCurrency(
                          line.deposit_amount + 
                          ((line.advance_rent_months || 0) * (line.monthly_rate || 0)) + 
                          (line.delivery_fee || 0),
                          'AED'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Toll & Fines Policy Summary */}
      <Collapsible open={openSections.tollFines} onOpenChange={() => toggleSection('tollFines')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <CardTitle>Toll & Fines Policy</CardTitle>
                </div>
                {openSections.tollFines ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Toll Handling:</span>
              <p className="font-medium">{data.salik_darb_handling || 'Rebill Actual (monthly)'}</p>
            </div>
            {data.salik_darb_handling === "Fixed Package per Vehicle" && (
              <div>
                <span className="text-muted-foreground">Fixed Package Amount:</span>
                <p className="font-medium">{formatCurrency(data.salik_darb_allowance_cap || 100)}/vehicle/month</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Admin Fee Model:</span>
              <p className="font-medium">{data.tolls_admin_fee_model || 'Per-invoice'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Traffic Fines:</span>
              <p className="font-medium">{data.traffic_fines_handling || 'Auto Rebill + Admin Fee'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fine Admin Fee:</span>
              <p className="font-medium">{formatCurrency(data.admin_fee_per_fine_aed || 25)} per fine</p>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Financial Terms Summary */}
      <Collapsible open={openSections.financialTerms} onOpenChange={() => toggleSection('financialTerms')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>Financial Terms</CardTitle>
                </div>
                {openSections.financialTerms ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Billing Plan:</span>
              <p className="font-medium capitalize">{data.billing_plan || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Billing Start:</span>
              <p className="font-medium">{data.billing_start_date || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">VAT Rate:</span>
              <p className="font-medium">{data.vat_percentage || 0}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Method:</span>
              <p className="font-medium capitalize">{data.payment_method?.replace('-', ' ') || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Deposit Type:</span>
              <p className="font-medium capitalize">{data.deposit_type?.replace('-', ' ') || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Escalation:</span>
              <p className="font-medium">{data.annual_escalation_percentage || 0}% annually</p>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Initial Fees */}
      {data.initial_fees && data.initial_fees.length > 0 && (
        <Collapsible open={openSections.initialFees} onOpenChange={() => toggleSection('initialFees')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Initial Fees (One-time)</CardTitle>
                  {openSections.initialFees ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <div className="space-y-2">
              {data.initial_fees.map((fee: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {fee.fee_type} {fee.description && `- ${fee.description}`}
                  </span>
                  <span className="font-medium">{parseFloat(fee.amount).toFixed(2)} AED</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Initial Fees:</span>
                <span>{totals.initialFees.toFixed(2)} AED</span>
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Add-Ons & Extras Summary */}
      {data.default_addons && data.default_addons.length > 0 && (
        <Collapsible open={openSections.addOns} onOpenChange={() => toggleSection('addOns')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Add-Ons & Extras</CardTitle>
                  {openSections.addOns ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <div className="space-y-2">
              {data.default_addons.map((addon: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {addon.item_name} ({addon.pricing_model}) × {addon.quantity}
                  </span>
                  <span className="font-medium">{formatCurrency(addon.total)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Monthly Add-Ons:</span>
                <span>
                  {formatCurrency(
                    data.default_addons
                      .filter((a: any) => a.pricing_model === 'monthly')
                      .reduce((sum: number, a: any) => sum + a.total, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>One-Time Add-Ons:</span>
                <span>
                  {formatCurrency(
                    data.default_addons
                      .filter((a: any) => a.pricing_model === 'one-time')
                      .reduce((sum: number, a: any) => sum + a.total, 0)
                  )}
                </span>
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Grand Total Summary */}
      <Collapsible open={openSections.grandTotal} onOpenChange={() => toggleSection('grandTotal')}>
        <Card className="border-primary">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <CardTitle>Grand Total Summary</CardTitle>
                </div>
                {openSections.grandTotal ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Deposits (Non-taxable):</span>
              <span className="font-semibold">{formatCurrency(totals.deposits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Advance Rent:</span>
              <span className="font-semibold">{formatCurrency(totals.advance)}</span>
            </div>
            {totals.deliveryFees > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fees:</span>
                <span className="font-semibold">{formatCurrency(totals.deliveryFees)}</span>
              </div>
            )}
            {totals.collectionFees > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collection Fees:</span>
                <span className="font-semibold">{formatCurrency(totals.collectionFees)}</span>
              </div>
            )}
            {totals.initialFees > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initial Fees (One-time):</span>
                <span className="font-semibold">{formatCurrency(totals.initialFees)}</span>
              </div>
            )}
            {totals.oneTimeAddOns > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">One-Time Add-Ons:</span>
                <span className="font-semibold">{formatCurrency(totals.oneTimeAddOns)}</span>
              </div>
            )}
            
            {totals.monthlyRecurringRental > 0 && (
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Monthly Recurring Rental:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(totals.monthlyRecurringRental)}</span>
              </div>
            )}
            
            <div className="border-t pt-3 flex justify-between">
              <span className="text-muted-foreground">Subtotal (Taxable):</span>
              <span>{formatCurrency(totals.taxableSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT ({data.vat_percentage || 5}%):</span>
              <span>{formatCurrency(totals.vat)}</span>
            </div>
            
            <Separator className="border-primary" />
            <div className="flex justify-between font-bold text-xl">
              <span className="text-primary">Total Upfront Due (incl. VAT):</span>
              <span className="text-primary">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Notes Section */}
      <Collapsible open={openSections.notes} onOpenChange={() => toggleSection('notes')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Additional Notes</CardTitle>
                {openSections.notes ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.notes || 'No additional notes provided'}
          </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      </div>

      {/* Send to Customer Dialog */}
      <SendQuoteToCustomerDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        quoteId={data.id}
        quoteNumber={data.quote_number}
        customerName={customerData?.full_name || data.account_name || 'Customer'}
        customerEmail={contactPersonData?.email || customerData?.email || ''}
      />
    </div>
  );
};
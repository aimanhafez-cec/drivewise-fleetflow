import React, { useEffect } from "react";
import { addMonths, format as formatDate } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentTermsSelect, PriceListSelect, ContactPersonSelect } from "@/components/ui/select-components";
import {
  BILLING_PLANS,
  PRORATION_RULES,
  VAT_RATES,
  DEPOSIT_TYPES,
  PAYMENT_METHODS,
  INITIAL_FEE_TYPES,
} from "@/lib/constants/financialOptions";
import { Calendar, DollarSign, Receipt, CreditCard, AlertCircle, TrendingUp, Plus, Trash2 } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuoteWizardStep2Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep2: React.FC<QuoteWizardStep2Props> = ({
  data,
  onChange,
  errors,
}) => {
  // Calculate initial fees total
  const calculateInitialFeesTotal = () => {
    return (data.initial_fees || []).reduce((sum: number, fee: any) => sum + (parseFloat(fee.amount) || 0), 0);
  };

  // Calculate upfront due
  const calculateUpfrontDue = () => {
    const deposit = parseFloat(data.default_deposit_amount) || 0;
    const monthlyRent = 0; // Will be calculated from line items later
    const advanceMonths = parseInt(data.default_advance_rent_months) || 0;
    const advanceRent = monthlyRent * advanceMonths;
    const initialFees = calculateInitialFeesTotal();

    return {
      deposit,
      advanceRent,
      advanceMonths,
      initialFees,
      total: deposit + advanceRent + initialFees,
    };
  };

  const upfrontDue = calculateUpfrontDue();

  // Fetch selected contact person's email for display
  const { data: selectedContact } = useQuery({
    queryKey: ["contact_person", data.invoice_contact_person_id || data.contact_person_id],
    queryFn: async () => {
      const contactId = data.invoice_contact_person_id || data.contact_person_id;
      if (!contactId) return null;
      const { data: contact, error } = await supabase
        .from("contact_persons")
        .select("email, full_name")
        .eq("id", contactId)
        .single();
      if (error) throw error;
      return contact;
    },
    enabled: !!(data.invoice_contact_person_id || data.contact_person_id) && data.email_invoice_to_contact,
  });

  const selectedContactEmail = selectedContact?.email;

  // Auto-calculate billing start date based on contract effective from + billing plan offset
  useEffect(() => {
    if (data.contract_effective_from && data.billing_plan && !data._manualBillingDate) {
      const effectiveDate = new Date(data.contract_effective_from);
      let monthsToAdd = 1; // Default to 1 month

      switch (data.billing_plan) {
        case 'monthly':
          monthsToAdd = 1;
          break;
        case 'quarterly':
          monthsToAdd = 3;
          break;
        case 'semi-annual':
          monthsToAdd = 6;
          break;
        case 'annual':
          monthsToAdd = 12;
          break;
      }

      const calculatedDate = addMonths(effectiveDate, monthsToAdd);
      const formattedDate = formatDate(calculatedDate, 'yyyy-MM-dd');
      
      onChange({ 
        billing_start_date: formattedDate
      });
    }
  }, [data.contract_effective_from, data.billing_plan]);

  // Initialize defaults for required fields if not set
  React.useEffect(() => {
    const updates: any = {};
    
    if (data.vat_percentage === undefined || data.vat_percentage === null) {
      updates.vat_percentage = 5;
    }
    if (!data.deposit_type) {
      updates.deposit_type = 'refundable';
    }
    if (data.default_deposit_amount === undefined || data.default_deposit_amount === null) {
      updates.default_deposit_amount = 2500;
    }
    if (!data.payment_method) {
      updates.payment_method = 'bank-transfer';
    }
    if (!data.billing_plan) {
      updates.billing_plan = 'monthly';
    }
    if (!data.proration_rule) {
      updates.proration_rule = 'first-last';
    }
    if (!data.currency) {
      updates.currency = 'AED';
    }
    
    // Only call onChange if there are updates to avoid infinite loop
    if (Object.keys(updates).length > 0) {
      onChange(updates);
    }
  }, []); // Empty dependency array - run only once on mount

  // Add initial fee row
  const addInitialFee = () => {
    const currentFees = data.initial_fees || [];
    onChange({
      initial_fees: [
        ...currentFees,
        { fee_type: "registration", description: "", amount: 0 },
      ],
    });
  };

  // Remove initial fee row
  const removeInitialFee = (index: number) => {
    const currentFees = [...(data.initial_fees || [])];
    currentFees.splice(index, 1);
    onChange({ initial_fees: currentFees });
  };

  // Update initial fee row
  const updateInitialFee = (index: number, field: string, value: any) => {
    const currentFees = [...(data.initial_fees || [])];
    currentFees[index] = { ...currentFees[index], [field]: value };
    onChange({ initial_fees: currentFees });
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Billing & Payment Terms */}
      <Card className="border-l-4 border-l-blue-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Billing & Payment Terms</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_terms_id">Payment Terms *</Label>
              <PaymentTermsSelect
                value={data.payment_terms_id || ""}
                onChange={(value) => onChange({ payment_terms_id: value })}
                placeholder="Select payment terms"
              />
              {errors.payment_terms_id && <FormError message={errors.payment_terms_id} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_plan">Billing Plan *</Label>
              <Select
                value={data.billing_plan || ""}
                onValueChange={(value) => onChange({ billing_plan: value })}
              >
                <SelectTrigger id="billing_plan">
                  <SelectValue placeholder="Select billing plan" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.billing_plan && <FormError message={errors.billing_plan} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_start_date">Billing Start Date</Label>
              <Input
                id="billing_start_date"
                type="date"
                value={data.billing_start_date || ""}
                onChange={(e) => onChange({ 
                  billing_start_date: e.target.value,
                  _manualBillingDate: true
                })}
              />
              {errors.billing_start_date && <FormError message={errors.billing_start_date} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proration_rule">Proration Rule</Label>
              <Select
                value={data.proration_rule || "first-last"}
                onValueChange={(value) => onChange({ proration_rule: value })}
              >
                <SelectTrigger id="proration_rule">
                  <SelectValue placeholder="Select proration rule" />
                </SelectTrigger>
                <SelectContent>
                  {PRORATION_RULES.map((rule) => (
                    <SelectItem key={rule.id} value={rule.value}>
                      {rule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Tax & Pricing */}
      <Card className="border-l-4 border-l-green-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Tax & Pricing</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={data.currency || "AED"}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_price_list_id">Default Price List *</Label>
              <PriceListSelect
                value={data.default_price_list_id || ""}
                onChange={(value) => onChange({ default_price_list_id: value })}
                placeholder="Select price list"
              />
              {errors.default_price_list_id && <FormError message={errors.default_price_list_id} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_escalation_percentage">Annual Escalation %</Label>
              <Input
                id="annual_escalation_percentage"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={data.annual_escalation_percentage ?? 0}
                onChange={(e) => onChange({ annual_escalation_percentage: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_percentage">VAT % *</Label>
              <Select
                value={data.vat_percentage?.toString() || "5"}
                onValueChange={(value) => onChange({ vat_percentage: parseFloat(value) })}
              >
                <SelectTrigger id="vat_percentage">
                  <SelectValue placeholder="Select VAT rate" />
                </SelectTrigger>
                <SelectContent>
                  {VAT_RATES.map((rate) => (
                    <SelectItem key={rate.id} value={rate.value.toString()}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vat_percentage && <FormError message={errors.vat_percentage} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="withholding_tax_percentage">Withholding Tax %</Label>
              <Input
                id="withholding_tax_percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.withholding_tax_percentage || 0}
                onChange={(e) => onChange({ withholding_tax_percentage: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Deposits & Advances */}
      <Card className="border-l-4 border-l-purple-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Deposits & Advances</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
          <CardDescription className="mt-2 text-sm">
            Security deposit and advance rent collected upfront per vehicle.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Deposit and advance rent amounts are set per vehicle. 
              These defaults will apply to each vehicle line in your quote.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit_type">Deposit Type *</Label>
              <Select
                value={data.deposit_type || "refundable"}
                onValueChange={(value) => onChange({ deposit_type: value })}
              >
                <SelectTrigger id="deposit_type">
                  <SelectValue placeholder="Select deposit type" />
                </SelectTrigger>
                <SelectContent>
                  {DEPOSIT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deposit_type && <FormError message={errors.deposit_type} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_deposit_amount">Deposit Amount per Vehicle (AED) *</Label>
              <Input
                id="default_deposit_amount"
                type="number"
                min="0"
                step="100"
                value={data.default_deposit_amount ?? 2500}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ default_deposit_amount: val === "" ? 0 : parseFloat(val) || 0 });
                }}
              />
              <p className="text-xs text-muted-foreground">This amount will be applied to each vehicle line added in the quote.</p>
              {errors.default_deposit_amount && <FormError message={errors.default_deposit_amount} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_advance_rent_months">Advance Rent per Vehicle (Months)</Label>
              <Input
                id="default_advance_rent_months"
                type="number"
                min="0"
                max="3"
                value={data.default_advance_rent_months ?? 0}
                onChange={(e) => onChange({ default_advance_rent_months: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Number of months to collect upfront for each vehicle. Can be adjusted per line if needed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_delivery_fee">Default Delivery Fee (per vehicle)</Label>
              <Input
                id="default_delivery_fee"
                type="number"
                min="0"
                step="50"
                value={data.default_delivery_fee || 0}
                onChange={(e) => onChange({ default_delivery_fee: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Fee charged when vehicle is <strong>delivered to customer location</strong>. Applied when "Pickup From" is set to "Customer Location".
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_collection_fee">Default Collection Fee (per vehicle)</Label>
              <Input
                id="default_collection_fee"
                type="number"
                min="0"
                step="50"
                value={data.default_collection_fee || 0}
                onChange={(e) => onChange({ default_collection_fee: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Fee charged when vehicle is <strong>collected from customer location</strong>. Applied when "Return To" is set to "Customer Location".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Initial Fees (Editable Grid) */}
      <Card className="border-l-4 border-l-orange-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Initial Fees</CardTitle>
              <Badge variant="secondary" className="text-xs">Default Settings</Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInitialFee}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </div>
          <CardDescription className="mt-2 text-sm">
            One-time setup and administrative charges collected upfront (registration, documentation, processing fees, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {data.initial_fees && data.initial_fees.length > 0 ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Fee Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Amount (AED)</th>
                      <th className="px-4 py-2 text-left text-sm font-medium w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.initial_fees.map((fee: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          <Select
                            value={fee.fee_type || "registration"}
                            onValueChange={(value) => updateInitialFee(index, "fee_type", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INITIAL_FEE_TYPES.map((type) => (
                                <SelectItem key={type.id} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={fee.description || ""}
                            onChange={(e) => updateInitialFee(index, "description", e.target.value)}
                            placeholder="Fee description"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="10"
                            value={fee.amount || 0}
                            onChange={(e) => updateInitialFee(index, "amount", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInitialFee(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-right font-semibold">
                        Total Initial Fees:
                      </td>
                      <td className="px-4 py-2 font-bold">
                        {calculateInitialFeesTotal().toFixed(2)} AED
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No initial fees added. Click "Add Fee" to include setup or processing fees.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 5: Late Fee Policy */}
      <Card className="border-l-4 border-l-red-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Late Fee Policy</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
              <Input
                id="grace_period_days"
                type="number"
                min="0"
                max="30"
                value={data.grace_period_days || 5}
                onChange={(e) => onChange({ grace_period_days: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="late_fee_percentage">Late Fee %</Label>
              <Input
                id="late_fee_percentage"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={data.late_fee_percentage || 2}
                onChange={(e) => onChange({ late_fee_percentage: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 6: Invoice & Payment Settings */}
      <Card className="border-l-4 border-l-indigo-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Invoice & Payment Settings</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1: Payment Method and Invoice Format */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Default Payment Method *</Label>
              <Select
                value={data.payment_method || "bank-transfer"}
                onValueChange={(value) => onChange({ payment_method: value })}
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && <FormError message={errors.payment_method} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_format">Invoice Format *</Label>
              <Select
                value={data.invoice_format || "consolidated"}
                onValueChange={(value) => onChange({ invoice_format: value })}
              >
                <SelectTrigger id="invoice_format">
                  <SelectValue placeholder="Select invoice format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidated">
                    Consolidated Invoice - One invoice for all lines
                  </SelectItem>
                  <SelectItem value="per_line">
                    Separate Invoices - One invoice per vehicle line
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {data.invoice_format === 'per_line' 
                  ? 'Each vehicle line will have its own invoice'
                  : 'All vehicle lines will be combined into one invoice'}
              </p>
            </div>

            {/* Row 2: Email Invoice Toggle and Contact Person (same row) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_invoice_to_contact">Email Invoice to Contact</Label>
                <Switch
                  id="email_invoice_to_contact"
                  checked={data.email_invoice_to_contact || false}
                  onCheckedChange={(checked) => onChange({ email_invoice_to_contact: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Send invoice to specific contact person via email
              </p>
            </div>

            {/* Contact Person Select beside toggle when enabled */}
            {data.email_invoice_to_contact && (
              <div className="space-y-2">
                <Label htmlFor="invoice_contact_person_id">Invoice to Contact *</Label>
                <ContactPersonSelect
                  customerId={data.customer_id}
                  value={data.invoice_contact_person_id || data.contact_person_id || ""}
                  onChange={(value) => onChange({ invoice_contact_person_id: value })}
                  placeholder="Select contact person"
                />
                {errors.invoice_contact_person_id && <FormError message={errors.invoice_contact_person_id} />}
                
                {selectedContactEmail && (
                  <p className="text-xs text-muted-foreground">
                    Invoice will be sent to: <span className="font-medium">{selectedContactEmail}</span>
                  </p>
                )}
              </div>
            )}

            {/* Row 4: Customer PO Number */}
            <div className="space-y-2">
              <Label htmlFor="customer_po_number">Customer PO Number</Label>
              <Input
                id="customer_po_number"
                value={data.customer_po_number || ""}
                onChange={(e) => onChange({ customer_po_number: e.target.value })}
                placeholder="PO-2025-001"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 7: Financial Summary - Defaults */}
      <Card className="border-l-4 border-l-primary shadow-md bg-primary/5">
        <CardHeader className="p-4 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Financial Summary - Defaults</CardTitle>
            <Badge variant="default" className="text-xs ml-auto">Summary</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Deposit (per vehicle):</span>
                <span className="font-medium">{upfrontDue.deposit.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Advance Rent:</span>
                <span className="font-medium">{upfrontDue.advanceMonths} month(s) per vehicle</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Initial Fees (One-time Total):</span>
                <span className="font-medium">{upfrontDue.initialFees.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee (per vehicle):</span>
                <span className="font-medium">{(data.default_delivery_fee || 0).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Collection Fee (per vehicle):</span>
                <span className="font-medium">{(data.default_collection_fee || 0).toFixed(2)} AED</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Final upfront amounts will be calculated in Step 4 after adding vehicle lines with rental rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

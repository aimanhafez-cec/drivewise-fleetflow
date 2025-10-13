import React, { useEffect } from "react";
import { addMonths, format as formatDate } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing & Payment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tax & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deposits & Advances
          </CardTitle>
          <CardDescription className="mt-2">
            Define the customer's refundable security deposit and any advance rental months to be collected 
            before contract activation. These protect the company's financial exposure and must be settled 
            before vehicle handover.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                value={data.default_deposit_amount || 2500}
                onChange={(e) => onChange({ default_deposit_amount: parseFloat(e.target.value) })}
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
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Initial Fees (Editable Grid) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Initial Fees
            </CardTitle>
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
          <CardDescription className="mt-2">
            One-time, non-refundable setup and administrative charges collected before vehicle delivery. 
            These cover preparation, documentation, delivery, and system setup costs and appear in the upfront due total.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Late Fee Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice & Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Card 7: Financial Summary */}
      <Card className="bg-primary/5 border-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm mb-1.5">Upfront Due per Vehicle</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Deposit (per vehicle):</span>
                <span className="font-medium">{upfrontDue.deposit.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Advance Rent ({upfrontDue.advanceMonths} months per vehicle):</span>
                <span className="font-medium">{upfrontDue.advanceRent.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Initial Fees Total:</span>
                <span className="font-medium">{upfrontDue.initialFees.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-1.5 mt-1.5">
                <span>Total Upfront Due (per vehicle):</span>
                <span className="text-primary">{upfrontDue.total.toFixed(2)} AED</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                * Multiply by number of vehicles for total upfront amount
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

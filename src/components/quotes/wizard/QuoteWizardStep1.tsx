import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import {
  LegalEntitySelect,
  BusinessUnitSelect,
  OpportunitySelect,
  ContactPersonSelect,
  SalesOfficeSelect,
  SalesRepSelect,
  CustomerSiteSelect,
} from "@/components/ui/select-components";
import { CustomerSelect } from "@/components/ui/select-components";
import { OpportunityViewDialog } from "@/components/quotes/OpportunityViewDialog";
import { useOpportunityById } from "@/hooks/useQuoteLOVs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuoteWizardStep1Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep1: React.FC<QuoteWizardStep1Props> = ({
  data,
  onChange,
  errors,
}) => {
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
  
  // Fetch opportunity details when opportunity_id changes
  const { data: opportunityData } = useOpportunityById(data.opportunity_id);

  // Fetch selected customer details
  const { data: selectedCustomer } = useQuery({
    queryKey: ["customer", data.customer_id],
    queryFn: async () => {
      if (!data.customer_id) return null;
      const { data: customer, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", data.customer_id)
        .single();
      if (error) throw error;
      return customer;
    },
    enabled: !!data.customer_id,
  });

  // Auto-fill account name when customer is selected (for organizations)
  useEffect(() => {
    if ((data.customer_type === "B2B" || data.customer_type === "CORPORATE") && selectedCustomer?.full_name) {
      onChange({ account_name: selectedCustomer.full_name });
    }
  }, [data.customer_type, selectedCustomer?.full_name, onChange]);

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (data.contract_effective_from && data.contract_effective_to) {
      const from = new Date(data.contract_effective_from);
      const to = new Date(data.contract_effective_to);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      onChange({ duration_days: diffDays });
    }
  }, [data.contract_effective_from, data.contract_effective_to]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Header Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Legal Entity & Business Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legal_entity_id">Legal Entity *</Label>
              <LegalEntitySelect
                value={data.legal_entity_id || ""}
                onChange={(value) => onChange({ legal_entity_id: value })}
                placeholder="Select legal entity"
              />
              {errors.legal_entity_id && (
                <p className="text-sm text-destructive">{errors.legal_entity_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_unit_id">Business Unit *</Label>
              <BusinessUnitSelect
                value={data.business_unit_id || ""}
                onChange={(value) => onChange({ business_unit_id: value })}
                placeholder="Select business unit"
              />
              {errors.business_unit_id && (
                <p className="text-sm text-destructive">{errors.business_unit_id}</p>
              )}
            </div>
          </div>

          {/* Row 2: Opportunity & Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opportunity_id">Opportunity ID (Optional)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <OpportunitySelect
                    value={data.opportunity_id || ""}
                    onChange={(value) => onChange({ opportunity_id: value })}
                    placeholder="Select opportunity"
                    allowClear
                  />
                </div>
                {data.opportunity_id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowOpportunityDialog(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote_number">Quote No. *</Label>
              <Input
                id="quote_number"
                value={data.quote_number || ""}
                onChange={(e) => onChange({ quote_number: e.target.value })}
                placeholder="Auto-generated"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote_description">Quote Description</Label>
            <Textarea
              id="quote_description"
              value={data.quote_description || ""}
              onChange={(e) => onChange({ quote_description: e.target.value })}
              placeholder="Enter quote description"
              rows={2}
            />
          </div>

          {/* Row 3: Customer Type & Customer Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_type">Customer Type *</Label>
              <Select
                value={data.customer_type || ""}
                onValueChange={(value) => {
                  onChange({ 
                    customer_type: value,
                    customer_id: null,
                    account_name: null,
                    customer_bill_to: null,
                    contact_person_id: null,
                    project: null,
                  });
                }}
              >
                <SelectTrigger id="customer_type">
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Organization
                    </div>
                  </SelectItem>
                  <SelectItem value="CORPORATE">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Corporate
                    </div>
                  </SelectItem>
                  <SelectItem value="B2C">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Person
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.customer_type && (
                <p className="text-sm text-destructive">{errors.customer_type}</p>
              )}
            </div>

            {/* Organization Fields */}
            {(data.customer_type === "B2B" || data.customer_type === "CORPORATE") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer_id">Customer Organization Name *</Label>
                  <CustomerSelect
                    value={data.customer_id || ""}
                    onChange={(value) => onChange({ customer_id: value })}
                    customerType={data.customer_type}
                    placeholder="Search and select organization"
                  />
                  {errors.customer_id && (
                    <p className="text-sm text-destructive">{errors.customer_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={data.account_name || ""}
                    disabled
                    placeholder="Auto-filled from customer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_bill_to">Customer Bill To</Label>
                  <CustomerSiteSelect
                    customerId={data.customer_id}
                    value={data.customer_bill_to || ""}
                    onChange={(value) => onChange({ customer_bill_to: value })}
                    placeholder="Select customer site"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person_id">Contact Person</Label>
                  <ContactPersonSelect
                    customerId={data.customer_id}
                    value={data.contact_person_id || ""}
                    onChange={(value) => onChange({ contact_person_id: value })}
                    placeholder="Select contact person"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Input
                    id="project"
                    value={data.project || ""}
                    onChange={(e) => onChange({ project: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
              </div>
            )}

            {/* Person Fields */}
            {data.customer_type === "B2C" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer_id">Customer Name *</Label>
                  <CustomerSelect
                    value={data.customer_id || ""}
                    onChange={(value) => onChange({ customer_id: value })}
                    customerType="B2C"
                    placeholder="Search and select person"
                  />
                  {errors.customer_id && (
                    <p className="text-sm text-destructive">{errors.customer_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_bill_to">Customer Bill To</Label>
                  <CustomerSiteSelect
                    customerId={data.customer_id}
                    value={data.customer_bill_to || ""}
                    onChange={(value) => onChange({ customer_bill_to: value })}
                    placeholder="Select customer site"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Sales Office & Sales Rep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales_office_id">Sales Office *</Label>
              <SalesOfficeSelect
                value={data.sales_office_id || ""}
                onChange={(value) => {
                  onChange({ sales_office_id: value, sales_rep_id: null });
                }}
                placeholder="Select sales office"
              />
              {errors.sales_office_id && (
                <p className="text-sm text-destructive">{errors.sales_office_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_rep_id">Sales Rep. *</Label>
              <SalesRepSelect
                salesOfficeId={data.sales_office_id}
                value={data.sales_rep_id || ""}
                onChange={(value) => onChange({ sales_rep_id: value })}
                placeholder="Select sales representative"
              />
              {errors.sales_rep_id && (
                <p className="text-sm text-destructive">{errors.sales_rep_id}</p>
              )}
            </div>
          </div>

          {/* Row 5: Quote Entry Date, Status & Win/Loss Reason */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote_entry_date">Quote Entry Date</Label>
              <Input
                id="quote_entry_date"
                type="date"
                value={data.quote_entry_date || format(new Date(), "yyyy-MM-dd")}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={data.status || "draft"}
                onValueChange={(value) => onChange({ status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                type="number"
                value={data.version || 1}
                disabled
              />
            </div>
          </div>

          {(data.status === "won" || data.status === "lost") && (
            <div className="space-y-2">
              <Label htmlFor="win_loss_reason">Win / Loss Reason *</Label>
              <Textarea
                id="win_loss_reason"
                value={data.win_loss_reason || ""}
                onChange={(e) => onChange({ win_loss_reason: e.target.value })}
                placeholder="Enter reason for win or loss"
                rows={2}
              />
              {errors.win_loss_reason && (
                <p className="text-sm text-destructive">{errors.win_loss_reason}</p>
              )}
            </div>
          )}

          {/* Row 6: Quote Date, Quote Type & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote_date">Quote Date *</Label>
              <Input
                id="quote_date"
                type="date"
                value={data.quote_date || ""}
                onChange={(e) => onChange({ quote_date: e.target.value })}
              />
              {errors.quote_date && (
                <p className="text-sm text-destructive">{errors.quote_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote_type">Quote Type *</Label>
              <Select
                value={data.quote_type || ""}
                onValueChange={(value) => onChange({ quote_type: value })}
              >
                <SelectTrigger id="quote_type">
                  <SelectValue placeholder="Select quote type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate lease">Corporate lease</SelectItem>
                  <SelectItem value="Personal Lease">Personal Lease</SelectItem>
                  <SelectItem value="Rental-Short Term">Rental-Short Term</SelectItem>
                </SelectContent>
              </Select>
              {errors.quote_type && (
                <p className="text-sm text-destructive">{errors.quote_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={data.currency || "AED"}
                onValueChange={(value) => onChange({ currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="EGP">EGP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 7: Contract Dates & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validity_date_to">Validity Date To</Label>
              <Input
                id="validity_date_to"
                type="date"
                value={data.validity_date_to || ""}
                onChange={(e) => onChange({ validity_date_to: e.target.value })}
              />
              {errors.validity_date_to && (
                <p className="text-sm text-destructive">{errors.validity_date_to}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_effective_from">Contract Effective From</Label>
              <Input
                id="contract_effective_from"
                type="date"
                value={data.contract_effective_from || ""}
                onChange={(e) => onChange({ contract_effective_from: e.target.value })}
              />
              {errors.contract_effective_from && (
                <p className="text-sm text-destructive">{errors.contract_effective_from}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_effective_to">Contract Effective To</Label>
              <Input
                id="contract_effective_to"
                type="date"
                value={data.contract_effective_to || ""}
                onChange={(e) => onChange({ contract_effective_to: e.target.value })}
              />
              {errors.contract_effective_to && (
                <p className="text-sm text-destructive">{errors.contract_effective_to}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Duration (Days)</Label>
              <Input
                id="duration_days"
                type="number"
                value={data.duration_days || ""}
                disabled
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity View Dialog */}
      <OpportunityViewDialog
        opportunityId={data.opportunity_id}
        opportunityNo={opportunityData?.opportunity_no}
        notesAssumptions={opportunityData?.notes_assumptions}
        open={showOpportunityDialog}
        onOpenChange={setShowOpportunityDialog}
      />
    </div>
  );
};

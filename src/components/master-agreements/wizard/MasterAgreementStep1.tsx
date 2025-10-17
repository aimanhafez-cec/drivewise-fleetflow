import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import {
  LegalEntitySelect,
  BusinessUnitSelect,
  OpportunitySelect,
  ContactPersonSelect,
  SalesOfficeSelect,
  SalesRepSelect,
  CustomerSiteSelect,
  CustomerSelect,
} from "@/components/ui/select-components";
import { OpportunityViewDialog } from "@/components/quotes/OpportunityViewDialog";
import { useOpportunityById } from "@/hooks/useQuoteLOVs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MasterAgreementStep1Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep1: React.FC<MasterAgreementStep1Props> = ({
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

  // Auto-fill account name when customer is selected (for companies)
  useEffect(() => {
    if (data.customer_type === "Company" && selectedCustomer?.full_name) {
      onChange({ account_name: selectedCustomer.full_name });
    }
  }, [data.customer_type, selectedCustomer?.full_name]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Master Agreement Header Information</CardTitle>
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

          {/* Row 2: Sales Office & Sales Rep */}
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

          {/* Row 3: Opportunity & Agreement Details */}
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
              <Label htmlFor="agreement_no">Master Agreement No. *</Label>
              <Input
                id="agreement_no"
                value={data.agreement_no || ""}
                onChange={(e) => onChange({ agreement_no: e.target.value })}
                placeholder="Auto-generated"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agreement_description">Agreement Description</Label>
            <Textarea
              id="agreement_description"
              value={data.agreement_description || ""}
              onChange={(e) => onChange({ agreement_description: e.target.value })}
              placeholder="Enter agreement description"
              rows={2}
            />
          </div>

          {/* Row 4: Customer Type & Customer Details */}
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
                    bill_to_site_id: null,
                    contact_person_id: null,
                  });
                }}
              >
                <SelectTrigger id="customer_type">
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Company">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </div>
                  </SelectItem>
                  <SelectItem value="Person">
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

            {/* Company Fields */}
            {data.customer_type === "Company" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer_id">Customer Organization Name *</Label>
                  <CustomerSelect
                    value={data.customer_id || ""}
                    onChange={(value) =>
                      onChange({
                        customer_id: value,
                        bill_to_site_id: null,
                        contact_person_id: null,
                      })
                    }
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
                  <Label htmlFor="bill_to_site_id">Bill To Site</Label>
                  <CustomerSiteSelect
                    customerId={data.customer_id}
                    value={data.bill_to_site_id || ""}
                    onChange={(value) => onChange({ bill_to_site_id: value })}
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
                  <Label htmlFor="customer_segment">Customer Segment</Label>
                  <Select
                    value={data.customer_segment || ""}
                    onValueChange={(value) => onChange({ customer_segment: value })}
                  >
                    <SelectTrigger id="customer_segment">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMB">SMB (Small/Medium Business)</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Fleet Operator">Fleet Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Person Fields */}
            {data.customer_type === "Person" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer_id">Customer Name *</Label>
                  <CustomerSelect
                    value={data.customer_id || ""}
                    onChange={(value) =>
                      onChange({
                        customer_id: value,
                        bill_to_site_id: null,
                        contact_person_id: null,
                      })
                    }
                    customerType="Person"
                    placeholder="Search and select person"
                  />
                  {errors.customer_id && (
                    <p className="text-sm text-destructive">{errors.customer_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bill_to_site_id">Bill To Site</Label>
                  <CustomerSiteSelect
                    customerId={data.customer_id}
                    value={data.bill_to_site_id || ""}
                    onChange={(value) => onChange({ bill_to_site_id: value })}
                    placeholder="Select customer site"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 5: Agreement Entry Date, Status & Version */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <DatePicker
                id="agreement_entry_date"
                label="Agreement Entry Date"
                value={data.agreement_entry_date || format(new Date(), "yyyy-MM-dd")}
                onChange={(date) => onChange({ agreement_entry_date: date ? format(date, "yyyy-MM-dd") : null })}
                placeholder="Auto-filled with today's date"
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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

          {/* Row 6: Currency & Credit Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_terms">Credit Terms *</Label>
              <Select
                value={data.credit_terms || ""}
                onValueChange={(value) => onChange({ credit_terms: value })}
              >
                <SelectTrigger id="credit_terms">
                  <SelectValue placeholder="Select credit terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.credit_terms && (
                <p className="text-sm text-destructive">{errors.credit_terms}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_limit">Credit Limit (AED)</Label>
              <Input
                id="credit_limit"
                type="number"
                value={data.credit_limit || ""}
                onChange={(e) => onChange({ credit_limit: parseFloat(e.target.value) || null })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_po_no">Customer PO Number</Label>
            <Input
              id="customer_po_no"
              value={data.customer_po_no || ""}
              onChange={(e) => onChange({ customer_po_no: e.target.value })}
              placeholder="Enter PO number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={data.notes || ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {showOpportunityDialog && data.opportunity_id && (
        <OpportunityViewDialog
          opportunityId={data.opportunity_id}
          open={showOpportunityDialog}
          onOpenChange={setShowOpportunityDialog}
        />
      )}
    </div>
  );
};

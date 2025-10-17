import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LOVSelect } from "@/components/ui/lov-select";
import { useLegalEntities, useCustomerSites } from "@/hooks/useCorporateLeasingLOVs";
import { CustomerSelect } from "@/components/ui/select-components";
import { RequiredLabel } from "@/components/ui/required-label";
import { FormError } from "@/components/ui/form-error";

interface MasterAgreementStep1Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep1: React.FC<MasterAgreementStep1Props> = ({
  data,
  onChange,
  errors,
}) => {
  const { items: legalEntities = [], isLoading: loadingEntities } = useLegalEntities();
  const { items: customerSites = [], isLoading: loadingSites } = useCustomerSites(data.customer_id);

  const CUSTOMER_SEGMENTS = [
    { id: "SMB", label: "SMB (Small/Medium Business)" },
    { id: "Enterprise", label: "Enterprise" },
    { id: "Government", label: "Government" },
    { id: "Fleet Operator", label: "Fleet Operator" },
  ];

  const CREDIT_TERMS = [
    { id: "Net 15", label: "Net 15" },
    { id: "Net 30", label: "Net 30" },
    { id: "Net 45", label: "Net 45" },
    { id: "Custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Entity & Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel>Legal Entity</RequiredLabel>
              <LOVSelect
                value={data.legal_entity_id}
                onChange={(value) => onChange("legal_entity_id", value)}
                items={legalEntities}
                isLoading={loadingEntities}
                placeholder="Select legal entity"
              />
              {errors.legal_entity_id && <FormError message={errors.legal_entity_id} />}
            </div>

            <div className="space-y-2">
              <RequiredLabel>Customer</RequiredLabel>
              <CustomerSelect
                value={data.customer_id}
                onChange={(value) => onChange("customer_id", value)}
              />
              {errors.customer_id && <FormError message={errors.customer_id} />}
            </div>

            <div className="space-y-2">
              <Label>Customer Segment</Label>
              <LOVSelect
                value={data.customer_segment}
                onChange={(value) => onChange("customer_segment", value)}
                items={CUSTOMER_SEGMENTS}
                placeholder="Select segment"
              />
            </div>

            <div className="space-y-2">
              <Label>Bill To Site</Label>
              <LOVSelect
                value={data.bill_to_site_id}
                onChange={(value) => onChange("bill_to_site_id", value)}
                items={customerSites}
                isLoading={loadingSites}
                placeholder="Select billing site"
                disabled={!data.customer_id}
              />
            </div>

            <div className="space-y-2">
              <RequiredLabel>Credit Terms</RequiredLabel>
              <LOVSelect
                value={data.credit_terms}
                onChange={(value) => onChange("credit_terms", value)}
                items={CREDIT_TERMS}
                placeholder="Select credit terms"
              />
              {errors.credit_terms && <FormError message={errors.credit_terms} />}
            </div>

            <div className="space-y-2">
              <Label>Credit Limit (AED)</Label>
              <Input
                type="number"
                value={data.credit_limit || ""}
                onChange={(e) => onChange("credit_limit", parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Customer PO Number</Label>
            <Input
              value={data.customer_po_no || ""}
              onChange={(e) => onChange("customer_po_no", e.target.value)}
              placeholder="Enter PO number"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={data.notes || ""}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

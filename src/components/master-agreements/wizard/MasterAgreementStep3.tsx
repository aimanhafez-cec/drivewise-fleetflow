import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LOVSelect } from "@/components/ui/lov-select";
import { RequiredLabel } from "@/components/ui/required-label";
import { FormError } from "@/components/ui/form-error";

interface MasterAgreementStep3Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep3: React.FC<MasterAgreementStep3Props> = ({
  data,
  onChange,
  errors,
}) => {
  const BILLING_DAYS = [
    { id: "Anniversary", label: "Anniversary (contract start)" },
    { id: "1st", label: "1st of month" },
    { id: "15th", label: "15th of month" },
  ];

  const INVOICE_FORMATS = [
    { id: "Consolidated", label: "Consolidated (single invoice)" },
    { id: "Per Vehicle", label: "Per Vehicle" },
    { id: "Per Cost Center", label: "Per Cost Center" },
  ];

  const LINE_ITEM_GRANULARITIES = [
    { id: "Base Rent + Add-ons", label: "Base Rent + Add-ons" },
    { id: "Fully Itemized", label: "Fully Itemized" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing & Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel>Billing Day</RequiredLabel>
              <LOVSelect
                value={data.billing_day}
                onChange={(value) => onChange("billing_day", value)}
                items={BILLING_DAYS}
                placeholder="Select billing day"
              />
              {errors.billing_day && <FormError message={errors.billing_day} />}
            </div>

            <div className="space-y-2">
              <RequiredLabel>Invoice Format</RequiredLabel>
              <LOVSelect
                value={data.invoice_format}
                onChange={(value) => onChange("invoice_format", value)}
                items={INVOICE_FORMATS}
                placeholder="Select invoice format"
              />
              {errors.invoice_format && <FormError message={errors.invoice_format} />}
            </div>

            <div className="space-y-2 col-span-2">
              <RequiredLabel>Line Item Granularity</RequiredLabel>
              <LOVSelect
                value={data.line_item_granularity}
                onChange={(value) => onChange("line_item_granularity", value)}
                items={LINE_ITEM_GRANULARITIES}
                placeholder="Select granularity"
              />
              {errors.line_item_granularity && <FormError message={errors.line_item_granularity} />}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Settings (Reference)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Billing Cycle</p>
            <p className="font-medium">Monthly</p>
          </div>
          <div>
            <p className="text-muted-foreground">Currency</p>
            <p className="font-medium">AED</p>
          </div>
          <div>
            <p className="text-muted-foreground">VAT Code</p>
            <p className="font-medium">UAE 5%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Discount Schema</p>
            <p className="font-medium">As per contract lines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

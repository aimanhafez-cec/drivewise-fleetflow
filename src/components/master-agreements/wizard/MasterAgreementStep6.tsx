import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LOVSelect } from "@/components/ui/lov-select";
import { DatePicker } from "@/components/ui/date-picker";

interface MasterAgreementStep6Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep6: React.FC<MasterAgreementStep6Props> = ({
  data,
  onChange,
  errors,
}) => {
  const SECURITY_INSTRUMENTS = [
    { id: "None", label: "None" },
    { id: "Deposit per Vehicle", label: "Deposit per Vehicle" },
    { id: "Bank Guarantee", label: "Bank Guarantee" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Security Instrument</Label>
              <LOVSelect
                value={data.security_instrument}
                onChange={(value) => onChange("security_instrument", value)}
                items={SECURITY_INSTRUMENTS}
                placeholder="Select instrument"
              />
            </div>

            {data.security_instrument !== "None" && (
              <div className="space-y-2">
                <Label>Deposit Amount (AED)</Label>
                <Input
                  type="number"
                  value={data.deposit_amount_aed || ""}
                  onChange={(e) => onChange("deposit_amount_aed", parseFloat(e.target.value) || null)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contract Start Date</Label>
              <DatePicker
                value={data.contract_start_date ? new Date(data.contract_start_date) : undefined}
                onChange={(date) => onChange("contract_start_date", date?.toISOString().split("T")[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Contract End Date</Label>
              <DatePicker
                value={data.contract_end_date ? new Date(data.contract_end_date) : undefined}
                onChange={(date) => onChange("contract_end_date", date?.toISOString().split("T")[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Signed Date</Label>
              <DatePicker
                value={data.signed_date ? new Date(data.signed_date) : undefined}
                onChange={(date) => onChange("signed_date", date?.toISOString().split("T")[0])}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review & Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{data.customer_id ? "Selected" : "Not selected"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Credit Terms</p>
              <p className="font-medium">{data.credit_terms || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Framework Model</p>
              <p className="font-medium">{data.framework_model || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Master Term</p>
              <p className="font-medium">{data.master_term || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Insurance</p>
              <p className="font-medium">{data.insurance_responsibility || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Maintenance</p>
              <p className="font-medium">{data.maintenance_policy || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

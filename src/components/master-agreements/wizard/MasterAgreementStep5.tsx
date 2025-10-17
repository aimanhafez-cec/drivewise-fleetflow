import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LOVSelect } from "@/components/ui/lov-select";

interface MasterAgreementStep5Props {
  data: any;
  onChange: (updates: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep5: React.FC<MasterAgreementStep5Props> = ({
  data,
  onChange,
  errors,
}) => {
  const SALIK_DARB_HANDLING = [
    { id: "Rebill Actual (monthly)", label: "Rebill Actual (monthly)" },
    { id: "Fixed monthly cap", label: "Fixed monthly cap" },
    { id: "Customer pays directly", label: "Customer pays directly" },
  ];

  const TOLLS_ADMIN_FEE_MODELS = [
    { id: "Per-invoice", label: "Per-invoice (single fee)" },
    { id: "Per-tag-per-month", label: "Per-tag-per-month" },
    { id: "None", label: "None (included)" },
  ];

  const TRAFFIC_FINES_HANDLING = [
    { id: "Auto Rebill + Admin Fee", label: "Auto Rebill + Admin Fee" },
    { id: "Manual review", label: "Manual review" },
  ];

  const FUEL_HANDLING = [
    { id: "Customer Fuel", label: "Customer Fuel" },
    { id: "Pre-paid Fuel Card", label: "Pre-paid Fuel Card" },
    { id: "Fuel allowance", label: "Fuel allowance" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tolls & Fines Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Salik/Darb Handling</Label>
              <LOVSelect
                value={data.salik_darb_handling}
                onChange={(value) => onChange({ salik_darb_handling: value })}
                items={SALIK_DARB_HANDLING}
                placeholder="Select handling"
              />
            </div>

            <div className="space-y-2">
              <Label>Tolls Admin Fee Model</Label>
              <LOVSelect
                value={data.tolls_admin_fee_model}
                onChange={(value) => onChange({ tolls_admin_fee_model: value })}
                items={TOLLS_ADMIN_FEE_MODELS}
                placeholder="Select model"
              />
            </div>

            <div className="space-y-2">
              <Label>Traffic Fines Handling</Label>
              <LOVSelect
                value={data.traffic_fines_handling}
                onChange={(value) => onChange({ traffic_fines_handling: value })}
                items={TRAFFIC_FINES_HANDLING}
                placeholder="Select handling"
              />
            </div>

            <div className="space-y-2">
              <Label>Admin Fee per Fine (AED)</Label>
              <Input
                type="number"
                value={data.admin_fee_per_fine_aed || 25}
                onChange={(e) => onChange({ admin_fee_per_fine_aed: parseFloat(e.target.value) || 25 })}
                placeholder="25"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Fuel Handling</Label>
              <LOVSelect
                value={data.fuel_handling}
                onChange={(value) => onChange({ fuel_handling: value })}
                items={FUEL_HANDLING}
                placeholder="Select fuel handling"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

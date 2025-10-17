import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LOVSelect } from "@/components/ui/lov-select";
import { RequiredLabel } from "@/components/ui/required-label";

interface MasterAgreementStep4Props {
  data: any;
  onChange: (updates: Record<string, any>) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep4: React.FC<MasterAgreementStep4Props> = ({
  data,
  onChange,
  errors,
}) => {
  const INSURANCE_RESPONSIBILITIES = [
    { id: "Included (Lessor)", label: "Included (Lessor)" },
    { id: "Customer arranges", label: "Customer arranges" },
  ];

  const MAINTENANCE_POLICIES = [
    { id: "Full (PM+wear)", label: "Full Service (PM + wear items)" },
    { id: "PM only", label: "PM only" },
    { id: "Customer handles", label: "Customer handles" },
  ];

  const WORKSHOP_PREFERENCES = [
    { id: "OEM", label: "OEM (Authorized dealers)" },
    { id: "Partner", label: "Partner workshops" },
    { id: "Any approved", label: "Any approved" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insurance Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel>Insurance Responsibility</RequiredLabel>
              <LOVSelect
                value={data.insurance_responsibility}
                onChange={(value) => onChange({ insurance_responsibility: value })}
                items={INSURANCE_RESPONSIBILITIES}
                placeholder="Select responsibility"
              />
            </div>

            {data.insurance_responsibility === "Included (Lessor)" && (
              <div className="space-y-2">
                <Label>Insurance Excess (AED)</Label>
                <Input
                  type="number"
                  value={data.insurance_excess_aed || ""}
                  onChange={(e) => onChange({ insurance_excess_aed: parseFloat(e.target.value) || null })}
                  placeholder="1500"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel>Maintenance Policy</RequiredLabel>
              <LOVSelect
                value={data.maintenance_policy}
                onChange={(value) => onChange({ maintenance_policy: value })}
                items={MAINTENANCE_POLICIES}
                placeholder="Select policy"
              />
            </div>

            <div className="space-y-2">
              <Label>Tyres Included After (km)</Label>
              <Input
                type="number"
                value={data.tyres_included_after_km || ""}
                onChange={(e) => onChange({ tyres_included_after_km: parseInt(e.target.value) || null })}
                placeholder="e.g., 40000"
              />
            </div>

            <div className="space-y-2">
              <Label>Workshop Preference</Label>
              <LOVSelect
                value={data.workshop_preference}
                onChange={(value) => onChange({ workshop_preference: value })}
                items={WORKSHOP_PREFERENCES}
                placeholder="Select preference"
              />
            </div>

            <div className="space-y-2">
              <Label>Registration Responsibility</Label>
              <LOVSelect
                value={data.registration_responsibility}
                onChange={(value) => onChange({ registration_responsibility: value })}
                items={[
                  { id: "Lessor", label: "Lessor" },
                  { id: "Customer", label: "Customer" },
                ]}
                placeholder="Select responsibility"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="roadside"
                checked={data.roadside_assistance_included || false}
                onCheckedChange={(checked) => onChange({ roadside_assistance_included: checked })}
              />
              <label htmlFor="roadside" className="text-sm font-medium leading-none">
                Roadside Assistance Included
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="replacement"
                checked={data.replacement_vehicle_included || false}
                onCheckedChange={(checked) => onChange({ replacement_vehicle_included: checked })}
              />
              <label htmlFor="replacement" className="text-sm font-medium leading-none">
                Replacement Vehicle Included
              </label>
            </div>

            {data.replacement_vehicle_included && (
              <div className="space-y-2 ml-6">
                <Label>Replacement SLA (hours)</Label>
                <Input
                  type="number"
                  value={data.replacement_sla_hours || ""}
                  onChange={(e) => onChange({ replacement_sla_hours: parseInt(e.target.value) || null })}
                  placeholder="24"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

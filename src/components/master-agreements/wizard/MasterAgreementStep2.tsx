import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LOVSelect } from "@/components/ui/lov-select";
import { RequiredLabel } from "@/components/ui/required-label";
import { FormError } from "@/components/ui/form-error";

interface MasterAgreementStep2Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep2: React.FC<MasterAgreementStep2Props> = ({
  data,
  onChange,
  errors,
}) => {
  const FRAMEWORK_MODELS = [
    { id: "Rate Card by Class", label: "Rate Card by Class" },
    { id: "Fixed Rate per VIN", label: "Fixed Rate per VIN" },
  ];

  const CONTRACT_TERMS = [
    { id: "12 months", label: "12 months" },
    { id: "24 months", label: "24 months" },
    { id: "36 months", label: "36 months" },
    { id: "48 months", label: "48 months" },
    { id: "Open-ended", label: "Open-ended" },
  ];

  const RENEWAL_OPTIONS = [
    { id: "Auto-renew", label: "Auto-renew" },
    { id: "Mutual agreement", label: "Mutual agreement" },
    { id: "Fixed term only", label: "Fixed term only" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Framework & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel>Framework Model</RequiredLabel>
              <LOVSelect
                value={data.framework_model}
                onChange={(value) => onChange("framework_model", value)}
                items={FRAMEWORK_MODELS}
                placeholder="Select framework"
              />
              {errors.framework_model && <FormError message={errors.framework_model} />}
            </div>

            <div className="space-y-2">
              <Label>Committed Fleet Size</Label>
              <Input
                type="number"
                value={data.committed_fleet_size || ""}
                onChange={(e) => onChange("committed_fleet_size", parseInt(e.target.value) || null)}
                placeholder="Number of vehicles"
              />
            </div>

            <div className="space-y-2">
              <RequiredLabel>Master Term</RequiredLabel>
              <LOVSelect
                value={data.master_term}
                onChange={(value) => onChange("master_term", value)}
                items={CONTRACT_TERMS}
                placeholder="Select term"
              />
              {errors.master_term && <FormError message={errors.master_term} />}
            </div>

            <div className="space-y-2">
              <Label>Off-Hire Notice Period (days)</Label>
              <Input
                type="number"
                value={data.off_hire_notice_period || 30}
                onChange={(e) => onChange("off_hire_notice_period", parseInt(e.target.value) || 30)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="co_terminus"
              checked={data.co_terminus_lines || false}
              onCheckedChange={(checked) => onChange("co_terminus_lines", checked)}
            />
            <label htmlFor="co_terminus" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Co-terminus Lines (all lines end on same date)
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="early_termination"
                checked={data.early_termination_allowed || false}
                onCheckedChange={(checked) => onChange("early_termination_allowed", checked)}
              />
              <label htmlFor="early_termination" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Early Termination Allowed
              </label>
            </div>

            {data.early_termination_allowed && (
              <div className="space-y-2 ml-6">
                <Label>Early Termination Rule</Label>
                <Input
                  value={data.early_termination_rule || ""}
                  onChange={(e) => onChange("early_termination_rule", e.target.value)}
                  placeholder="e.g., 3 months notice + penalty"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Renewal Option</Label>
            <LOVSelect
              value={data.renewal_option}
              onChange={(value) => onChange("renewal_option", value)}
              items={RENEWAL_OPTIONS}
              placeholder="Select renewal option"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Info } from "lucide-react";
import { FormError } from "@/components/ui/form-error";

interface QuoteWizardStep3InsuranceProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep3_Insurance: React.FC<QuoteWizardStep3InsuranceProps> = ({
  data,
  onChange,
  errors,
}) => {
  // Auto-set excess to 0 for Full/Zero-Excess package
  React.useEffect(() => {
    if (data.insurance_coverage_package === 'full-zero-excess') {
      onChange({ insurance_excess_aed: 0 });
    }
  }, [data.insurance_coverage_package]);

  // Auto-generate coverage summary
  React.useEffect(() => {
    const parts = [];
    if (data.insurance_coverage_package) {
      const pkgLabel = {
        'cdw': 'CDW (Collision Damage Waiver)',
        'comprehensive': 'Comprehensive',
        'full-zero-excess': 'Full Coverage / Zero Excess',
      }[data.insurance_coverage_package] || data.insurance_coverage_package;
      parts.push(pkgLabel);
    }
    
    if (data.insurance_excess_aed !== undefined && data.insurance_coverage_package !== 'full-zero-excess') {
      parts.push(`AED ${data.insurance_excess_aed} excess`);
    } else if (data.insurance_coverage_package === 'full-zero-excess') {
      parts.push('Zero Excess');
    }
    
    if (data.insurance_glass_tire_cover) {
      parts.push('Glass & Tire included');
    }
    
    if (data.insurance_pai_enabled) {
      parts.push('Personal Accident Insurance');
    }
    
    if (data.insurance_territorial_coverage) {
      parts.push(data.insurance_territorial_coverage === 'uae-only' ? 'UAE Only' : 'GCC Coverage');
    }
    
    onChange({ insurance_coverage_summary: parts.join(' • ') || 'No coverage configured' });
  }, [
    data.insurance_coverage_package,
    data.insurance_excess_aed,
    data.insurance_glass_tire_cover,
    data.insurance_pai_enabled,
    data.insurance_territorial_coverage,
  ]);

  const calculateMonthlyTotal = () => {
    // This will later sum line-level insurance charges
    // For now, we'll show 0 since lines inherit from header
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Main Insurance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Coverage - Default Settings
          </CardTitle>
          <CardDescription>
            Configure default insurance coverage for all vehicles. These settings will be inherited by each vehicle line 
            and can be overridden individually if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Coverage Package */}
          <div className="space-y-2">
            <Label htmlFor="coverage_package" className="flex items-center gap-2">
              Coverage Package *
              <Info className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Select
              value={data.insurance_coverage_package || ""}
              onValueChange={(value) => onChange({ insurance_coverage_package: value })}
            >
              <SelectTrigger id="coverage_package">
                <SelectValue placeholder="Select coverage package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cdw">CDW (Collision Damage Waiver)</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="full-zero-excess">Full Coverage / Zero Excess</SelectItem>
              </SelectContent>
            </Select>
            {errors.insurance_coverage_package && <FormError message={errors.insurance_coverage_package} />}
            <p className="text-xs text-muted-foreground">
              This sets the baseline coverage level for all vehicle lines
            </p>
          </div>

          {/* Excess Amount */}
          <div className="space-y-2">
            <Label htmlFor="excess_aed">
              Excess / Deductible (AED) *
            </Label>
            <Input
              id="excess_aed"
              type="number"
              min="0"
              step="100"
              value={data.insurance_excess_aed ?? 1500}
              onChange={(e) => onChange({ insurance_excess_aed: parseFloat(e.target.value) || 0 })}
              disabled={data.insurance_coverage_package === 'full-zero-excess'}
              placeholder="1500"
            />
            {errors.insurance_excess_aed && <FormError message={errors.insurance_excess_aed} />}
            <p className="text-xs text-muted-foreground">
              {data.insurance_coverage_package === 'full-zero-excess' 
                ? 'Automatically set to 0 for Full/Zero-Excess package'
                : 'Customer liability per incident'}
            </p>
          </div>

          {/* Glass & Tire Cover */}
          <div className="space-y-2">
            <Label htmlFor="glass_tire">Glass & Tire Cover</Label>
            <Select
              value={data.insurance_glass_tire_cover ? "yes" : "no"}
              onValueChange={(value) => onChange({ insurance_glass_tire_cover: value === "yes" })}
            >
              <SelectTrigger id="glass_tire">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Included</SelectItem>
                <SelectItem value="no">No - Not Included</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default: Yes for Comprehensive & Full packages
            </p>
          </div>

          {/* Personal Accident Insurance (PAI) */}
          <div className="space-y-2">
            <Label htmlFor="pai">Personal Accident Insurance (PAI)</Label>
            <Select
              value={data.insurance_pai_enabled ? "yes" : "no"}
              onValueChange={(value) => onChange({ insurance_pai_enabled: value === "yes" })}
            >
              <SelectTrigger id="pai">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Enabled</SelectItem>
                <SelectItem value="no">No - Not Included</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional coverage for driver and passengers
            </p>
          </div>

          {/* Territorial Coverage */}
          <div className="space-y-2">
            <Label htmlFor="territorial">Territorial Coverage *</Label>
            <Select
              value={data.insurance_territorial_coverage || "uae-only"}
              onValueChange={(value) => onChange({ insurance_territorial_coverage: value })}
            >
              <SelectTrigger id="territorial">
                <SelectValue placeholder="Select coverage area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uae-only">UAE Only (Default)</SelectItem>
                <SelectItem value="gcc">GCC Coverage (surcharge applies)</SelectItem>
              </SelectContent>
            </Select>
            {errors.insurance_territorial_coverage && <FormError message={errors.insurance_territorial_coverage} />}
            <p className="text-xs text-muted-foreground">
              GCC coverage includes Saudi Arabia, Kuwait, Bahrain, Oman, Qatar
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Coverage Summary Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-base">Coverage Summary (Default)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Auto-generated summary */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Coverage Description:</p>
            <p className="text-sm text-muted-foreground">
              {data.insurance_coverage_summary || 'Configure coverage settings above'}
            </p>
          </div>

          {/* Monthly Total (Read-only) */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="text-sm font-semibold">Monthly Insurance Total (All Vehicles)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sum of all vehicle line insurance charges
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-base px-3 py-1">
                {calculateMonthlyTotal().toFixed(2)} AED
              </Badge>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> These are default settings. Each vehicle line in the next step 
              will inherit these values, but you can customize insurance per vehicle if needed.
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
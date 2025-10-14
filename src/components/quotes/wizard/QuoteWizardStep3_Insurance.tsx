import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Info, Wrench, Check, X, Globe, DollarSign, MapPin, User, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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

  // Initialize defaults for required fields if not set
  React.useEffect(() => {
    const updates: any = {};
    
    if (!data.insurance_coverage_package) {
      updates.insurance_coverage_package = 'comprehensive';
    }
    if (data.insurance_excess_aed === undefined) {
      updates.insurance_excess_aed = 1500;
    }
    if (!data.insurance_territorial_coverage) {
      updates.insurance_territorial_coverage = 'uae-only';
    }
    
    if (Object.keys(updates).length > 0) {
      onChange(updates);
    }
  }, []);

  // Auto-generate insurance coverage summary
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

  // Auto-generate maintenance coverage summary
  React.useEffect(() => {
    if (!data.maintenance_included) {
      onChange({ maintenance_coverage_summary: 'Maintenance: Customer Responsibility (not included)' });
      return;
    }

    const parts = [];
    const packageLabels = {
      'none': 'No Package',
      'basic': 'Basic Plan - Scheduled services only',
      'full': 'Full Plan - Parts, labor, tires, battery',
      'comprehensive': 'Comprehensive Plan - All-inclusive coverage'
    };
    
    if (data.maintenance_package_type) {
      parts.push(packageLabels[data.maintenance_package_type as keyof typeof packageLabels] || data.maintenance_package_type);
    }
    
    if (data.monthly_maintenance_cost_per_vehicle) {
      parts.push(`AED ${data.monthly_maintenance_cost_per_vehicle}/vehicle/month`);
    }
    
    if (data.maintenance_plan_source) {
      parts.push(data.maintenance_plan_source === 'internal' ? 'Internal Workshop' : 'Third Party Provider');
    }
    
    onChange({ maintenance_coverage_summary: parts.join(' • ') || 'Maintenance included' });
  }, [
    data.maintenance_included,
    data.maintenance_package_type,
    data.monthly_maintenance_cost_per_vehicle,
    data.maintenance_plan_source,
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

      {/* Enhanced Coverage Summary Card */}
      <Card className="border-primary/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Coverage Summary (Default)
          </CardTitle>
          <CardDescription>
            Comprehensive overview of insurance and protection defaults for all vehicles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Quick Reference Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Protection Level Card */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Protection Level</p>
                    <p className="font-semibold text-sm text-foreground">
                      {data.insurance_coverage_package === 'cdw' && 'CDW'}
                      {data.insurance_coverage_package === 'comprehensive' && 'Comprehensive'}
                      {data.insurance_coverage_package === 'full-zero-excess' && 'Full / Zero Excess'}
                      {!data.insurance_coverage_package && 'Not Set'}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">The level of insurance coverage protecting against damage, theft, and liability</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Customer Liability Card */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Customer Liability</p>
                    <p className="font-semibold text-sm text-foreground">
                      {data.insurance_coverage_package === 'full-zero-excess' 
                        ? 'AED 0' 
                        : `AED ${data.insurance_excess_aed || 1500}`}
                    </p>
                    <p className="text-xs text-muted-foreground">per incident</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">The excess/deductible amount customer pays in case of damage or loss</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Coverage Area Card */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Coverage Area</p>
                    <p className="font-semibold text-sm text-foreground">
                      {data.insurance_territorial_coverage === 'gcc' ? 'GCC Countries' : 'UAE Only'}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {data.insurance_territorial_coverage === 'gcc' 
                      ? 'Coverage extends to Saudi Arabia, Kuwait, Bahrain, Oman, Qatar, and UAE'
                      : 'Coverage limited to United Arab Emirates only'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Driver Protection Card */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <HelpCircle className="h-3 w-3 text-muted-foreground ml-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Driver Protection</p>
                    <p className="font-semibold text-sm text-foreground">
                      {data.insurance_pai_enabled ? 'PAI Included' : 'Not Included'}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Personal Accident Insurance covers medical expenses for driver and passengers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Separator />

          {/* Coverage Description */}
          <div className="p-4 bg-gradient-to-r from-muted/50 to-muted rounded-lg border">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Coverage Description:
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {data.insurance_coverage_summary || 'Configure coverage settings above to see summary'}
            </p>
          </div>

          {/* What's Included / Not Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What's Included */}
            <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
                <Check className="h-4 w-4" />
                What's Included
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Collision & Comprehensive Damage</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Third Party Liability (Unlimited)</span>
                </li>
                {data.insurance_glass_tire_cover && (
                  <>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Glass & Windscreen Coverage</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Tire Damage Coverage</span>
                    </li>
                  </>
                )}
                {data.insurance_pai_enabled && (
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Personal Accident Insurance</span>
                  </li>
                )}
                {data.insurance_territorial_coverage === 'gcc' && (
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>GCC Cross-border Coverage</span>
                  </li>
                )}
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>24/7 Roadside Assistance</span>
                </li>
              </ul>
            </div>

            {/* What's Not Included */}
            <div className="p-4 rounded-lg border bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold mb-3 text-red-900 dark:text-red-100 flex items-center gap-2">
                <X className="h-4 w-4" />
                What's Not Included
              </p>
              <ul className="space-y-2">
                {!data.insurance_pai_enabled && (
                  <li className="flex items-start gap-2 text-sm">
                    <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Personal Accident Insurance <span className="text-xs text-muted-foreground">(Add +AED 50/month)</span></span>
                  </li>
                )}
                {data.insurance_territorial_coverage !== 'gcc' && (
                  <li className="flex items-start gap-2 text-sm">
                    <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Cross-border GCC Travel <span className="text-xs text-muted-foreground">(Add +AED 150/month)</span></span>
                  </li>
                )}
                {!data.insurance_glass_tire_cover && (
                  <>
                    <li className="flex items-start gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Glass & Windscreen Damage</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Tire Damage or Punctures</span>
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2 text-sm">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Mechanical Breakdown <span className="text-xs text-muted-foreground">(See Maintenance section)</span></span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Off-road or Competition Use</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Intentional Damage or Negligence</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Coverage Comparison Table - Collapsible */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                View Detailed Coverage Comparison
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-semibold">Feature</th>
                      <th className="text-center py-2 px-3 font-semibold">Included</th>
                      <th className="text-left py-2 px-3 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Collision Damage</td>
                      <td className="text-center py-3 px-3">
                        <Check className="h-5 w-5 text-green-600 inline-block" />
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">Up to vehicle value</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Third Party Liability</td>
                      <td className="text-center py-3 px-3">
                        <Check className="h-5 w-5 text-green-600 inline-block" />
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">Unlimited coverage</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Glass & Windscreen</td>
                      <td className="text-center py-3 px-3">
                        {data.insurance_glass_tire_cover ? (
                          <Check className="h-5 w-5 text-green-600 inline-block" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 inline-block" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {data.insurance_glass_tire_cover ? 'Full coverage' : 'Not included'}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Tires</td>
                      <td className="text-center py-3 px-3">
                        {data.insurance_glass_tire_cover ? (
                          <Check className="h-5 w-5 text-green-600 inline-block" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 inline-block" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {data.insurance_glass_tire_cover ? 'Full coverage' : 'Not included'}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Personal Accident</td>
                      <td className="text-center py-3 px-3">
                        {data.insurance_pai_enabled ? (
                          <Check className="h-5 w-5 text-green-600 inline-block" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 inline-block" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {data.insurance_pai_enabled ? 'Driver & passengers' : 'Available as add-on (+AED 50/mo)'}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Cross-border Travel</td>
                      <td className="text-center py-3 px-3">
                        {data.insurance_territorial_coverage === 'gcc' ? (
                          <Check className="h-5 w-5 text-green-600 inline-block" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 inline-block" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {data.insurance_territorial_coverage === 'gcc' 
                          ? 'GCC countries included' 
                          : 'Available as add-on (+AED 150/mo)'}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-3">Roadside Assistance</td>
                      <td className="text-center py-3 px-3">
                        <Check className="h-5 w-5 text-green-600 inline-block" />
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">24/7 emergency support</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Enhanced Monthly Total with Gradient */}
          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Insurance Total</p>
                <p className="text-xs text-muted-foreground">
                  All vehicles • Sum of line insurance charges
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {calculateMonthlyTotal().toFixed(2)} <span className="text-lg font-normal text-muted-foreground">AED</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Per vehicle: — <span className="text-muted-foreground ml-1">(add vehicles in step 4)</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Smart Info Banner */}
          <div className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-semibold">Default Coverage Settings</p>
              <p className="text-blue-800 dark:text-blue-200">
                These settings will be inherited by each vehicle line in the next step. 
                You can customize insurance coverage per vehicle if needed for specific requirements.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Maintenance Package Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Coverage - Default Settings
          </CardTitle>
          <CardDescription>
            Configure default maintenance coverage for all vehicles. Toggle to include maintenance as part of the lease package, 
            or leave disabled for customer responsibility. These settings will be inherited by each vehicle line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Include Maintenance Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1 pr-4">
              <Label htmlFor="maintenance_included" className="text-base font-semibold cursor-pointer">
                Include Maintenance Plan in Lease?
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                When enabled, maintenance costs are included in monthly rate. When disabled, customer is responsible for maintenance.
              </p>
            </div>
            <Switch
              id="maintenance_included"
              checked={data.maintenance_included || false}
              onCheckedChange={(checked) => {
                onChange({ 
                  maintenance_included: checked,
                  maintenance_package_type: checked ? (data.maintenance_package_type || 'basic') : 'none'
                });
              }}
            />
          </div>

          {/* Maintenance Package Details (conditional) */}
          {data.maintenance_included && (
            <>
              {/* Package Type */}
              <div className="space-y-2">
                <Label htmlFor="maintenance_package_type">
                  Maintenance Package Type *
                </Label>
                <Select
                  value={data.maintenance_package_type || "basic"}
                  onValueChange={(value) => onChange({ maintenance_package_type: value })}
                >
                  <SelectTrigger id="maintenance_package_type">
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Scheduled services only</SelectItem>
                    <SelectItem value="full">Full - Parts, labor, tires, battery</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive - All-inclusive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the level of maintenance coverage to include
                </p>
              </div>

              {/* Monthly Cost per Vehicle */}
              <div className="space-y-2">
                <Label htmlFor="maintenance_cost">
                  Monthly Maintenance Cost per Vehicle (AED) *
                </Label>
                <Input
                  id="maintenance_cost"
                  type="number"
                  min="0"
                  step="50"
                  value={data.monthly_maintenance_cost_per_vehicle ?? 250}
                  onChange={(e) => onChange({ monthly_maintenance_cost_per_vehicle: parseFloat(e.target.value) || 0 })}
                  placeholder="250"
                />
                <p className="text-xs text-muted-foreground">
                  This amount will be added to each vehicle's monthly rate
                </p>
              </div>

              {/* Plan Source */}
              <div className="space-y-2">
                <Label htmlFor="maintenance_source">Plan Source</Label>
                <Select
                  value={data.maintenance_plan_source || "internal"}
                  onValueChange={(value) => onChange({ maintenance_plan_source: value })}
                >
                  <SelectTrigger id="maintenance_source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Workshop</SelectItem>
                    <SelectItem value="third_party">Third Party Provider</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Where maintenance services will be performed
                </p>
              </div>

              {/* Show as Separate Line */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1 pr-4">
                  <Label htmlFor="show_separate" className="text-sm font-medium cursor-pointer">
                    Show Maintenance as Separate Line Item?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Display maintenance cost separately in quote, or bundle with base rate
                  </p>
                </div>
                <Switch
                  id="show_separate"
                  checked={data.show_maintenance_separate_line ?? true}
                  onCheckedChange={(checked) => onChange({ show_maintenance_separate_line: checked })}
                />
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Enhanced Combined Summary Card */}
      <Card className="border-primary/50 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Complete Coverage Summary
          </CardTitle>
          <CardDescription>
            Combined overview of insurance and maintenance defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Insurance Summary - Enhanced */}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/5 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Insurance Coverage</p>
                <p className="text-xs text-green-700 dark:text-green-300">Default protection settings</p>
              </div>
            </div>
            <div className="pl-11">
              <p className="text-sm text-foreground leading-relaxed">
                {data.insurance_coverage_summary || 'Configure insurance coverage above to see summary'}
              </p>
            </div>
          </div>

          {/* Maintenance Summary - Enhanced */}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/5 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Maintenance Coverage</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">Default service settings</p>
              </div>
            </div>
            <div className="pl-11">
              <p className="text-sm text-foreground leading-relaxed">
                {data.maintenance_coverage_summary || 'Configure maintenance settings above to see summary'}
              </p>
              {data.maintenance_included && data.show_maintenance_separate_line && (
                <Badge variant="outline" className="mt-2 text-xs">
                  Shown as separate line item
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Excess</p>
              <p className="text-lg font-bold text-foreground">
                {data.insurance_coverage_package === 'full-zero-excess' ? '0' : (data.insurance_excess_aed || '—')}
              </p>
              <p className="text-xs text-muted-foreground">AED</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Territory</p>
              <p className="text-sm font-semibold text-foreground">
                {data.insurance_territorial_coverage === 'gcc' ? 'GCC' : 'UAE'}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Glass/Tire</p>
              <p className="text-sm font-semibold text-foreground">
                {data.insurance_glass_tire_cover ? (
                  <Check className="h-5 w-5 text-green-600 inline-block" />
                ) : (
                  <X className="h-5 w-5 text-red-600 inline-block" />
                )}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Maintenance</p>
              <p className="text-sm font-semibold text-foreground">
                {data.maintenance_included ? (
                  <Check className="h-5 w-5 text-green-600 inline-block" />
                ) : (
                  <X className="h-5 w-5 text-red-600 inline-block" />
                )}
              </p>
            </div>
          </div>

          {/* Key Info Banner */}
          <div className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-semibold">Applied to All Vehicles</p>
              <p className="text-blue-800 dark:text-blue-200">
                These default settings will be inherited by each vehicle line in Step 4. 
                You can customize insurance and maintenance per vehicle for specific requirements.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
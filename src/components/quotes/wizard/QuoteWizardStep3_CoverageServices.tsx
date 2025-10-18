import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Info, Wrench, Check, X, ChevronDown, Package, Gauge, DollarSign } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddOnsTable, AddOnLine } from "./AddOnsTable";
import { formatCurrency } from "@/lib/utils/currency";

interface QuoteWizardStep3CoverageServicesProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep3_CoverageServices: React.FC<QuoteWizardStep3CoverageServicesProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [showDetailsOpen, setShowDetailsOpen] = React.useState(false);

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
        'cdw': 'CDW',
        'comprehensive': 'Comprehensive',
        'full-zero-excess': 'Full/Zero Excess',
      }[data.insurance_coverage_package] || data.insurance_coverage_package;
      parts.push(pkgLabel);
    }
    
    if (data.insurance_excess_aed !== undefined && data.insurance_coverage_package !== 'full-zero-excess') {
      parts.push(`AED ${data.insurance_excess_aed} excess`);
    } else if (data.insurance_coverage_package === 'full-zero-excess') {
      parts.push('Zero Excess');
    }
    
    if (data.insurance_glass_tire_cover) parts.push('Glass & Tire');
    if (data.insurance_pai_enabled) parts.push('PAI');
    if (data.insurance_territorial_coverage) {
      parts.push(data.insurance_territorial_coverage === 'uae-only' ? 'UAE Only' : 'GCC');
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
      onChange({ maintenance_coverage_summary: 'Customer Responsibility' });
      return;
    }

    const parts = [];
    const packageLabels = {
      'none': 'None',
      'basic': 'Basic',
      'full': 'Full',
      'comprehensive': 'Comprehensive'
    };
    
    if (data.maintenance_package_type) {
      parts.push(packageLabels[data.maintenance_package_type as keyof typeof packageLabels]);
    }
    
    if (data.monthly_maintenance_cost_per_vehicle) {
      parts.push(`AED ${data.monthly_maintenance_cost_per_vehicle}/vehicle`);
    }
    
    onChange({ maintenance_coverage_summary: parts.join(' • ') || 'Included' });
  }, [
    data.maintenance_included,
    data.maintenance_package_type,
    data.monthly_maintenance_cost_per_vehicle,
  ]);

  // Auto-generate add-ons summary
  React.useEffect(() => {
    const addons: AddOnLine[] = data.default_addons || [];
    if (addons.length === 0) {
      onChange({ default_addons_summary: 'No add-ons selected' });
      return;
    }
    
    const monthly = addons.filter(a => a.pricing_model === 'monthly');
    const oneTime = addons.filter(a => a.pricing_model === 'one-time');
    
    const parts = [];
    if (monthly.length > 0) {
      const total = monthly.reduce((sum, a) => sum + a.total, 0);
      parts.push(`${monthly.length} monthly (+${formatCurrency(total)}/month)`);
    }
    if (oneTime.length > 0) {
      const total = oneTime.reduce((sum, a) => sum + a.total, 0);
      parts.push(`${oneTime.length} one-time (+${formatCurrency(total)})`);
    }
    
    onChange({ default_addons_summary: parts.join(' • ') });
  }, [data.default_addons]);

  const TooltipLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="flex items-center gap-1.5 cursor-help">
            {label}
            <Info className="h-3 w-3 text-muted-foreground" />
          </Label>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      {/* Insurance Coverage Card - Compact */}
      <Card className="border-l-4 border-l-blue-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Insurance Coverage</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          
          {/* Primary Selection: Coverage Package - Highlighted */}
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-3 space-y-1.5">
                  <TooltipLabel 
                    label="Coverage Package *" 
                    tooltip="Baseline coverage level for all vehicles. Basic is included, Comprehensive and Full add extra costs."
                  />
                  <Select
                    value={data.insurance_coverage_package || "comprehensive"}
                    onValueChange={(value) => {
                      onChange({ insurance_coverage_package: value, insurance_package_type: value });
                      // Auto-set insurance cost based on package
                      if (value === 'basic') {
                        onChange({ monthly_insurance_cost_per_vehicle: 0 });
                      } else if (value === 'comprehensive') {
                        onChange({ monthly_insurance_cost_per_vehicle: 300 });
                      } else if (value === 'full') {
                        onChange({ monthly_insurance_cost_per_vehicle: 500 });
                      }
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (Included - 0 AED/mo)</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive (+300 AED/mo)</SelectItem>
                      <SelectItem value="full">Full Coverage (+500 AED/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.insurance_coverage_package && <FormError message={errors.insurance_coverage_package} />}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <TooltipLabel 
                    label="Excess / Deductible (AED) *" 
                    tooltip="Amount customer pays per incident. Automatically 0 for Full/Zero-Excess package."
                  />
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="h-9"
                    value={data.insurance_excess_aed ?? 1500}
                    onChange={(e) => onChange({ insurance_excess_aed: parseFloat(e.target.value) || 0 })}
                    disabled={data.insurance_coverage_package === 'full-zero-excess'}
                    placeholder="1500"
                  />
                  {errors.insurance_excess_aed && <FormError message={errors.insurance_excess_aed} />}
                </div>
              </div>
            </div>

            {/* Visual Separator + Row 2: Glass & Tire + PAI */}
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Glass & Tire Cover" 
                    tooltip="Coverage for windscreen, glass, and tire damage. Typically included in Comprehensive packages."
                  />
                  <Select
                    value={data.insurance_glass_tire_cover ? "yes" : "no"}
                    onValueChange={(value) => onChange({ insurance_glass_tire_cover: value === "yes" })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Included</SelectItem>
                      <SelectItem value="no">No - Not Included</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Personal Accident Insurance (PAI)" 
                    tooltip="Optional coverage for medical expenses of driver and passengers in case of accident."
                  />
                  <Select
                    value={data.insurance_pai_enabled ? "yes" : "no"}
                    onValueChange={(value) => onChange({ insurance_pai_enabled: value === "yes" })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Enabled</SelectItem>
                      <SelectItem value="no">No - Not Included</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visual Separator + Row 3: Territorial Coverage + Monthly Cost */}
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Territorial Coverage *" 
                    tooltip="Geographic area where insurance is valid. GCC includes UAE, Saudi Arabia, Kuwait, Bahrain, Oman, Qatar (surcharge applies)."
                  />
                  <Select
                    value={data.insurance_territorial_coverage || "uae-only"}
                    onValueChange={(value) => onChange({ insurance_territorial_coverage: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uae-only">UAE Only (Default)</SelectItem>
                      <SelectItem value="gcc">GCC Coverage (surcharge applies)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.insurance_territorial_coverage && <FormError message={errors.insurance_territorial_coverage} />}
                </div>

                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Monthly Cost / Vehicle (AED) *" 
                    tooltip="Amount added to each vehicle's monthly rate for insurance coverage."
                  />
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    className="h-9"
                    value={data.monthly_insurance_cost_per_vehicle ?? 300}
                    onChange={(e) => onChange({ monthly_insurance_cost_per_vehicle: parseFloat(e.target.value) || 0 })}
                    placeholder="300"
                  />
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Maintenance Coverage Card - Compact */}
      <Card className="border-l-4 border-l-orange-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Maintenance Coverage</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include maintenance in lease or make it customer's responsibility. Settings apply to all vehicles by default.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          
          {/* Include Maintenance Toggle - Compact */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="maintenance_included" className="text-sm font-medium cursor-pointer flex-1">
              Include Maintenance Plan?
            </Label>
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

          {/* Maintenance Details - Conditional */}
          {data.maintenance_included && (
            <>
              {/* Row 1: Package Type + Monthly Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Package Type *" 
                    tooltip="Basic: scheduled services only. Full: parts, labor, tires, battery. Comprehensive: all-inclusive."
                  />
                  <Select
                    value={data.maintenance_package_type || "basic"}
                    onValueChange={(value) => onChange({ maintenance_package_type: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Scheduled services</SelectItem>
                      <SelectItem value="full">Full - Parts, labor, tires, battery</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive - All-inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Monthly Cost / Vehicle (AED) *" 
                    tooltip="Amount added to each vehicle's monthly rate for maintenance coverage."
                  />
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    className="h-9"
                    value={data.monthly_maintenance_cost_per_vehicle ?? 250}
                    onChange={(e) => onChange({ monthly_maintenance_cost_per_vehicle: parseFloat(e.target.value) || 0 })}
                    placeholder="250"
                  />
                </div>
              </div>

              {/* Row 2: Plan Source + Show Separate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel 
                    label="Plan Source" 
                    tooltip="Where maintenance services will be performed - internal workshop or third-party provider."
                  />
                  <Select
                    value={data.maintenance_plan_source || "internal"}
                    onValueChange={(value) => onChange({ maintenance_plan_source: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Workshop</SelectItem>
                      <SelectItem value="third_party">Third Party Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="show_separate" className="text-xs font-medium cursor-pointer flex-1">
                    Show as Separate Line Item
                  </Label>
                  <Switch
                    id="show_separate"
                    checked={data.show_maintenance_separate_line ?? true}
                    onCheckedChange={(checked) => onChange({ show_maintenance_separate_line: checked })}
                  />
                </div>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Mileage Configuration Card */}
      <Card className="border-l-4 border-l-purple-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Mileage Configuration</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Choose between pooled mileage (shared across all vehicles) or individual mileage per vehicle.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          
          {/* Enable Mileage Pooling Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="mileage_pooling" className="text-sm font-medium cursor-pointer">
                Enable Mileage Pooling
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Share total mileage allowance across all vehicles instead of per-vehicle limits
              </p>
            </div>
            <Switch
              id="mileage_pooling"
              checked={data.mileage_pooling_enabled || false}
              onCheckedChange={(checked) => {
                onChange({ 
                  mileage_pooling_enabled: checked,
                  pooled_mileage_allowance_km: checked ? (data.pooled_mileage_allowance_km || 30000) : undefined,
                  pooled_excess_km_rate: checked ? (data.pooled_excess_km_rate || 1.00) : undefined,
                });
              }}
            />
          </div>

          {/* Pooled Mileage Details - Conditional */}
          {data.mileage_pooling_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <TooltipLabel 
                  label="Total Fleet Mileage Allowance (km/month) *" 
                  tooltip="Total kilometers shared across all vehicles per month. Example: 10 vehicles × 3,000 km = 30,000 km pool."
                />
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  className="h-9"
                  value={data.pooled_mileage_allowance_km ?? 30000}
                  onChange={(e) => onChange({ pooled_mileage_allowance_km: parseInt(e.target.value) || 0 })}
                  placeholder="30000"
                />
                <p className="text-xs text-muted-foreground">
                  Shared across all {(data.quote_items || []).length || 0} vehicle(s)
                </p>
              </div>

              <div className="space-y-1.5">
                <TooltipLabel 
                  label="Excess Rate (AED/km) *" 
                  tooltip="Charge per kilometer when the total pooled allowance is exceeded."
                />
                <Input
                  type="number"
                  min="0"
                  step="0.10"
                  className="h-9"
                  value={data.pooled_excess_km_rate ?? 1.00}
                  onChange={(e) => onChange({ pooled_excess_km_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="1.00"
                />
              </div>
            </div>
          )}

          {/* Info Banner */}
          {!data.mileage_pooling_enabled && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  When disabled, each vehicle will have its own mileage allowance configured in Step 4.
                </p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Additional Services Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Additional Services</CardTitle>
              <CardDescription className="text-xs">
                Emergency support and replacement vehicle services
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          
          {/* Roadside Assistance */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium">Roadside Assistance (24/7)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Emergency towing, flat tire, battery jump-start, fuel delivery
                </p>
              </div>
              <Switch
                checked={data.roadside_assistance_included ?? true}
                onCheckedChange={(checked) => 
                  onChange({ 
                    roadside_assistance_included: checked,
                    roadside_assistance_cost_monthly: checked ? (data.roadside_assistance_cost_monthly || 40) : undefined
                  })
                }
              />
            </div>
            
            {data.roadside_assistance_included !== false && (
              <div className="pl-4 space-y-1.5">
                <TooltipLabel
                  label="Monthly Cost per Vehicle (AED)"
                  tooltip="Cost for 24/7 roadside assistance coverage per vehicle"
                />
                <Input
                  type="number"
                  min="0"
                  step="5"
                  className="h-9"
                  value={data.roadside_assistance_cost_monthly ?? 40}
                  onChange={(e) => 
                    onChange({ roadside_assistance_cost_monthly: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="40"
                />
              </div>
            )}
          </div>

          {/* Replacement Vehicle */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium">Replacement Vehicle</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Courtesy vehicle provided during breakdowns or scheduled maintenance
                </p>
              </div>
              <Switch
                checked={data.replacement_vehicle_included ?? true}
                onCheckedChange={(checked) => 
                  onChange({ 
                    replacement_vehicle_included: checked,
                    replacement_vehicle_cost_monthly: checked ? (data.replacement_vehicle_cost_monthly || 60) : undefined,
                    replacement_sla_hours: checked ? (data.replacement_sla_hours || 24) : undefined
                  })
                }
              />
            </div>
            
            {data.replacement_vehicle_included !== false && (
              <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="Monthly Cost per Vehicle (AED)"
                    tooltip="Cost for replacement vehicle coverage per vehicle"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    className="h-9"
                    value={data.replacement_vehicle_cost_monthly ?? 60}
                    onChange={(e) => 
                      onChange({ replacement_vehicle_cost_monthly: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="60"
                  />
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="SLA Response Time (hours)"
                    tooltip="Maximum hours to deliver replacement vehicle"
                  />
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    className="h-9"
                    value={data.replacement_sla_hours ?? 24}
                    onChange={(e) => 
                      onChange({ replacement_sla_hours: parseInt(e.target.value) || 24 })
                    }
                    placeholder="24"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 dark:text-blue-100">
                These services can be customized per vehicle in Step 4 if needed.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Toll & Fines Handling Card */}
      <Card className="border-l-4 border-l-green-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Toll & Fines Handling</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4" side="right">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">UAE Toll Systems & Handling Options</h4>
                    <div className="space-y-2 text-xs">
                      <p><strong>Salik (Dubai):</strong> AED 4-8 per gate crossing | <strong>Darb (Abu Dhabi):</strong> Variable by location</p>
                      <p><strong>Rebill Actuals:</strong> Most common - customer pays exact charges + optional admin fee. No disputes over allowances.</p>
                      <p><strong>Included Allowance:</strong> Corporate leases - include up to cap/month, excess rebilled to customer.</p>
                      <p><strong>Included in Lease Rate:</strong> Estimated toll cost built into monthly rate (long-term only)</p>
                      <p className="pt-2 border-t"><strong>Traffic Fines:</strong> Auto-rebill with admin fee is recommended. Customer disputes can be handled while keeping AR aging active.</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Toll Handling Type */}
          <div className="space-y-1.5">
            <TooltipLabel 
              label="Toll Handling Type *" 
              tooltip="Choose how Salik/Darb toll charges are billed. Rebill Actuals: pass through actual toll costs monthly. Included Allowance: cap included per vehicle, excess rebilled. Included: tolls are part of the lease rate."
            />
            <Select
              value={data.salik_darb_handling || "Rebill Actual (monthly)"}
              onValueChange={(value) => onChange({ 
                salik_darb_handling: value,
                // Clear allowance cap if not Included Allowance
                salik_darb_allowance_cap: value === "Included Allowance" ? data.salik_darb_allowance_cap : undefined,
                // Auto-set admin fee to None if Included Allowance or Included in Lease Rate
                tolls_admin_fee_model: (value === "Included Allowance" || value === "Included in Lease Rate") ? "None" : data.tolls_admin_fee_model
              })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rebill Actual (monthly)">Rebill Actuals (monthly)</SelectItem>
                <SelectItem value="Included Allowance">Included Allowance (cap/month)</SelectItem>
                <SelectItem value="Included in Lease Rate">Included in Lease Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Allowance Cap - Conditional */}
          {data.salik_darb_handling === "Included Allowance" && (
            <div className="space-y-1.5 p-3 bg-muted/50 rounded-lg">
              <TooltipLabel 
                label="Monthly Allowance Cap (AED) *" 
                tooltip="Maximum toll charges included per vehicle per month. Any usage above this cap will be rebilled to customer. Typical range: AED 100-300/month for corporate leases."
              />
              <Input
                type="number"
                min="0"
                step="10"
                className="h-9"
                value={data.salik_darb_allowance_cap ?? 150}
                onChange={(e) => onChange({ salik_darb_allowance_cap: parseFloat(e.target.value) || 0 })}
                placeholder="150"
              />
            </div>
          )}

          {/* Row 3: Admin Fee Model + Traffic Fines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Admin Fee Model - Only for Rebill Actuals */}
            {data.salik_darb_handling === "Rebill Actual (monthly)" && (
              <div className="space-y-1.5">
                <TooltipLabel 
                  label="Admin Fee Model" 
                  tooltip="How administrative fees are charged for toll processing. Per-invoice: one admin fee per monthly invoice. Per-event: fee charged per toll transaction."
                />
                <Select
                  value={data.tolls_admin_fee_model || "Per-invoice"}
                  onValueChange={(value) => onChange({ tolls_admin_fee_model: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None - No Admin Fee</SelectItem>
                    <SelectItem value="Per-event">Per-event (per transaction)</SelectItem>
                    <SelectItem value="Per-invoice">Per-invoice (monthly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <TooltipLabel 
                label="Traffic Fines Handling *" 
                tooltip="How traffic violations are processed and billed to customers. Company handles all fines and bills customer with processing admin fee."
              />
              <Select
                value={data.traffic_fines_handling || "Auto Rebill + Admin Fee"}
                onValueChange={(value) => onChange({ traffic_fines_handling: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto Rebill + Admin Fee">Auto Rebill + Admin Fee</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Admin Fee per Fine - Always visible since Auto Rebill is the only option */}
          <div className="space-y-1.5">
            <TooltipLabel 
              label="Admin Fee per Fine (AED)" 
              tooltip="Processing fee charged per traffic violation for administrative handling. Typical: AED 25-50 per fine."
            />
            <Input
              type="number"
              min="0"
              step="5"
              className="h-9"
              value={data.admin_fee_per_fine_aed ?? 25}
              onChange={(e) => onChange({ admin_fee_per_fine_aed: parseFloat(e.target.value) || 0 })}
              placeholder="25"
            />
          </div>

        </CardContent>
      </Card>

      {/* Default Add-Ons & Extras Card */}
      <Card className="border-l-4 border-l-indigo-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Default Add-Ons & Extras</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">
              Applied to All Vehicles
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <AddOnsTable
            addons={data.default_addons || []}
            onChange={(addons) => onChange({ default_addons: addons })}
          />
          
          {/* Summary of selected add-ons */}
          {data.default_addons && data.default_addons.length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected Add-Ons Summary:</p>
              <div className="space-y-1">
                {data.default_addons.map((addon: AddOnLine) => (
                  <div key={addon.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{addon.item_name}</span>
                    <span className="font-medium">
                      {formatCurrency(addon.total)} {addon.pricing_model === 'monthly' ? '/ month' : 'one-time'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Summary Card */}
      <Card className="border-primary/50">
        <CardHeader className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Coverage Summary</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              Applied to all vehicles
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg border bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground mb-1">Excess</p>
              <p className="text-lg font-bold text-foreground">
                {data.insurance_coverage_package === 'full-zero-excess' ? '0' : data.insurance_excess_aed || '1500'}
                <span className="text-xs font-normal ml-1">AED</span>
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
              <p className="text-xs text-muted-foreground mb-1">Territory</p>
              <p className="text-lg font-bold text-foreground">
                {data.insurance_territorial_coverage === 'gcc' ? 'GCC' : 'UAE'}
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
              <p className="text-xs text-muted-foreground mb-1">Glass & Tire</p>
              <p className="text-lg font-bold text-foreground">
                {data.insurance_glass_tire_cover ? <Check className="h-5 w-5 inline" /> : <X className="h-5 w-5 inline" />}
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
              <p className="text-xs text-muted-foreground mb-1">Maintenance</p>
              <p className="text-lg font-bold text-foreground">
                {data.maintenance_included ? <Check className="h-5 w-5 inline" /> : <X className="h-5 w-5 inline" />}
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-muted-foreground mb-1">Add-Ons</p>
              <p className="text-lg font-bold text-foreground">
                {(data.default_addons || []).length}
              </p>
            </div>
          </div>

          {/* Collapsible Detailed View */}
          <Collapsible open={showDetailsOpen} onOpenChange={setShowDetailsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors text-sm">
              <span className="font-medium flex items-center gap-2">
                <Info className="h-3 w-3" />
                View Detailed Coverage Breakdown
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDetailsOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              
              {/* Insurance Details */}
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  Insurance Coverage
                </p>
                <p className="text-sm text-foreground">
                  {data.insurance_coverage_summary || 'Not configured'}
                </p>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1.5">Included:</p>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-green-600" />
                        Collision & Comprehensive Damage
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-green-600" />
                        Third Party Liability (Unlimited)
                      </li>
                      {data.insurance_glass_tire_cover && (
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-green-600" />
                          Glass & Tire Coverage
                        </li>
                      )}
                      {data.insurance_pai_enabled && (
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-green-600" />
                          Personal Accident Insurance
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1.5">Not Included:</p>
                    <ul className="space-y-1 text-xs">
                      {!data.insurance_pai_enabled && (
                        <li className="flex items-center gap-1.5">
                          <X className="h-3 w-3 text-red-600" />
                          Personal Accident Insurance
                        </li>
                      )}
                      {data.insurance_territorial_coverage !== 'gcc' && (
                        <li className="flex items-center gap-1.5">
                          <X className="h-3 w-3 text-red-600" />
                          Cross-border GCC Travel
                        </li>
                      )}
                      {!data.insurance_glass_tire_cover && (
                        <li className="flex items-center gap-1.5">
                          <X className="h-3 w-3 text-red-600" />
                          Glass & Tire Damage
                        </li>
                      )}
                      <li className="flex items-center gap-1.5">
                        <X className="h-3 w-3 text-red-600" />
                        Off-road or Competition Use
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Maintenance Details */}
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Wrench className="h-3 w-3" />
                  Maintenance Coverage
                </p>
                <p className="text-sm text-foreground">
                  {data.maintenance_coverage_summary || 'Customer Responsibility'}
                </p>
                {data.maintenance_included && data.monthly_maintenance_cost_per_vehicle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cost: AED {data.monthly_maintenance_cost_per_vehicle}/vehicle/month
                  </p>
                )}
              </div>

              {/* Add-Ons Details */}
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Package className="h-3 w-3" />
                  Default Add-Ons & Extras
                </p>
                <p className="text-sm text-foreground">
                  {data.default_addons_summary || 'No add-ons selected'}
                </p>
                {data.default_addons && data.default_addons.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {data.default_addons.map((addon: AddOnLine, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {addon.item_name} ({addon.pricing_model})
                        </span>
                        <span className="font-medium">
                          {formatCurrency(addon.total)}{addon.pricing_model === 'monthly' ? '/mo' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toll & Fines Details */}
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3" />
                  Toll & Fines Handling
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Toll Policy:</span>
                    <span className="font-medium">{data.salik_darb_handling || 'Rebill Actual (monthly)'}</span>
                  </div>
                  {data.salik_darb_handling === "Included Allowance" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monthly Allowance Cap:</span>
                      <span className="font-medium">{formatCurrency(data.salik_darb_allowance_cap || 150)}/vehicle/month</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Admin Fee Model:</span>
                    <span className="font-medium">{data.tolls_admin_fee_model || 'Per-invoice'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Traffic Fines:</span>
                    <span className="font-medium">{data.traffic_fines_handling || 'Auto Rebill + Admin Fee'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fine Admin Fee:</span>
                    <span className="font-medium">{formatCurrency(data.admin_fee_per_fine_aed || 25)}</span>
                  </div>
                </div>
              </div>

            </CollapsibleContent>
          </Collapsible>

          {/* Info Banner - Compact */}
          <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-100">
              These defaults will be inherited by all vehicle lines in Step 4. You can customize per-vehicle if needed.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

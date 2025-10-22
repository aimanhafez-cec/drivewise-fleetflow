import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Info, Wrench, Check, X, ChevronDown, Package, Gauge, DollarSign } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddOnsTable, AddOnLine } from "@/components/quotes/wizard/AddOnsTable";
import { formatCurrency } from "@/lib/utils/currency";

interface MasterAgreementStep3Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep3: React.FC<MasterAgreementStep3Props> = ({
  data,
  onChange,
  errors,
}) => {
  const [showDetailsOpen, setShowDetailsOpen] = React.useState(false);

  React.useEffect(() => {
    if (data.insurance_coverage_package === 'full-zero-excess') {
      onChange({ insurance_excess_aed: 0 });
    }
  }, [data.insurance_coverage_package]);

  React.useEffect(() => {
    const updates: any = {};
    if (!data.insurance_coverage_package) updates.insurance_coverage_package = 'comprehensive';
    if (data.insurance_excess_aed === undefined) updates.insurance_excess_aed = 1500;
    if (!data.insurance_territorial_coverage) updates.insurance_territorial_coverage = 'uae-only';
    if (data.monthly_insurance_cost_per_vehicle === undefined) updates.monthly_insurance_cost_per_vehicle = 300;
    if (Object.keys(updates).length > 0) onChange(updates);
  }, []);

  // Auto-set monthly insurance cost based on coverage package
  React.useEffect(() => {
    if (data.insurance_coverage_package === 'cdw') {
      onChange({ monthly_insurance_cost_per_vehicle: 0 });
    } else if (data.insurance_coverage_package === 'comprehensive' && !data.monthly_insurance_cost_per_vehicle) {
      onChange({ monthly_insurance_cost_per_vehicle: 300 });
    } else if (data.insurance_coverage_package === 'full-zero-excess' && data.monthly_insurance_cost_per_vehicle !== 500) {
      onChange({ monthly_insurance_cost_per_vehicle: 500 });
    }
  }, [data.insurance_coverage_package]);

  React.useEffect(() => {
    const parts = [];
    if (data.insurance_coverage_package) {
      const pkgLabel = { 'cdw': 'CDW', 'comprehensive': 'Comprehensive', 'full-zero-excess': 'Full/Zero Excess' }[data.insurance_coverage_package] || data.insurance_coverage_package;
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
  }, [data.insurance_coverage_package, data.insurance_excess_aed, data.insurance_glass_tire_cover, data.insurance_pai_enabled, data.insurance_territorial_coverage]);

  React.useEffect(() => {
    if (!data.maintenance_included) {
      onChange({ maintenance_coverage_summary: 'Customer Responsibility' });
      return;
    }
    const parts = [];
    const packageLabels = { 'none': 'None', 'basic': 'Basic', 'full': 'Full', 'comprehensive': 'Comprehensive' };
    if (data.maintenance_package_type) parts.push(packageLabels[data.maintenance_package_type as keyof typeof packageLabels]);
    if (data.monthly_maintenance_cost_per_vehicle) parts.push(`AED ${data.monthly_maintenance_cost_per_vehicle}/vehicle`);
    onChange({ maintenance_coverage_summary: parts.join(' • ') || 'Included' });
  }, [data.maintenance_included, data.maintenance_package_type, data.monthly_maintenance_cost_per_vehicle]);

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
      {/* Insurance Coverage Card */}
      <Card className="border-l-4 border-l-blue-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Insurance Coverage</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-3 space-y-1.5">
                  <TooltipLabel label="Coverage Package *" tooltip="Baseline coverage level for all vehicles." />
                  <Select
                    value={data.insurance_coverage_package || ""}
                    onValueChange={(value) => onChange({ insurance_coverage_package: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdw">CDW - Collision Damage Waiver (+0 AED/mo)</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive (+300 AED/mo)</SelectItem>
                      <SelectItem value="full-zero-excess">Full / Zero Excess (+500 AED/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.insurance_coverage_package && <FormError message={errors.insurance_coverage_package} />}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <TooltipLabel label="Excess / Deductible (AED) *" tooltip="Amount customer pays per incident." />
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
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel label="Glass & Tire Cover" tooltip="Coverage for windscreen, glass, and tire damage." />
                  <Select
                    value={data.insurance_glass_tire_cover ? "yes" : "no"}
                    onValueChange={(value) => onChange({ insurance_glass_tire_cover: value === "yes" })}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Included</SelectItem>
                      <SelectItem value="no">No - Not Included</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <TooltipLabel label="Personal Accident Insurance (PAI)" tooltip="Optional coverage for medical expenses." />
                  <Select
                    value={data.insurance_pai_enabled ? "yes" : "no"}
                    onValueChange={(value) => onChange({ insurance_pai_enabled: value === "yes" })}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Enabled</SelectItem>
                      <SelectItem value="no">No - Not Included</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

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
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uae-only">UAE Only (Default)</SelectItem>
                      <SelectItem value="gcc">GCC Coverage (surcharge applies)</SelectItem>
                    </SelectContent>
                  </Select>
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

      {/* Maintenance Coverage Card */}
      <Card className="border-l-4 border-l-orange-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Maintenance Coverage</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
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

          {data.maintenance_included && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel label="Package Type *" tooltip="Basic: scheduled services only. Full: parts, labor, tires." />
                  <Select
                    value={data.maintenance_package_type || "basic"}
                    onValueChange={(value) => onChange({ maintenance_package_type: value })}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Scheduled services</SelectItem>
                      <SelectItem value="full">Full - Parts, labor, tires, battery</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive - All-inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <TooltipLabel label="Monthly Cost / Vehicle (AED) *" tooltip="Amount added to each vehicle's monthly rate." />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TooltipLabel label="Plan Source" tooltip="Where maintenance services will be performed." />
                  <Select
                    value={data.maintenance_plan_source || "internal"}
                    onValueChange={(value) => onChange({ maintenance_plan_source: value })}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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

      {/* Additional Services Section */}
      <Card className="border-l-4 border-l-teal-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">Additional Services</CardTitle>
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

      {/* Mileage Configuration */}
      <Card className="border-l-4 border-l-purple-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Mileage Configuration</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Default Settings</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="mileage_pooling" className="text-sm font-medium cursor-pointer">
                Enable Mileage Pooling
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Share total mileage allowance across all vehicles
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

          {data.mileage_pooling_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <TooltipLabel label="Total Fleet Mileage Allowance (km/month) *" tooltip="Total kilometers shared across all vehicles per month." />
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  className="h-9"
                  value={data.pooled_mileage_allowance_km ?? 30000}
                  onChange={(e) => onChange({ pooled_mileage_allowance_km: parseInt(e.target.value) || 0 })}
                  placeholder="30000"
                />
              </div>

              <div className="space-y-1.5">
                <TooltipLabel label="Excess Rate (AED/km) *" tooltip="Charge per kilometer when pooled allowance is exceeded." />
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
        </CardContent>
      </Card>

      {/* Toll & Fines Handling */}
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
          {/* TOLL PROCESSING Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2">
              <div className="text-sm font-semibold text-foreground">TOLL PROCESSING</div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-1.5">
              <TooltipLabel label="Toll Handling Type *" tooltip="Choose how Salik/Darb toll charges are billed." />
              <Select
                value={data.salik_darb_handling || "Rebill Actual (monthly)"}
                onValueChange={(value) => onChange({ salik_darb_handling: value })}
              >
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rebill Actual (monthly)">Rebill Actuals (monthly)</SelectItem>
                  <SelectItem value="Included Allowance">Included Allowance (cap/month)</SelectItem>
                  <SelectItem value="Included in Lease Rate">Included in Lease Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allowance Cap - Conditional */}
            {data.salik_darb_handling === "Included Allowance" && (
              <div className="space-y-1.5 ml-4 p-3 bg-muted/50 rounded-lg">
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

            {/* Admin Fee Model - Only for Rebill Actuals */}
            {data.salik_darb_handling === "Rebill Actual (monthly)" && (
              <div className="space-y-1.5 ml-4">
                <TooltipLabel 
                  label="Admin Fee Model" 
                  tooltip="How administrative fees are charged for toll processing. Per-invoice: one admin fee per monthly invoice. Per-event: fee charged per toll transaction."
                />
                <Select
                  value={data.tolls_admin_fee_model || "Per-invoice"}
                  onValueChange={(value) => onChange({ tolls_admin_fee_model: value })}
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None - No Admin Fee</SelectItem>
                    <SelectItem value="Per-event">Per-event (per transaction)</SelectItem>
                    <SelectItem value="Per-invoice">Per-invoice (monthly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Admin Fee per Toll - Conditional */}
            {data.salik_darb_handling === "Rebill Actual (monthly)" && 
             data.tolls_admin_fee_model && 
             data.tolls_admin_fee_model !== "None" && (
              <div className="space-y-1.5 ml-4">
                <TooltipLabel 
                  label="Admin Fee per Toll (AED)" 
                  tooltip="Administrative fee charged per toll transaction when using per-event model, or per monthly invoice when using per-invoice model. Typical: AED 1-2."
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-9"
                  value={data.admin_fee_per_toll_aed ?? 1}
                  onChange={(e) => onChange({ admin_fee_per_toll_aed: parseFloat(e.target.value) || 0 })}
                  placeholder="1.00"
                />
              </div>
            )}
          </div>

          {/* TRAFFIC VIOLATIONS PROCESSING Section */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2 pb-2">
              <div className="text-sm font-semibold text-foreground">TRAFFIC VIOLATIONS PROCESSING</div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-1.5">
              <TooltipLabel label="Traffic Fines Handling *" tooltip="How traffic violations are processed." />
              <Select
                value={data.traffic_fines_handling || "Auto Rebill + Admin Fee"}
                onValueChange={(value) => onChange({ traffic_fines_handling: value })}
              >
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto Rebill + Admin Fee">Auto Rebill + Admin Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <TooltipLabel label="Admin Fee per Fine (AED)" tooltip="Processing fee charged per traffic violation." />
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
          </div>
        </CardContent>
      </Card>

      {/* Default Add-Ons */}
      <Card className="border-l-4 border-l-indigo-500 shadow-md">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Default Add-Ons & Extras</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">Applied to All Vehicles</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <AddOnsTable
            addons={data.default_addons || []}
            onChange={(addons) => onChange({ default_addons: addons })}
          />
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormError } from "@/components/ui/form-error";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Info, MapPin, FileText, Gauge, Coins, Shield, Wrench, Calculator, Package } from "lucide-react";
import { useLocations, useCustomerSites } from "@/hooks/useBusinessLOVs";
import { formatDurationInMonthsAndDays } from "@/lib/utils/dateUtils";
import { VehicleAddOnsOverride } from "./VehicleAddOnsOverride";
import { AddOnLine } from "./AddOnsTable";

interface VehicleLineDetailsProps {
  line: any;
  onUpdate: (field: string, value: any) => void;
  errors: Record<string, string>;
  depositType: string;
  headerDefaults?: {
    deposit_amount?: number;
    advance_rent_months?: number;
    insurance_coverage_package?: string;
    insurance_excess_aed?: number;
    insurance_glass_tire_cover?: boolean;
    insurance_pai_enabled?: boolean;
    insurance_territorial_coverage?: string;
    pickup_type?: string;
    pickup_location_id?: string;
    pickup_customer_site_id?: string;
    return_type?: string;
    return_location_id?: string;
    return_customer_site_id?: string;
    default_price_list_id?: string;
    billing_plan?: string;
    customer_id?: string;
    default_delivery_fee?: number;
    default_collection_fee?: number;
    maintenance_included?: boolean;
    maintenance_package_type?: string;
    monthly_maintenance_cost_per_vehicle?: number;
    maintenance_plan_source?: string;
    show_maintenance_separate_line?: boolean;
    default_addons?: AddOnLine[];
    initial_fees?: Array<{
      fee_type: string;
      fee_type_label?: string;
      description: string;
      amount: number;
    }>;
    mileage_pooling_enabled?: boolean;
    pooled_mileage_allowance_km?: number;
    pooled_excess_km_rate?: number;
  };
}

export const VehicleLineDetails: React.FC<VehicleLineDetailsProps> = ({
  line,
  onUpdate,
  errors,
  depositType,
  headerDefaults = {},
}) => {
  const { items: locations = [], isLoading: locationsLoading } = useLocations();
  const { items: customerSites = [], isLoading: sitesLoading } = useCustomerSites(headerDefaults?.customer_id);
  const linePrefix = `line_${line.line_no - 1}`;

  // Debug logging for vehicle line customer data
  useEffect(() => {
    console.log('🔍 VehicleLineDetails - Line', line.line_no, {
      headerDefaults_customer_id: headerDefaults?.customer_id,
      customerSites_count: customerSites.length,
      sitesLoading,
      pickup_type: line.pickup_type ?? headerDefaults?.pickup_type,
      pickup_customer_site_id: line.pickup_customer_site_id ?? headerDefaults?.pickup_customer_site_id
    });
  }, [headerDefaults?.customer_id, customerSites.length, sitesLoading, line.line_no, line.pickup_type, line.pickup_customer_site_id, headerDefaults?.pickup_type, headerDefaults?.pickup_customer_site_id]);

  // Get billing period information based on billing plan
  const getBillingPeriodInfo = () => {
    const plan = headerDefaults?.billing_plan || 'monthly';
    
    switch (plan) {
      case 'quarterly':
        return { label: 'Quarterly', unit: 'quarter', multiplier: 3, abbrev: 'per quarter' };
      case 'semi-annual':
        return { label: 'Semi-Annual', unit: 'period', multiplier: 6, abbrev: 'per 6 months' };
      case 'annual':
        return { label: 'Annual', unit: 'year', multiplier: 12, abbrev: 'per year' };
      case 'monthly':
      default:
        return { label: 'Monthly', unit: 'month', multiplier: 1, abbrev: 'per month' };
    }
  };

  const periodInfo = getBillingPeriodInfo();

  // Get default per-period rate from price list based on vehicle class
  const getDefaultPerPeriodRate = (): number => {
    const monthlyRatesByClass: Record<string, Record<string, number>> = {
      'standard': { 'economy': 1200, 'compact': 1500, 'midsize': 2000, 'suv': 3500, 'luxury': 5000 },
      'premium': { 'economy': 1400, 'compact': 1800, 'midsize': 2400, 'suv': 4200, 'luxury': 6000 },
      'government': { 'economy': 1000, 'compact': 1300, 'midsize': 1800, 'suv': 3000, 'luxury': 4500 },
    };

    const priceListId = headerDefaults?.default_price_list_id || 'standard';
    const vehicleClassName = line._vehicleMeta?.category_name?.toLowerCase() || 'midsize';
    const monthlyRate = monthlyRatesByClass[priceListId]?.[vehicleClassName] || 2000;
    
    const { multiplier } = periodInfo;
    return monthlyRate * multiplier;
  };

  const defaultRate = getDefaultPerPeriodRate();
  const isRateCustomized = line.monthly_rate !== undefined && line.monthly_rate !== defaultRate;

  const calculateBillingPeriods = (): number => {
    const totalMonths = line.duration_months || 0;
    const { multiplier } = periodInfo;
    return Math.ceil(totalMonths / multiplier);
  };

  const billingPeriods = calculateBillingPeriods();

  // Auto-default per-period rate from price list when vehicle class is selected
  useEffect(() => {
    if (line.vehicle_class_id && (!line.monthly_rate || line.monthly_rate === 0)) {
      const defaultRate = getDefaultPerPeriodRate();
      onUpdate('monthly_rate', defaultRate);
    }
  }, [line.vehicle_class_id, headerDefaults?.default_price_list_id, headerDefaults?.billing_plan]);

  // Auto-calculate lease term from dates
  useEffect(() => {
    if (line.pickup_at && line.return_at) {
      const from = new Date(line.pickup_at);
      const to = new Date(line.return_at);
      
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.round(diffDays / 30.44);
      
      // Always update if duration is 0 or different from calculated
      if (!line.duration_months || line.duration_months === 0 || line.duration_months !== months) {
        onUpdate('duration_months', months);
      }
      if (!line.lease_term_months || line.lease_term_months === 0 || line.lease_term_months !== months) {
        onUpdate('lease_term_months', months);
      }
    }
  }, [line.pickup_at, line.return_at]);

  // Helper to check if a field is customized
  const isCustomized = (field: string, lineValue: any, defaultValue: any) => {
    if (defaultValue === undefined) return false;
    return lineValue !== undefined && lineValue !== defaultValue;
  };

  // Reset field to default
  const resetToDefault = (field: string, defaultValue: any) => {
    onUpdate(field, defaultValue);
  };

  // Helper to check if a section has customizations
  const hasCustomizations = (section: string): boolean => {
    switch (section) {
      case "delivery":
        return isCustomized("pickup_type", line.pickup_type, headerDefaults.pickup_type) ||
               isCustomized("pickup_location_id", line.pickup_location_id, headerDefaults.pickup_location_id) ||
               isCustomized("pickup_customer_site_id", line.pickup_customer_site_id, headerDefaults.pickup_customer_site_id) ||
               isCustomized("return_type", line.return_type, headerDefaults.return_type) ||
               isCustomized("return_location_id", line.return_location_id, headerDefaults.return_location_id) ||
               isCustomized("return_customer_site_id", line.return_customer_site_id, headerDefaults.return_customer_site_id) ||
               isCustomized("delivery_fee", line.delivery_fee, headerDefaults.default_delivery_fee ?? 0) ||
               isCustomized("collection_fee", line.collection_fee, headerDefaults.default_collection_fee ?? 0);
      case "deposit":
        return isCustomized("deposit_amount", line.deposit_amount, headerDefaults.deposit_amount) ||
               isCustomized("advance_rent_months", line.advance_rent_months, headerDefaults.advance_rent_months);
      case "insurance":
        return isCustomized("insurance_coverage_package", line.insurance_coverage_package, headerDefaults.insurance_coverage_package) ||
               isCustomized("insurance_excess_aed", line.insurance_excess_aed, headerDefaults.insurance_excess_aed) ||
               isCustomized("insurance_territorial_coverage", line.insurance_territorial_coverage, headerDefaults.insurance_territorial_coverage) ||
               isCustomized("insurance_glass_tire_cover", line.insurance_glass_tire_cover, headerDefaults.insurance_glass_tire_cover) ||
               isCustomized("insurance_pai_enabled", line.insurance_pai_enabled, headerDefaults.insurance_pai_enabled);
      case "maintenance":
        return isCustomized("maintenance_included", line.maintenance_included, headerDefaults.maintenance_included) ||
               isCustomized("maintenance_package_type", line.maintenance_package_type, headerDefaults.maintenance_package_type) ||
               isCustomized("monthly_maintenance_cost_per_vehicle", line.monthly_maintenance_cost_per_vehicle, headerDefaults.monthly_maintenance_cost_per_vehicle) ||
               isCustomized("maintenance_plan_source", line.maintenance_plan_source, headerDefaults.maintenance_plan_source) ||
               isCustomized("show_maintenance_separate_line", line.show_maintenance_separate_line, headerDefaults.show_maintenance_separate_line);
      case "addons":
        const headerAddOns = headerDefaults.default_addons || [];
        const lineAddOns = line.addons || [];
        
        // Check if any add-on differs from header
        if (lineAddOns.length !== headerAddOns.length) return true;
        
        return lineAddOns.some((lineAddon: AddOnLine) => {
          const headerAddon = headerAddOns.find((h: AddOnLine) => h.id === lineAddon.id);
          if (!headerAddon) return true;
          return lineAddon.quantity !== headerAddon.quantity || 
                 lineAddon.unit_price !== headerAddon.unit_price;
        });
      default:
        return false;
    }
  };

  // Generate preview text for accordion headers
  const getDeliveryPreview = () => {
    const pickupType = line.pickup_type ?? headerDefaults.pickup_type ?? "company_location";
    const returnType = line.return_type ?? headerDefaults.return_type ?? "company_location";
    if (pickupType === "customer_site" && returnType === "customer_site") return "Delivery & Collection";
    if (pickupType === "customer_site") return "Delivery only";
    if (returnType === "customer_site") return "Collection only";
    return "Self-pickup";
  };

  const getMaintenancePreview = () => {
    const enabled = line.maintenance_included ?? headerDefaults.maintenance_included ?? false;
    if (!enabled) return "Disabled";
    const type = line.maintenance_package_type ?? headerDefaults.maintenance_package_type ?? "basic";
    const cost = line.monthly_maintenance_cost_per_vehicle ?? headerDefaults.monthly_maintenance_cost_per_vehicle ?? 0;
    return `${type.charAt(0).toUpperCase() + type.slice(1)} | ${cost} AED/month`;
  };

  const getAddOnsPreview = () => {
    const addons = line.addons || [];
    const enabledCount = addons.filter((a: any) => a.enabled).length;
    if (enabledCount === 0) return "None selected";
    const monthlyCount = addons.filter((a: any) => a.enabled && a.type === 'monthly').length;
    const oneTimeCount = addons.filter((a: any) => a.enabled && a.type === 'one-time').length;
    return `${enabledCount} selected (${monthlyCount} monthly, ${oneTimeCount} one-time)`;
  };

  // Calculate total maintenance cost
  const calculateMaintenanceCost = () => {
    const enabled = line.maintenance_included ?? headerDefaults.maintenance_included ?? false;
    if (!enabled) return 0;
    const monthlyCost = line.monthly_maintenance_cost_per_vehicle ?? headerDefaults.monthly_maintenance_cost_per_vehicle ?? 0;
    const months = line.duration_months || 0;
    return monthlyCost * months;
  };

  return (
    <div className="space-y-2 max-w-5xl">
      <Accordion type="multiple" defaultValue={[]} className="w-full">
        
        {/* SECTION 1: Delivery & Collection */}
        <AccordionItem value="delivery">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold">Delivery & Collection</span>
              <span className="text-sm text-muted-foreground ml-2">{getDeliveryPreview()}</span>
              {hasCustomizations("delivery") && (
                <Badge variant="secondary" className="ml-2">Customized</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Pickup Configuration */}
          <div className="space-y-2">
            <Label htmlFor={`pickup_type_${line.line_no}`} className="flex items-center gap-2">
              Pickup From *
              {isCustomized("pickup_type", line.pickup_type, headerDefaults.pickup_type) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.pickup_type ?? headerDefaults.pickup_type ?? "company_location"}
              onValueChange={(value) => {
                onUpdate('pickup_type', value);
                // Clear location/site when type changes
                if (value === 'company_location') {
                  onUpdate('pickup_customer_site_id', null);
                } else {
                  onUpdate('pickup_location_id', null);
                }
              }}
            >
              <SelectTrigger id={`pickup_type_${line.line_no}`}>
                <SelectValue placeholder="Select pickup type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_location">Our Location</SelectItem>
                <SelectItem value="customer_site">Customer Location (Delivery)</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("pickup_type", line.pickup_type, headerDefaults.pickup_type) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("pickup_type", headerDefaults.pickup_type)}
              >
                Reset to default
              </Button>
            )}
          </div>

          {/* Pickup Location/Site Selector */}
          <div className="space-y-2">
            {(line.pickup_type ?? headerDefaults.pickup_type ?? "company_location") === "company_location" ? (
              <>
                <Label htmlFor={`pickup_location_${line.line_no}`} className="flex items-center gap-2">
                  Pickup Location *
                  {isCustomized("pickup_location_id", line.pickup_location_id, headerDefaults.pickup_location_id) && (
                    <Badge variant="secondary" className="text-xs">Customized</Badge>
                  )}
                </Label>
                <Select
                  value={line.pickup_location_id ?? headerDefaults.pickup_location_id ?? ""}
                  onValueChange={(value) => onUpdate('pickup_location_id', value)}
                >
                  <SelectTrigger id={`pickup_location_${line.line_no}`}>
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsLoading ? (
                      <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                    ) : locations.length === 0 ? (
                      <SelectItem value="__none__" disabled>No locations</SelectItem>
                    ) : (
                      locations.map((loc: any) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isCustomized("pickup_location_id", line.pickup_location_id, headerDefaults.pickup_location_id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => resetToDefault("pickup_location_id", headerDefaults.pickup_location_id)}
                  >
                    Reset to default
                  </Button>
                )}
              </>
            ) : (
              <>
                <Label htmlFor={`pickup_customer_site_${line.line_no}`} className="flex items-center gap-2">
                  Customer Site *
                  {isCustomized("pickup_customer_site_id", line.pickup_customer_site_id, headerDefaults.pickup_customer_site_id) && (
                    <Badge variant="secondary" className="text-xs">Customized</Badge>
                  )}
                </Label>
                {!headerDefaults?.customer_id && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No customer selected. Customer sites cannot be loaded.
                    </AlertDescription>
                  </Alert>
                )}
                {headerDefaults?.customer_id && customerSites.length === 0 && !sitesLoading && (
                  <Alert className="mb-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No customer sites found for customer ID: {headerDefaults.customer_id}
                    </AlertDescription>
                  </Alert>
                )}
                <Select
                  value={line.pickup_customer_site_id ?? headerDefaults.pickup_customer_site_id ?? ""}
                  onValueChange={(value) => onUpdate('pickup_customer_site_id', value)}
                >
                  <SelectTrigger id={`pickup_customer_site_${line.line_no}`}>
                    <SelectValue placeholder="Select customer site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sitesLoading ? (
                      <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                    ) : customerSites.length === 0 ? (
                      <SelectItem value="__none__" disabled>No sites available</SelectItem>
                    ) : (
                      customerSites.map((site: any) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isCustomized("pickup_customer_site_id", line.pickup_customer_site_id, headerDefaults.pickup_customer_site_id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => resetToDefault("pickup_customer_site_id", headerDefaults.pickup_customer_site_id)}
                  >
                    Reset to default
                  </Button>
                )}
              </>
            )}
            {errors[`${linePrefix}_pickup_location`] && <FormError message={errors[`${linePrefix}_pickup_location`]} />}
          </div>

          {/* Return Configuration */}
          <div className="space-y-2">
            <Label htmlFor={`return_type_${line.line_no}`} className="flex items-center gap-2">
              Return To *
              {isCustomized("return_type", line.return_type, headerDefaults.return_type) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.return_type ?? headerDefaults.return_type ?? "company_location"}
              onValueChange={(value) => {
                onUpdate('return_type', value);
                // Clear location/site when type changes
                if (value === 'company_location') {
                  onUpdate('return_customer_site_id', null);
                } else {
                  onUpdate('return_location_id', null);
                }
              }}
            >
              <SelectTrigger id={`return_type_${line.line_no}`}>
                <SelectValue placeholder="Select return type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_location">Our Location</SelectItem>
                <SelectItem value="customer_site">Customer Location (Collection)</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("return_type", line.return_type, headerDefaults.return_type) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("return_type", headerDefaults.return_type)}
              >
                Reset to default
              </Button>
            )}
          </div>

          {/* Return Location/Site Selector */}
          <div className="space-y-2">
            {(line.return_type ?? headerDefaults.return_type ?? "company_location") === "company_location" ? (
              <>
                <Label htmlFor={`return_location_${line.line_no}`} className="flex items-center gap-2">
                  Return Location *
                  {isCustomized("return_location_id", line.return_location_id, headerDefaults.return_location_id) && (
                    <Badge variant="secondary" className="text-xs">Customized</Badge>
                  )}
                </Label>
                <Select
                  value={line.return_location_id ?? headerDefaults.return_location_id ?? ""}
                  onValueChange={(value) => onUpdate('return_location_id', value)}
                >
                  <SelectTrigger id={`return_location_${line.line_no}`}>
                    <SelectValue placeholder="Select return location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsLoading ? (
                      <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                    ) : locations.length === 0 ? (
                      <SelectItem value="__none__" disabled>No locations</SelectItem>
                    ) : (
                      locations.map((loc: any) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isCustomized("return_location_id", line.return_location_id, headerDefaults.return_location_id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => resetToDefault("return_location_id", headerDefaults.return_location_id)}
                  >
                    Reset to default
                  </Button>
                )}
              </>
            ) : (
              <>
                <Label htmlFor={`return_customer_site_${line.line_no}`} className="flex items-center gap-2">
                  Customer Site *
                  {isCustomized("return_customer_site_id", line.return_customer_site_id, headerDefaults.return_customer_site_id) && (
                    <Badge variant="secondary" className="text-xs">Customized</Badge>
                  )}
                </Label>
                <Select
                  value={line.return_customer_site_id ?? headerDefaults.return_customer_site_id ?? ""}
                  onValueChange={(value) => onUpdate('return_customer_site_id', value)}
                >
                  <SelectTrigger id={`return_customer_site_${line.line_no}`}>
                    <SelectValue placeholder="Select customer site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sitesLoading ? (
                      <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                    ) : customerSites.length === 0 ? (
                      <SelectItem value="__none__" disabled>No sites available</SelectItem>
                    ) : (
                      customerSites.map((site: any) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {isCustomized("return_customer_site_id", line.return_customer_site_id, headerDefaults.return_customer_site_id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => resetToDefault("return_customer_site_id", headerDefaults.return_customer_site_id)}
                  >
                    Reset to default
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Delivery Fee - Only shown when pickup_type = customer_site */}
          {(line.pickup_type ?? headerDefaults.pickup_type ?? "company_location") === "customer_site" ? (
            <div className="space-y-2">
              <Label htmlFor={`delivery_fee_${line.line_no}`} className="flex items-center gap-2">
                Delivery Fee (AED)
                {isCustomized("delivery_fee", line.delivery_fee, headerDefaults.default_delivery_fee ?? 0) && (
                  <Badge variant="secondary" className="text-xs">Customized</Badge>
                )}
              </Label>
              <Input
                id={`delivery_fee_${line.line_no}`}
                type="number"
                min="0"
                step="50"
                value={line.delivery_fee ?? headerDefaults.default_delivery_fee ?? 0}
                onChange={(e) => onUpdate('delivery_fee', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              {isCustomized("delivery_fee", line.delivery_fee, headerDefaults.default_delivery_fee ?? 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => resetToDefault("delivery_fee", headerDefaults.default_delivery_fee ?? 0)}
                >
                  Reset to default
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Fee for delivering this vehicle to customer location
              </p>
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-md border border-dashed">
              <p className="text-xs text-muted-foreground">
                ℹ️ No delivery fee - customer picks up from our location
              </p>
            </div>
          )}

          {/* Collection Fee - Only shown when return_type = customer_site */}
          {(line.return_type ?? headerDefaults.return_type ?? "company_location") === "customer_site" ? (
            <div className="space-y-2">
              <Label htmlFor={`collection_fee_${line.line_no}`} className="flex items-center gap-2">
                Collection Fee (AED)
                {isCustomized("collection_fee", line.collection_fee, headerDefaults.default_collection_fee ?? 0) && (
                  <Badge variant="secondary" className="text-xs">Customized</Badge>
                )}
              </Label>
              <Input
                id={`collection_fee_${line.line_no}`}
                type="number"
                min="0"
                step="50"
                value={line.collection_fee ?? headerDefaults.default_collection_fee ?? 0}
                onChange={(e) => onUpdate('collection_fee', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              {isCustomized("collection_fee", line.collection_fee, headerDefaults.default_collection_fee ?? 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => resetToDefault("collection_fee", headerDefaults.default_collection_fee ?? 0)}
                >
                  Reset to default
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Fee for collecting this vehicle from customer location
              </p>
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-md border border-dashed">
              <p className="text-xs text-muted-foreground">
                ℹ️ No collection fee - customer returns to our location
              </p>
            </div>
          )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 2: Contract Terms */}
        <AccordionItem value="contract">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold">Contract Terms</span>
              <span className="text-sm text-muted-foreground ml-2">
                {line.duration_months || 0} months | {line.monthly_rate || 0} AED/{periodInfo.abbrev}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <Label htmlFor={`pickup_${line.line_no}`}>Start Date *</Label>
            <Input
              id={`pickup_${line.line_no}`}
              type="date"
              value={line.pickup_at || ""}
              onChange={(e) => onUpdate('pickup_at', e.target.value)}
            />
            {errors[`${linePrefix}_pickup`] && <FormError message={errors[`${linePrefix}_pickup`]} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`return_${line.line_no}`}>Return Date *</Label>
            <Input
              id={`return_${line.line_no}`}
              type="date"
              value={line.return_at || ""}
              onChange={(e) => onUpdate('return_at', e.target.value)}
            />
            {errors[`${linePrefix}_return`] && <FormError message={errors[`${linePrefix}_return`]} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`term_${line.line_no}`}>Lease Term</Label>
            <Input
              id={`term_${line.line_no}`}
              type="text"
              value={
                line.pickup_at && line.return_at
                  ? formatDurationInMonthsAndDays(
                      new Date(line.pickup_at),
                      new Date(line.return_at)
                    )
                  : ""
              }
              disabled
              placeholder="Auto-calculated from dates"
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Duration: {line.duration_months || 0} months
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`rate_type_${line.line_no}`}>Rate Type *</Label>
            <Select
              value={line.rate_type || 'monthly'}
              onValueChange={(value) => onUpdate('rate_type', value)}
            >
              <SelectTrigger id={`rate_type_${line.line_no}`}>
                <SelectValue placeholder="Select rate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`rate_${line.line_no}`} className="flex items-center gap-2">
              Per Period Rate (AED/{periodInfo.abbrev}) *
              {isRateCustomized && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <div className="relative">
            <Input
              id={`rate_${line.line_no}`}
              type="number"
              min="0"
              step="0.01"
              value={line.monthly_rate || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onUpdate('monthly_rate', Math.round(value * 100) / 100);
              }}
              placeholder={`Auto-defaulted from price list (${periodInfo.label})`}
            />
              {isRateCustomized && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                  onClick={() => onUpdate('monthly_rate', defaultRate)}
                >
                  Reset
                </Button>
              )}
            </div>
            {errors[`${linePrefix}_rate`] && <FormError message={errors[`${linePrefix}_rate`]} />}
            <p className="text-xs text-muted-foreground">
              Default from price list: {defaultRate.toFixed(2)} AED/{periodInfo.abbrev}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`line_subtotal_${line.line_no}`}>Line Subtotal (Total Contract Value)</Label>
            <Input
              id={`line_subtotal_${line.line_no}`}
              type="text"
              value={`${((line.monthly_rate || 0) * billingPeriods).toFixed(2)} AED`}
              disabled
              className="bg-muted font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              {line.monthly_rate || 0} AED/{periodInfo.abbrev} × {billingPeriods} billing {billingPeriods === 1 ? 'period' : 'periods'}
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Contract: {line.duration_months || 0} months = {billingPeriods} × {periodInfo.label} billing cycles
            </p>
          </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 3: Mileage Package */}
        {!headerDefaults?.mileage_pooling_enabled && (
          <AccordionItem value="mileage">
            <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="font-semibold">Mileage Package</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {line.mileage_package_km || 3000} km/month
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label htmlFor={`mileage_${line.line_no}`}>Included KM / Month *</Label>
              <Input
                id={`mileage_${line.line_no}`}
                type="number"
                min="0"
                step="500"
                value={line.mileage_package_km || 3000}
                onChange={(e) => onUpdate('mileage_package_km', parseInt(e.target.value) || 0)}
                placeholder="3000"
              />
              <p className="text-xs text-muted-foreground">Standard: 3,000 km/month</p>
              {errors[`${linePrefix}_mileage`] && <FormError message={errors[`${linePrefix}_mileage`]} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`excess_${line.line_no}`}>Excess KM Rate (AED/km) *</Label>
              <Input
                id={`excess_${line.line_no}`}
                type="number"
                min="0"
                step="0.10"
                value={line.excess_km_rate || 1.00}
                onChange={(e) => onUpdate('excess_km_rate', parseFloat(e.target.value) || 0)}
                placeholder="1.00"
              />
              <p className="text-xs text-muted-foreground">Charge per km over allowance</p>
              {errors[`${linePrefix}_excess_km`] && <FormError message={errors[`${linePrefix}_excess_km`]} />}
            </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Pooled Mileage Info Badge */}
        {headerDefaults?.mileage_pooling_enabled && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border-y">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Mileage Pooling Enabled
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  Using shared fleet allowance: {headerDefaults.pooled_mileage_allowance_km?.toLocaleString()} km/month @ {headerDefaults.pooled_excess_km_rate} AED/km excess
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Deposit & Advance Rent */}
        <AccordionItem value="deposit">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-semibold">Deposit & Advance Rent</span>
              {hasCustomizations("deposit") && (
                <Badge variant="secondary" className="ml-2">Customized</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <Label htmlFor={`deposit_${line.line_no}`} className="flex items-center gap-2">
              Deposit Amount (AED) - {depositType}
              {isCustomized("deposit_amount", line.deposit_amount, headerDefaults.deposit_amount) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Input
              id={`deposit_${line.line_no}`}
              type="number"
              min="0"
              step="100"
              value={line.deposit_amount ?? headerDefaults.deposit_amount ?? 0}
              onChange={(e) => onUpdate('deposit_amount', parseFloat(e.target.value) || 0)}
              placeholder={headerDefaults.deposit_amount ? `Default: ${headerDefaults.deposit_amount}` : undefined}
            />
            {isCustomized("deposit_amount", line.deposit_amount, headerDefaults.deposit_amount) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("deposit_amount", headerDefaults.deposit_amount)}
              >
                Reset to default
              </Button>
            )}
            {errors[`${linePrefix}_deposit`] && <FormError message={errors[`${linePrefix}_deposit`]} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`advance_${line.line_no}`} className="flex items-center gap-2">
              Advance Rent (Months)
              {isCustomized("advance_rent_months", line.advance_rent_months, headerDefaults.advance_rent_months) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Input
              id={`advance_${line.line_no}`}
              type="number"
              min="0"
              max="3"
              value={line.advance_rent_months ?? headerDefaults.advance_rent_months ?? 0}
              onChange={(e) => onUpdate('advance_rent_months', parseInt(e.target.value) || 0)}
              placeholder={headerDefaults.advance_rent_months !== undefined ? `Default: ${headerDefaults.advance_rent_months}` : undefined}
            />
            {isCustomized("advance_rent_months", line.advance_rent_months, headerDefaults.advance_rent_months) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("advance_rent_months", headerDefaults.advance_rent_months)}
              >
                Reset to default
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Advance: {line.advance_rent_months || 0} × {line.monthly_rate || 0} = {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
            </p>
            {errors[`${linePrefix}_advance`] && <FormError message={errors[`${linePrefix}_advance`]} />}
          </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 5: Insurance Overrides */}
        <AccordionItem value="insurance">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-semibold">Insurance Overrides</span>
              {hasCustomizations("insurance") && (
                <Badge variant="secondary" className="ml-2">Customized</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <Label htmlFor={`ins_coverage_${line.line_no}`} className="flex items-center gap-2">
              Coverage Package
              {isCustomized("insurance_coverage_package", line.insurance_coverage_package, headerDefaults.insurance_coverage_package) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.insurance_coverage_package ?? headerDefaults.insurance_coverage_package ?? 'comprehensive'}
              onValueChange={(value) => onUpdate('insurance_coverage_package', value)}
            >
              <SelectTrigger id={`ins_coverage_${line.line_no}`}>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cdw">CDW</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="full-zero-excess">Full / Zero Excess</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_coverage_package", line.insurance_coverage_package, headerDefaults.insurance_coverage_package) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_coverage_package", headerDefaults.insurance_coverage_package)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_excess_${line.line_no}`} className="flex items-center gap-2">
              Excess (AED)
              {isCustomized("insurance_excess_aed", line.insurance_excess_aed, headerDefaults.insurance_excess_aed) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Input
              id={`ins_excess_${line.line_no}`}
              type="number"
              min="0"
              step="100"
              value={line.insurance_excess_aed ?? headerDefaults.insurance_excess_aed ?? 1500}
              onChange={(e) => onUpdate('insurance_excess_aed', parseFloat(e.target.value))}
              placeholder={headerDefaults.insurance_excess_aed !== undefined ? `Default: ${headerDefaults.insurance_excess_aed}` : undefined}
            />
            {isCustomized("insurance_excess_aed", line.insurance_excess_aed, headerDefaults.insurance_excess_aed) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_excess_aed", headerDefaults.insurance_excess_aed)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_territory_${line.line_no}`} className="flex items-center gap-2">
              Territorial Coverage
              {isCustomized("insurance_territorial_coverage", line.insurance_territorial_coverage, headerDefaults.insurance_territorial_coverage) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.insurance_territorial_coverage ?? headerDefaults.insurance_territorial_coverage ?? 'uae-only'}
              onValueChange={(value) => onUpdate('insurance_territorial_coverage', value)}
            >
              <SelectTrigger id={`ins_territory_${line.line_no}`}>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uae-only">UAE Only</SelectItem>
                <SelectItem value="gcc">GCC Countries</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_territorial_coverage", line.insurance_territorial_coverage, headerDefaults.insurance_territorial_coverage) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_territorial_coverage", headerDefaults.insurance_territorial_coverage)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_glass_tire_${line.line_no}`} className="flex items-center gap-2">
              Glass & Tire Cover
              {isCustomized("insurance_glass_tire_cover", line.insurance_glass_tire_cover, headerDefaults.insurance_glass_tire_cover) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={(line.insurance_glass_tire_cover ?? headerDefaults.insurance_glass_tire_cover) ? "yes" : "no"}
              onValueChange={(value) => onUpdate('insurance_glass_tire_cover', value === "yes")}
            >
              <SelectTrigger id={`ins_glass_tire_${line.line_no}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Included</SelectItem>
                <SelectItem value="no">No - Not Included</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_glass_tire_cover", line.insurance_glass_tire_cover, headerDefaults.insurance_glass_tire_cover) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_glass_tire_cover", headerDefaults.insurance_glass_tire_cover)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_pai_${line.line_no}`} className="flex items-center gap-2">
              Personal Accident Insurance (PAI)
              {isCustomized("insurance_pai_enabled", line.insurance_pai_enabled, headerDefaults.insurance_pai_enabled) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={(line.insurance_pai_enabled ?? headerDefaults.insurance_pai_enabled) ? "yes" : "no"}
              onValueChange={(value) => onUpdate('insurance_pai_enabled', value === "yes")}
            >
              <SelectTrigger id={`ins_pai_${line.line_no}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Enabled</SelectItem>
                <SelectItem value="no">No - Not Included</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_pai_enabled", line.insurance_pai_enabled, headerDefaults.insurance_pai_enabled) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_pai_enabled", headerDefaults.insurance_pai_enabled)}
              >
                Reset to default
              </Button>
            )}
          </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 6: Maintenance Override */}
        <AccordionItem value="maintenance">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="font-semibold">Maintenance Override</span>
              <span className="text-sm text-muted-foreground ml-2">{getMaintenancePreview()}</span>
              {hasCustomizations("maintenance") && (
                <Badge variant="secondary" className="ml-2">Customized</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Enable/Disable Maintenance */}
              <div className="space-y-2 col-span-full">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Include Maintenance Plan</Label>
                    <p className="text-xs text-muted-foreground">Add maintenance coverage to this vehicle</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={line.maintenance_included ?? headerDefaults.maintenance_included ?? false}
                      onCheckedChange={(checked) => onUpdate('maintenance_included', checked)}
                    />
                    {isCustomized("maintenance_included", line.maintenance_included, headerDefaults.maintenance_included) && (
                      <Badge variant="secondary" className="text-xs">Customized</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditional fields when maintenance is enabled */}
              {(line.maintenance_included ?? headerDefaults.maintenance_included) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`maint_package_${line.line_no}`} className="flex items-center gap-2">
                      Package Type
                      {isCustomized("maintenance_package_type", line.maintenance_package_type, headerDefaults.maintenance_package_type) && (
                        <Badge variant="secondary" className="text-xs">Customized</Badge>
                      )}
                    </Label>
                    <Select
                      value={line.maintenance_package_type ?? headerDefaults.maintenance_package_type ?? 'basic'}
                      onValueChange={(value) => onUpdate('maintenance_package_type', value)}
                    >
                      <SelectTrigger id={`maint_package_${line.line_no}`}>
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - Scheduled services</SelectItem>
                        <SelectItem value="full">Full - Parts, labor, tires, battery</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive - All-inclusive</SelectItem>
                      </SelectContent>
                    </Select>
                    {isCustomized("maintenance_package_type", line.maintenance_package_type, headerDefaults.maintenance_package_type) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => resetToDefault("maintenance_package_type", headerDefaults.maintenance_package_type)}
                      >
                        Reset to default
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`maint_cost_${line.line_no}`} className="flex items-center gap-2">
                      Monthly Cost/Vehicle (AED)
                      {isCustomized("monthly_maintenance_cost_per_vehicle", line.monthly_maintenance_cost_per_vehicle, headerDefaults.monthly_maintenance_cost_per_vehicle) && (
                        <Badge variant="secondary" className="text-xs">Customized</Badge>
                      )}
                    </Label>
                    <Input
                      id={`maint_cost_${line.line_no}`}
                      type="number"
                      min="0"
                      step="50"
                      value={line.monthly_maintenance_cost_per_vehicle ?? headerDefaults.monthly_maintenance_cost_per_vehicle ?? 0}
                      onChange={(e) => onUpdate('monthly_maintenance_cost_per_vehicle', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    {isCustomized("monthly_maintenance_cost_per_vehicle", line.monthly_maintenance_cost_per_vehicle, headerDefaults.monthly_maintenance_cost_per_vehicle) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => resetToDefault("monthly_maintenance_cost_per_vehicle", headerDefaults.monthly_maintenance_cost_per_vehicle)}
                      >
                        Reset to default
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`maint_source_${line.line_no}`} className="flex items-center gap-2">
                      Plan Source
                      {isCustomized("maintenance_plan_source", line.maintenance_plan_source, headerDefaults.maintenance_plan_source) && (
                        <Badge variant="secondary" className="text-xs">Customized</Badge>
                      )}
                    </Label>
                    <Select
                      value={line.maintenance_plan_source ?? headerDefaults.maintenance_plan_source ?? 'internal'}
                      onValueChange={(value) => onUpdate('maintenance_plan_source', value)}
                    >
                      <SelectTrigger id={`maint_source_${line.line_no}`}>
                        <SelectValue placeholder="Select plan source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal Workshop</SelectItem>
                        <SelectItem value="third_party">Third Party Provider</SelectItem>
                      </SelectContent>
                    </Select>
                    {isCustomized("maintenance_plan_source", line.maintenance_plan_source, headerDefaults.maintenance_plan_source) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => resetToDefault("maintenance_plan_source", headerDefaults.maintenance_plan_source)}
                      >
                        Reset to default
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 col-span-full">
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                      <Checkbox 
                        checked={line.show_maintenance_separate_line ?? headerDefaults.show_maintenance_separate_line ?? false}
                        onCheckedChange={(checked) => onUpdate('show_maintenance_separate_line', checked)}
                      />
                      <div>
                        <Label className="font-medium">Show as separate line item in quote</Label>
                        <p className="text-xs text-muted-foreground">Display maintenance as a distinct line in the quotation</p>
                      </div>
                      {isCustomized("show_maintenance_separate_line", line.show_maintenance_separate_line, headerDefaults.show_maintenance_separate_line) && (
                        <Badge variant="secondary" className="text-xs ml-auto">Customized</Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
              
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 7: Line Summary */}
        <AccordionItem value="summary" className="border-t-2 border-primary/20">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">Line Summary</span>
              <span className="text-sm font-bold text-primary ml-2">
                {((line.monthly_rate || 0) * billingPeriods).toFixed(2)} AED
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            
            <Card className="bg-muted">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deposit:</span>
                  <span className="font-medium">{line.deposit_amount || 0} AED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Advance Rent:</span>
                  <span className="font-medium">
                    {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee:</span>
                  <span className="font-medium">{(line.delivery_fee || 0).toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Collection Fee:</span>
                  <span className="font-medium">{(line.collection_fee || 0).toFixed(2)} AED</span>
                </div>

                {/* Maintenance section */}
                {(line.maintenance_included ?? headerDefaults.maintenance_included) && (
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">Maintenance (Monthly):</span>
                    <span className="font-medium">
                      {line.monthly_maintenance_cost_per_vehicle || headerDefaults.monthly_maintenance_cost_per_vehicle || 0} AED
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-semibold">Upfront Total:</span>
                  <span className="font-bold text-primary">
                    {((line.deposit_amount || 0) + (line.advance_rent_months || 0) * (line.monthly_rate || 0) + (line.delivery_fee || 0) + (line.collection_fee || 0)).toFixed(2)} AED
                  </span>
                </div>
                
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="font-semibold">Rate:</span>
                  <span className="font-medium">
                    {line.monthly_rate || 0} AED/{periodInfo.abbrev}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Billing Periods:</span>
                  <span className="font-medium">
                    {billingPeriods} × {periodInfo.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Lease Term:</span>
                  <span className="font-medium">{line.lease_term_months || 0} months</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="font-bold text-lg">Line Total:</span>
                  <span className="font-bold text-lg text-primary">
                    {((line.monthly_rate || 0) * billingPeriods).toFixed(2)} AED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {line.monthly_rate || 0} AED/{periodInfo.abbrev} × {billingPeriods} billing {billingPeriods === 1 ? 'period' : 'periods'}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{line.duration_months || 0} months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Mileage:</span>
                  <span className="font-medium">
                    {((line.mileage_package_km || 0) * (line.duration_months || 0)).toLocaleString()} km
                  </span>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 7: Add-Ons & Extras Override */}
        <AccordionItem value="addons">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-semibold">Add-Ons & Extras</span>
              <span className="text-sm text-muted-foreground ml-2">
                {getAddOnsPreview()}
              </span>
              {hasCustomizations("addons") && (
                <Badge variant="secondary" className="ml-2">Customized</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <VehicleAddOnsOverride
              line={line}
              onUpdate={onUpdate}
              headerDefaults={headerDefaults}
            />
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { availableAddOns } from "@/lib/constants/addOns";
import { formatCurrency } from "@/lib/utils/currency";
import { RotateCcw } from "lucide-react";

interface VehicleAddOnsOverrideProps {
  line: any;
  onUpdate: (field: string, value: any) => void;
  headerDefaults?: {
    default_addons?: Array<{
      id: string;
      name: string;
      type: 'monthly' | 'one-time';
      amount: number;
      enabled: boolean;
    }>;
  };
}

export const VehicleAddOnsOverride: React.FC<VehicleAddOnsOverrideProps> = ({
  line,
  onUpdate,
  headerDefaults = {},
}) => {
  const lineAddOns = line.addons || [];
  const defaultAddOns = headerDefaults.default_addons || [];

  const handleToggle = (addonId: string, enabled: boolean) => {
    const addon = availableAddOns.find(a => a.id === addonId);
    if (!addon) return;

    const existing = lineAddOns.find((a: any) => a.id === addonId);
    
    if (existing) {
      // Update existing
      const updated = lineAddOns.map((a: any) => 
        a.id === addonId ? { ...a, enabled, customized: true } : a
      );
      onUpdate('addons', updated);
    } else {
      // Add new
      onUpdate('addons', [
        ...lineAddOns,
        {
          id: addon.id,
          name: addon.name,
          type: addon.isFlat ? 'one-time' as const : 'monthly' as const,
          amount: addon.amount,
          enabled: enabled,
          customized: true,
        }
      ]);
    }
  };

  const isEnabled = (addonId: string) => {
    const lineAddon = lineAddOns.find((a: any) => a.id === addonId);
    if (lineAddon !== undefined) return lineAddon.enabled;
    
    const defaultAddon = defaultAddOns.find(a => a.id === addonId);
    return defaultAddon?.enabled || false;
  };

  const isCustomized = (addonId: string) => {
    const lineAddon = lineAddOns.find((a: any) => a.id === addonId);
    return lineAddon?.customized || false;
  };

  const isFromDefault = (addonId: string) => {
    return defaultAddOns.some(a => a.id === addonId && a.enabled);
  };

  const resetToDefaults = () => {
    const resetAddons = defaultAddOns
      .filter(a => a.enabled)
      .map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        amount: a.amount,
        enabled: true,
        customized: false,
      }));
    onUpdate('addons', resetAddons);
  };

  const hasCustomizations = lineAddOns.some((a: any) => a.customized);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Customize add-ons for this vehicle line
        </p>
        {hasCustomizations && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="h-8 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset to Default
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {availableAddOns.map((addon) => {
          const Icon = addon.icon;
          const enabled = isEnabled(addon.id);
          const customized = isCustomized(addon.id);
          const fromDefault = isFromDefault(addon.id);
          
          return (
            <Card key={addon.id} className={`p-3 ${enabled ? 'border-primary bg-primary/5' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`h-4 w-4 mt-0.5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-medium text-sm cursor-pointer" htmlFor={`line_addon_${line.line_no}_${addon.id}`}>
                        {addon.name}
                      </Label>
                      {fromDefault && !customized && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                      {customized && (
                        <Badge variant="secondary" className="text-xs">Customized</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{addon.description}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="font-semibold text-sm">{formatCurrency(addon.amount)}</span>
                      <span className="text-xs text-muted-foreground">
                        {addon.isFlat ? 'one-time' : 'per month'}
                      </span>
                    </div>
                  </div>
                </div>
                <Switch
                  id={`line_addon_${line.line_no}_${addon.id}`}
                  checked={enabled}
                  onCheckedChange={(checked) => handleToggle(addon.id, checked)}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

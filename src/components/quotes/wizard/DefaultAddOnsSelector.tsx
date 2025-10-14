import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { availableAddOns, addOnCategories } from "@/lib/constants/addOns";
import { formatCurrency } from "@/lib/utils/currency";

interface DefaultAddOnsSelectorProps {
  selectedAddOns: Array<{
    id: string;
    name: string;
    type: 'monthly' | 'one-time';
    amount: number;
    enabled: boolean;
  }>;
  onChange: (addons: any[]) => void;
}

export const DefaultAddOnsSelector: React.FC<DefaultAddOnsSelectorProps> = ({
  selectedAddOns = [],
  onChange,
}) => {
  const handleToggle = (addonId: string, enabled: boolean) => {
    const addon = availableAddOns.find(a => a.id === addonId);
    if (!addon) return;

    const existing = selectedAddOns.find(a => a.id === addonId);
    
    if (existing) {
      // Update existing
      const updated = selectedAddOns.map(a => 
        a.id === addonId ? { ...a, enabled } : a
      );
      onChange(updated);
    } else {
      // Add new
      onChange([
        ...selectedAddOns,
        {
          id: addon.id,
          name: addon.name,
          type: addon.isFlat ? 'one-time' as const : 'monthly' as const,
          amount: addon.amount,
          enabled: enabled,
        }
      ]);
    }
  };

  const isEnabled = (addonId: string) => {
    return selectedAddOns.find(a => a.id === addonId)?.enabled || false;
  };

  return (
    <div className="space-y-4">
      {addOnCategories.map((category) => {
        const categoryAddOns = availableAddOns.filter(a => a.category === category);
        
        return (
          <div key={category} className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">{category}</h4>
            <div className="space-y-2">
              {categoryAddOns.map((addon) => {
                const Icon = addon.icon;
                const enabled = isEnabled(addon.id);
                
                return (
                  <Card key={addon.id} className={`p-3 ${enabled ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`h-4 w-4 mt-0.5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="font-medium text-sm cursor-pointer" htmlFor={`addon_${addon.id}`}>
                              {addon.name}
                            </Label>
                            {addon.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{addon.description}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="font-semibold text-sm">{formatCurrency(addon.amount)}</span>
                            <span className="text-xs text-muted-foreground">
                              {addon.isFlat ? 'one-time' : 'per month per vehicle'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Switch
                        id={`addon_${addon.id}`}
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
      })}
    </div>
  );
};

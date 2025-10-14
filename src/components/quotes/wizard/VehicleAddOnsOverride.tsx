import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { AddOnsTable, AddOnLine } from "./AddOnsTable";

interface VehicleAddOnsOverrideProps {
  line: any;
  onUpdate: (field: string, value: any) => void;
  headerDefaults?: {
    default_addons?: AddOnLine[];
  };
}

export const VehicleAddOnsOverride: React.FC<VehicleAddOnsOverrideProps> = ({
  line,
  onUpdate,
  headerDefaults = {},
}) => {
  const lineAddOns: AddOnLine[] = line.addons || [];
  const defaultAddOns: AddOnLine[] = headerDefaults.default_addons || [];

  const hasCustomizations = () => {
    if (lineAddOns.length !== defaultAddOns.length) return true;
    
    // Check if any line add-on differs from defaults
    return lineAddOns.some((lineAddon, index) => {
      const defaultAddon = defaultAddOns.find(d => d.id === lineAddon.id);
      if (!defaultAddon) return true;
      
      return (
        lineAddon.quantity !== defaultAddon.quantity ||
        lineAddon.unit_price !== defaultAddon.unit_price ||
        lineAddon.item_code !== defaultAddon.item_code ||
        lineAddon.item_name !== defaultAddon.item_name
      );
    });
  };

  const resetToDefaults = () => {
    // Deep clone the defaults to avoid mutations
    const resetAddons = defaultAddOns.map(addon => ({ ...addon }));
    onUpdate('addons', resetAddons);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Customize add-ons for this vehicle line
          </p>
          {defaultAddOns.length > 0 && !hasCustomizations() && (
            <Badge variant="outline" className="text-xs">Using Header Defaults</Badge>
          )}
          {hasCustomizations() && (
            <Badge variant="secondary" className="text-xs">Customized</Badge>
          )}
        </div>
        {hasCustomizations() && (
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

      <Card className="p-4">
        <AddOnsTable
          addons={lineAddOns}
          onChange={(addons) => onUpdate('addons', addons)}
        />
      </Card>

      {defaultAddOns.length > 0 && lineAddOns.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No add-ons configured for this line. Header has {defaultAddOns.length} default add-on(s).
        </p>
      )}
    </div>
  );
};

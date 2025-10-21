import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface AddonsSelectionStepProps {
  data: EnhancedWizardData['step4'];
  onChange: (field: keyof EnhancedWizardData['step4'], value: any) => void;
  errors?: string[];
}

// Mock addons data - in production, fetch from API
const AVAILABLE_ADDONS = [
  {
    id: 'gps',
    name: 'GPS Navigation',
    description: 'Built-in GPS navigation system',
    dailyRate: 15,
    category: 'navigation',
    recommended: true,
  },
  {
    id: 'child_seat',
    name: 'Child Safety Seat',
    description: 'Safety seat for children (specify age)',
    dailyRate: 20,
    category: 'safety',
    recommended: false,
  },
  {
    id: 'additional_driver',
    name: 'Additional Driver',
    description: 'Add extra authorized driver',
    dailyRate: 25,
    category: 'driver',
    recommended: false,
  },
  {
    id: 'wifi',
    name: 'Mobile WiFi Hotspot',
    description: '4G mobile WiFi device',
    dailyRate: 30,
    category: 'connectivity',
    recommended: true,
  },
  {
    id: 'winter_tires',
    name: 'Winter Tires',
    description: 'Specialized winter tire package',
    dailyRate: 10,
    category: 'seasonal',
    recommended: false,
  },
  {
    id: 'premium_insurance',
    name: 'Premium Insurance',
    description: 'Zero excess insurance coverage',
    dailyRate: 50,
    category: 'insurance',
    recommended: true,
  },
  {
    id: 'roadside_assist',
    name: '24/7 Roadside Assistance',
    description: 'Premium roadside support',
    dailyRate: 15,
    category: 'support',
    recommended: true,
  },
  {
    id: 'fuel_prepay',
    name: 'Prepaid Fuel',
    description: 'Full tank prepayment option',
    dailyRate: 0,
    category: 'convenience',
    recommended: false,
  },
];

export const AddonsSelectionStep: React.FC<AddonsSelectionStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  const toggleAddon = (addonId: string) => {
    const addon = AVAILABLE_ADDONS.find((a) => a.id === addonId);
    if (!addon) return;

    const isSelected = data.selectedAddons.some((a) => a.id === addonId);

    if (isSelected) {
      onChange(
        'selectedAddons',
        data.selectedAddons.filter((a) => a.id !== addonId)
      );
    } else {
      onChange('selectedAddons', [
        ...data.selectedAddons,
        {
          id: addon.id,
          name: addon.name,
          quantity: 1,
          dailyRate: addon.dailyRate,
          totalCost: addon.dailyRate,
        },
      ]);
    }
  };

  const recommendedAddons = AVAILABLE_ADDONS.filter((a) => a.recommended);
  const categorizedAddons = AVAILABLE_ADDONS.reduce((acc, addon) => {
    if (!acc[addon.category]) {
      acc[addon.category] = [];
    }
    acc[addon.category].push(addon);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_ADDONS>);

  const totalAddonsCost = data.selectedAddons.reduce((sum, addon) => sum + addon.totalCost, 0);

  return (
    <div className="space-y-6">
      {recommendedAddons.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Recommended Add-ons</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedAddons.map((addon) => {
              const isSelected = data.selectedAddons.some((a) => a.id === addon.id);
              return (
                <div
                  key={addon.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={`addon-${addon.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleAddon(addon.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`addon-${addon.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {addon.name}
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                    <p className="text-sm font-medium mt-2">AED {addon.dailyRate}/day</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {Object.entries(categorizedAddons).map(([category, addons]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category.replace('_', ' ')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {addons.map((addon) => {
              const isSelected = data.selectedAddons.some((a) => a.id === addon.id);
              return (
                <div
                  key={addon.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={`addon-${addon.id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleAddon(addon.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`addon-${addon.id}`} className="cursor-pointer">
                      {addon.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                    <p className="text-sm font-medium mt-2">
                      {addon.dailyRate === 0 ? 'Included' : `AED ${addon.dailyRate}/day`}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {data.selectedAddons.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Selected Add-ons Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.selectedAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between text-sm">
                  <span>{addon.name}</span>
                  <span className="font-medium">AED {addon.totalCost.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Add-ons:</span>
                <span className="text-primary">AED {totalAddonsCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

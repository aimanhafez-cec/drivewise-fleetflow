import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, Navigation, Baby, Wifi, Car, Snowflake } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useReservationWizard } from './ReservationWizardContext';
import { useAddonItems } from '@/hooks/useAddonItems';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, any> = {
  insurance: Shield,
  gps: Navigation,
  baby_seat: Baby,
  wifi: Wifi,
  additional_driver: Car,
  winter_tires: Snowflake,
};

export const Step5ServicesAddOns: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();
  const { data: addOns, isLoading } = useAddonItems();

  const handleAddOnToggle = (addOnId: string, price: number) => {
    const isSelected = wizardData.globalAddOns.includes(addOnId);
    
    if (isSelected) {
      updateWizardData({
        globalAddOns: wizardData.globalAddOns.filter((id) => id !== addOnId),
        globalAddOnPrices: Object.fromEntries(
          Object.entries(wizardData.globalAddOnPrices).filter(([key]) => key !== addOnId)
        ),
      });
    } else {
      updateWizardData({
        globalAddOns: [...wizardData.globalAddOns, addOnId],
        globalAddOnPrices: {
          ...wizardData.globalAddOnPrices,
          [addOnId]: price,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Group add-ons by category
  const groupedAddOns = addOns?.reduce((acc: Record<string, any[]>, addOn) => {
    if (!acc[addOn.category]) {
      acc[addOn.category] = [];
    }
    acc[addOn.category].push(addOn);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Services & Add-ons</h2>
        <p className="text-muted-foreground">
          Select additional services to enhance your rental experience
        </p>
      </div>

      {Object.entries(groupedAddOns).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-lg capitalize">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((addOn: any) => {
              const isSelected = wizardData.globalAddOns.includes(addOn.id);
              const IconComponent = iconMap[addOn.item_code] || Car;

              return (
                <Card
                  key={addOn.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => handleAddOnToggle(addOn.id, addOn.default_unit_price)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleAddOnToggle(addOn.id, addOn.default_unit_price)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base">
                                {addOn.item_name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="text-xs mt-1"
                              >
                                {addOn.pricing_model === 'monthly'
                                  ? 'Per Month'
                                  : 'One-time'}
                              </Badge>
                            </div>
                          </div>
                          <span className="font-bold text-lg whitespace-nowrap">
                            {formatCurrency(addOn.default_unit_price)}
                          </span>
                        </div>
                        {addOn.description && (
                          <p className="text-sm text-muted-foreground">
                            {addOn.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      {wizardData.globalAddOns.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Selected Add-ons
                </p>
                <p className="text-2xl font-bold">
                  {wizardData.globalAddOns.length} service(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Add-ons Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    Object.values(wizardData.globalAddOnPrices).reduce(
                      (sum, price) => sum + (price as number),
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

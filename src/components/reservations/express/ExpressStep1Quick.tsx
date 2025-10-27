import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import CustomerIdentification from '@/components/instant-booking/wizard/CustomerIdentification';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Car, CheckCircle2 } from 'lucide-react';

interface ExpressStep1QuickProps {
  customerId?: string;
  vehicleClassId?: string;
  onCustomerSelect: (id: string, name: string) => void;
  onVehicleClassSelect: (id: string) => void;
  expanded: boolean;
}

interface VehicleClass {
  id: string;
  name: string;
  description?: string;
}

export const ExpressStep1Quick: React.FC<ExpressStep1QuickProps> = ({
  customerId,
  vehicleClassId,
  onCustomerSelect,
  onVehicleClassSelect,
  expanded,
}) => {
  const { data: vehicleClasses } = useQuery<VehicleClass[]>({
    queryKey: ['vehicle-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_categories' as any)
        .select('id, name, description')
        .order('name');
      if (error) throw error;
      return (data || []) as unknown as VehicleClass[];
    },
  });

  return (
    <div className={cn("space-y-4", !expanded && "opacity-50 pointer-events-none")}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
          expanded ? "bg-primary text-primary-foreground" : customerId && vehicleClassId ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
        )}>
          {customerId && vehicleClassId ? <CheckCircle2 className="h-5 w-5" /> : "1"}
        </div>
        <h3 className="font-semibold">Who & What</h3>
      </div>

      {expanded && (
        <>
          {/* Customer Selection */}
          <Card>
            <CardContent className="pt-6">
              <Label>Customer *</Label>
              <CustomerIdentification
                selectedCustomerId={customerId}
                onCustomerSelect={(customer: any) => onCustomerSelect(customer.id, customer.name)}
              />
            </CardContent>
          </Card>

          {/* Vehicle Class Grid */}
          <Card>
            <CardContent className="pt-6">
              <Label className="mb-3 block">Vehicle Class *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicleClasses?.map((vc) => (
                  <button
                    key={vc.id}
                    onClick={() => onVehicleClassSelect(vc.id)}
                    className={cn(
                      "p-4 border-2 rounded-lg text-left transition-all hover:border-primary",
                      vehicleClassId === vc.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <Car className="h-6 w-6 mb-2 text-primary" />
                    <div className="font-semibold">{vc.name}</div>
                    {vc.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {vc.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

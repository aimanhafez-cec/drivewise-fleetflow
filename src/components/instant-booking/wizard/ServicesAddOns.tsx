import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  UserPlus,
  Baby,
  Navigation,
  Wifi,
  Car,
  Sparkles,
  Key,
  Receipt,
  AlertTriangle,
  Globe,
} from 'lucide-react';

interface ServicesAddOnsProps {
  selectedAddOns: string[];
  addOnCharges: Record<string, number>;
  rentalDays: number;
  onUpdate: (updates: any) => void;
}

const ServicesAddOns = ({ selectedAddOns, addOnCharges, rentalDays, onUpdate }: ServicesAddOnsProps) => {
  const addOns = [
    {
      id: 'cdw_scdw',
      category: 'Insurance & Protection',
      icon: Shield,
      name: 'Super Collision Damage Waiver',
      description: 'Reduce excess to AED 500',
      rate: 45,
      perDay: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'personal_accident',
      category: 'Insurance & Protection',
      icon: Shield,
      name: 'Personal Accident Insurance',
      description: 'Coverage for driver and passengers',
      rate: 30,
      perDay: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'theft_protection',
      category: 'Insurance & Protection',
      icon: Shield,
      name: 'Theft Protection',
      description: 'Full coverage against theft',
      rate: 25,
      perDay: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'additional_driver',
      category: 'Additional Services',
      icon: UserPlus,
      name: 'Additional Driver',
      description: 'Add extra authorized driver',
      rate: 25,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'child_seat',
      category: 'Additional Services',
      icon: Baby,
      name: 'Child Seat',
      description: 'Safety seat for children',
      rate: 20,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'gps_navigation',
      category: 'Additional Services',
      icon: Navigation,
      name: 'GPS Navigation',
      description: 'Built-in GPS system',
      rate: 15,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'wifi_hotspot',
      category: 'Additional Services',
      icon: Wifi,
      name: 'WiFi Hotspot',
      description: 'Unlimited 4G data',
      rate: 50,
      perDay: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'delivery_collection',
      category: 'Convenience',
      icon: Car,
      name: 'Delivery & Collection',
      description: 'We deliver and collect the car',
      rate: 150,
      perDay: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      id: 'car_wash',
      category: 'Convenience',
      icon: Sparkles,
      name: 'Car Wash Package',
      description: 'Professional interior & exterior wash',
      rate: 75,
      perDay: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      id: 'second_key',
      category: 'Convenience',
      icon: Key,
      name: 'Second Key',
      description: 'Extra key (refundable deposit)',
      rate: 50,
      perDay: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      id: 'salik_darb',
      category: 'Coverage Packages',
      icon: Receipt,
      name: 'Salik & Darb Handling',
      description: 'Toll fees (Actual + AED 5 admin fee)',
      rate: 0,
      perDay: false,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 'traffic_fine_admin',
      category: 'Coverage Packages',
      icon: AlertTriangle,
      name: 'Traffic Fine Administration',
      description: 'AED 50 per fine processing',
      rate: 0,
      perDay: false,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 'cross_border',
      category: 'Coverage Packages',
      icon: Globe,
      name: 'Cross-Border Permit to Oman',
      description: 'Travel to Oman',
      rate: 150,
      perDay: false,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const categories = Array.from(new Set(addOns.map(a => a.category)));

  const handleToggle = (addOnId: string) => {
    const addOn = addOns.find(a => a.id === addOnId);
    if (!addOn) return;

    const isSelected = selectedAddOns.includes(addOnId);
    const cost = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;

    if (isSelected) {
      onUpdate({
        selectedAddOns: selectedAddOns.filter(id => id !== addOnId),
        addOnCharges: Object.fromEntries(
          Object.entries(addOnCharges).filter(([key]) => key !== addOnId)
        ),
      });
    } else {
      onUpdate({
        selectedAddOns: [...selectedAddOns, addOnId],
        addOnCharges: { ...addOnCharges, [addOnId]: cost },
      });
    }
  };

  const totalAddOns = Object.values(addOnCharges).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Services & Add-ons</h2>
          <p className="text-muted-foreground">
            Enhance your rental with additional services (optional)
          </p>
        </div>
        {totalAddOns > 0 && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
            +AED {totalAddOns.toFixed(2)}
          </Badge>
        )}
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="font-semibold text-foreground mb-3 text-lg">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addOns
              .filter(a => a.category === category)
              .map((addOn) => {
                const IconComponent = addOn.icon;
                const isSelected = selectedAddOns.includes(addOn.id);
                const cost = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;

                return (
                  <Card
                    key={addOn.id}
                    className={`transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-md' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${addOn.bg}`}>
                            <IconComponent className={`h-5 w-5 ${addOn.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={addOn.id}
                              className="font-semibold text-foreground cursor-pointer text-sm"
                            >
                              {addOn.name}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {addOn.description}
                            </p>
                            <div className="mt-2">
                              {addOn.rate > 0 ? (
                                <Badge variant="outline" className="text-xs">
                                  AED {addOn.rate}{addOn.perDay ? '/day' : ' flat'}
                                  {isSelected && addOn.perDay && ` × ${rentalDays} = AED ${cost}`}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Variable rate
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Switch
                          id={addOn.id}
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(addOn.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      {selectedAddOns.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No add-ons selected. You can proceed with the base rental or add services above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServicesAddOns;

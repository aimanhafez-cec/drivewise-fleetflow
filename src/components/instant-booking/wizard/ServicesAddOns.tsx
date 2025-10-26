import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Package,
  Users,
  Briefcase,
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

  // Popular package handlers
  const handleEssentialPackage = () => {
    const packageIds = ['cdw_scdw', 'gps_navigation'];
    const newSelectedAddOns = [...new Set([...selectedAddOns, ...packageIds])];
    const newCharges = { ...addOnCharges };
    
    packageIds.forEach(id => {
      const addOn = addOns.find(a => a.id === id);
      if (addOn && !selectedAddOns.includes(id)) {
        newCharges[id] = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;
      }
    });
    
    onUpdate({
      selectedAddOns: newSelectedAddOns,
      addOnCharges: newCharges,
    });
  };

  const handleFamilyPackage = () => {
    const packageIds = ['cdw_scdw', 'child_seat', 'gps_navigation'];
    const newSelectedAddOns = [...new Set([...selectedAddOns, ...packageIds])];
    const newCharges = { ...addOnCharges };
    
    packageIds.forEach(id => {
      const addOn = addOns.find(a => a.id === id);
      if (addOn && !selectedAddOns.includes(id)) {
        newCharges[id] = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;
      }
    });
    
    onUpdate({
      selectedAddOns: newSelectedAddOns,
      addOnCharges: newCharges,
    });
  };

  const handleBusinessPackage = () => {
    const packageIds = ['wifi_hotspot', 'additional_driver'];
    const newSelectedAddOns = [...new Set([...selectedAddOns, ...packageIds])];
    const newCharges = { ...addOnCharges };
    
    packageIds.forEach(id => {
      const addOn = addOns.find(a => a.id === id);
      if (addOn && !selectedAddOns.includes(id)) {
        newCharges[id] = addOn.perDay ? addOn.rate * rentalDays : addOn.rate;
      }
    });
    
    onUpdate({
      selectedAddOns: newSelectedAddOns,
      addOnCharges: newCharges,
    });
  };

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

      {/* Popular Packages - Quick Select */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Popular Packages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">Essential</h4>
                  <p className="text-xs text-muted-foreground">SCDW + GPS</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    AED {((45 + 15) * rentalDays).toFixed(0)} total
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={handleEssentialPackage}
                size="sm" 
                className="w-full"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">Family</h4>
                  <p className="text-xs text-muted-foreground">SCDW + Child Seat + GPS</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    AED {((45 + 20 + 15) * rentalDays).toFixed(0)} total
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={handleFamilyPackage}
                size="sm" 
                className="w-full"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">Business</h4>
                  <p className="text-xs text-muted-foreground">WiFi + Additional Driver</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    AED {((50 + 25) * rentalDays).toFixed(0)} total
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={handleBusinessPackage}
                size="sm" 
                className="w-full"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </CardContent>
          </Card>
        </div>
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

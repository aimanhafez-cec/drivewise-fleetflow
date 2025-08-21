import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Baby, 
  Navigation, 
  Wifi, 
  UserPlus, 
  PhoneCall, 
  Mountain, 
  Truck,
  Clock,
  Plus,
  Minus
} from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  description: string;
  amount: number;
  isFlat: boolean; // true for flat rate, false for daily rate
  category: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
}

interface AddOnsSelectorProps {
  selectedAddOns: string[];
  addOnCharges: Record<string, number>;
  onAddOnToggle: (addOnId: string) => void;
  rentalDays?: number;
}

const availableAddOns: AddOn[] = [
  // Insurance & Protection
  {
    id: 'cdw_scdw',
    name: 'Collision Damage Waiver (CDW/SCDW)',
    description: 'Protection against collision and comprehensive damage',
    amount: 45,
    isFlat: false,
    category: 'Insurance & Protection',
    icon: Shield,
    popular: true
  },
  {
    id: 'off_road_insurance',
    name: 'Off-Road Insurance',
    description: 'Coverage for off-road driving adventures',
    amount: 50,
    isFlat: false,
    category: 'Insurance & Protection',
    icon: Mountain
  },
  {
    id: 'roadside_assistance',
    name: 'Roadside Assistance (Premium)',
    description: '24/7 premium roadside assistance service',
    amount: 10,
    isFlat: false,
    category: 'Insurance & Protection',
    icon: PhoneCall
  },
  
  // Equipment & Accessories
  {
    id: 'child_seat',
    name: 'Child Seat',
    description: 'Safety-certified child car seat',
    amount: 20,
    isFlat: false,
    category: 'Equipment & Accessories',
    icon: Baby,
    popular: true
  },
  {
    id: 'gps_navigation',
    name: 'GPS Navigation',
    description: 'Turn-by-turn GPS navigation system',
    amount: 15,
    isFlat: false,
    category: 'Equipment & Accessories',
    icon: Navigation
  },
  {
    id: 'wifi_hotspot',
    name: 'Wi-Fi Hotspot',
    description: 'Mobile internet hotspot device',
    amount: 50,
    isFlat: false,
    category: 'Equipment & Accessories',
    icon: Wifi
  },
  
  // Driver Services
  {
    id: 'additional_driver',
    name: 'Additional Driver',
    description: 'Add an extra authorized driver',
    amount: 25,
    isFlat: false,
    category: 'Driver Services',
    icon: UserPlus
  },
  {
    id: 'young_driver',
    name: 'Young Driver Surcharge (under 24)',
    description: 'Required surcharge for drivers under 24 years',
    amount: 50,
    isFlat: false,
    category: 'Driver Services',
    icon: Clock
  },
  
  // Delivery Services
  {
    id: 'delivery_collection',
    name: 'Delivery & Collection Service',
    description: 'Vehicle delivery and collection service',
    amount: 100,
    isFlat: true,
    category: 'Delivery Services',
    icon: Truck,
    popular: true
  }
];

const AddOnsSelector: React.FC<AddOnsSelectorProps> = ({
  selectedAddOns = [],
  addOnCharges = {},
  onAddOnToggle,
  rentalDays = 1
}) => {
  const categorizeAddOns = (category: string) => {
    return availableAddOns.filter(addOn => addOn.category === category);
  };

  const getTotalAddOnAmount = () => {
    return Object.values(addOnCharges).reduce((sum, amount) => sum + amount, 0);
  };

  const calculateAddOnCost = (addOn: AddOn) => {
    return addOn.isFlat ? addOn.amount : addOn.amount * rentalDays;
  };

  const categories = [
    'Insurance & Protection',
    'Equipment & Accessories', 
    'Driver Services',
    'Delivery Services'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add-ons Selection */}
      <div className="lg:col-span-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Plus className="h-5 w-5 text-card-foreground" />
              Add-on Features
            </CardTitle>
            <CardDescription className="text-card-foreground/70">
              Enhance your rental experience with optional add-ons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {categories.map((category) => {
              const categoryAddOns = categorizeAddOns(category);
              if (categoryAddOns.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h3 className="font-semibold text-lg text-card-foreground border-b border-card-foreground/20 pb-2">
                    {category}
                  </h3>
                  <div className="grid gap-4">
                    {categoryAddOns.map((addOn) => {
                      const isSelected = selectedAddOns.includes(addOn.id);
                      const cost = calculateAddOnCost(addOn);
                      const IconComponent = addOn.icon;

                      return (
                        <div
                          key={addOn.id}
                          className={`
                            relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                            ${isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-card-foreground/20 bg-card hover:border-primary/50'
                            }
                          `}
                          onClick={() => onAddOnToggle(addOn.id)}
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => {}} // Controlled by parent click
                              className="mt-1"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                                <h4 className="font-medium text-card-foreground">{addOn.name}</h4>
                                {addOn.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-card-foreground/70 mb-3">
                                {addOn.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-red-600">
                                  AED {cost.toFixed(0)}
                                  {addOn.isFlat ? (
                                    <span className="text-xs text-card-foreground/70 ml-1">(flat rate)</span>
                                  ) : (
                                    <span className="text-xs text-card-foreground/70 ml-1">
                                      ({rentalDays} day{rentalDays > 1 ? 's' : ''} × AED {addOn.amount})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Selected Add-ons Summary */}
      <div>
        <Card className="shadow-card sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Selected Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAddOns.length === 0 ? (
              <p className="text-card-foreground/70 text-sm">No add-ons selected</p>
            ) : (
              <div className="space-y-3">
                {selectedAddOns.map((addOnId) => {
                  const addOn = availableAddOns.find(a => a.id === addOnId);
                  if (!addOn) return null;
                  
                  const cost = calculateAddOnCost(addOn);
                  const IconComponent = addOn.icon;
                  
                  return (
                    <div key={addOnId} className="flex items-center justify-between p-3 bg-card-foreground/5 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-card-foreground">{addOn.name}</p>
                          <p className="text-xs text-card-foreground/70">
                            {addOn.isFlat ? 'Flat rate' : `AED ${addOn.amount}/day`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-red-600">AED {cost.toFixed(0)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-card-foreground/70 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddOnToggle(addOnId);
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                <div className="border-t border-card-foreground/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-card-foreground">Add-ons Total:</span>
                    <span className="font-bold text-lg text-red-600">
                      AED {getTotalAddOnAmount().toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddOnsSelector;
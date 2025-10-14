// Add-ons constants for Reservation system (legacy)
// Note: Quote system uses database-driven addon_items table

import { Shield, Zap, Baby, Wifi, Users, Package, Fuel, MapPin, Car } from 'lucide-react';

export interface AddOn {
  id: string;
  name: string;
  description: string;
  icon: any;
  amount: number;
  category: 'protection' | 'convenience' | 'safety' | 'services';
  isFlat: boolean;
  isPopular?: boolean;
}

export const availableAddOns: AddOn[] = [
  {
    id: 'cdw',
    name: 'Collision Damage Waiver (CDW/SCDW)',
    description: 'Reduce financial responsibility for collision damage',
    icon: Shield,
    amount: 30,
    category: 'protection',
    isFlat: false,
    isPopular: true,
  },
  {
    id: 'pai',
    name: 'Personal Accident Insurance (PAI)',
    description: 'Coverage for medical expenses due to accidents',
    icon: Shield,
    amount: 10,
    category: 'protection',
    isFlat: false,
  },
  {
    id: 'gps',
    name: 'GPS Navigation System',
    description: 'Portable GPS device with latest maps',
    icon: MapPin,
    amount: 15,
    category: 'convenience',
    isFlat: false,
  },
  {
    id: 'child_seat',
    name: 'Child Safety Seat',
    description: 'Forward-facing child seat (15-36kg)',
    icon: Baby,
    amount: 5,
    category: 'safety',
    isFlat: false,
  },
  {
    id: 'wifi',
    name: 'Wi-Fi Hotspot Device',
    description: 'Mobile Wi-Fi hotspot with unlimited data',
    icon: Wifi,
    amount: 20,
    category: 'convenience',
    isFlat: false,
  },
  {
    id: 'additional_driver',
    name: 'Additional Driver',
    description: 'Add extra authorized driver to rental agreement',
    icon: Users,
    amount: 50,
    category: 'services',
    isFlat: true,
  },
  {
    id: 'delivery',
    name: 'Vehicle Delivery',
    description: 'Door-to-door vehicle delivery service',
    icon: Package,
    amount: 75,
    category: 'services',
    isFlat: true,
  },
  {
    id: 'prepaid_fuel',
    name: 'Prepaid Fuel',
    description: 'Prepay for full tank of fuel at discounted rate',
    icon: Fuel,
    amount: 150,
    category: 'services',
    isFlat: true,
  },
];

export const addOnCategories = {
  protection: { name: 'Protection & Insurance', icon: Shield },
  convenience: { name: 'Convenience', icon: Zap },
  safety: { name: 'Safety', icon: Baby },
  services: { name: 'Services', icon: Car },
};

export const categorizeAddOns = (): Array<{ category: string; name: string; icon: any; items: AddOn[] }> => {
  return Object.entries(addOnCategories).map(([key, value]) => ({
    category: key,
    ...value,
    items: availableAddOns.filter(addon => addon.category === key),
  }));
};

export const calculateAddOnCost = (addOnId: string, rentalDays: number = 1): number => {
  const addOn = availableAddOns.find(a => a.id === addOnId);
  if (!addOn) return 0;
  return addOn.isFlat ? addOn.amount : addOn.amount * rentalDays;
};

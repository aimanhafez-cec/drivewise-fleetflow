import React from 'react';
import { 
  Shield, 
  Baby, 
  Navigation, 
  Wifi, 
  UserPlus, 
  PhoneCall, 
  Mountain, 
  Truck,
  Clock
} from 'lucide-react';

export interface AddOn {
  id: string;
  name: string;
  description: string;
  amount: number;
  isFlat: boolean; // true for flat rate, false for daily rate
  category: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
}

export const availableAddOns: AddOn[] = [
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
    description: 'Coverage for off-road driving adventures - included with premium price-list',
    amount: 50,
    isFlat: false,
    category: 'Insurance & Protection',
    icon: Mountain
  },
  {
    id: 'roadside_assistance',
    name: 'Roadside Assistance (Premium)',
    description: '24/7 premium roadside assistance service - included with premium price-list',
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
    description: 'Turn-by-turn GPS navigation system - included with premium price-list',
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
    description: 'Vehicle delivery and collection service - included with premium price-list',
    amount: 100,
    isFlat: true,
    category: 'Delivery Services',
    icon: Truck,
    popular: true
  }
];

export const categorizeAddOns = (category: string) => {
  return availableAddOns.filter(addOn => addOn.category === category);
};

export const calculateAddOnCost = (addOn: AddOn, rentalDays: number = 1) => {
  return addOn.isFlat ? addOn.amount : addOn.amount * rentalDays;
};

export const addOnCategories = [
  'Insurance & Protection',
  'Equipment & Accessories', 
  'Driver Services',
  'Delivery Services'
];
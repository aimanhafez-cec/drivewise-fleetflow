import { useLOV, useLOVById } from './useLOV';

// Customer LOV
export interface Customer {
  id: string;
  label: string;
  full_name: string;
  phone?: string;
  email?: string;
  status: string;
}

export const useCustomers = (searchQuery?: string) => {
  const result = useLOV<Customer>('customers', 'id, full_name, phone, email', {
    searchFields: ['full_name', 'email'],
    orderBy: 'full_name'
  });
  
  if (searchQuery !== undefined) {
    result.updateSearch(searchQuery);
  }
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.full_name} (${item.email})`
    }))
  };
};

export const useCustomerById = (id?: string) => {
  return useLOVById<Customer>('customers', 'id, full_name, phone, email', id);
};

// Vehicle Categories (Classes)
export interface VehicleClass {
  id: string;
  label: string;
  name: string;
  description?: string;
}

export const useVehicleClasses = () => {
  const result = useLOV<VehicleClass>('categories', 'id, name, description');
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.name
    }))
  };
};

// Vehicle Makes
export interface VehicleMake {
  id: string;
  label: string;
  make: string;
}

export const useVehicleMakes = (classId?: string) => {
  // For now, return static data since DISTINCT queries need special handling
  const staticMakes: VehicleMake[] = [
    { id: 'toyota', make: 'Toyota', label: 'Toyota' },
    { id: 'honda', make: 'Honda', label: 'Honda' },
    { id: 'ford', make: 'Ford', label: 'Ford' },
    { id: 'chevrolet', make: 'Chevrolet', label: 'Chevrolet' },
    { id: 'nissan', make: 'Nissan', label: 'Nissan' },
    { id: 'bmw', make: 'BMW', label: 'BMW' },
    { id: 'mercedes', make: 'Mercedes-Benz', label: 'Mercedes-Benz' }
  ];

  return {
    items: staticMakes,
    isLoading: false,
    error: null,
    updateSearch: () => {},
    searchQuery: '',
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve()
  };
};

// Vehicle Models
export interface VehicleModel {
  id: string;
  label: string;
  model: string;
}

export const useVehicleModels = (make?: string, classId?: string) => {
  // Static model data organized by make
  const modelsByMake: Record<string, VehicleModel[]> = {
    toyota: [
      { id: 'camry', model: 'Camry', label: 'Camry' },
      { id: 'corolla', model: 'Corolla', label: 'Corolla' },
      { id: 'rav4', model: 'RAV4', label: 'RAV4' },
      { id: 'prius', model: 'Prius', label: 'Prius' }
    ],
    honda: [
      { id: 'civic', model: 'Civic', label: 'Civic' },
      { id: 'accord', model: 'Accord', label: 'Accord' },
      { id: 'crv', model: 'CR-V', label: 'CR-V' },
      { id: 'pilot', model: 'Pilot', label: 'Pilot' }
    ],
    ford: [
      { id: 'f150', model: 'F-150', label: 'F-150' },
      { id: 'escape', model: 'Escape', label: 'Escape' },
      { id: 'explorer', model: 'Explorer', label: 'Explorer' },
      { id: 'mustang', model: 'Mustang', label: 'Mustang' }
    ],
    chevrolet: [
      { id: 'silverado', model: 'Silverado', label: 'Silverado' },
      { id: 'equinox', model: 'Equinox', label: 'Equinox' },
      { id: 'tahoe', model: 'Tahoe', label: 'Tahoe' },
      { id: 'malibu', model: 'Malibu', label: 'Malibu' }
    ],
    nissan: [
      { id: 'altima', model: 'Altima', label: 'Altima' },
      { id: 'sentra', model: 'Sentra', label: 'Sentra' },
      { id: 'rogue', model: 'Rogue', label: 'Rogue' },
      { id: 'pathfinder', model: 'Pathfinder', label: 'Pathfinder' }
    ]
  };
  
  const models = make && modelsByMake[make.toLowerCase()] 
    ? modelsByMake[make.toLowerCase()]
    : [];

  return {
    items: models,
    isLoading: false,
    error: null,
    updateSearch: () => {},
    searchQuery: '',
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve()
  };
};

// Locations
export interface Location {
  id: string;
  label: string;
  name: string;
  code?: string;
  type?: string;
}

export const useLocations = (type?: string) => {
  // Return static locations since the table doesn't exist in the database
  const staticLocations: Location[] = [
    { id: 'main', name: 'Main Location', code: 'MAIN', type: 'branch', label: 'Main Location' },
    { id: 'airport', name: 'Airport Location', code: 'AIRPORT', type: 'airport', label: 'Airport Location' },
    { id: 'downtown', name: 'Downtown Branch', code: 'DOWN', type: 'branch', label: 'Downtown Branch' }
  ];

  return {
    items: staticLocations,
    isLoading: false,
    error: null,
    updateSearch: () => {},
    searchQuery: '',
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve()
  };
};

// Vehicles with enhanced search
export interface VehicleOption {
  id: string;
  label: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
  category_id?: string;
}

export const useVehicleOptions = (filters: {
  classId?: string;
  make?: string;
  model?: string;
  locationId?: string;
  status?: string;
  vinOrPlate?: string;
} = {}) => {
  const { classId, make, model, locationId, status = 'available', vinOrPlate } = filters;
  
  const dependencies: Record<string, any> = { status };
  if (classId) dependencies.category_id = classId;
  if (make) dependencies.make = make;
  if (model) dependencies.model = model;
  
  const result = useLOV<VehicleOption>('vehicles', 'id, make, model, year, license_plate, status, category_id', {
    dependencies,
    searchFields: vinOrPlate ? ['vin', 'license_plate'] : ['make', 'model', 'license_plate'],
    orderBy: 'make'
  });
  
  if (vinOrPlate) {
    result.updateSearch(vinOrPlate);
  }
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.make} ${item.model} (${item.year}) - ${item.license_plate}`
    }))
  };
};

// Business Units
export interface BusinessUnit {
  id: string;
  label: string;
  name: string;
}

export const useBusinessUnits = () => {
  // Return static business units since the table doesn't exist in the database
  const staticUnits: BusinessUnit[] = [
    { id: 'main', name: 'Main Business Unit', label: 'Main Business Unit' },
    { id: 'branch1', name: 'Branch Office 1', label: 'Branch Office 1' },
    { id: 'branch2', name: 'Branch Office 2', label: 'Branch Office 2' }
  ];

  return {
    items: staticUnits,
    isLoading: false,
    error: null,
    updateSearch: () => {},
    searchQuery: '',
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve()
  };
};

// Payment Terms
export interface PaymentTerm {
  id: string;
  label: string;
  name: string;
  days: number;
}

export const usePaymentTerms = () => {
  // Return static payment terms since the table doesn't exist in the database
  const staticTerms: PaymentTerm[] = [
    { id: 'net30', name: 'Net 30 Days', days: 30, label: 'Net 30 Days' },
    { id: 'net15', name: 'Net 15 Days', days: 15, label: 'Net 15 Days' },
    { id: 'cod', name: 'Cash on Delivery', days: 0, label: 'Cash on Delivery' },
    { id: 'prepaid', name: 'Prepaid', days: -1, label: 'Prepaid' }
  ];

  return {
    items: staticTerms,
    isLoading: false,
    error: null,
    updateSearch: () => {},
    searchQuery: '',
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve()
  };
};

// Reservation Types
export interface ReservationType {
  id: string;
  label: string;
  name: string;
}

export const useReservationTypes = () => {
  // Return static reservation types since the table doesn't exist in the database
  const staticTypes: ReservationType[] = [
    { id: 'daily', name: 'Daily Rental', label: 'Daily Rental' },
    { id: 'weekly', name: 'Weekly Rental', label: 'Weekly Rental' },
    { id: 'monthly', name: 'Monthly Rental', label: 'Monthly Rental' },
    { id: 'corporate', name: 'Corporate Booking', label: 'Corporate Booking' }
  ];

  return {
    items: staticTypes,
    isLoading: false,
    error: null,
    updateSearch: () => {},
    searchQuery: '',
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve()
  };
};
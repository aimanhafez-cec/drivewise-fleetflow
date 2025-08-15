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
  const result = useLOV<Customer>('customers', 'id, full_name, phone, email, status', {
    searchFields: ['full_name', 'phone', 'email']
  });
  
  if (searchQuery !== undefined) {
    result.updateSearch(searchQuery);
  }
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.full_name
    }))
  };
};

export const useCustomerById = (id?: string) => {
  return useLOVById<Customer>('customers', 'id, full_name, phone, email, status', id);
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
  const result = useLOV<VehicleMake>('vehicles', 'DISTINCT make as id, make, make as label', {
    dependencies: { category_id: classId },
    orderBy: 'make'
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      id: item.make,
      label: item.make
    }))
  };
};

// Vehicle Models
export interface VehicleModel {
  id: string;
  label: string;
  model: string;
}

export const useVehicleModels = (make?: string, classId?: string) => {
  const dependencies: Record<string, any> = {};
  if (make) dependencies.make = make;
  if (classId) dependencies.category_id = classId;
  
  const result = useLOV<VehicleModel>('vehicles', 'DISTINCT model as id, model, model as label', {
    dependencies,
    orderBy: 'model'
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      id: item.model,
      label: item.model
    }))
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
  const result = useLOV<Location>('locations', 'id, name, code, type', {
    dependencies: type ? { type } : {},
    searchFields: ['name', 'code']
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.name
    }))
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
  if (locationId) dependencies.location_id = locationId;
  
  const result = useLOV<VehicleOption>('vehicles', 'id, make, model, year, license_plate, status, category_id', {
    dependencies,
    searchFields: vinOrPlate ? ['vin', 'license_plate'] : ['make', 'model', 'license_plate']
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
  const result = useLOV<BusinessUnit>('business_units', 'id, name');
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.name
    }))
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
  const result = useLOV<PaymentTerm>('payment_terms', 'id, name, days');
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.name
    }))
  };
};

// Reservation Types
export interface ReservationType {
  id: string;
  label: string;
  name: string;
}

export const useReservationTypes = () => {
  const result = useLOV<ReservationType>('reservation_types', 'id, name');
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.name
    }))
  };
};
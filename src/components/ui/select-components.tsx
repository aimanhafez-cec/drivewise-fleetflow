import React from 'react';
import { LOVSelect } from './lov-select';
import { 
  useCustomers, 
  useCustomerById,
  useVehicleClasses,
  useVehicleMakes,
  useVehicleModels,
  useLocations,
  useVehicleOptions,
  useBusinessUnits,
  usePaymentTerms,
  useReservationTypes
} from '@/hooks/useBusinessLOVs';

interface BaseSelectProps {
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  allowClear?: boolean;
  className?: string;
  'data-testid'?: string;
}

// Customer Select
interface CustomerSelectProps extends BaseSelectProps {
  statusFilter?: string;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  statusFilter,
  ...props
}) => {
  const { items, isLoading, updateSearch, fetchNextPage, hasNextPage, isFetchingNextPage } = useCustomers();
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Search customer by name, phone, or email"
      onSearch={updateSearch}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      searchPlaceholder="Search customers..."
    />
  );
};

// Vehicle Class Select
export const VehicleClassSelect: React.FC<BaseSelectProps> = (props) => {
  const { items, isLoading } = useVehicleClasses();
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select vehicle class"
    />
  );
};

// Vehicle Make Select
interface VehicleMakeSelectProps extends BaseSelectProps {
  classId?: string;
}

export const VehicleMakeSelect: React.FC<VehicleMakeSelectProps> = ({
  classId,
  ...props
}) => {
  const { items, isLoading } = useVehicleMakes(classId);
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select make"
    />
  );
};

// Vehicle Model Select
interface VehicleModelSelectProps extends BaseSelectProps {
  make?: string;
  classId?: string;
}

export const VehicleModelSelect: React.FC<VehicleModelSelectProps> = ({
  make,
  classId,
  ...props
}) => {
  const { items, isLoading } = useVehicleModels(make, classId);
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select model"
    />
  );
};

// Location Select
interface LocationSelectProps extends BaseSelectProps {
  type?: string;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  type,
  ...props
}) => {
  const { items, isLoading, updateSearch, fetchNextPage, hasNextPage, isFetchingNextPage } = useLocations(type);
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select location"
      onSearch={updateSearch}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      searchPlaceholder="Search locations..."
    />
  );
};

// Vehicle Select (full vehicle with search)
interface VehicleSelectProps extends BaseSelectProps {
  classId?: string;
  make?: string;
  model?: string;
  locationId?: string;
  status?: string;
  vinOrPlateSearch?: string;
}

export const VehicleSelect: React.FC<VehicleSelectProps> = ({
  classId,
  make,
  model,
  locationId,
  status,
  vinOrPlateSearch,
  ...props
}) => {
  const { items, isLoading, updateSearch, fetchNextPage, hasNextPage, isFetchingNextPage } = useVehicleOptions({
    classId,
    make,
    model,
    locationId,
    status,
    vinOrPlate: vinOrPlateSearch
  });
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select vehicle"
      onSearch={updateSearch}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      searchPlaceholder="Search by make, model, or license plate..."
    />
  );
};

// Business Unit Select
export const BusinessUnitSelect: React.FC<BaseSelectProps> = (props) => {
  const { items, isLoading } = useBusinessUnits();
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select business unit"
    />
  );
};

// Payment Terms Select
export const PaymentTermsSelect: React.FC<BaseSelectProps> = (props) => {
  const { items, isLoading } = usePaymentTerms();
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select payment terms"
    />
  );
};

// Reservation Type Select
export const ReservationTypeSelect: React.FC<BaseSelectProps> = (props) => {
  const { items, isLoading } = useReservationTypes();
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder="Select reservation type"
    />
  );
};
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Quote-specific LOV components
export const OpportunitySelect: React.FC<BaseSelectProps> = (props) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("opportunities")
        .select("*")
        .order("opportunity_no", { ascending: false });

      if (searchQuery) {
        query = query.or(`opportunity_no.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        label: item.opportunity_no,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <LOVSelect
      {...props}
      items={opportunities}
      isLoading={isLoading}
      onSearch={setSearchQuery}
      placeholder={props.placeholder || "Select opportunity..."}
    />
  );
};

export const LegalEntitySelect: React.FC<BaseSelectProps> = (props) => {
  const { data: legalEntities = [], isLoading } = useQuery({
    queryKey: ["legal_entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_entities")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        label: item.name,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <LOVSelect
      {...props}
      items={legalEntities}
      isLoading={isLoading}
      placeholder={props.placeholder || "Select legal entity..."}
    />
  );
};

interface ContactPersonSelectProps extends BaseSelectProps {
  customerId?: string;
}

export const ContactPersonSelect: React.FC<ContactPersonSelectProps> = ({ customerId, ...props }) => {
  const { data: contactPersons = [], isLoading } = useQuery({
    queryKey: ["contact_persons", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("contact_persons")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_primary", { ascending: false })
        .order("full_name");
      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        label: `${item.full_name}${item.position ? ` (${item.position})` : ""}`,
      }));
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <LOVSelect
      {...props}
      items={contactPersons}
      isLoading={isLoading}
      disabled={props.disabled || !customerId}
      placeholder={props.placeholder || "Select contact person..."}
    />
  );
};

export const SalesOfficeSelect: React.FC<BaseSelectProps> = (props) => {
  const { data: salesOffices = [], isLoading } = useQuery({
    queryKey: ["sales_offices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_offices")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        label: item.name,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <LOVSelect
      {...props}
      items={salesOffices}
      isLoading={isLoading}
      placeholder={props.placeholder || "Select sales office..."}
    />
  );
};

interface SalesRepSelectProps extends BaseSelectProps {
  salesOfficeId?: string;
}

export const SalesRepSelect: React.FC<SalesRepSelectProps> = ({ salesOfficeId, ...props }) => {
  const { data: salesReps = [], isLoading } = useQuery({
    queryKey: ["sales_representatives", salesOfficeId],
    queryFn: async () => {
      let query = supabase
        .from("sales_representatives")
        .select("*")
        .eq("is_active", true);

      if (salesOfficeId) {
        query = query.eq("sales_office_id", salesOfficeId);
      }

      query = query.order("full_name");

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        label: `${item.full_name}${item.email ? ` (${item.email})` : ""}`,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <LOVSelect
      {...props}
      items={salesReps}
      isLoading={isLoading}
      disabled={props.disabled || !salesOfficeId}
      placeholder={props.placeholder || "Select sales rep..."}
    />
  );
};
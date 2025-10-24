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
  useReservationTypes,
  useCustomerSites,
  usePriceLists
} from '@/hooks/useBusinessLOVs';
import { useLegalEntities } from '@/hooks/useQuoteLOVs';
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
  customerType?: string;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  statusFilter,
  customerType,
  ...props
}) => {
  const { items, isLoading, updateSearch, fetchNextPage, hasNextPage, isFetchingNextPage } = useCustomers(undefined, customerType);
  
  const filteredItems = statusFilter
    ? items.filter(item => item.status === statusFilter)
    : items;
  
  return (
    <LOVSelect
      {...props}
      items={filteredItems}
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
  const { items, isLoading } = useLegalEntities();

  console.log('🔍 LegalEntitySelect: Received items:', items);
  console.log('🔍 LegalEntitySelect: isLoading:', isLoading);

  return (
    <LOVSelect
      {...props}
      items={items}
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

// Customer Site Select
interface CustomerSiteSelectProps extends BaseSelectProps {
  customerId?: string;
}

export const CustomerSiteSelect: React.FC<CustomerSiteSelectProps> = ({
  customerId,
  ...props
}) => {
  const { items, isLoading } = useCustomerSites(customerId);
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      disabled={props.disabled || !customerId}
      placeholder="Select customer site..."
    />
  );
};

// Price List Select
export const PriceListSelect: React.FC<BaseSelectProps> = (props) => {
  const { items, isLoading } = usePriceLists();
  
  return (
    <LOVSelect
      {...props}
      items={items}
      isLoading={isLoading}
      placeholder={props.placeholder || "Select price list..."}
    />
  );
};

// Tax Level Select (Mock data until table created)
export const TaxLevelSelect: React.FC<BaseSelectProps> = (props) => {
  const mockTaxLevels = [
    { id: 'vat-5', label: 'UAE VAT (5%)' },
    { id: 'vat-0', label: 'Zero Rated (0%)' },
    { id: 'exempt', label: 'VAT Exempt' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockTaxLevels}
      isLoading={false}
      placeholder={props.placeholder || "Select tax level..."}
    />
  );
};

// Tax Code Select (Mock data until table created)
interface TaxCodeSelectProps extends BaseSelectProps {
  taxLevelId?: string;
}

export const TaxCodeSelect: React.FC<TaxCodeSelectProps> = ({ taxLevelId, ...props }) => {
  const mockTaxCodes = taxLevelId === 'vat-5' ? [
    { id: 'std-rate', label: 'S - Standard Rate' },
    { id: 'reduced', label: 'R - Reduced Rate' },
  ] : taxLevelId === 'vat-0' ? [
    { id: 'zero-rated', label: 'Z - Zero Rated' },
  ] : [
    { id: 'exempt', label: 'E - Exempt' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockTaxCodes}
      isLoading={false}
      disabled={props.disabled || !taxLevelId}
      placeholder={props.placeholder || "Select tax code..."}
    />
  );
};

// Insurance Level Select (Mock data until table created)
export const InsuranceLevelSelect: React.FC<BaseSelectProps> = (props) => {
  const mockInsuranceLevels = [
    { id: 'comprehensive', label: 'Comprehensive' },
    { id: 'third-party', label: 'Third Party' },
    { id: 'tpl-fire-theft', label: 'TPL + Fire & Theft' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockInsuranceLevels}
      isLoading={false}
      placeholder={props.placeholder || "Select insurance level..."}
    />
  );
};

// Insurance Group Select (Mock data until table created)
export const InsuranceGroupSelect: React.FC<BaseSelectProps> = (props) => {
  const mockInsuranceGroups = [
    { id: 'group-a', label: 'Group A - Sedan' },
    { id: 'group-b', label: 'Group B - SUV' },
    { id: 'group-c', label: 'Group C - Luxury' },
    { id: 'group-d', label: 'Group D - Sports' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockInsuranceGroups}
      isLoading={false}
      placeholder={props.placeholder || "Select insurance group..."}
    />
  );
};

// Insurance Provider Select (Mock data until table created)
export const InsuranceProviderSelect: React.FC<BaseSelectProps> = (props) => {
  const mockInsuranceProviders = [
    { id: 'provider-1', label: 'AXA Insurance' },
    { id: 'provider-2', label: 'Oman Insurance' },
    { id: 'provider-3', label: 'Dubai Insurance' },
    { id: 'provider-4', label: 'Orient Insurance' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockInsuranceProviders}
      isLoading={false}
      placeholder={props.placeholder || "Select insurance provider..."}
    />
  );
};

// Discount Type Select (Mock data until table created)
export const DiscountTypeSelect: React.FC<BaseSelectProps> = (props) => {
  const mockDiscountTypes = [
    { id: 'percentage', label: 'Percentage Discount (%)' },
    { id: 'fixed-amount', label: 'Fixed Amount (AED)' },
    { id: 'corporate', label: 'Corporate Rate' },
    { id: 'seasonal', label: 'Seasonal Promotion' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockDiscountTypes}
      isLoading={false}
      placeholder={props.placeholder || "Select discount type..."}
    />
  );
};

// Reservation Method Select (Mock data until table created)
export const ReservationMethodSelect: React.FC<BaseSelectProps> = (props) => {
  const mockReservationMethods = [
    { id: 'walk-in', label: 'Walk-in' },
    { id: 'phone', label: 'Phone Call' },
    { id: 'email', label: 'Email' },
    { id: 'website', label: 'Website' },
    { id: 'mobile-app', label: 'Mobile App' },
    { id: 'agent', label: 'Travel Agent' },
  ];

  return (
    <LOVSelect
      {...props}
      items={mockReservationMethods}
      isLoading={false}
      placeholder={props.placeholder || "Select reservation method..."}
    />
  );
};
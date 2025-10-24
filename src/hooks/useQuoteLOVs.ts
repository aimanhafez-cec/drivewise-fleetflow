import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Opportunity {
  id: string;
  opportunity_no: string;
  customer_id: string;
  status: string;
  notes_assumptions?: string;
  label?: string;
}

export interface OpportunityPackage {
  id: string;
  opportunity_id: string;
  package_name: string;
  description?: string;
  qty: number;
  uom: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  legal_entity_id?: string;
  is_active: boolean;
  label?: string;
}

export interface ContactPerson {
  id: string;
  customer_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  is_primary: boolean;
  label?: string;
}

export interface SalesOffice {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  label?: string;
}

export interface SalesRep {
  id: string;
  full_name: string;
  email?: string;
  sales_office_id?: string;
  is_active: boolean;
  label?: string;
}

export interface LegalEntity {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  label: string;
}

// Hook to fetch opportunities
export const useOpportunities = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["opportunities", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("opportunities")
        .select("*")
        .order("opportunity_no", { ascending: false });

      if (searchQuery) {
        query = query.or(`opportunity_no.ilike.%${searchQuery}%,notes_assumptions.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        label: `${item.opportunity_no}`,
      })) as Opportunity[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch opportunity by ID
export const useOpportunityById = (id?: string) => {
  return useQuery({
    queryKey: ["opportunity", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Opportunity;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch opportunity packages
export const useOpportunityPackages = (opportunityId?: string) => {
  return useQuery({
    queryKey: ["opportunity_packages", opportunityId],
    queryFn: async () => {
      if (!opportunityId) return [];
      const { data, error } = await supabase
        .from("opportunity_packages")
        .select("*")
        .eq("opportunity_id", opportunityId)
        .order("package_name");
      if (error) throw error;
      return data as OpportunityPackage[];
    },
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch business units
export const useBusinessUnits = () => {
  return useQuery({
    queryKey: ["business_units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_units")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        label: item.name,
      })) as BusinessUnit[];
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook to fetch contact persons for a customer
export const useContactPersons = (customerId?: string) => {
  return useQuery({
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
        ...item,
        label: `${item.full_name}${item.position ? ` (${item.position})` : ""}`,
      })) as ContactPerson[];
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch sales offices
export const useSalesOffices = () => {
  return useQuery({
    queryKey: ["sales_offices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_offices")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        label: item.name,
      })) as SalesOffice[];
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook to fetch sales representatives, optionally filtered by office
export const useSalesReps = (salesOfficeId?: string) => {
  return useQuery({
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
        ...item,
        label: `${item.full_name}${item.email ? ` (${item.email})` : ""}`,
      })) as SalesRep[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch legal entities
export const useLegalEntities = () => {
  const result = useQuery({
    queryKey: ["legal_entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_entities")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        label: item.name,
      })) as LegalEntity[];
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    items: result.data || [],
    isLoading: result.isLoading,
    error: result.error,
  };
};

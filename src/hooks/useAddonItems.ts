import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AddonItem {
  id: string;
  item_code: string;
  item_name: string;
  description: string | null;
  category: string;
  pricing_model: 'monthly' | 'one-time';
  default_unit_price: number;
  currency: string;
  uom: string;
  is_active: boolean;
  display_order: number;
  notes: string | null;
}

export const useAddonItems = () => {
  return useQuery({
    queryKey: ['addon-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addon_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as AddonItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddonItemById = (id?: string) => {
  return useQuery({
    queryKey: ['addon-item', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('addon_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AddonItem;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

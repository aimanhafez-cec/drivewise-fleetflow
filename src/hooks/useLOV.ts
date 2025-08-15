import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LOVItem {
  id: string;
  label: string;
  [key: string]: any;
}

interface LOVOptions {
  pageSize?: number;
  staleTime?: number;
  dependencies?: Record<string, any>;
  searchFields?: string[];
  orderBy?: string;
}

// Generic LOV hook with search, pagination, and caching
export const useLOV = <T extends LOVItem>(
  tableName: string,
  selectFields: string,
  options: LOVOptions = {}
) => {
  const {
    pageSize = 50,
    staleTime = 5 * 60 * 1000, // 5 minutes
    dependencies = {},
    searchFields = ['name'],
    orderBy = 'name'
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const debounceTimeout = useMemo(() => {
    return setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
  }, [searchQuery]);

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => clearTimeout(debounceTimeout);
  }, [debounceTimeout]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: [tableName, debouncedQuery, dependencies],
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select(selectFields)
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1)
        .order(orderBy);

      if (error) throw error;

      return {
        items: (data || []) as unknown as T[],
        nextPage: data && data.length === pageSize ? pageParam + 1 : undefined
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    staleTime,
    enabled: Object.values(dependencies).every(dep => dep !== undefined)
  });

  const items = useMemo(() => {
    return data?.pages.flatMap(page => page.items) || [];
  }, [data]);

  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    items,
    isLoading,
    error,
    searchQuery,
    updateSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  };
};

// Hook to fetch a single item by ID (for hydration)
export const useLOVById = <T extends LOVItem>(
  tableName: string,
  selectFields: string,
  id?: string
) => {
  return useQuery({
    queryKey: [tableName, 'by-id', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select(selectFields)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as T;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};
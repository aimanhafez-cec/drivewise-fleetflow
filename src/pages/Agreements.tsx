import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { AgreementKPIDashboard } from '@/components/agreements/list/AgreementKPIDashboard';
import { AgreementListFilters, AgreementFilters } from '@/components/agreements/list/AgreementListFilters';
import { AgreementListTable } from '@/components/agreements/list/AgreementListTable';
import { AgreementQuickActions } from '@/components/agreements/list/AgreementQuickActions';

const Agreements = () => {
  const [filters, setFilters] = useState<AgreementFilters>({
    search: '',
    status: [],
    agreementDateFrom: undefined,
    agreementDateTo: undefined,
    checkoutDateFrom: undefined,
    checkoutDateTo: undefined,
    returnDateFrom: undefined,
    returnDateTo: undefined,
    paymentStatus: 'all',
    locationType: 'all',
  });

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['agreements:list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreements')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email
          ),
          vehicles (
            make,
            model,
            license_plate
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter agreements based on current filters
  const filteredAgreements = useMemo(() => {
    if (!agreements) return [];

    return agreements.filter(agreement => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          agreement.agreement_no?.toLowerCase().includes(searchLower) ||
          agreement.profiles?.full_name?.toLowerCase().includes(searchLower) ||
          agreement.profiles?.email?.toLowerCase().includes(searchLower) ||
          agreement.vehicles?.license_plate?.toLowerCase().includes(searchLower) ||
          agreement.vehicles?.make?.toLowerCase().includes(searchLower) ||
          agreement.vehicles?.model?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        // Check for overdue status
        const isOverdue = agreement.return_datetime && 
          new Date(agreement.return_datetime) < new Date() && 
          agreement.status === 'active';
        
        if (filters.status.includes('overdue')) {
          if (!isOverdue) return false;
        } else {
          if (!filters.status.includes(agreement.status)) return false;
        }
      }

      // Agreement date filter
      if (filters.agreementDateFrom || filters.agreementDateTo) {
        const agreementDate = new Date(agreement.agreement_date || agreement.checkout_datetime);
        if (filters.agreementDateFrom && agreementDate < filters.agreementDateFrom) return false;
        if (filters.agreementDateTo && agreementDate > filters.agreementDateTo) return false;
      }

      // Checkout date filter
      if (filters.checkoutDateFrom || filters.checkoutDateTo) {
        if (!agreement.checkout_datetime) return false;
        const checkoutDate = new Date(agreement.checkout_datetime);
        if (filters.checkoutDateFrom && checkoutDate < filters.checkoutDateFrom) return false;
        if (filters.checkoutDateTo && checkoutDate > filters.checkoutDateTo) return false;
      }

      // Return date filter
      if (filters.returnDateFrom || filters.returnDateTo) {
        if (!agreement.return_datetime) return false;
        const returnDate = new Date(agreement.return_datetime);
        if (filters.returnDateFrom && returnDate < filters.returnDateFrom) return false;
        if (filters.returnDateTo && returnDate > filters.returnDateTo) return false;
      }

      return true;
    });
  }, [agreements, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      status: [],
      agreementDateFrom: undefined,
      agreementDateTo: undefined,
      checkoutDateFrom: undefined,
      checkoutDateTo: undefined,
      returnDateFrom: undefined,
      returnDateTo: undefined,
      paymentStatus: 'all',
      locationType: 'all',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Agreements Management</h1>
        <p className="text-muted-foreground">
          Comprehensive UAE rental agreement management system
        </p>
      </div>

      {/* KPI Dashboard */}
      <AgreementKPIDashboard agreements={agreements || []} />

      {/* Quick Actions */}
      <AgreementQuickActions />

      {/* Filters */}
      <AgreementListFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* Agreements Table */}
      <AgreementListTable agreements={filteredAgreements} />
    </div>
  );
};

export default Agreements;

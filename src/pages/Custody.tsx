import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { custodyApi } from "@/lib/api/custody";
import { CustodyKPICards } from "@/components/custody/CustodyKPICards";
import { CustodyFilters } from "@/components/custody/CustodyFilters";
import { CustodyTable } from "@/components/custody/CustodyTable";
import type { CustodyFilters as CustodyFiltersType } from "@/lib/api/custody";

export default function Custody() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CustodyFiltersType>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50 });

  // Fetch custody transactions
  const { data: custodyData, isLoading: isLoadingCustody } = useQuery({
    queryKey: ["custody-transactions", filters, pagination],
    queryFn: () => custodyApi.listCustodyTransactions(filters, pagination),
  });

  // Fetch KPIs
  const { data: kpiData, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ["custody-kpis"],
    queryFn: () => custodyApi.getCustodyKPIs(),
  });

  const handleFilterChange = (newFilters: CustodyFiltersType) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  if (isLoadingCustody && !custodyData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles in Custody</h1>
          <p className="text-muted-foreground mt-1">
            Manage replacement vehicles and custody transactions
          </p>
        </div>
        <Button onClick={() => navigate("/custody/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Custody Transaction
        </Button>
      </div>

      {/* KPI Cards */}
      <CustodyKPICards metrics={kpiData} isLoading={isLoadingKPIs} />

      {/* Filters */}
      <CustodyFilters onFilterChange={handleFilterChange} />

      {/* Custody Table */}
      <CustodyTable
        data={custodyData?.data || []}
        isLoading={isLoadingCustody}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalCount: custodyData?.totalCount || 0,
          totalPages: custodyData?.totalPages || 0,
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

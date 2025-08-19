import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, ClipboardCheck, FileText, AlertTriangle } from "lucide-react";
import { InspectionFilters } from "@/components/inspections/InspectionFilters";
import { InspectionsList } from "@/components/inspections/InspectionsList";

interface UnifiedInspection {
  id: string;
  type: 'OUT' | 'IN' | 'LEGACY';
  status: string;
  performed_at: string;
  inspection_date?: string;
  agreement_id?: string;
  vehicle_id?: string;
  location_id?: string;
  agreements?: {
    agreement_no: string;
    vehicle_id: string;
  };
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  reservations?: {
    ro_number: string;
  };
  checklist?: any;
  metrics?: any;
  damage_marker_ids?: string[];
}

const Inspections: React.FC = () => {
  const navigate = useNavigate();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => { 
    document.title = "Inspections | CEC Car Rental"; 
  }, []);

  // Fetch unified inspections from all tables
  const { data: allInspections = [], isLoading } = useQuery({
    queryKey: ["inspections-unified"],
    queryFn: async () => {
      const inspections: UnifiedInspection[] = [];

      // Fetch inspection_out 
      const { data: outData } = await supabase
        .from("inspection_out")
        .select(`
          id, status, performed_at, agreement_id, line_id, location_id, 
          checklist, metrics, damage_marker_ids, created_at, updated_at
        `)
        .order("performed_at", { ascending: false });

      // Fetch inspection_in
      const { data: inData } = await supabase
        .from("inspection_in")
        .select(`
          id, status, performed_at, agreement_id, line_id, location_id, 
          checklist, metrics, damage_marker_ids, created_at, updated_at
        `)
        .order("performed_at", { ascending: false });

      // Combine modern inspections and add type
      const modernInspections = [
        ...(outData?.map(item => ({ ...item, type: 'OUT' as const })) || []),
        ...(inData?.map(item => ({ ...item, type: 'IN' as const })) || [])
      ];

      // Get unique agreement IDs to fetch related data
      const agreementIds = [...new Set(modernInspections.map(i => i.agreement_id).filter(Boolean))];
      
      // Fetch agreement and vehicle data for modern inspections
      let agreementData: any[] = [];
      if (agreementIds.length > 0) {
        const { data } = await supabase
          .from("agreements")
          .select(`
            id, agreement_no
          `)
          .in('id', agreementIds);
        agreementData = data || [];
      }

      // Get unique line IDs to fetch vehicle data
      const lineIds = [...new Set(modernInspections.map(i => i.line_id).filter(Boolean))];
      
      let lineData: any[] = [];
      if (lineIds.length > 0) {
        const { data } = await supabase
          .from("agreement_lines")
          .select(`
            id, agreement_id, vehicle_id
          `)
          .in('id', lineIds);
        lineData = data || [];
      }

      // Get unique vehicle IDs from lines and fetch vehicle data separately
      const vehicleIds = [...new Set(lineData.map(l => l.vehicle_id).filter(Boolean))];
      
      let vehicleData: any[] = [];
      if (vehicleIds.length > 0) {
        const { data } = await supabase
          .from("vehicles")
          .select(`
            id, make, model, year, license_plate
          `)
          .in('id', vehicleIds);
        vehicleData = data || [];
      }

      // Map modern inspections with agreement and vehicle data
      for (const inspection of modernInspections) {
        const agreement = agreementData.find(a => a.id === inspection.agreement_id);
        const agreementLine = lineData.find((l: any) => l.id === inspection.line_id);
        const vehicle = agreementLine?.vehicle_id ? vehicleData.find(v => v.id === agreementLine.vehicle_id) : undefined;
        
        inspections.push({
          ...inspection,
          agreements: agreement ? {
            agreement_no: agreement.agreement_no,
            vehicle_id: agreementLine?.vehicle_id || ''
          } : undefined,
          vehicles: vehicle,
          vehicle_id: agreementLine?.vehicle_id
        });
      }

      // Fetch legacy inspections
      const { data: legacyData } = await supabase
        .from("inspections")
        .select(`
          *,
          vehicles(make, model, year, license_plate),
          reservations(ro_number)
        `)
        .order("inspection_date", { ascending: false });

      if (legacyData) {
        inspections.push(...legacyData.map(item => ({ 
          ...item, 
          type: 'LEGACY' as const,
          performed_at: item.inspection_date 
        })));
      }

      // Sort all inspections by date
      return inspections.sort((a, b) => 
        new Date(b.performed_at || b.inspection_date || 0).getTime() - 
        new Date(a.performed_at || a.inspection_date || 0).getTime()
      );
    },
  });

  // Apply filters
  const filteredInspections = useMemo(() => {
    return allInspections.filter(inspection => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchString = `
          ${inspection.id} 
          ${inspection.agreements?.agreement_no || ''} 
          ${inspection.vehicles?.make || ''} 
          ${inspection.vehicles?.model || ''} 
          ${inspection.vehicles?.license_plate || ''}
          ${inspection.reservations?.ro_number || ''}
        `.toLowerCase();
        
        if (!searchString.includes(query)) return false;
      }

      // Type filter
      if (typeFilter !== "all" && inspection.type !== typeFilter) return false;

      // Status filter  
      if (statusFilter !== "all" && inspection.status !== statusFilter) return false;

      // Date filter
      if (dateFilter !== "all") {
        const inspectionDate = new Date(inspection.performed_at || inspection.inspection_date || '');
        const now = new Date();
        
        switch (dateFilter) {
          case "today":
            if (inspectionDate.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (inspectionDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            if (inspectionDate < monthAgo) return false;
            break;
          case "quarter":
            const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            if (inspectionDate < quarterAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [allInspections, searchQuery, typeFilter, statusFilter, dateFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allInspections.length;
    const locked = allInspections.filter(i => i.status === 'LOCKED').length;
    const drafts = allInspections.filter(i => i.status === 'DRAFT').length;
    const failed = allInspections.filter(i => i.status === 'failed').length;

    return { total, locked, drafts, failed };
  }, [allInspections]);

  const hasActiveFilters = Boolean(searchQuery || typeFilter !== "all" || statusFilter !== "all" || dateFilter !== "all");

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
          <p className="text-muted-foreground">Manage vehicle inspections and quality checks</p>
        </div>
        <Button onClick={() => navigate("/inspections/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Inspection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <ClipboardCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.locked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{stats.drafts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <InspectionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Inspections List */}
      <InspectionsList
        inspections={filteredInspections}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Inspections;

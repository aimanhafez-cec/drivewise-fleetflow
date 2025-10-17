import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, FileText, MoreVertical, Eye, Edit, FileSpreadsheet, Copy, Download, Trash2, DollarSign, FileCheck, Users } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MasterAgreementSearch } from '@/components/master-agreements/MasterAgreementSearch';

type StatusFilter = 'all' | 'draft' | 'active' | 'suspended' | 'expired' | 'terminated';

const MasterAgreements = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchFilters, setSearchFilters] = useState<any>(null);

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['master-agreements:list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_leasing_agreements')
        .select(`
          *,
          legal_entity:legal_entity_id (
            name
          ),
          bill_to_site:bill_to_site_id (
            site_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch customer data from customers table (with fallback to profiles)
      if (data && data.length > 0) {
        const customerIds = data.map(a => a.customer_id).filter(Boolean);
        
        // Try customers table first
        const { data: customers } = await supabase
          .from('customers')
          .select('id, full_name, email')
          .in('id', customerIds);
        
        // Fallback to profiles if needed
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', customerIds);
        
        // Fetch lines data for each agreement
        const agreementIds = data.map(a => a.id);
        const { data: lines } = await supabase
          .from('corporate_leasing_lines')
          .select('agreement_id, qty, monthly_rate_aed, setup_fee_aed')
          .in('agreement_id', agreementIds);
        
        // Calculate totals per agreement
        const agreementTotals = lines?.reduce((acc: any, line: any) => {
          if (!acc[line.agreement_id]) {
            acc[line.agreement_id] = {
              lineCount: 0,
              totalMonthlyValue: 0,
              totalSetupFees: 0
            };
          }
          acc[line.agreement_id].lineCount += 1;
          acc[line.agreement_id].totalMonthlyValue += (line.monthly_rate_aed || 0) * (line.qty || 1);
          acc[line.agreement_id].totalSetupFees += line.setup_fee_aed || 0;
          return acc;
        }, {});
        
        // Merge customer and totals data
        return data.map(agreement => {
          const customer = customers?.find((c: any) => c.id === agreement.customer_id) ||
                          profiles?.find((p: any) => p.id === agreement.customer_id);
          const totals = agreementTotals?.[agreement.id] || { lineCount: 0, totalMonthlyValue: 0, totalSetupFees: 0 };
          
          return {
            ...agreement,
            customer: customer as any,
            lineCount: totals.lineCount,
            monthlyValue: totals.totalMonthlyValue,
            totalSetupFees: totals.totalSetupFees
          };
        }) as any[];
      }
      
      return data as any[];
    },
  });

  // Filter agreements based on status and search
  const filteredAgreements = useMemo(() => {
    if (!agreements) return [];
    
    let filtered = agreements;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    // Apply search filters
    if (searchFilters) {
      if (searchFilters.quickSearch) {
        const search = searchFilters.quickSearch.toLowerCase();
        filtered = filtered.filter(a => 
          a.agreement_no?.toLowerCase().includes(search) ||
          a.customer?.full_name?.toLowerCase().includes(search) ||
          a.customer_po_no?.toLowerCase().includes(search)
        );
      }
      
      if (searchFilters.agreementNo) {
        filtered = filtered.filter(a => 
          a.agreement_no?.toLowerCase().includes(searchFilters.agreementNo.toLowerCase())
        );
      }
      
      if (searchFilters.customerName) {
        filtered = filtered.filter(a => 
          a.customer?.full_name?.toLowerCase().includes(searchFilters.customerName.toLowerCase())
        );
      }
      
      if (searchFilters.status) {
        filtered = filtered.filter(a => a.status === searchFilters.status);
      }
      
      if (searchFilters.legalEntity) {
        filtered = filtered.filter(a => 
          a.legal_entity?.name?.toLowerCase().includes(searchFilters.legalEntity.toLowerCase())
        );
      }
      
      if (searchFilters.billToSite) {
        filtered = filtered.filter(a => 
          a.bill_to_site?.site_name?.toLowerCase().includes(searchFilters.billToSite.toLowerCase())
        );
      }
      
      if (searchFilters.dateFrom) {
        filtered = filtered.filter(a => 
          new Date(a.created_at) >= searchFilters.dateFrom
        );
      }
      
      if (searchFilters.dateTo) {
        filtered = filtered.filter(a => 
          new Date(a.created_at) <= searchFilters.dateTo
        );
      }
    }
    
    return filtered;
  }, [agreements, statusFilter, searchFilters]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!agreements) return { total: 0, active: 0, draft: 0, monthlyValue: 0 };
    
    return {
      total: agreements.length,
      active: agreements.filter(a => a.status === 'active').length,
      draft: agreements.filter(a => a.status === 'draft').length,
      monthlyValue: agreements
        .filter(a => a.status === 'active')
        .reduce((sum, a) => sum + (a.monthlyValue || 0), 0)
    };
  }, [agreements]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'expired':
        return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Master Agreements</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Corporate leasing master agreements and contract lines
          </p>
        </div>
        <Button onClick={() => navigate('/master-agreements/new')} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">New Master Agreement</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agreements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-xs text-muted-foreground">All master agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.active}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.draft}</div>
            <p className="text-xs text-muted-foreground">Pending activation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.monthlyValue)}</div>
            <p className="text-xs text-muted-foreground">Active agreements MRR</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <MasterAgreementSearch
        onSearch={(filters) => setSearchFilters(filters)}
        onReset={() => setSearchFilters(null)}
      />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All ({agreements?.length || 0})
        </Button>
        <Button
          variant={statusFilter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('draft')}
        >
          Draft ({agreements?.filter(a => a.status === 'draft').length || 0})
        </Button>
        <Button
          variant={statusFilter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('active')}
        >
          Active ({agreements?.filter(a => a.status === 'active').length || 0})
        </Button>
        <Button
          variant={statusFilter === 'suspended' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('suspended')}
        >
          Suspended ({agreements?.filter(a => a.status === 'suspended').length || 0})
        </Button>
        <Button
          variant={statusFilter === 'expired' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('expired')}
        >
          Expired ({agreements?.filter(a => a.status === 'expired').length || 0})
        </Button>
        <Button
          variant={statusFilter === 'terminated' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('terminated')}
        >
          Terminated ({agreements?.filter(a => a.status === 'terminated').length || 0})
        </Button>
      </div>

      {/* Master Agreements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Master Agreements ({filteredAgreements?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAgreements && filteredAgreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="min-w-[140px]">Agreement No.</TableHead>
                    <TableHead className="min-w-[180px]">Customer</TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">Legal Entity</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">Vehicles</TableHead>
                    <TableHead className="min-w-[120px] hidden sm:table-cell">Monthly Value</TableHead>
                    <TableHead className="min-w-[140px] hidden md:table-cell">Contract Period</TableHead>
                    <TableHead className="min-w-[100px] hidden 2xl:table-cell">Bill To Site</TableHead>
                    <TableHead className="min-w-[100px] hidden 2xl:table-cell">Created</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements.map((agreement) => (
                    <TableRow 
                      key={agreement.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/master-agreements/${agreement.id}`)}
                    >
                      <TableCell className="font-medium">
                        {agreement.agreement_no || `CLA-${agreement.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {agreement.customer?.full_name || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {agreement.customer?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {agreement.legal_entity?.name || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(agreement.status)}>
                          {getStatusLabel(agreement.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{agreement.lineCount || 0} {agreement.lineCount === 1 ? 'vehicle' : 'vehicles'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="font-medium">{formatCurrency(agreement.monthlyValue || 0)}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {agreement.contract_start_date && agreement.contract_end_date ? (
                            <>
                              <p>
                                {format(new Date(agreement.contract_start_date), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-muted-foreground">
                                → {format(new Date(agreement.contract_end_date), 'MMM dd, yyyy')}
                              </p>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Dates TBD</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden 2xl:table-cell">
                        {agreement.bill_to_site?.site_name || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden 2xl:table-cell">
                        {format(new Date(agreement.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/master-agreements/${agreement.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {agreement.status === 'draft' && (
                              <DropdownMenuItem onClick={() => navigate(`/master-agreements/${agreement.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate(`/master-agreements/${agreement.id}#lines`)}>
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              View Lines
                            </DropdownMenuItem>
                            {agreement.source_quote_id && (
                              <DropdownMenuItem onClick={() => navigate(`/quotes/${agreement.source_quote_id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Source Quote
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            {agreement.status === 'draft' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchFilters || statusFilter !== 'all' 
                  ? 'No matching agreements found' 
                  : 'No master agreements found'
                }
              </h3>
              <p className="text-muted-foreground">
                {searchFilters || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search criteria.'
                  : 'Create your first master agreement to get started.'
                }
              </p>
              {(!searchFilters && statusFilter === 'all') && (
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/master-agreements/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Master Agreement
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterAgreements;

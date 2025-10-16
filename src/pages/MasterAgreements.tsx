import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MasterAgreements = () => {
  const navigate = useNavigate();

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
      
      // Fetch customer data separately
      if (data && data.length > 0) {
        const customerIds = data.map(a => a.customer_id).filter(Boolean);
        const { data: customers } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', customerIds);
        
        // Merge customer data
        return data.map(agreement => ({
          ...agreement,
          customer: customers?.find((c: any) => c.id === agreement.customer_id) as any
        })) as any[];
      }
      
      return data as any[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 font-medium';
      case 'draft':
        return 'text-gray-600';
      case 'suspended':
        return 'text-orange-600 font-medium';
      case 'expired':
        return 'text-gray-400';
      case 'terminated':
        return 'text-red-600 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
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

      {/* Master Agreements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            All Master Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agreements && agreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="min-w-[140px]">Agreement No.</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[120px] hidden sm:table-cell">Legal Entity</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Contract Period</TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">Bill To Site</TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement) => (
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
                      <TableCell className="hidden sm:table-cell">
                        {agreement.legal_entity?.name || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell>
                        <span className={cn("text-sm", getStatusColor(agreement.status))}>
                          {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                        </span>
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
                      <TableCell className="hidden lg:table-cell">
                        {agreement.bill_to_site?.site_name || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
                        {format(new Date(agreement.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No master agreements found</h3>
              <p className="text-muted-foreground">
                Create your first master agreement to get started.
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/master-agreements/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Master Agreement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterAgreements;

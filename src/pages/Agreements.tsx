import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";

const Agreements = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromReservation = searchParams.get('fromReservation');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'pending_return':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isNewAgreement = (agreementId: string) => {
    return fromReservation && new Date().getTime() - new Date().getTime() < 60000; // Within last minute
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agreements</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage rental agreements and contracts
          </p>
        </div>
        <Button onClick={() => navigate('/agreements/new')} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">New Agreement</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Agreements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            All Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agreements && agreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table id="agreements-table" className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="min-w-[120px]">Agreement No.</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[120px] hidden sm:table-cell">Vehicle</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Period</TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">Total Amount</TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">Balance Due</TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {agreements.map((agreement) => (
                  <TableRow 
                    key={agreement.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/agreements/${agreement.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`}
                        {isNewAgreement(agreement.id) && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {agreement.profiles?.full_name || 'Unknown Customer'}
                        </p>
                        <p className="text-sm text-card-foreground">
                          {agreement.profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {agreement.vehicles ? (
                        <div>
                          <p className="font-medium">
                            {agreement.vehicles.make} {agreement.vehicles.model}
                          </p>
                          <p className="text-sm text-card-foreground">
                            {agreement.vehicles.license_plate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-card-foreground">No vehicle assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(agreement.status)}>
                        {agreement.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        {agreement.checkout_datetime && agreement.return_datetime ? (
                          <>
                            <p>
                              {format(new Date(agreement.checkout_datetime), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-card-foreground">
                              → {format(new Date(agreement.return_datetime), 'MMM dd, yyyy')}
                            </p>
                          </>
                        ) : (
                          <span className="text-card-foreground">Dates TBD</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium hidden lg:table-cell">
                      {formatCurrency(agreement.total_amount || 0)}
                    </TableCell>
                    <TableCell className="font-medium text-destructive hidden lg:table-cell">
                      {formatCurrency(agreement.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-sm text-card-foreground hidden xl:table-cell">
                      {format(new Date(agreement.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-card-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No agreements found</h3>
              <p className="text-card-foreground">
                Create your first agreement to get started.
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/agreements/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Agreement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Agreements;
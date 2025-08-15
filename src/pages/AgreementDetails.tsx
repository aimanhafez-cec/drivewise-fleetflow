import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { AgreementActions } from '@/components/agreements/AgreementActions';
import { AgreementLinesTable } from '@/components/agreements/AgreementLinesTable';
import { DamageTab } from '@/components/agreements/DamageTab';
import { TicketsTab } from '@/components/agreements/TicketsTab';

const AgreementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromReservation = searchParams.get('fromReservation');

  const { data: agreement, isLoading, refetch } = useQuery({
    queryKey: ['agreement', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreements')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email,
            phone
          ),
          vehicles (
            make,
            model,
            license_plate,
            year
          ),
          agreement_lines (
            *
          ),
          reservations:reservation_id (
            id,
            start_datetime,
            end_datetime
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-full max-w-sm" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Agreement not found</h3>
        <p className="text-muted-foreground">
          The agreement you're looking for doesn't exist.
        </p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/agreements')}
        >
          Back to Agreements
        </Button>
      </div>
    );
  }

  return (
    <div id="agreement-details-page" className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/agreements">Agreements</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/agreements')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Agreement {agreement.agreement_no || `#${agreement.id.slice(0, 8)}`}
            </h1>
            <p className="text-muted-foreground">
              Created on {format(new Date(agreement.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(agreement.status)}>
            {agreement.status.replace('_', ' ').toUpperCase()}
          </Badge>
          {fromReservation && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/reservations/${fromReservation}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Reservation
            </Button>
          )}
          <AgreementActions 
            agreementId={agreement.id}
            agreementNo={agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`}
          />
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
              <p className="font-medium">
                {agreement.profiles?.full_name || 'Unknown Customer'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{agreement.profiles?.email || 'N/A'}</p>
            </div>
            {agreement.profiles?.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{agreement.profiles.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agreement.vehicles ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    {agreement.vehicles.year} {agreement.vehicles.make} {agreement.vehicles.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">License Plate</p>
                  <p>{agreement.vehicles.license_plate}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No vehicle assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Agreement Date</p>
              <p>{format(new Date(agreement.agreement_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">
                ${agreement.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge className={getStatusColor(agreement.status)}>
                {agreement.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger id="tab-damage" value="damage">Damage</TabsTrigger>
          <TabsTrigger id="tab-tickets" value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <AgreementLinesTable
            agreementId={id!}
            lines={agreement.agreement_lines || []}
            agreementStartDate={new Date(agreement.agreement_date)}
            agreementEndDate={new Date(agreement.return_datetime || agreement.agreement_date)}
            onExchangeComplete={() => {
              // Refresh agreement data after exchange
              refetch();
            }}
          />
        </TabsContent>

        {/* Damage Tab */}
        <TabsContent value="damage">
          <DamageTab 
            agreementId={id!} 
            agreementLines={agreement.agreement_lines || []} 
          />
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <TicketsTab 
            agreementId={id!} 
            customerId={agreement.customer_id}
            agreementLines={agreement.agreement_lines || []} 
          />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No payment records found
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.notes ? (
                <p className="whitespace-pre-wrap">{agreement.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgreementDetails;
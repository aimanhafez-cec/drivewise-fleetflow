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
import { formatCurrency } from "@/lib/utils";

const AgreementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromReservation = searchParams.get('fromReservation');

  const { data: agreement, isLoading, refetch } = useQuery({
    queryKey: ['agreement', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Get agreement with lines
      const { data: agreementData, error: agreementError } = await supabase
        .from('agreements')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email,
            phone
          ),
          agreement_lines (*),
          reservations:reservation_id (
            id,
            start_datetime,
            end_datetime
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (agreementError) throw agreementError;
      if (!agreementData) return null;

      // Get vehicles for the agreement lines
      const vehicleIds = agreementData.agreement_lines
        ?.map(line => line.vehicle_id)
        .filter(Boolean) || [];

      let vehiclesData: any[] = [];
      if (vehicleIds.length > 0) {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, make, model, license_plate, year, color, vin, status')
          .in('id', vehicleIds);
        
        if (vehiclesError) throw vehiclesError;
        vehiclesData = vehicles || [];
      }

      // Merge vehicle data with agreement lines
      const enrichedLines = agreementData.agreement_lines?.map(line => ({
        ...line,
        vehicle: vehiclesData.find(v => v.id === line.vehicle_id) || null
      })) || [];

      return {
        ...agreementData,
        agreement_lines: enrichedLines
      };
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
        <FileText className="h-12 w-12 text-white" />
        <h3 className="mt-4 text-lg font-semibold text-white">Agreement not found</h3>
        <p className="text-white">
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
    <div id="agreement-details-page" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-start space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/agreements')}
            className="p-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">
              Agreement {agreement.agreement_no || `#${agreement.id.slice(0, 8)}`}
            </h1>
            <p className="text-sm sm:text-base text-white/70 mt-1">
              Created on {format(new Date(agreement.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <div className="flex items-center justify-between sm:justify-start space-x-2">
            <Badge className={getStatusColor(agreement.status)}>
              {agreement.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {fromReservation && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/reservations/${fromReservation}`)}
                className="text-xs"
              >
                <Eye className="mr-1 h-3 w-3" />
                <span className="hidden xs:inline">View </span>Reservation
              </Button>
            )}
          </div>
          <div className="w-full sm:w-auto">
            <AgreementActions 
              agreementId={agreement.id}
              agreementNo={agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`}
              agreementStatus={agreement.status}
              agreementLines={agreement.agreement_lines || []}
            />
          </div>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Customer Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-card-foreground">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Customer Name</p>
              <p className="font-medium text-sm sm:text-base text-card-foreground break-words">
                {agreement.profiles?.full_name || 'Unknown Customer'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Email</p>
              <p className="text-sm sm:text-base text-card-foreground break-all">{agreement.profiles?.email || 'N/A'}</p>
            </div>
            {agreement.profiles?.phone && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Phone</p>
                <p className="text-sm sm:text-base text-card-foreground">{agreement.profiles.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-card-foreground">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {(() => {
              const vehicleFromLine = agreement.agreement_lines?.find(line => line.vehicle_id)?.vehicle;
              return vehicleFromLine ? (
                <>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Vehicle</p>
                    <p className="font-medium text-sm sm:text-base text-card-foreground break-words">
                      {vehicleFromLine.year} {vehicleFromLine.make} {vehicleFromLine.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">License Plate</p>
                    <p className="text-sm sm:text-base text-card-foreground font-mono">{vehicleFromLine.license_plate}</p>
                  </div>
                  {vehicleFromLine.color && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Color</p>
                      <p className="text-sm sm:text-base text-card-foreground">{vehicleFromLine.color}</p>
                    </div>
                  )}
                  {vehicleFromLine.vin && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">VIN</p>
                      <p className="font-mono text-xs sm:text-sm text-card-foreground break-all">{vehicleFromLine.vin}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Status</p>
                    <p className="capitalize text-sm sm:text-base text-card-foreground">{vehicleFromLine.status}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm sm:text-base text-card-foreground/70">No vehicle assigned</p>
              );
            })()}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-card-foreground">Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Agreement Date</p>
              <p className="text-sm sm:text-base text-card-foreground">{format(new Date(agreement.agreement_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Total Amount</p>
              <p className="text-lg sm:text-xl font-bold text-card-foreground">
                {formatCurrency(agreement.total_amount || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-card-foreground/70 mb-1">Status</p>
              <Badge className={getStatusColor(agreement.status)}>
                {agreement.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="flex w-max min-w-full sm:w-full">
            <TabsTrigger value="summary" className="flex-1 sm:flex-none">Summary</TabsTrigger>
            <TabsTrigger id="tab-damage" value="damage" className="flex-1 sm:flex-none">Damage</TabsTrigger>
            <TabsTrigger id="tab-tickets" value="tickets" className="flex-1 sm:flex-none">Tickets</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1 sm:flex-none">Payments</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 sm:flex-none">Notes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="space-y-4 sm:space-y-6">
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
              <CardTitle className="text-card-foreground">Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-card-foreground text-center py-8">
                No payment records found
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.notes ? (
                <p className="whitespace-pre-wrap text-card-foreground">{agreement.notes}</p>
              ) : (
                <p className="text-card-foreground">No notes available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgreementDetails;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText, DollarSign } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

const ReservationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            customers (
              full_name,
              email
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching reservation:', error);
          toast({
            title: "Error",
            description: "Failed to load reservation details.",
            variant: "destructive",
          });
          navigate('/reservations');
          return;
        }

        setReservation({
          id: data.id,
          reservationNo: data.ro_number,
          customer: data.customers?.full_name || 'Unknown Customer',
          customerEmail: data.customers?.email || '',
          entryDate: format(new Date(data.created_at), 'yyyy-MM-dd'),
          validityDate: format(new Date(data.end_datetime), 'yyyy-MM-dd'),
          status: data.status.toUpperCase(),
          currency: 'AED',
          businessUnit: 'Main Location',
          paymentTerms: 'Net 30 Days',
          totalAmount: data.total_amount || 0,
          leaseToOwn: false,
        });
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load reservation details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, navigate, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return <div>Reservation not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/reservations">Reservations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{reservation.reservationNo}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/reservations')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reservation {reservation.reservationNo}
            </h1>
            <p className="text-muted-foreground">
              Created on {reservation.entryDate}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(reservation.status)}>
            {reservation.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
              <p className="font-medium">{reservation.customer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{reservation.customerEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reservation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entry Date</p>
              <p>{reservation.entryDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
              <p>{reservation.validityDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Unit</p>
              <p>{reservation.businessUnit}</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Currency</p>
              <p>{reservation.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
              <p>{reservation.paymentTerms}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(reservation.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-semibold">Generate Agreement</h3>
              <p className="text-sm text-muted-foreground">Create rental agreement</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-semibold">Create Invoice</h3>
              <p className="text-sm text-muted-foreground">Generate billing invoice</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <Edit className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-semibold">Modify Reservation</h3>
              <p className="text-sm text-muted-foreground">Update reservation details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservationDetails;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, FileText, Printer, Mail, ExternalLink } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ConvertToAgreementModal } from '@/components/reservation/ConvertToAgreementModal';
import { ReservationInfoCards } from '@/components/reservations/ReservationInfoCards';
import { ReservationPaymentHistory } from '@/components/reservations/ReservationPaymentHistory';
import { ReservationTimeline } from '@/components/reservations/ReservationTimeline';
import { supabase } from '@/integrations/supabase/client';

const ReservationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  
  const [reservationData, setReservationData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  const fetchReservationData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const [reservationResponse, paymentsResponse] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            customers:customer_id (
              full_name,
              email,
              phone
            ),
            vehicles:vehicle_id (
              make,
              model,
              license_plate,
              vin
            ),
            categories:vehicle_class_id (
              name,
              description
            ),
            agreements:converted_agreement_id (
              agreement_no
            )
          `)
          .eq('id', id)
          .single(),
        supabase
          .from('reservation_payments')
          .select('*')
          .eq('reservation_id', id)
          .order('payment_date', { ascending: false })
      ]);

      if (reservationResponse.error) {
        console.error('Error fetching reservation:', reservationResponse.error);
        toast({
          title: "Error",
          description: "Reservation not found.",
          variant: "destructive",
        });
        navigate('/reservations');
        return;
      }

      const data = reservationResponse.data;
      setReservationData(data);
      setPayments(paymentsResponse.data || []);

      // Build timeline events
      const events: any[] = [
        {
          id: 'created',
          type: 'created',
          title: 'Reservation Created',
          description: `Reservation ${data.ro_number} was created`,
          timestamp: data.created_at,
          status: 'info',
        },
      ];

      // Add payment events
      if (paymentsResponse.data) {
        paymentsResponse.data.forEach((payment: any) => {
          events.push({
            id: payment.id,
            type: 'payment',
            title: 'Payment Received',
            description: `${payment.payment_type.replace(/_/g, ' ')} via ${payment.payment_method.replace(/_/g, ' ')}`,
            timestamp: payment.payment_date,
            status: payment.payment_status === 'completed' ? 'success' : 'pending',
            metadata: {
              amount: `${payment.amount} AED`,
              reference: payment.transaction_id || '-',
            },
          });
        });
      }

      // Add conversion event
      if (data.converted_agreement_id && data.agreements) {
        events.push({
          id: 'converted',
          type: 'converted',
          title: 'Converted to Agreement',
          description: `Converted to Agreement ${data.agreements.agreement_no}`,
          timestamp: data.updated_at,
          status: 'success',
        });
      }

      setTimelineEvents(events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));

      // Show creation toast if redirected from new reservation
      if (searchParams.get('created') === '1') {
        toast({
          title: "Reservation Created",
          description: `Reservation ${data.ro_number} has been created successfully.`,
        });
      }

    } catch (error) {
      console.error('Failed to fetch reservation data:', error);
      toast({
        title: "Error",
        description: "Failed to load reservation details.",
        variant: "destructive",
      });
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReservationData();
    }
  }, [id]);

  const handlePrint = () => {
    toast({
      title: "Print",
      description: "Print functionality would be implemented here.",
    });
  };

  const handleEmail = () => {
    toast({
      title: "Email",
      description: "Email functionality would be implemented here.",
    });
  };

  const handleEdit = () => {
    navigate('/reservations/new', { 
      state: { editData: reservationData } 
    });
  };

  const handleConvertToAgreement = () => {
    if (!reservationData) return;
    setConvertModalOpen(true);
  };

  const handleViewAgreement = () => {
    if (reservationData?.converted_agreement_id) {
      navigate(`/agreements/${reservationData.converted_agreement_id}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-emerald-100 text-emerald-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !reservationData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isConvertible = reservationData.status === 'confirmed' && 
    reservationData.down_payment_status === 'paid' && 
    !reservationData.converted_agreement_id;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/reservations">Reservations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{reservationData.ro_number}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/reservations')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {reservationData.ro_number}
                  </h1>
                  <Badge className={getStatusColor(reservationData.status)}>
                    {reservationData.status}
                  </Badge>
                  {reservationData.converted_agreement_id && (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                      <FileText className="h-3 w-3 mr-1" />
                      Converted
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Created on {format(new Date(reservationData.created_at), 'PPP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              {isConvertible && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleConvertToAgreement}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Convert to Agreement
                </Button>
              )}

              {reservationData.converted_agreement_id && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewAgreement}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Agreement
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ReservationInfoCards
            reservation={reservationData}
            customer={reservationData.customers}
            vehicle={reservationData.vehicles}
            vehicleClass={reservationData.categories}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <ReservationPaymentHistory
            payments={payments}
            totalAmount={reservationData.total_amount || 0}
            downPaymentRequired={reservationData.down_payment_amount || 0}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <ReservationTimeline events={timelineEvents} />
        </TabsContent>
      </Tabs>

      {/* Convert to Agreement Modal */}
      {reservationData && (
        <ConvertToAgreementModal
          open={convertModalOpen}
          onOpenChange={setConvertModalOpen}
          reservation={reservationData}
        />
      )}
    </div>
  );
};

export default ReservationDetailsPage;

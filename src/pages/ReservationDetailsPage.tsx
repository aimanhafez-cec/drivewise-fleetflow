import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, FileText, DollarSign, Printer, Mail, Calendar, Building, CreditCard, Clock } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { SummaryCard } from '@/components/reservation/SummaryCard';
import { useReservationSummary } from '@/hooks/useReservationSummary';
import { ConvertToAgreementModal } from '@/components/reservation/ConvertToAgreementModal';
import { AddDepositModal } from '@/components/reservation/AddDepositModal';
import { agreementsApi } from '@/lib/api/agreements';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface ReservationHeader {
  id: string;
  customerId: string;
  reservationNo: string;
  customer: string;
  businessUnit: string;
  customerBillTo: string;
  paymentTerms: string;
  validityDate: string;
  contractBillingPlan: string;
  createdAt: string;
  status: string;
}

interface ReservationLine {
  id: string;
  lineNo: number;
  reservationType: string;
  vehicleClass: string;
  vehicle: string;
  driverName: string;
  checkOutDate: string;
  checkInDate: string;
  lineNetPrice: number;
  additionAmount: number;
  discount: string;
  discountValue: number;
  tax: string;
  taxValue: number;
  lineTotal: number;
}

interface Payment {
  id: string;
  paymentDate: string;
  method: string;
  amount: number;
  reference: string;
  status: string;
}

interface ReservationNotes {
  note: string;
  specialNote: string;
}

const ReservationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [addDepositModalOpen, setAddDepositModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  
  const queryClient = useQueryClient();
  
  const [reservationData, setReservationData] = useState<{
    header: ReservationHeader | null;
    lines: ReservationLine[];
    payments: Payment[];
    notes: ReservationNotes | null;
  }>({
    header: null,
    lines: [],
    payments: [],
    notes: null,
  });

  // Mock data for demonstration
  const mockFormData = {
    reservationLines: reservationData.lines,
    selectedMiscCharges: [],
    promotionCode: '',
    preAdjustment: 0,
    advancePayment: 0,
    cancellationCharges: 0,
    securityDepositPaid: 0,
    discountValue: 0,
  };

  const summary = useReservationSummary(mockFormData);

  const fetchReservationData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const [reservationResponse, paymentsResponse] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            customers (
              full_name,
              email
            )
          `)
          .eq('id', id)
          .single(),
        supabase
          .from('payments')
          .select('*')
          .eq('reservation_id', id)
          .order('processed_at', { ascending: false })
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
      const paymentsData = paymentsResponse.data || [];

      const mockData = {
        header: {
          id: data.id,
          customerId: data.customer_id,
          reservationNo: data.ro_number || 'RES-000000',
          customer: data.customers?.full_name || 'Unknown Customer',
          businessUnit: data.pickup_location || 'Main Location',
          customerBillTo: `${data.customers?.full_name || 'Unknown'} - Personal`,
          paymentTerms: 'Net 30 Days',
          validityDate: format(new Date(data.end_datetime), 'yyyy-MM-dd'),
          contractBillingPlan: 'Standard Plan',
          createdAt: format(new Date(data.created_at), 'yyyy-MM-dd'),
          status: data.status.toUpperCase(),
        },
        lines: [
          {
            id: '1',
            lineNo: 1,
            reservationType: 'Standard',
            vehicleClass: 'Economy',
            vehicle: '2023 Toyota Corolla',
            driverName: 'John Smith',
            checkOutDate: '2024-01-30',
            checkInDate: '2024-02-02',
            lineNetPrice: 300.00,
            additionAmount: 50.00,
            discount: 'Weekend Special',
            discountValue: 30.00,
            tax: 'Sales Tax',
            taxValue: 32.00,
            lineTotal: 352.00,
          },
        ],
        payments: paymentsData.map(payment => ({
          id: payment.id,
          paymentDate: payment.processed_at || payment.created_at,
          method: payment.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          amount: payment.amount,
          reference: payment.transaction_id || '-',
          status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
        })),
        notes: {
          note: 'Customer requested early pickup.',
          specialNote: 'VIP customer - provide excellent service.',
        },
      };

      setReservationData(mockData);

      // Show creation toast if redirected from new reservation
      if (searchParams.get('created') === '1') {
        toast({
          title: "Reservation Created",
          description: `Reservation ${mockData.header.reservationNo} has been created successfully.`,
        });
      }

    } catch (error) {
      console.error('Failed to fetch reservation data:', error);
      toast({
        title: "Error",
        description: "Reservation not found.",
        variant: "destructive",
      });
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  const refreshDeposits = () => {
    fetchReservationData();
  };

  useEffect(() => {
    if (id) {
      fetchReservationData();
    }
  }, [id, navigate, toast, searchParams]);

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

  const handleConvertToAgreement = () => {
    if (!reservationData.header || reservationData.lines.length === 0) {
      toast({
        title: "Cannot Convert",
        description: "Reservation must have at least one line to convert to agreement.",
        variant: "destructive",
      });
      return;
    }
    
    setConvertModalOpen(true);
  };

  const performConversion = async () => {
    if (!reservationData.header || !id) return;

    setConverting(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const result = await agreementsApi.convertReservation(id, {}, idempotencyKey);
      
      toast({
        title: "Agreement Created",
        description: `Agreement ${result.agreementNo} created successfully.`,
      });
      
      // Invalidate cache to refresh lists
      queryClient.invalidateQueries({ queryKey: ['agreements:list'] });
      queryClient.invalidateQueries({ queryKey: ['reservations:open'] });
      
      // Navigate to agreement details
      navigate(`/agreements/${result.agreementId}?fromReservation=${id}`);
      
    } catch (error: any) {
      console.error('Failed to convert reservation:', error);
      toast({
        title: "Conversion Failed", 
        description: error.message || "Could not convert reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
      setConvertModalOpen(false);
    }
  };

  // Check if reservation is convertible
  const isConvertible = reservationData.header && 
    reservationData.lines.length > 0 && 
    reservationData.header.status !== 'COMPLETED';

  if (loading || !reservationData.header) {
    return (
      <div id="reservation-details-page" className="space-y-6">
        {/* Breadcrumbs Skeleton */}
        <Skeleton className="h-4 w-48" />
        
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="reservation-details-page" className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/reservations">Reservations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{reservationData.header.reservationNo}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Card */}
      <Card>
        <CardHeader>
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
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Reservation no. {reservationData.header.reservationNo}
                  </h1>
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    {reservationData.header.reservationNo}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Created on {format(new Date(reservationData.header.createdAt), 'PPP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button id="btn-edit" variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                <Edit className="mr-2 h-4 w-4" />
                {editMode ? 'Save' : 'Edit'}
              </Button>
              <Button 
                id="btn-convert" 
                variant="outline" 
                size="sm" 
                onClick={handleConvertToAgreement}
                disabled={!isConvertible}
              >
                <FileText className="mr-2 h-4 w-4" />
                Convert to Agreement
              </Button>
              <Button id="btn-print" variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button id="btn-email" variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Header Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge id="chip-customer" variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {reservationData.header.customer}
            </Badge>
            <Badge id="chip-business-unit" variant="outline" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {reservationData.header.businessUnit}
            </Badge>
            <Badge id="chip-bill-to" variant="outline" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {reservationData.header.customerBillTo}
            </Badge>
            <Badge id="chip-payment-terms" variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {reservationData.header.paymentTerms}
            </Badge>
            <Badge id="chip-validity" variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Valid until {format(new Date(reservationData.header.validityDate), 'PP')}
            </Badge>
            <Badge id="chip-billing-plan" variant="outline">
              {reservationData.header.contractBillingPlan}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger id="tab-summary" value="summary">Summary</TabsTrigger>
          <TabsTrigger id="tab-deposits" value="deposits">Deposits</TabsTrigger>
          <TabsTrigger id="tab-notes" value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Reservation Lines */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Reservation Lines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div id="grid-reservation-lines">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Line No.</TableHead>
                          <TableHead>Reservation Type</TableHead>
                          <TableHead>Vehicle Class</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Driver Name</TableHead>
                          <TableHead>Check out Date</TableHead>
                          <TableHead>Check In Date</TableHead>
                          <TableHead>Line Net Price</TableHead>
                          <TableHead>Addition Amount</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Discount Value</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead>Tax Value</TableHead>
                          <TableHead>Line Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reservationData.lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>{line.lineNo}</TableCell>
                            <TableCell>{line.reservationType}</TableCell>
                            <TableCell>{line.vehicleClass}</TableCell>
                            <TableCell>{line.vehicle}</TableCell>
                            <TableCell>{line.driverName}</TableCell>
                            <TableCell>{format(new Date(line.checkOutDate), 'PP')}</TableCell>
                            <TableCell>{format(new Date(line.checkInDate), 'PP')}</TableCell>
                            <TableCell>{formatCurrency(line.lineNetPrice)}</TableCell>
                            <TableCell>{formatCurrency(line.additionAmount)}</TableCell>
                            <TableCell>{line.discount}</TableCell>
                            <TableCell>{formatCurrency(line.discountValue)}</TableCell>
                            <TableCell>{line.tax}</TableCell>
                            <TableCell>{formatCurrency(line.taxValue)}</TableCell>
                            <TableCell>{formatCurrency(line.lineTotal)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {reservationData.lines.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                              No reservation lines added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary of Charge */}
            <div className="space-y-6">
              <div id="summary-card" className="sticky top-6">
                <SummaryCard
                  summary={summary}
                  currencyCode="EGP"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Customer Deposits</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAddDepositModalOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add Deposit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservationData.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.paymentDate), 'PP')}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'Completed' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reservationData.payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No deposits recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {reservationData.notes?.note || 'No notes available.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {reservationData.notes?.specialNote || 'No special notes available.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Convert to Agreement Modal */}
      <ConvertToAgreementModal
        open={convertModalOpen}
        onOpenChange={setConvertModalOpen}
        onConfirm={performConversion}
        isConverting={converting}
        reservation={{
          reservationNo: reservationData.header?.reservationNo || '',
          customer: reservationData.header?.customer || '',
          priceList: 'Standard Price List',
          linesCount: reservationData.lines.length,
          checkOutDate: reservationData.lines[0]?.checkOutDate || '',
          checkInDate: reservationData.lines[0]?.checkInDate || '',
          grandTotal: summary.grandTotal,
          advancePaid: summary.advancePaid,
          balanceDue: summary.balanceDue,
        }}
      />

      {/* Add Deposit Modal */}
      {reservationData.header && (
        <AddDepositModal
          open={addDepositModalOpen}
          onOpenChange={setAddDepositModalOpen}
          reservationId={reservationData.header.id}
          customerId={reservationData.header.customerId}
          onDepositAdded={refreshDeposits}
        />
      )}
    </div>
  );
};

export default ReservationDetailsPage;
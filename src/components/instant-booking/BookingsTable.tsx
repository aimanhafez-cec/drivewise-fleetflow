import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Eye, 
  CreditCard, 
  FileText, 
  XCircle,
  Car,
  Package,
  Hash
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import BookingDetailsDrawer from './BookingDetailsDrawer';
import CancelBookingDialog from './CancelBookingDialog';
import VehicleAssignmentDialog from './VehicleAssignmentDialog';

interface BookingsTableProps {
  filters: {
    search: string;
    status: string;
    reservationType: string;
    dateFrom: string;
    dateTo: string;
    location: string;
  };
}

const BookingsTable = ({ filters }: BookingsTableProps) => {
  const navigate = useNavigate();
  
  // Dialog states
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [assignVehicleDialogOpen, setAssignVehicleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    number: string;
    vehicleId: string | null;
    startDate: string;
    endDate: string;
  } | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['instant-bookings', filters],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          customer:customers(full_name, customer_type, phone, email),
          vehicle:vehicles(make, model, year, license_plate)
        `)
        .eq('booking_type', 'INSTANT')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`ro_number.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        const validStatuses = ['pending', 'confirmed', 'checked_out', 'completed', 'cancelled'] as const;
        type ValidStatus = typeof validStatuses[number];
        if (validStatuses.includes(filters.status as ValidStatus)) {
          query = query.eq('status', filters.status as ValidStatus);
        }
      }

      if (filters.dateFrom) {
        query = query.gte('start_datetime', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('end_datetime', filters.dateTo);
      }

      if (filters.location) {
        query = query.eq('pickup_location', filters.location);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'destructive'; className: string }> = {
      pending: { label: 'Pending Payment', variant: 'default', className: 'bg-amber-100 text-amber-800 border-amber-200' },
      confirmed: { label: 'Confirmed', variant: 'default', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      checked_out: { label: 'Active', variant: 'default', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      completed: { label: 'Completed', variant: 'default', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      cancelled: { label: 'Cancelled', variant: 'destructive', className: '' },
    };

    const config = statusConfig[status] || statusConfig.confirmed;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getReservationTypeBadge = (type: any) => {
    // Will be implemented in Phase 3 when reservation_type field is added
    if (!type) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <Package className="h-3 w-3 mr-1" />
          Standard
        </Badge>
      );
    }
    
    const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
      vehicle_class: { label: 'Vehicle Class', icon: Package, color: 'text-[hsl(var(--chart-1))]', bg: 'bg-[hsl(var(--chart-1))]/10' },
      make_model: { label: 'Make + Model', icon: Car, color: 'text-[hsl(var(--chart-2))]', bg: 'bg-[hsl(var(--chart-2))]/10' },
      specific_vin: { label: 'Specific VIN', icon: Hash, color: 'text-[hsl(var(--chart-3))]', bg: 'bg-[hsl(var(--chart-3))]/10' },
    };

    const config = typeConfig[type];
    if (!config) return null;

    const IconComponent = config.icon;
    return (
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getCustomerTypeBadge = (type: string) => {
    return type === 'Company' ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Company
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Person
      </Badge>
    );
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 1) return '1 Day';
    if (days < 7) return `${days} Days`;
    if (days < 30) return `${Math.floor(days / 7)} Week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} Month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Instant Bookings Found
          </h3>
          <p className="text-muted-foreground">
            {filters.search || filters.status !== 'all' || filters.reservationType !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Create your first instant booking to get started.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vehicle / Class</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">
                        {booking.ro_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {booking.customer?.full_name || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.customer?.customer_type && getCustomerTypeBadge(booking.customer.customer_type)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getReservationTypeBadge((booking as any).reservation_type)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {booking.vehicle ? (
                        <>
                          <div className="text-sm font-medium text-foreground">
                            {booking.vehicle.make} {booking.vehicle.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.vehicle.year} • {booking.vehicle.license_plate}
                          </div>
                        </>
                      ) : (booking as any).vehicle_class_name ? (
                        <div className="text-sm text-foreground">
                          {(booking as any).vehicle_class_name}
                        </div>
                      ) : (booking as any).make_model_requested ? (
                        <div className="text-sm text-foreground">
                          {(booking as any).make_model_requested}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Class-based booking</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-foreground">
                        {format(new Date(booking.start_datetime), 'MMM dd')} → {format(new Date(booking.end_datetime), 'MMM dd')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {calculateDuration(booking.start_datetime, booking.end_datetime)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">
                        AED {booking.total_amount?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </div>
                      {!(booking as any).down_payment_paid && (booking as any).down_payment_amount && (
                        <div className="text-xs text-amber-600">
                          Down: AED {(booking as any).down_payment_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking({
                              id: booking.id,
                              number: booking.ro_number,
                              vehicleId: booking.vehicle_id,
                              startDate: booking.start_datetime,
                              endDate: booking.end_datetime,
                            });
                            setDetailsDrawerOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {!booking.vehicle_id && booking.status !== 'cancelled' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking({
                                id: booking.id,
                                number: booking.ro_number,
                                vehicleId: booking.vehicle_id,
                                startDate: booking.start_datetime,
                                endDate: booking.end_datetime,
                              });
                              setAssignVehicleDialogOpen(true);
                            }}
                          >
                            <Car className="h-4 w-4 mr-2" />
                            Assign Vehicle
                          </DropdownMenuItem>
                        )}
                        
                        {booking.converted_agreement_id && (
                          <DropdownMenuItem
                            onClick={() => navigate(`/agreements/${booking.converted_agreement_id}`)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Agreement
                          </DropdownMenuItem>
                        )}
                        
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedBooking({
                                  id: booking.id,
                                  number: booking.ro_number,
                                  vehicleId: booking.vehicle_id,
                                  startDate: booking.start_datetime,
                                  endDate: booking.end_datetime,
                                });
                                setCancelDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Booking
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
      </CardContent>

      {/* Dialogs */}
      <BookingDetailsDrawer
        bookingId={selectedBooking?.id || null}
        open={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedBooking(null);
        }}
      />
      
      <CancelBookingDialog
        bookingId={selectedBooking?.id || null}
        bookingNumber={selectedBooking?.number || null}
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setSelectedBooking(null);
        }}
      />
      
      <VehicleAssignmentDialog
        bookingId={selectedBooking?.id || null}
        bookingNumber={selectedBooking?.number || null}
        currentVehicleId={selectedBooking?.vehicleId || null}
        startDate={selectedBooking?.startDate || null}
        endDate={selectedBooking?.endDate || null}
        open={assignVehicleDialogOpen}
        onClose={() => {
          setAssignVehicleDialogOpen(false);
          setSelectedBooking(null);
        }}
      />
    </Card>
  );
};

export default BookingsTable;

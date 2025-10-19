import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Calendar,
  MapPin,
  Car,
  CreditCard,
  Package,
  Phone,
  Mail,
  FileText,
  Download,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { useNavigate } from 'react-router-dom';

interface BookingDetailsDrawerProps {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
}

const BookingDetailsDrawer = ({ bookingId, open, onClose }: BookingDetailsDrawerProps) => {
  const navigate = useNavigate();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          customer:customers(
            id,
            full_name,
            customer_type,
            phone,
            email,
            credit_limit
          ),
          vehicle:vehicles(
            id,
            make,
            model,
            year,
            license_plate,
            color,
            vin
          ),
          agreement:agreements(
            id,
            agreement_no,
            status
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && open,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending Payment', className: 'bg-amber-100 text-amber-800' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
      checked_out: { label: 'Active', className: 'bg-emerald-100 text-emerald-800' },
      completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Booking Details</span>
            {booking && getStatusBadge(booking.status)}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : booking ? (
          <div className="mt-6 space-y-6">
            {/* Booking Reference */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="text-2xl font-bold text-foreground">{booking.ro_number}</p>
              {booking.auto_approved && (
                <Badge className="bg-emerald-100 text-emerald-800 mt-2">
                  Auto-Approved
                </Badge>
              )}
            </div>

            {/* Customer Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Customer Information</h3>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{booking.customer?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline">{booking.customer?.customer_type}</Badge>
                </div>
                {booking.customer?.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span className="font-medium">{booking.customer.phone}</span>
                    </div>
                  </div>
                )}
                {booking.customer?.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="font-medium text-sm">{booking.customer.email}</span>
                    </div>
                  </div>
                )}
                {booking.customer?.credit_limit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Credit Limit:</span>
                    <span className="font-medium">{formatCurrency(booking.customer.credit_limit)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Rental Period */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Rental Period</h3>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Start:</span>
                  <span className="font-medium">
                    {format(new Date(booking.start_datetime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">End:</span>
                  <span className="font-medium">
                    {format(new Date(booking.end_datetime), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {Math.ceil(
                      (new Date(booking.end_datetime).getTime() -
                        new Date(booking.start_datetime).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Locations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Locations</h3>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pickup:</span>
                  <span className="font-medium">{booking.pickup_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Return:</span>
                  <span className="font-medium">{booking.return_location}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vehicle Details */}
            {booking.vehicle && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Vehicle Details</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle:</span>
                      <span className="font-medium">
                        {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">License Plate:</span>
                      <Badge variant="outline">{booking.vehicle.license_plate}</Badge>
                    </div>
                    {booking.vehicle.color && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Color:</span>
                        <span className="font-medium">{booking.vehicle.color}</span>
                      </div>
                    )}
                    {booking.vehicle.vin && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">VIN:</span>
                        <span className="font-medium text-xs">{booking.vehicle.vin}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Add-ons */}
            {booking.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0 && (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Add-ons & Services</h3>
                  </div>
                  <div className="space-y-1 pl-7">
                    {booking.add_ons.map((addon: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="capitalize">
                          {typeof addon === 'string' ? addon.replace(/_/g, ' ') : String(addon)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Financial Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Financial Information</h3>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">{formatCurrency(booking.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(booking.status)}
                </div>
                {booking.instant_booking_score && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Booking Score:</span>
                    <Badge variant="outline">{booking.instant_booking_score}/100</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Agreement Link */}
            {booking.agreement && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Agreement</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Agreement No:</span>
                      <Button
                        variant="link"
                        className="font-semibold p-0 h-auto"
                        onClick={() => {
                          navigate(`/agreements/${booking.agreement.id}`);
                          onClose();
                        }}
                      >
                        {booking.agreement.agreement_no}
                      </Button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant="outline">{booking.agreement.status}</Badge>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No booking details available
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BookingDetailsDrawer;

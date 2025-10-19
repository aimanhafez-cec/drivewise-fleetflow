import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Calendar,
  MapPin,
  Package,
  Car,
  Hash,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  Mail,
  Trash,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ReservationCardProps {
  reservation: any;
  onConvertToAgreement: (reservation: any) => void;
  onCollectPayment?: (reservation: any) => void;
}

const getReservationTypeIcon = (type?: string) => {
  switch (type) {
    case 'vehicle_class':
      return <Package className="h-3.5 w-3.5" />;
    case 'make_model':
      return <Car className="h-3.5 w-3.5" />;
    case 'specific_vin':
      return <Hash className="h-3.5 w-3.5" />;
    default:
      return <Car className="h-3.5 w-3.5" />;
  }
};

const getReservationTypeLabel = (type?: string) => {
  switch (type) {
    case 'vehicle_class':
      return 'Class';
    case 'make_model':
      return 'Make+Model';
    case 'specific_vin':
      return 'Specific VIN';
    default:
      return 'Standard';
  }
};

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    checked_out: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

const getPaymentStatusColor = (status?: string) => {
  const colors = {
    pending: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    partial: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onConvertToAgreement,
  onCollectPayment,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/reservations/${reservation.id}`);
  };

  return (
    <Card className="border-border/50 hover:shadow-md transition-all group">
      <CardContent className="p-0">
        {/* Header Section */}
        <div
          className="p-4 cursor-pointer bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b"
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    {getReservationTypeIcon(reservation.reservation_type)}
                    {getReservationTypeLabel(reservation.reservation_type)}
                  </Badge>
                  <Badge className={cn('text-xs', getStatusColor(reservation.status))}>
                    {reservation.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-base truncate">
                  {reservation.profiles?.full_name || 'Unknown Customer'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {reservation.profiles?.email || 'No email'}
                </p>
              </div>
            </div>

            {/* Quick Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-50">
                <DropdownMenuItem onClick={handleCardClick}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/reservations/${reservation.id}/edit`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Customer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Cancel Reservation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-4 space-y-3">
          {/* Vehicle/Class Info */}
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">
              {reservation.reservation_type === 'vehicle_class' && reservation.categories?.name
                ? `${reservation.categories.name} Class`
                : reservation.reservation_type === 'make_model' && reservation.make_model
                ? reservation.make_model
                : reservation.vehicles
                ? `${reservation.vehicles.make} ${reservation.vehicles.model}`
                : 'Vehicle TBD'}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {reservation.start_datetime && reservation.end_datetime ? (
                <>
                  {format(new Date(reservation.start_datetime), 'MMM dd, yyyy')} -{' '}
                  {format(new Date(reservation.end_datetime), 'MMM dd, yyyy')}
                </>
              ) : (
                'Dates TBD'
              )}
            </span>
          </div>

          {/* Locations */}
          {(reservation.pickup_location || reservation.return_location) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {reservation.pickup_location || 'TBD'} → {reservation.return_location || 'TBD'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="p-4 bg-muted/30 border-t flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatCurrency(reservation.total_amount || 0)}
              </span>
              {reservation.down_payment_status && (
                <Badge className={cn('text-xs', getPaymentStatusColor(reservation.down_payment_status))}>
                  {reservation.down_payment_status === 'pending' && 'Payment Pending'}
                  {reservation.down_payment_status === 'partial' && 'Partial Payment'}
                  {reservation.down_payment_status === 'paid' && 'Paid'}
                </Badge>
              )}
            </div>
            {reservation.down_payment_amount > 0 && (
              <p className="text-xs text-muted-foreground">
                Down payment: {formatCurrency(reservation.down_payment_amount)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {reservation.down_payment_status === 'pending' && onCollectPayment && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onCollectPayment(reservation);
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Collect Payment
              </Button>
            )}
            {reservation.down_payment_status === 'paid' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConvertToAgreement(reservation);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Convert to Agreement</span>
                <span className="sm:hidden">Convert</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

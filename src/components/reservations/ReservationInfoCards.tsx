import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Car,
  Calendar,
  MapPin,
  Package,
  Hash,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';

interface ReservationInfoCardsProps {
  reservation: any;
  customer?: any;
  vehicle?: any;
  vehicleClass?: any;
}

const getReservationTypeIcon = (type?: string) => {
  switch (type) {
    case 'vehicle_class':
      return <Package className="h-4 w-4" />;
    case 'make_model':
      return <Car className="h-4 w-4" />;
    case 'specific_vin':
      return <Hash className="h-4 w-4" />;
    default:
      return <Car className="h-4 w-4" />;
  }
};

const getReservationTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    vehicle_class: 'By Vehicle Class',
    make_model: 'By Make & Model',
    specific_vin: 'Specific Vehicle (VIN)',
  };
  return labels[type || ''] || 'Standard';
};

export const ReservationInfoCards: React.FC<ReservationInfoCardsProps> = ({
  reservation,
  customer,
  vehicle,
  vehicleClass,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="font-semibold">
                {customer?.full_name || 'Unknown Customer'}
              </p>
            </div>
            {customer?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{customer.email}</p>
              </div>
            )}
            {customer?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{customer.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reservation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reservation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {getReservationTypeIcon(reservation.reservation_type)}
                {getReservationTypeLabel(reservation.reservation_type)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge>{reservation.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="font-semibold">
                {formatCurrency(reservation.total_amount || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle/Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reservation.reservation_type === 'vehicle_class' && vehicleClass && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vehicle Class</p>
                <p className="font-semibold">{vehicleClass.name}</p>
              </div>
              {vehicleClass.description && (
                <p className="text-sm text-muted-foreground">
                  {vehicleClass.description}
                </p>
              )}
            </>
          )}

          {reservation.reservation_type === 'make_model' && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Make & Model</p>
              <p className="font-semibold">{reservation.make_model}</p>
            </div>
          )}

          {reservation.reservation_type === 'specific_vin' && vehicle && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                <p className="font-semibold">
                  {vehicle.make} {vehicle.model}
                </p>
              </div>
              {vehicle.license_plate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">License Plate</p>
                  <p className="font-mono">{vehicle.license_plate}</p>
                </div>
              )}
              {vehicle.vin && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">VIN</p>
                  <p className="font-mono text-sm">{vehicle.vin}</p>
                </div>
              )}
            </>
          )}

          {!vehicle && !vehicleClass && reservation.reservation_type === 'vehicle_class' && (
            <p className="text-sm text-muted-foreground">Vehicle class not specified</p>
          )}
        </CardContent>
      </Card>

      {/* Rental Period & Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rental Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium">Pickup</p>
              </div>
              <p className="text-sm ml-6">
                {format(new Date(reservation.start_datetime), 'PPP p')}
              </p>
              <p className="text-sm text-muted-foreground ml-6">
                {reservation.pickup_location || 'TBD'}
              </p>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium">Return</p>
              </div>
              <p className="text-sm ml-6">
                {format(new Date(reservation.end_datetime), 'PPP p')}
              </p>
              <p className="text-sm text-muted-foreground ml-6">
                {reservation.return_location || 'TBD'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

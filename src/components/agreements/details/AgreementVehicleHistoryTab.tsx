import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AgreementVehicleHistoryTabProps {
  agreement: any;
}

export const AgreementVehicleHistoryTab: React.FC<AgreementVehicleHistoryTabProps> = ({ agreement }) => {
  // Fetch vehicle exchanges
  const { data: exchanges } = useQuery({
    queryKey: ['vehicle-exchanges', agreement.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_exchanges')
        .select('*')
        .eq('agreement_id', agreement.id)
        .order('exchange_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Current Vehicle Assignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Current Vehicle Assignment
              </CardTitle>
              <CardDescription>Currently assigned vehicle for this agreement</CardDescription>
            </div>
            {agreement.status === 'active' && (
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Exchange Vehicle
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {agreement.vehicles ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    {agreement.vehicles.year} {agreement.vehicles.make} {agreement.vehicles.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{agreement.vehicles.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-medium text-xs">{agreement.vehicles.vin || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{agreement.vehicles.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out Date</p>
                  <p className="font-medium">
                    {agreement.checkout_datetime 
                      ? format(new Date(agreement.checkout_datetime), 'MMM dd, yyyy')
                      : 'Not checked out'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out Odometer</p>
                  <p className="font-medium">
                    {agreement.checkout_odometer?.toLocaleString() || 'N/A'} km
                  </p>
                </div>
              </div>

              {agreement.status === 'active' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Vehicle location tracking not enabled</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vehicle assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Exchange History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Vehicle Exchange History
          </CardTitle>
          <CardDescription>Record of vehicle swaps during this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          {exchanges && exchanges.length > 0 ? (
            <div className="space-y-4">
              {exchanges.map((exchange) => (
                <div key={exchange.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">Vehicle Exchange</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(exchange.exchange_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge variant="outline">Exchange #{exchanges.length - exchanges.indexOf(exchange)}</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Returned Vehicle</p>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">
                          Old Vehicle ID: {exchange.old_vehicle_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Previous vehicle
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          <p>Odometer: {exchange.odometer_in_old?.toLocaleString()} km</p>
                          <p>Fuel: {exchange.fuel_in_old}/8</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">New Vehicle</p>
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="font-medium">
                          New Vehicle ID: {exchange.new_vehicle_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Replacement vehicle
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          <p>Odometer: {exchange.odometer_out_new?.toLocaleString()} km</p>
                          <p>Fuel: {exchange.fuel_out_new}/8</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {exchange.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">{exchange.notes}</p>
                    </div>
                  )}

                  {exchange.allocation_rationale && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground">Reason:</p>
                      <p className="text-sm">{exchange.allocation_rationale}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vehicle exchanges recorded</p>
              <p className="text-sm mt-2">Vehicle exchange history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Maintenance & Service Records
          </CardTitle>
          <CardDescription>Work orders and maintenance during this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No maintenance records</p>
            <p className="text-sm mt-2">Service records will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

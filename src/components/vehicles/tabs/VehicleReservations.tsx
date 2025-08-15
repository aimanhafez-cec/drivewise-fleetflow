import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleReservationsProps {
  vehicleId: string;
}

const statusColors = {
  pending: "secondary",
  confirmed: "default", 
  cancelled: "destructive",
  completed: "outline"
} as const;

export function VehicleReservations({ vehicleId }: VehicleReservationsProps) {
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['vehicle-reservations', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          customers (
            full_name,
            email
          )
        `)
        .eq('vehicle_id', vehicleId)
        .order('start_datetime', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: agreements, isLoading: agreementsLoading } = useQuery({
    queryKey: ['vehicle-agreements', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreements')
        .select(`
          *,
          customers (
            full_name,
            email
          )
        `)
        .eq('vehicle_id', vehicleId)
        .order('agreement_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading || agreementsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations && reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{(reservation.customers as any)?.full_name}</h4>
                    <Badge variant={statusColors[reservation.status as keyof typeof statusColors]}>
                      {reservation.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>
                      <p>Start</p>
                      <p className="font-medium">
                        {format(new Date(reservation.start_datetime), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p>End</p>
                      <p className="font-medium">
                        {format(new Date(reservation.end_datetime), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p>Pickup</p>
                      <p className="font-medium">{reservation.pickup_location}</p>
                    </div>
                    <div>
                      <p>Total</p>
                      <p className="font-medium">${reservation.total_amount || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reservations found</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Agreements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          {agreements && agreements.length > 0 ? (
            <div className="space-y-4">
              {agreements.slice(0, 5).map((agreement) => (
                <div key={agreement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{(agreement.customers as any)?.full_name}</h4>
                    <Badge variant={statusColors[agreement.status as keyof typeof statusColors] || "default"}>
                      {agreement.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>
                      <p>Agreement Date</p>
                      <p className="font-medium">
                        {format(new Date(agreement.agreement_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p>Checkout</p>
                      <p className="font-medium">
                        {agreement.checkout_datetime 
                          ? format(new Date(agreement.checkout_datetime), 'MMM dd, yyyy')
                          : 'Not checked out'
                        }
                      </p>
                    </div>
                    <div>
                      <p>Return</p>
                      <p className="font-medium">
                        {agreement.return_datetime 
                          ? format(new Date(agreement.return_datetime), 'MMM dd, yyyy')
                          : 'Not returned'
                        }
                      </p>
                    </div>
                    <div>
                      <p>Total</p>
                      <p className="font-medium">${agreement.total_amount || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No agreements found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
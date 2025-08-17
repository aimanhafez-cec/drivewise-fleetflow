import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Car, Wrench } from "lucide-react";

interface VehicleDamageHistoryProps {
  vehicleId: string;
}

const severityColors = {
  minor: "secondary",
  moderate: "default",
  major: "destructive"
} as const;

const repairStatusColors = {
  pending: "secondary",
  in_progress: "default", 
  completed: "outline",
  cancelled: "destructive"
} as const;

export function VehicleDamageHistory({ vehicleId }: VehicleDamageHistoryProps) {
  const { data: damageRecords, isLoading } = useQuery({
    queryKey: ['vehicle-damage', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_records')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">
                  {damageRecords?.filter(r => r.severity === 'major').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Major Damage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {damageRecords?.filter(r => r.repair_status === 'pending').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending Repairs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">
                  ${damageRecords?.reduce((sum, r) => sum + (Number(r.repair_cost) || 0), 0).toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-muted-foreground">Total Repair Costs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Damage Records */}
      <Card>
        <CardHeader>
          <CardTitle>Damage Records</CardTitle>
        </CardHeader>
        <CardContent>
          {damageRecords && damageRecords.length > 0 ? (
            <div className="space-y-4">
              {damageRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{record.damage_type}</h4>
                      <Badge variant={severityColors[record.severity as keyof typeof severityColors] || "default"}>
                        {record.severity || 'Unknown'}
                      </Badge>
                    </div>
                    <Badge variant={repairStatusColors[record.repair_status as keyof typeof repairStatusColors] || "default"}>
                      {record.repair_status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{record.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{record.location_on_vehicle || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recorded</p>
                      <p className="font-medium">
                        {format(new Date(record.recorded_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Repair Cost</p>
                      <p className="font-medium">
                        {record.repair_cost ? `AED ${Number(record.repair_cost).toFixed(2)}` : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Photos</p>
                      <p className="font-medium">
                        {record.photos ? record.photos.length : 0} photos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No damage records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
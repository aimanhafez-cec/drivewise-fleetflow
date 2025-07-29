import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleGeneralInfo } from "@/components/vehicles/tabs/VehicleGeneralInfo";
import { VehicleOwnership } from "@/components/vehicles/tabs/VehicleOwnership";
import { VehicleReservations } from "@/components/vehicles/tabs/VehicleReservations";
import { VehicleDamageHistory } from "@/components/vehicles/tabs/VehicleDamageHistory";
import { VehicleExpenses } from "@/components/vehicles/tabs/VehicleExpenses";
import { VehicleDocuments } from "@/components/vehicles/tabs/VehicleDocuments";
import { VehicleTasks } from "@/components/vehicles/tabs/VehicleTasks";

const statusColors = {
  available: "default",
  rented: "destructive", 
  maintenance: "secondary",
  out_of_service: "outline"
} as const;

const statusLabels = {
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance", 
  out_of_service: "Out of Service"
} as const;

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          categories (
            id,
            name,
            icon
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicles
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Vehicle not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicles
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">{vehicle.license_plate}</p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Vehicle
        </Button>
      </div>

      {/* Quick Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statusColors[vehicle.status as keyof typeof statusColors]}>
                {statusLabels[vehicle.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{vehicle.categories?.name || 'Uncategorized'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Odometer</p>
              <p className="font-medium">{vehicle.odometer?.toLocaleString() || 0} km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fuel Level</p>
              <p className="font-medium">{vehicle.fuel_level || 100}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="damage">Damage History</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <VehicleGeneralInfo vehicle={vehicle} />
        </TabsContent>

        <TabsContent value="ownership">
          <VehicleOwnership vehicle={vehicle} />
        </TabsContent>

        <TabsContent value="reservations">
          <VehicleReservations vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="damage">
          <VehicleDamageHistory vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="expenses">
          <VehicleExpenses vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="documents">
          <VehicleDocuments vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <VehicleTasks vehicleId={vehicle.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
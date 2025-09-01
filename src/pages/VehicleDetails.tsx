import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MouseEvent, useState } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  DollarSign, 
  Plus, 
  Car,
  Fuel,
  MapPin,
  FileText,
  Wrench,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import VehicleForm from '@/components/vehicles/VehicleForm';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  odometer: number;
  fuel_level: number;
  location: string;
  transmission: string;
  engine_size: string;
  features: string[];
  category_id: string;
  subtype: string;
  ownership_type: string;
  categories?: {
    name: string;
    icon: string;
  };
}

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch vehicle statistics
  const { data: stats } = useQuery({
    queryKey: ['vehicle-stats', id],
    queryFn: async () => {
      if (!id) return null;

      const [reservationsResult, agreementsResult, damageResult] = await Promise.all([
        supabase.from('reservations').select('status, total_amount').eq('vehicle_id', id),
        supabase.from('agreements').select('status, total_amount').eq('vehicle_id', id),
        supabase.from('damage_records').select('repair_cost, repair_status').eq('vehicle_id', id)
      ]);

      const reservations = reservationsResult.data || [];
      const agreements = agreementsResult.data || [];
      const damages = damageResult.data || [];

      return {
        totalRevenue: agreements.reduce((sum, a) => sum + (a.total_amount || 0), 0),
        totalReservations: reservations.length,
        activeReservations: reservations.filter(r => r.status === 'confirmed').length,
        totalAgreements: agreements.length,
        activeAgreements: agreements.filter(a => a.status === 'active').length,
        completedAgreements: agreements.filter(a => a.status === 'completed').length,
        damageCount: damages.length,
        repairCosts: damages.reduce((sum, d) => sum + (d.repair_cost || 0), 0),
        pendingRepairs: damages.filter(d => d.repair_status === 'pending').length,
      };
    },
    enabled: !!id,
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { label: 'Available', color: 'bg-green-500 text-white' };
      case 'rented':
        return { label: 'On Rent', color: 'bg-orange-500 text-white' };
      case 'maintenance':
        return { label: 'In Service', color: 'bg-blue-500 text-white' };
      case 'out_of_service':
        return { label: 'Out of Service', color: 'bg-red-500 text-white' };
      default:
        return { label: status, color: 'bg-gray-500 text-white' };
    }
  };

  const getFuelLevelInfo = (fuel_level: number) => {
    switch (fuel_level) {
      case 100:
        return { label: 'Full', color: 'bg-green-500 text-white' };
      case 75:
        return { label: '3/4', color: 'bg-blue-500 text-white' };
      case 50:
        return { label: '2/4', color: 'bg-orange-500 text-white' };
      case 25:
        return { label: '1/4', color: 'bg-red-500 text-white' };
      default:
        return { label: fuel_level, color: 'bg-gray-500 text-white' };
    }
  };
  
  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
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
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/vehicles')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
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

  const summaryStats = [
    { label: 'Total Revenue', value: `AED ${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-emerald-500' },
    { label: 'Total Reservations', value: stats?.totalReservations || 0, color: 'text-blue-500' },
    { label: 'Active Reservations', value: stats?.activeReservations || 0, color: 'text-blue-500' },
    { label: 'Total Agreements', value: stats?.totalAgreements || 0, color: 'text-purple-500' },
    { label: 'Active Agreements', value: stats?.activeAgreements || 0, color: 'text-purple-500' },
    { label: 'Completed Agreements', value: stats?.completedAgreements || 0, color: 'text-green-500' },
    { label: 'Damage Records', value: stats?.damageCount || 0, color: 'text-red-500' },
    { label: 'Repair Costs', value: `AED ${(stats?.repairCosts || 0).toLocaleString()}`, color: 'text-red-500' },
    { label: 'Pending Repairs', value: stats?.pendingRepairs || 0, color: 'text-orange-500' },
    { label: 'Odometer Reading', value: `${(vehicle.odometer || 0).toLocaleString()} km`, color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/vehicles')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Vehicle Card</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{vehicle.license_plate}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={getStatusInfo(vehicle.status).color}
                >
                  {getStatusInfo(vehicle.status).label}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
            </DialogHeader>
            <VehicleForm
              vehicle={selectedVehicle}
              onSuccess={handleFormClose}
            />
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-900 text-white hover:bg-blue-800"
            onClick={() => handleEdit(vehicle)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Reserve
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Agreement
          </Button>
        </div>
      </div>

      {/* Vehicle Information Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-4">
            <div>
              <Label className="text-sm font-medium text-card-foreground">Make</Label>
              <Input value={vehicle.make} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Model</Label>
              <Input value={vehicle.model} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Year</Label>
              <Input value={vehicle.year} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">License Plate</Label>
              <Input value={vehicle.license_plate} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">VIN</Label>
              <Input value={vehicle.vin} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Color</Label>
              <Input value={vehicle.color || 'Not specified'} readOnly className="mt-1 text-muted-foreground" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <Label className="text-sm font-medium text-card-foreground">Transmission</Label>
              <Input value={vehicle.transmission || 'Not specified'} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Engine Size</Label>
              <Input value={vehicle.engine_size || 'Not specified'} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Fuel Level</Label>
              <Input value={getFuelLevelInfo(vehicle.fuel_level).label} readOnly className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-card-foreground">Location</Label>
              <Input value={vehicle.location || 'Not specified'} readOnly className="mt-1 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="inline-flex w-full overflow-x-auto">
          <TabsTrigger value="summary" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white whitespace-nowrap">
            Summary
          </TabsTrigger>
          <TabsTrigger value="reservations" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Reservations
          </TabsTrigger>
          <TabsTrigger value="damages" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Damages
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="track" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Track
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Documents
          </TabsTrigger>
          <TabsTrigger value="agreement-track" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Agreement Track
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap">
            History
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Vehicle Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Technical Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Car className="h-5 w-5 text-emerald-500" />
                      Technical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Make</Label>
                        <Input value={vehicle.make} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Model</Label>
                        <Input value={vehicle.model} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Year</Label>
                        <Input value={vehicle.year} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">VIN</Label>
                        <Input value={vehicle.vin} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">License Plate</Label>
                        <Input value={vehicle.license_plate} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Color</Label>
                        <Input value={vehicle.color || 'Not specified'} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Fuel className="h-5 w-5 text-emerald-500" />
                      Current Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Status</Label>
                        <div className="mt-1 text-muted-foreground">
                          <Badge className={getStatusInfo(vehicle.status).color}>
                            {getStatusInfo(vehicle.status).label}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Fuel Level </Label>
                        <Badge className={getFuelLevelInfo(vehicle.fuel_level).color}>
                          {getFuelLevelInfo(vehicle.fuel_level).label}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Odometer</Label>
                        <Input value={`${(vehicle.odometer || 0).toLocaleString()} km`} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Location</Label>
                        <Input value={vehicle.location || 'Not specified'} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Category</Label>
                        <Input value={vehicle.categories?.name || 'Uncategorized'} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary Statistics */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      Summary Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summaryStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="text-sm text-card-foreground">{stat.label}</span>
                        <span className={`text-sm font-medium ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Track Tab */}
          <TabsContent value="track">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="default" className="bg-cyan-400 hover:bg-cyan-500">
                  Vehicle Track
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="text-white">Employee ↕</TableHead>
                      <TableHead className="text-white">Note ↕</TableHead>
                      <TableHead className="text-white">Pick Up Date & Time ↕</TableHead>
                      <TableHead className="text-white">Drop Off Date & Time ↕</TableHead>
                      <TableHead className="text-white">Odometer-Out ↕</TableHead>
                      <TableHead className="text-white">Fuel-Out ↕</TableHead>
                      <TableHead className="text-white">Odometer-In ↕</TableHead>
                      <TableHead className="text-white">Fuel-In ↕</TableHead>
                      <TableHead className="text-white">Status ↕</TableHead>
                      <TableHead className="text-white">Actions ↕</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-card text-card-foreground">
                    <TableRow>
                      <TableCell>System User</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{vehicle.odometer || 0}</TableCell>
                      <TableCell>{getFuelLevelInfo(vehicle.fuel_level).label}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{getStatusInfo(vehicle.status).label}</TableCell>
                      <TableCell>...</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs */}
          <TabsContent value="reservations">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle reservations will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="damages">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle damage history will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle maintenance records will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle expenses will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle documents will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agreement-track">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Agreement tracking will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle tasks will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-6">
                <p className="text-card-foreground">Vehicle history will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
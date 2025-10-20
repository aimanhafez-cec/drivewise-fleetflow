import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, Filter } from 'lucide-react';
import { useVehiclesByStatus, useStatusCounts, useVehiclesNeedingAttention } from '@/hooks/useVehicleStatus';
import { VehicleWithStatus } from '@/lib/api/vehicle-status';
import VehicleCard from './components/VehicleCard';
import VehicleHistoryDialog from './components/VehicleHistoryDialog';
import ChangeStatusDialog from './components/ChangeStatusDialog';

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', textColor: 'text-green-700' },
  reserved: { label: 'Reserved', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  rented: { label: 'On Rent', color: 'bg-blue-500', textColor: 'text-blue-700' },
  under_maintenance: { label: 'Maintenance', color: 'bg-purple-500', textColor: 'text-purple-700' },
  accident_repair: { label: 'Accident Repair', color: 'bg-orange-500', textColor: 'text-orange-700' },
  registration_pending: { label: 'Registration Pending', color: 'bg-amber-500', textColor: 'text-amber-700' },
  internal_use: { label: 'Internal Use', color: 'bg-indigo-500', textColor: 'text-indigo-700' },
  sold: { label: 'Sold', color: 'bg-gray-500', textColor: 'text-gray-700' },
  de_fleeted: { label: 'De-fleeted', color: 'bg-red-500', textColor: 'text-red-700' },
};

const VehicleStatusBoard: React.FC = () => {
  const { data: vehiclesByStatus, isLoading } = useVehiclesByStatus();
  const { data: statusCounts } = useStatusCounts();
  const { data: needingAttention } = useVehiclesNeedingAttention();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithStatus | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleViewHistory = (vehicle: VehicleWithStatus) => {
    setSelectedVehicle(vehicle);
    setHistoryDialogOpen(true);
  };

  const handleChangeStatus = (vehicle: VehicleWithStatus) => {
    setSelectedVehicle(vehicle);
    setStatusDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading vehicle status board...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Status Board</h1>
          <p className="text-muted-foreground mt-2">
            Real-time overview of fleet operational status
          </p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Attention Required Banner */}
      {needingAttention && needingAttention.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">
                {needingAttention.length} Vehicle(s) Need Attention
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              Service due, insurance expiring, or registration renewal required within 30 days
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Status Counts Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(statusConfig).slice(0, 5).map(([status, config]) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <div className="text-2xl font-bold">
                  {statusCounts?.[status] || 0}
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {config.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Board - Kanban Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(statusConfig).slice(0, 5).map(([status, config]) => {
          const vehicles = vehiclesByStatus?.[status] || [];
          
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <h3 className="font-semibold text-sm">{config.label}</h3>
                </div>
                <Badge variant="secondary">{vehicles.length}</Badge>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {vehicles.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No vehicles
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onViewHistory={handleViewHistory}
                      onChangeStatus={handleChangeStatus}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      {selectedVehicle && (
        <>
          <VehicleHistoryDialog
            vehicle={selectedVehicle}
            open={historyDialogOpen}
            onOpenChange={setHistoryDialogOpen}
          />
          <ChangeStatusDialog
            vehicle={selectedVehicle}
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default VehicleStatusBoard;

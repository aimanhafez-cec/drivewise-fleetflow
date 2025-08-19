import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVehicles } from '@/hooks/useVehicles';
import { formatVehicleDisplay } from '@/hooks/useVehicles';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, CheckCircle } from 'lucide-react';
import Select from "react-select";

interface InspectionVehicleAssignmentProps {
  agreementId: string;
  lineId: string;
  onComplete: (data: { vehicleId: string }) => void;
}

export const InspectionVehicleAssignment: React.FC<InspectionVehicleAssignmentProps> = ({
  agreementId,
  lineId,
  onComplete
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { data: vehicles } = useVehicles();

  // Fetch current agreement line to check existing vehicle assignment
  const { data: agreementLine } = useQuery({
    queryKey: ['agreement-line', lineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agreement_lines')
        .select('vehicle_id')
        .eq('id', lineId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (agreementLine?.vehicle_id) {
      setSelectedVehicleId(agreementLine.vehicle_id);
    }
  }, [agreementLine]);

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleContinue = async () => {
    if (!selectedVehicleId) return;

    // Update agreement line with selected vehicle
    if (selectedVehicleId !== agreementLine?.vehicle_id) {
      const { error } = await supabase
        .from('agreement_lines')
        .update({ vehicle_id: selectedVehicleId })
        .eq('id', lineId);

      if (error) {
        console.error('Failed to update vehicle assignment:', error);
        return;
      }
    }

    onComplete({ vehicleId: selectedVehicleId });
  };

  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);
  const currentVehicle = vehicles?.find(v => v.id === agreementLine?.vehicle_id);

  return (
    <div id="step-assign" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vehicle Assignment</h3>
        <p className="text-muted-foreground">
          Assign a vehicle to this agreement line for the inspection.
        </p>
      </div>

      {currentVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Currently Assigned Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  License: {currentVehicle.license_plate}
                </p>
              </div>
              <Badge variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Assigned
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
          <CardHeader>
            <CardTitle>Select Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              inputId="select-vehicle"
              options={vehicles?.map(vehicle => ({
                value: vehicle.id,
                label: `${formatVehicleDisplay(vehicle)} - ${vehicle.status}`,
              }))}
              value={vehicles?.find(v => v.id === selectedVehicleId) ? {
                value: selectedVehicleId,
                label: `${formatVehicleDisplay(selectedVehicle)} - ${selectedVehicle?.status}`,
              } : null}
              onChange={option => handleVehicleSelect(option?.value || "")}
              placeholder="Choose a vehicle..."
              isClearable
            />

          {selectedVehicle && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Make/Model:</span>
                  <p>{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <p>{selectedVehicle.year}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">License:</span>
                  <p>{selectedVehicle.license_plate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}>
                    {selectedVehicle.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleContinue}
            disabled={!selectedVehicleId}
            className="w-full"
          >
            Continue to Checklist
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
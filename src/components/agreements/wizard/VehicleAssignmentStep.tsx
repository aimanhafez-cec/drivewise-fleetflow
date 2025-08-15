import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VehicleSelector } from '../VehicleSelector';
import { Car, Plus, X } from 'lucide-react';

interface VehicleAssignmentStepProps {
  data: {
    vehicleAssignments: Array<{
      lineId: string;
      vehicle: any | null;
      checkoutLocation: string;
      checkinLocation: string;
    }>;
  };
  agreementLines: any[];
  agreementStartDate: Date;
  agreementEndDate: Date;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const VehicleAssignmentStep: React.FC<VehicleAssignmentStepProps> = ({
  data,
  agreementLines,
  agreementStartDate,
  agreementEndDate,
  onChange,
  errors,
}) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

  const updateAssignment = (lineIndex: number, field: string, value: any) => {
    const updatedAssignments = [...data.vehicleAssignments];
    updatedAssignments[lineIndex] = { 
      ...updatedAssignments[lineIndex], 
      [field]: value 
    };
    onChange({ vehicleAssignments: updatedAssignments });
  };

  const assignVehicle = (lineIndex: number, vehicle: any) => {
    updateAssignment(lineIndex, 'vehicle', vehicle);
    setSelectedLineIndex(null);
  };

  const removeVehicle = (lineIndex: number) => {
    updateAssignment(lineIndex, 'vehicle', null);
  };

  const hasUnassignedLines = data.vehicleAssignments.some(assignment => !assignment.vehicle);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.vehicleAssignments.map((assignment, index) => {
            const line = agreementLines[index];
            const isSelected = selectedLineIndex === index;

            return (
              <Card key={assignment.lineId} className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Agreement Line {index + 1}</h4>
                      <p className="text-sm text-muted-foreground">
                        {line?.check_out_at && line?.check_in_at && (
                          <>
                            {new Date(line.check_out_at).toLocaleDateString()} - {new Date(line.check_in_at).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.vehicle ? (
                        <Badge variant="default">Vehicle Assigned</Badge>
                      ) : (
                        <Badge variant="outline">No Vehicle</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignment.vehicle ? (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">
                            {assignment.vehicle.year} {assignment.vehicle.make} {assignment.vehicle.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.vehicle.license_plate}
                          </div>
                          {assignment.vehicle.categories && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {assignment.vehicle.categories.name}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVehicle(index)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <Car className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-3">No vehicle assigned</p>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedLineIndex(index)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Assign Vehicle
                      </Button>
                    </div>
                  )}

                  {isSelected && !assignment.vehicle && (
                    <div className="border-t pt-4">
                      <VehicleSelector
                        selectedVehicle={null}
                        onVehicleSelect={(vehicle) => {
                          if (vehicle) {
                            assignVehicle(index, vehicle);
                          }
                        }}
                        agreementStartDate={agreementStartDate}
                        agreementEndDate={agreementEndDate}
                        excludeVehicleId={undefined}
                      />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedLineIndex(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {hasUnassignedLines && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Car className="h-4 w-4" />
                <span className="font-medium">Incomplete Vehicle Assignment</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Some agreement lines don't have vehicles assigned. All lines must have vehicles before proceeding.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
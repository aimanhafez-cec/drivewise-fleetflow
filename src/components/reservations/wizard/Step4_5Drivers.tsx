import React, { useState } from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedDriverPicker } from '@/components/reservation/EnhancedDriverPicker';
import { Users, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Step4_5Drivers: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();
  const firstLine = wizardData.reservationLines[0];
  const drivers = firstLine?.drivers || [];

  const handleDriversChange = (selectedDrivers: any[]) => {
    const driverAssignments = selectedDrivers.map((driver, index) => ({
      driverId: driver.id,
      role: index === 0 ? 'PRIMARY' as const : 'ADDITIONAL' as const,
      fee: index > 0 ? 50 : undefined,
    }));

    const updatedLine = {
      ...firstLine,
      drivers: driverAssignments,
    };

    updateWizardData({
      reservationLines: [updatedLine],
    });
  };

  const primaryDriver = drivers.find(d => d.role === 'PRIMARY');
  const additionalDrivers = drivers.filter(d => d.role === 'ADDITIONAL');

  // Convert driver assignments to Driver objects for EnhancedDriverPicker
  const selectedDrivers = drivers.map(d => ({ id: d.driverId } as any));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Driver Information</h2>
        <p className="text-muted-foreground">
          Add drivers for this reservation (at least one primary driver required)
        </p>
      </div>

      {drivers.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please add at least one primary driver to proceed. All drivers must have valid documents.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assigned Drivers
          </CardTitle>
          <CardDescription>
            Manage drivers for this reservation line
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Driver */}
          {primaryDriver && (
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>Primary Driver</Badge>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Driver ID: {primaryDriver.driverId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDriversChange(selectedDrivers.filter(d => d.id !== primaryDriver.driverId))}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Additional Drivers */}
          {additionalDrivers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Additional Drivers</h4>
              {additionalDrivers.map((driver, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Additional Driver</Badge>
                        <span className="text-sm text-muted-foreground">
                          +{driver.fee ? `AED ${driver.fee}` : 'No charge'}
                        </span>
                      </div>
                      <p className="text-sm font-medium">Driver ID: {driver.driverId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDriversChange(selectedDrivers.filter(d => d.id !== driver.driverId))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Driver Picker */}
          <div className="border rounded-lg p-4">
            <EnhancedDriverPicker
              selectedDrivers={selectedDrivers}
              onDriversChange={handleDriversChange}
            />
          </div>

          {/* Driver Fees Summary */}
          {additionalDrivers.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Additional Driver Fees ({additionalDrivers.length} driver{additionalDrivers.length > 1 ? 's' : ''})
                  </span>
                  <span className="font-medium">
                    AED {additionalDrivers.reduce((sum, d) => sum + (d.fee || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          All drivers must have verified Emirates ID, Driving License, and Passport before vehicle handover.
          Additional fees apply for drivers under 25 years old.
        </AlertDescription>
      </Alert>
    </div>
  );
};

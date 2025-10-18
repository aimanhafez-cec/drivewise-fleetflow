import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LOVSelect } from '@/components/ui/lov-select';
import { Plus, AlertTriangle, CheckCircle2, Trash2, Star } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import { useAgreementDrivers, useAssignDriver, useRemoveDriver, useUpdateDriverAssignment } from '@/hooks/useAgreementDrivers';
import { getDriverAgeWarning, getLicenseExpiryWarning } from '@/hooks/useDrivers';

interface MasterAgreementStep5DriversProps {
  data: {
    id?: string;
    agreement_items?: any[];
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep5Drivers: React.FC<MasterAgreementStep5DriversProps> = ({ 
  data, 
  onChange, 
  errors 
}) => {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const { items: drivers, updateSearch } = useDrivers();
  const { data: agreementDrivers = [], isLoading } = useAgreementDrivers(data.id);
  const assignDriverMutation = useAssignDriver();
  const removeDriverMutation = useRemoveDriver();
  const updateDriverMutation = useUpdateDriverAssignment();

  const vehicleLines = data.agreement_items || [];

  // Group drivers by line
  const getDriversForLine = (lineId: string) => {
    return agreementDrivers.filter(ad => ad.line_id === lineId);
  };

  const handleAssignDriver = async () => {
    if (!selectedLineId || !selectedDriverId || !data.id) return;

    const lineDrivers = getDriversForLine(selectedLineId);
    const isPrimary = lineDrivers.length === 0; // First driver becomes primary

    await assignDriverMutation.mutateAsync({
      agreement_id: data.id,
      line_id: selectedLineId,
      driver_id: selectedDriverId,
      is_primary: isPrimary
    });

    setShowAssignDialog(false);
    setSelectedLineId(null);
    setSelectedDriverId(null);
  };

  const handleRemoveDriver = async (assignmentId: string) => {
    if (!data.id) return;
    await removeDriverMutation.mutateAsync({ assignmentId, agreementId: data.id });
  };

  const handleMakePrimary = async (assignmentId: string, lineId: string) => {
    if (!data.id) return;
    
    // First, set all drivers on this line to non-primary
    const lineDrivers = getDriversForLine(lineId);
    for (const ld of lineDrivers) {
      if (ld.id !== assignmentId && ld.is_primary) {
        await updateDriverMutation.mutateAsync({
          assignmentId: ld.id,
          agreementId: data.id,
          updates: { is_primary: false }
        });
      }
    }
    
    // Then make the selected driver primary
    await updateDriverMutation.mutateAsync({
      assignmentId,
      agreementId: data.id,
      updates: { is_primary: true }
    });
  };

  const hasAllDriversAssigned = vehicleLines.every(line => 
    getDriversForLine(line.id).length > 0
  );

  if (!data.id) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please save the agreement as a draft first before assigning drivers.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Authorized Drivers</h2>
        <p className="text-muted-foreground">
          Assign authorized drivers to each vehicle line. At least one driver is required per vehicle before checkout.
        </p>
      </div>

      {/* Status Alert */}
      {vehicleLines.length > 0 && (
        <Alert variant={hasAllDriversAssigned ? 'default' : 'destructive'}>
          <AlertDescription className="flex items-center gap-2">
            {hasAllDriversAssigned ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                All vehicle lines have assigned drivers
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                {vehicleLines.filter(line => getDriversForLine(line.id).length === 0).length} vehicle line(s) need driver assignment
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Driver Assignment Table */}
      {vehicleLines.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Driver Assignments by Vehicle Line</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line #</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Contract No</TableHead>
                  <TableHead>Assigned Drivers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleLines.map((line) => {
                  const lineDrivers = getDriversForLine(line.id);
                  return (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.line_number}</TableCell>
                      <TableCell>
                        {line.vehicle_class_name || line.vehicle_make_model || 'Vehicle TBD'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {line.contract_no || 'TBD'}
                      </TableCell>
                      <TableCell>
                        {lineDrivers.length === 0 ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            No drivers assigned
                          </Badge>
                        ) : (
                          <div className="space-y-2">
                            {lineDrivers.map((ld) => (
                              <div key={ld.id} className="flex items-center gap-2 flex-wrap">
                                {ld.is_primary && (
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                )}
                                <span className="text-sm">
                                  {ld.driver?.full_name} ({ld.driver?.license_no})
                                </span>
                                {ld.is_primary && (
                                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveDriver(ld.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                {!ld.is_primary && lineDrivers.length > 1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMakePrimary(ld.id, line.id)}
                                    className="h-6 text-xs"
                                  >
                                    Make Primary
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLineId(line.id);
                            setShowAssignDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Driver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertDescription>
            No vehicle lines have been added yet. Please add vehicles in Step 4 first.
          </AlertDescription>
        </Alert>
      )}

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver to Vehicle Line</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Driver</label>
              <LOVSelect
                value={selectedDriverId || undefined}
                onChange={(value) => setSelectedDriverId(value as string)}
                items={drivers.filter(d => d.status === 'active')}
                placeholder="Search for driver..."
                onSearch={updateSearch}
              />
            </div>
            {selectedDriverId && (() => {
              const driver = drivers.find(d => d.id === selectedDriverId);
              const ageWarning = getDriverAgeWarning(driver?.date_of_birth);
              const licenseWarning = getLicenseExpiryWarning(driver?.license_expiry);
              
              return (ageWarning || licenseWarning) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {ageWarning && <div>{ageWarning}</div>}
                    {licenseWarning && <div>{licenseWarning}</div>}
                  </AlertDescription>
                </Alert>
              );
            })()}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignDriver}
                disabled={!selectedDriverId || assignDriverMutation.isPending}
              >
                Assign Driver
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

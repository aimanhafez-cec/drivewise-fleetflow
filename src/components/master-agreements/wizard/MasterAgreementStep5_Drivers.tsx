import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LOVSelect } from '@/components/ui/lov-select';
import { Plus, AlertTriangle, CheckCircle2, Trash2, Star, Info, Shield, FileCheck, UserPlus, FileText, Pencil, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDrivers } from '@/hooks/useDrivers';
import { useAgreementDrivers, useAssignDriver, useRemoveDriver, useUpdateDriverAssignment } from '@/hooks/useAgreementDrivers';
import { getDriverAgeWarning, getLicenseExpiryWarning } from '@/hooks/useDrivers';
import { EnhancedDriverForm } from '@/components/drivers/EnhancedDriverForm';
import { DriverDocumentsDialog } from '@/components/drivers/DriverDocumentsDialog';

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
  const [isCreateDriverOpen, setIsCreateDriverOpen] = useState(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [viewDocsDriverId, setViewDocsDriverId] = useState<string | null>(null);
  const [viewDocsDriverName, setViewDocsDriverName] = useState<string | null>(null);
  const [editDriverId, setEditDriverId] = useState<string | null>(null);

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

  const handleDriverCreated = (newDriverId: string) => {
    setIsCreateDriverOpen(false);
    setSelectedDriverId(newDriverId);
    // Dialog stays open so user can assign the newly created driver
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
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">Authorized Drivers</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4">
                <div className="space-y-2">
                  <p className="font-semibold">When are drivers required?</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Master Agreement can be signed without driver information</li>
                    <li>Drivers must be assigned before vehicle checkout/handover</li>
                    <li>You can add or update drivers anytime from the agreement details page</li>
                    <li>At least one primary driver is required per vehicle line</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-muted-foreground">
          Assign authorized drivers to each vehicle line. Driver information can be added now or later, but is required before vehicle delivery.
        </p>
      </div>

      {/* Status Alert */}
      {vehicleLines.length > 0 && (
        <>
          <Alert variant="default" className={hasAllDriversAssigned ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}>
            <AlertDescription className="flex items-center gap-2">
              {hasAllDriversAssigned ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-900">All vehicle lines have assigned drivers - Ready for vehicle handover</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-900">
                    {vehicleLines.filter(line => getDriversForLine(line.id).length === 0).length} vehicle line(s) do not have drivers assigned yet. You can continue and assign drivers later, but they will be required before vehicle delivery.
                  </span>
                </>
              )}
            </AlertDescription>
          </Alert>

        </>
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
                  <TableHead>Vehicle Details</TableHead>
                  <TableHead>Contract No</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead className="text-right">Monthly Rate</TableHead>
                  <TableHead>Driver Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleLines.map((line, index) => {
                  const lineDrivers = getDriversForLine(line.id);
                  return (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {line._vehicleMeta?.item_description || 
                             `${line._vehicleMeta?.make || ''} ${line._vehicleMeta?.model || ''} ${line._vehicleMeta?.year || ''}`.trim() || 
                             'Vehicle TBD'}
                          </div>
                          {line._vehicleMeta?.category_name && (
                            <Badge variant="outline" className="text-xs">
                              {line._vehicleMeta.category_name}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {line.contract_no || 'TBD'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {line.pickup_at && line.return_at ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{format(new Date(line.pickup_at), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              to {format(new Date(line.return_at), 'dd MMM yyyy')}
                            </div>
                            {line.duration_months && (
                              <Badge variant="secondary" className="text-xs">
                                {line.duration_months} months
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">TBD</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.monthly_rate ? (
                          <div className="space-y-1">
                            <div className="font-semibold">
                              AED {line.monthly_rate.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                            </div>
                            {line.mileage_package_km && (
                              <div className="text-xs text-muted-foreground">
                                {line.mileage_package_km.toLocaleString()} km/mo
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {/* Driver count badge */}
                          <div className="flex items-center gap-2">
                            <Badge variant={lineDrivers.length === 0 ? 'outline' : 'default'} className="text-xs">
                              {lineDrivers.length === 0 ? 'No Drivers' : `${lineDrivers.length} Driver${lineDrivers.length > 1 ? 's' : ''}`}
                            </Badge>
                            {lineDrivers.length > 0 && lineDrivers.some(ld => ld.is_primary) && (
                              <Badge className="bg-green-500 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            )}
                          </div>
                          
                          {/* Driver list */}
                          {lineDrivers.length > 0 && (
                            <div className="space-y-1">
                              {lineDrivers.map((ld) => {
                              const verificationBadge = () => {
                                const status = ld.driver?.verification_status;
                                if (!status || status === 'unverified') {
                                  return <Badge variant="destructive" className="text-xs"><Shield className="h-3 w-3 mr-1" />Unverified</Badge>;
                                } else if (status === 'pending_docs') {
                                  return <Badge variant="secondary" className="text-xs"><FileCheck className="h-3 w-3 mr-1" />Pending</Badge>;
                                } else if (status === 'verified' || status === 'approved') {
                                  return <Badge className="bg-green-500 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
                                } else if (status === 'rejected' || status === 'expired') {
                                  return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />{status === 'rejected' ? 'Rejected' : 'Expired'}</Badge>;
                                }
                                return null;
                              };
                              
                              return (
                              <div key={ld.id} className="flex items-center gap-1 flex-wrap text-xs">
                                {ld.is_primary && (
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                )}
                                <span className="font-medium">
                                  {ld.driver?.full_name}
                                </span>
                                {verificationBadge()}
                                {ld.is_primary && (
                                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                                )}
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   onClick={() => {
                                     setViewDocsDriverId(ld.driver?.id || null);
                                     setViewDocsDriverName(ld.driver?.full_name || null);
                                     setDocsDialogOpen(true);
                                   }}
                                   className="h-6 w-6 p-0"
                                   title="View Documents"
                                 >
                                   <FileText className="h-3 w-3" />
                                 </Button>
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   onClick={() => {
                                     setEditDriverId(ld.driver?.id || null);
                                     setIsCreateDriverOpen(true);
                                   }}
                                   className="h-6 w-6 p-0"
                                   title="Edit Driver"
                                 >
                                   <Pencil className="h-3 w-3" />
                                 </Button>
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   onClick={() => handleRemoveDriver(ld.id)}
                                   className="h-6 w-6 p-0"
                                   title="Remove Driver"
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
                             )})}
                            </div>
                          )}
                        </div>
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
              <label className="text-sm font-medium mb-2 block">Select Driver</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <LOVSelect
                    value={selectedDriverId || undefined}
                    onChange={(value) => setSelectedDriverId(value as string)}
                    items={drivers.filter(d => d.status === 'active')}
                    placeholder="Search for driver..."
                    onSearch={updateSearch}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCreateDriverOpen(true)}
                  title="Create New Driver"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {selectedDriverId && (() => {
              const driver = drivers.find(d => d.id === selectedDriverId);
              const ageWarning = getDriverAgeWarning(driver?.date_of_birth);
              const licenseWarning = getLicenseExpiryWarning(driver?.license_expiry);
              const verificationStatus = driver?.verification_status;
              
              const needsVerification = !verificationStatus || 
                ['unverified', 'rejected', 'expired'].includes(verificationStatus);
              
              return (
                <>
                  {needsVerification && (
                    <Alert variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Driver not verified for vehicle handover</strong>
                        <p className="text-sm mt-1">
                          This driver requires document verification (Emirates ID, License, Passport) 
                          before vehicle checkout. You can assign them now and verify documents later 
                          from the driver management page.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {(ageWarning || licenseWarning) && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {ageWarning && <div>{ageWarning}</div>}
                        {licenseWarning && <div>{licenseWarning}</div>}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
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

      {/* Create Driver Sheet */}
      <Sheet open={isCreateDriverOpen} onOpenChange={(open) => {
        setIsCreateDriverOpen(open);
        if (!open) setEditDriverId(null);
      }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editDriverId ? 'Edit Driver' : 'Create New Driver'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <EnhancedDriverForm
              open={isCreateDriverOpen}
              onClose={() => {
                setIsCreateDriverOpen(false);
                setEditDriverId(null);
              }}
              driverId={editDriverId || undefined}
              onSave={handleDriverCreated}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DriverDocumentsDialog
        open={docsDialogOpen}
        onOpenChange={setDocsDialogOpen}
        driverId={viewDocsDriverId || undefined}
        driverName={viewDocsDriverName || undefined}
      />
    </div>
  );
};

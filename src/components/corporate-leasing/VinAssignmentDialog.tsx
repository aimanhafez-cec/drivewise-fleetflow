import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { VehicleLine, AvailableVin } from '@/lib/api/corporateVinAssignment';
import { useAvailableVins, useAssignVin, useUnassignVin } from '@/hooks/useCorporateVinAssignment';
import { format } from 'date-fns';

interface VinAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: VehicleLine | null;
  mode: 'assign' | 'view';
}

const VinAssignmentDialog: React.FC<VinAssignmentDialogProps> = ({
  open,
  onOpenChange,
  line,
  mode,
}) => {
  const [selectedVin, setSelectedVin] = useState<AvailableVin | null>(null);
  const [vinSearch, setVinSearch] = useState('');
  const [checkoutDetailsOpen, setCheckoutDetailsOpen] = useState(false);
  const [checkoutLocation, setCheckoutLocation] = useState('');
  const [fuelLevel, setFuelLevel] = useState(100);
  const [odometer, setOdometer] = useState('');
  const [notes, setNotes] = useState('');

  const { data: availableVins = [], isLoading: vinsLoading } = useAvailableVins(
    line?.itemCode || '',
    mode === 'assign' && open && !!line
  );

  const assignMutation = useAssignVin();
  const unassignMutation = useUnassignVin();

  const filteredVins = availableVins.filter(vin =>
    vin.vin.toLowerCase().includes(vinSearch.toLowerCase()) ||
    vin.license_plate.toLowerCase().includes(vinSearch.toLowerCase())
  );

  const handleAssign = () => {
    if (!line || !selectedVin) return;

    assignMutation.mutate(
      {
        agreementId: line.agreementId,
        lineNo: line.lineNo,
        contractNo: line.contractNo,
        vehicleId: selectedVin.id,
        vin: selectedVin.vin,
        itemCode: line.itemCode,
        checkoutLocationId: checkoutLocation || undefined,
        checkoutFuelLevel: fuelLevel,
        checkoutOdometer: odometer ? parseInt(odometer) : undefined,
        checkoutNotes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const handleUnassign = () => {
    if (!line?.assignmentId) return;

    if (confirm('Are you sure you want to unassign this VIN?')) {
      unassignMutation.mutate(line.assignmentId, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const resetForm = () => {
    setSelectedVin(null);
    setVinSearch('');
    setCheckoutLocation('');
    setFuelLevel(100);
    setOdometer('');
    setNotes('');
    setCheckoutDetailsOpen(false);
  };

  if (!line) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'assign' ? 'Assign VIN to Contract Line' : 'View VIN Assignment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'assign'
              ? 'Select an available VIN matching the vehicle specifications'
              : 'Current VIN assignment details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Line Details */}
          <Alert>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Master Agreement:</span> {line.agreementNo}
                </div>
                <div>
                  <span className="font-semibold">Contract No:</span> {line.contractNo}
                </div>
                <div>
                  <span className="font-semibold">Vehicle Spec:</span> {line.itemDescription}
                </div>
                <div>
                  <span className="font-semibold">Vehicle Class:</span> {line.vehicleClass}
                </div>
                <div>
                  <span className="font-semibold">Start Date:</span>{' '}
                  {line.startDate ? format(new Date(line.startDate), 'MMM dd, yyyy') : '-'}
                </div>
                <div>
                  <span className="font-semibold">End Date:</span>{' '}
                  {line.endDate ? format(new Date(line.endDate), 'MMM dd, yyyy') : '-'}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span> {line.durationMonths} months
                </div>
                <div>
                  <span className="font-semibold">Monthly Rate:</span> AED{' '}
                  {line.monthlyRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {mode === 'assign' ? (
            <>
              {/* Available VINs */}
              <div className="space-y-4">
                <div>
                  <Label>Available VINs ({filteredVins.length})</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by VIN or License Plate..."
                      value={vinSearch}
                      onChange={(e) => setVinSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {vinsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading available VINs...</div>
                ) : filteredVins.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No available vehicles found matching this specification.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RadioGroup value={selectedVin?.id} onValueChange={(id) => {
                    const vin = filteredVins.find(v => v.id === id);
                    setSelectedVin(vin || null);
                  }}>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Select</TableHead>
                            <TableHead>VIN</TableHead>
                            <TableHead>License Plate</TableHead>
                            <TableHead>Make/Model</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Odometer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVins.map((vin) => (
                            <TableRow key={vin.id}>
                              <TableCell>
                                <RadioGroupItem value={vin.id} />
                              </TableCell>
                              <TableCell className="font-mono text-sm">{vin.vin}</TableCell>
                              <TableCell>{vin.license_plate}</TableCell>
                              <TableCell>
                                {vin.make} {vin.model} {vin.year}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{vin.color}</Badge>
                              </TableCell>
                              <TableCell>{vin.odometer.toLocaleString()} km</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Optional Checkout Details */}
              <Collapsible open={checkoutDetailsOpen} onOpenChange={setCheckoutDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {checkoutDetailsOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                    Optional Checkout Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Checkout Location</Label>
                      <Input
                        placeholder="Enter location"
                        value={checkoutLocation}
                        onChange={(e) => setCheckoutLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Expected Fuel Level (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={fuelLevel}
                        onChange={(e) => setFuelLevel(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Expected Odometer (km)</Label>
                      <Input
                        type="number"
                        placeholder={selectedVin ? String(selectedVin.odometer) : 'Enter odometer'}
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Add any notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : (
            /* View Mode - Show Current Assignment */
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Assigned VIN:</span> {line.assignedVin}
                    </div>
                    <div>
                      <span className="font-semibold">License Plate:</span> {line.assignedLicensePlate || '-'}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === 'assign' ? (
            <Button
              onClick={handleAssign}
              disabled={!selectedVin || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleUnassign}
              disabled={unassignMutation.isPending}
            >
              {unassignMutation.isPending ? 'Unassigning...' : 'Unassign VIN'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VinAssignmentDialog;

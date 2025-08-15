import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Plus } from 'lucide-react';
import { ReservationLine } from '@/pages/NewReservation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LineDetailsModalProps {
  line: ReservationLine | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lineId: string, updates: Partial<ReservationLine>) => void;
  onDelete: (lineId: string) => void;
}

export const LineDetailsModal: React.FC<LineDetailsModalProps> = ({
  line,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [editedLine, setEditedLine] = useState<ReservationLine | null>(null);

  React.useEffect(() => {
    if (line) {
      setEditedLine({ ...line });
    }
  }, [line]);

  const handleSave = () => {
    if (editedLine) {
      onSave(editedLine.id, editedLine);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedLine) {
      onDelete(editedLine.id);
      onClose();
    }
  };

  const updateEditedLine = (field: keyof ReservationLine, value: any) => {
    if (editedLine) {
      setEditedLine(prev => ({
        ...prev!,
        [field]: value,
        // Recalculate line total if net price or tax changes
        lineTotal: field === 'lineNetPrice' || field === 'taxValue' 
          ? (field === 'lineNetPrice' ? value : prev!.lineNetPrice) + 
            (field === 'taxValue' ? value : prev!.taxValue)
          : prev!.lineTotal
      }));
    }
  };

  if (!editedLine) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle id="modal-line-details">
            Reservation Line Details (#{editedLine.lineNo})
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="core" id="tab-core">Core</TabsTrigger>
            <TabsTrigger value="drivers" id="tab-drivers">Drivers</TabsTrigger>
            <TabsTrigger value="rates" id="tab-rates">Rates & Discounts</TabsTrigger>
            <TabsTrigger value="misc" id="tab-misc">Misc Charges</TabsTrigger>
            <TabsTrigger value="airport" id="tab-airport">Airport</TabsTrigger>
            <TabsTrigger value="notes" id="tab-notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="space-y-4 mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Reservation Type */}
              <div className="space-y-2">
                <Label>Reservation Type</Label>
                <Select 
                  value={editedLine.reservationTypeId} 
                  onValueChange={(value) => updateEditedLine('reservationTypeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Class */}
              <div className="space-y-2">
                <Label>Vehicle Class</Label>
                <Select 
                  value={editedLine.vehicleClassId} 
                  onValueChange={(value) => updateEditedLine('vehicleClassId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="midsize">Midsize</SelectItem>
                    <SelectItem value="fullsize">Full Size</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select 
                  value={editedLine.vehicleId} 
                  onValueChange={(value) => updateEditedLine('vehicleId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car1">Toyota Camry</SelectItem>
                    <SelectItem value="car2">Honda Accord</SelectItem>
                    <SelectItem value="car3">Nissan Altima</SelectItem>
                    <SelectItem value="car4">BMW 3 Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Driver Display */}
              <div className="space-y-2">
                <Label>Primary Driver</Label>
                <Input
                  value={editedLine.drivers.find(d => d.role === 'PRIMARY')?.driverId || 'None'}
                  disabled
                  className="bg-muted"
                  placeholder="No primary driver assigned"
                />
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedLine.checkOutDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedLine.checkOutDate ? 
                        format(editedLine.checkOutDate, "PPP p") : 
                        <span>Pick check-out date</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedLine.checkOutDate || undefined}
                      onSelect={(date) => updateEditedLine('checkOutDate', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedLine.checkInDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedLine.checkInDate ? 
                        format(editedLine.checkInDate, "PPP p") : 
                        <span>Pick check-in date</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedLine.checkInDate || undefined}
                      onSelect={(date) => updateEditedLine('checkInDate', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Assigned Drivers</Label>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              </div>
              
              {editedLine.drivers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No drivers assigned to this line
                </div>
              ) : (
                <div className="space-y-3">
                  {editedLine.drivers.map((driver, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <span className="font-medium">Driver ID: {driver.driverId}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={driver.role === 'PRIMARY' ? 'default' : 'secondary'}>
                              {driver.role}
                            </Badge>
                            {driver.addlDriverFee && driver.addlDriverFee > 0 && (
                              <span className="text-sm text-muted-foreground">
                                +${driver.addlDriverFee.toFixed(2)} fee
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rates" className="space-y-4 mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Line Net Price */}
              <div className="space-y-2">
                <Label>Line Net Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedLine.lineNetPrice}
                  onChange={(e) => updateEditedLine('lineNetPrice', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Tax Value */}
              <div className="space-y-2">
                <Label>Tax Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedLine.taxValue}
                  onChange={(e) => updateEditedLine('taxValue', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Tax Code */}
              <div className="space-y-2">
                <Label>Tax Code</Label>
                <Select 
                  value={editedLine.taxId} 
                  onValueChange={(value) => updateEditedLine('taxId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (10%)</SelectItem>
                    <SelectItem value="reduced">Reduced (5%)</SelectItem>
                    <SelectItem value="exempt">Tax Exempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Line Total (Read-only) */}
              <div className="space-y-2">
                <Label>Line Total</Label>
                <Input
                  value={editedLine.lineTotal.toFixed(2)}
                  disabled
                  className="bg-muted font-mono"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="misc" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Miscellaneous Charges</Label>
              <div className="space-y-2">
                {[
                  { id: 'insurance', label: 'Insurance', amount: 25.00, taxable: true },
                  { id: 'gps', label: 'GPS', amount: 15.00, taxable: true },
                  { id: 'cleaning', label: 'Cleaning Fee', amount: 30.00, taxable: false },
                  { id: 'fuel', label: 'Fuel Charge', amount: 50.00, taxable: true },
                  { id: 'delivery', label: 'Delivery', amount: 20.00, taxable: false },
                ].map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox id={`misc-${charge.id}`} />
                      <div>
                        <Label htmlFor={`misc-${charge.id}`} className="font-medium">
                          {charge.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          ${charge.amount.toFixed(2)} {charge.taxable ? '(Taxable)' : '(Non-taxable)'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="airport" className="space-y-4 mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Arrival Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Arrival Information</h4>
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <Input placeholder="e.g. EK123" />
                </div>
                <div className="space-y-2">
                  <Label>Airline</Label>
                  <Input placeholder="e.g. Emirates" />
                </div>
                <div className="space-y-2">
                  <Label>Passengers</Label>
                  <Input type="number" placeholder="Number of passengers" />
                </div>
              </div>

              {/* Departure Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Departure Information</h4>
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <Input placeholder="e.g. EK456" />
                </div>
                <div className="space-y-2">
                  <Label>Airline</Label>
                  <Input placeholder="e.g. Emirates" />
                </div>
                <div className="space-y-2">
                  <Label>Passengers</Label>
                  <Input type="number" placeholder="Number of passengers" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Line Notes</Label>
              <Textarea
                placeholder="Enter any additional notes for this reservation line..."
                rows={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Line
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
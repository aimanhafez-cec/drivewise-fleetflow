import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LOVSelect } from '@/components/ui/lov-select';
import { Plus, X, User, CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDrivers, useCreateDriver, Driver, getDriverAgeWarning, getLicenseExpiryWarning } from '@/hooks/useDrivers';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDriverPickerProps {
  selectedDrivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
  className?: string;
}

export const EnhancedDriverPicker: React.FC<EnhancedDriverPickerProps> = ({
  selectedDrivers,
  onDriversChange,
  className
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    full_name: '',
    license_no: '',
    phone: '',
    email: '',
    date_of_birth: '',
    license_expiry: '',
    additional_driver_fee: 25.00
  });

  const { items: drivers, isLoading } = useDrivers(searchQuery, true);
  const createDriverMutation = useCreateDriver();

  const availableDrivers = drivers.filter(driver => 
    !selectedDrivers.find(selected => selected.id === driver.id)
  );

  const handleDriverSelect = (driverId: string | string[] | undefined) => {
    // Handle single string (when multiple=false) or array
    const newDriverId = Array.isArray(driverId) ? driverId[driverId.length - 1] : driverId;
    if (!newDriverId) return;

    const driver = drivers.find(d => d.id === newDriverId);
    if (!driver) return;

    const newSelectedDrivers = [...selectedDrivers, { 
      ...driver, 
      role: selectedDrivers.length === 0 ? 'PRIMARY' : 'ADDITIONAL' 
    } as Driver];
    
    onDriversChange(newSelectedDrivers);
  };

  const handleDriverRemove = (driverId: string) => {
    const filteredDrivers = selectedDrivers.filter(d => d.id !== driverId);
    
    // If we removed the primary driver, make the first remaining driver primary
    if (filteredDrivers.length > 0 && !filteredDrivers.find(d => d.role === 'PRIMARY')) {
      filteredDrivers[0].role = 'PRIMARY';
    }
    
    onDriversChange(filteredDrivers);
  };

  const handlePrimaryChange = (driverId: string) => {
    const updatedDrivers = selectedDrivers.map(driver => ({
      ...driver,
      role: driver.id === driverId ? 'PRIMARY' : 'ADDITIONAL'
    } as Driver));
    
    onDriversChange(updatedDrivers);
  };

  const handleNewDriverSave = async () => {
    if (!newDriver.full_name || !newDriver.license_no) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in the driver's name and license number.",
        variant: "destructive"
      });
      return;
    }

    try {
      const createdDriver = await createDriverMutation.mutateAsync({
        full_name: newDriver.full_name,
        license_no: newDriver.license_no,
        phone: newDriver.phone,
        email: newDriver.email,
        date_of_birth: newDriver.date_of_birth,
        license_expiry: newDriver.license_expiry,
        status: 'active',
        additional_driver_fee: newDriver.additional_driver_fee || 25.00
      });

      const driverWithRole: Driver = {
        ...createdDriver,
        label: `${createdDriver.full_name} (${createdDriver.license_no})`,
        role: selectedDrivers.length === 0 ? 'PRIMARY' : 'ADDITIONAL'
      };
      
      onDriversChange([...selectedDrivers, driverWithRole]);
      setNewDriver({ 
        full_name: '', 
        license_no: '', 
        phone: '', 
        email: '', 
        date_of_birth: '',
        license_expiry: '',
        additional_driver_fee: 25.00 
      });
      setShowNewDriverModal(false);
      
      toast({
        title: "Driver Added",
        description: `${createdDriver.full_name} has been added successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create driver. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Driver(s)</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowNewDriverModal(true)}
          className="h-8 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          New Driver
        </Button>
      </div>

      {/* Driver Search and Selection */}
      <LOVSelect
        items={availableDrivers}
        value={[]}
        onChange={handleDriverSelect}
        onSearch={setSearchQuery}
        isLoading={isLoading}
        placeholder="Search by name, license, phone, email, ID..."
        searchPlaceholder="Type at least 2 characters"
        emptyMessage={searchQuery.length < 2 ? "Type 2+ characters to search" : "No drivers found"}
        multiple={false}
        allowClear={false}
        className="w-full"
      />

      {/* Selected Drivers */}
      {selectedDrivers.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Selected Drivers:</div>
          {selectedDrivers.map((driver) => {
            const ageWarning = getDriverAgeWarning(driver.date_of_birth);
            const licenseWarning = getLicenseExpiryWarning(driver.license_expiry);
            const hasWarnings = ageWarning || licenseWarning;
            
            return (
              <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3 flex-1">
                  <RadioGroup
                    value={selectedDrivers.find(d => d.role === 'PRIMARY')?.id || ''}
                    onValueChange={handlePrimaryChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={driver.id} id={`primary-${driver.id}`} />
                      <Label htmlFor={`primary-${driver.id}`} className="text-xs font-medium">Primary</Label>
                    </div>
                  </RadioGroup>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{driver.full_name}</span>
                      {driver.role === 'PRIMARY' && (
                        <Badge variant="default" className="text-xs px-2 py-0">Primary</Badge>
                      )}
                      {driver.role === 'ADDITIONAL' && driver.additional_driver_fee > 0 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          +AED{driver.additional_driver_fee}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      License: {driver.license_no}
                      {driver.phone && ` • Phone: ${driver.phone}`}
                    </div>
                    {hasWarnings && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        {ageWarning || licenseWarning}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDriverRemove(driver.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* New Driver Modal */}
      <Dialog open={showNewDriverModal} onOpenChange={setShowNewDriverModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                value={newDriver.full_name || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>License No. <span className="text-destructive">*</span></Label>
              <Input
                value={newDriver.license_no || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, license_no: e.target.value }))}
                placeholder="Enter license number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newDriver.date_of_birth || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>License Expiry</Label>
              <Input
                type="date"
                value={newDriver.license_expiry || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, license_expiry: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newDriver.phone || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newDriver.email || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Driver Fee ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newDriver.additional_driver_fee || 25.00}
                onChange={(e) => setNewDriver(prev => ({ ...prev, additional_driver_fee: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowNewDriverModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleNewDriverSave}
              disabled={!newDriver.full_name || !newDriver.license_no || createDriverMutation.isPending}
            >
              {createDriverMutation.isPending ? 'Adding...' : 'Add Driver'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
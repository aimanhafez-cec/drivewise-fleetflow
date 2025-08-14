import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Check, ChevronDown, Plus, X, User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface Driver {
  id: string;
  fullName: string;
  licenseNo: string;
  phone: string;
  email: string;
  dob: Date | null;
  role?: 'PRIMARY' | 'ADDITIONAL';
  addlDriverFee?: number;
}

interface DriverPickerProps {
  selectedDrivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
  className?: string;
}

// Mock driver data - in real app this would come from API
const MOCK_DRIVERS: Driver[] = [
  { id: '1', fullName: 'John Smith', licenseNo: 'DL123456', phone: '+1-555-0101', email: 'john.smith@email.com', dob: new Date('1985-03-15') },
  { id: '2', fullName: 'Sarah Johnson', licenseNo: 'DL789012', phone: '+1-555-0102', email: 'sarah.j@email.com', dob: new Date('1990-07-22') },
  { id: '3', fullName: 'Mike Davis', licenseNo: 'DL345678', phone: '+1-555-0103', email: 'mike.davis@email.com', dob: new Date('1988-11-08') },
  { id: '4', fullName: 'Emily Wilson', licenseNo: 'DL901234', phone: '+1-555-0104', email: 'emily.w@email.com', dob: new Date('1992-05-30') },
];

export const DriverPicker: React.FC<DriverPickerProps> = ({
  selectedDrivers,
  onDriversChange,
  className
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDriverModal, setShowNewDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    fullName: '',
    licenseNo: '',
    phone: '',
    email: '',
    dob: null
  });

  const filteredDrivers = MOCK_DRIVERS.filter(driver =>
    driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.licenseNo.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(driver => !selectedDrivers.find(selected => selected.id === driver.id));

  const handleDriverSelect = (driver: Driver) => {
    const newSelectedDrivers = [...selectedDrivers, { ...driver, role: 'ADDITIONAL' as const }];
    
    // If this is the first driver, make them primary
    if (selectedDrivers.length === 0) {
      newSelectedDrivers[0].role = 'PRIMARY';
    }
    
    onDriversChange(newSelectedDrivers);
    setSearchOpen(false);
    setSearchQuery('');
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

  const handleNewDriverSave = () => {
    if (newDriver.fullName && newDriver.licenseNo) {
      const driver: Driver = {
        id: Date.now().toString(),
        fullName: newDriver.fullName,
        licenseNo: newDriver.licenseNo,
        phone: newDriver.phone || '',
        email: newDriver.email || '',
        dob: newDriver.dob || null,
        role: selectedDrivers.length === 0 ? 'PRIMARY' : 'ADDITIONAL'
      };
      
      onDriversChange([...selectedDrivers, driver]);
      setNewDriver({ fullName: '', licenseNo: '', phone: '', email: '', dob: null });
      setShowNewDriverModal(false);
    }
  };

  const getAgeWarning = (dob: Date | null): string | null => {
    if (!dob) return null;
    
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1 < 25 ? 'Under 25 - Additional fees may apply' : null;
    }
    
    return age < 25 ? 'Under 25 - Additional fees may apply' : null;
  };

  const getLicenseExpiryWarning = (licenseNo: string): string | null => {
    // Mock logic - in real app would check against license database
    return Math.random() > 0.8 ? 'License expires within 30 days' : null;
  };

  return (
    <div className={cn("space-y-3", className)}>
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

      {/* Driver Search */}
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            id="drivers-select"
            variant="outline"
            role="combobox"
            aria-expanded={searchOpen}
            className="w-full justify-between text-left"
          >
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Select driver(s)...
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput 
              placeholder="Search drivers..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No drivers found.</CommandEmpty>
              <CommandGroup>
                {filteredDrivers.map((driver) => (
                  <CommandItem
                    key={driver.id}
                    value={driver.id}
                    onSelect={() => handleDriverSelect(driver)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{driver.fullName}</span>
                      <span className="text-xs text-muted-foreground">{driver.licenseNo}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Drivers */}
      {selectedDrivers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Selected drivers:</div>
          {selectedDrivers.map((driver) => {
            const ageWarning = getAgeWarning(driver.dob);
            const licenseWarning = getLicenseExpiryWarning(driver.licenseNo);
            
            return (
              <div key={driver.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroup
                    value={selectedDrivers.find(d => d.role === 'PRIMARY')?.id || ''}
                    onValueChange={handlePrimaryChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={driver.id} id={`primary-${driver.id}`} />
                      <Label htmlFor={`primary-${driver.id}`} className="text-xs">Primary</Label>
                    </div>
                  </RadioGroup>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{driver.fullName}</span>
                      {driver.role === 'PRIMARY' && (
                        <Badge variant="default" className="text-xs px-1 py-0">Primary</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{driver.licenseNo}</div>
                    {(ageWarning || licenseWarning) && (
                      <div className="text-xs text-amber-600 mt-1">
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
                  className="h-8 w-8 p-0"
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
                value={newDriver.fullName || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>License No. <span className="text-destructive">*</span></Label>
              <Input
                value={newDriver.licenseNo || ''}
                onChange={(e) => setNewDriver(prev => ({ ...prev, licenseNo: e.target.value }))}
                placeholder="Enter license number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDriver.dob && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDriver.dob ? format(newDriver.dob, "PPP") : <span>Pick date of birth</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDriver.dob || undefined}
                    onSelect={(date) => setNewDriver(prev => ({ ...prev, dob: date || null }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowNewDriverModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleNewDriverSave}
              disabled={!newDriver.fullName || !newDriver.licenseNo}
            >
              Add Driver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
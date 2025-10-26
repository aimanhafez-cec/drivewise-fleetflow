import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface DatesLocationsProps {
  data: {
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    pickupLocation: string;
    returnLocation: string;
  };
  onUpdate: (updates: any) => void;
}

const DatesLocations = ({ data, onUpdate }: DatesLocationsProps) => {
  const [sameLocation, setSameLocation] = useState(true); // Default to true
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);

  // Smart defaults - pre-fill dates and times on mount if empty
  useEffect(() => {
    const hasData = data.pickupDate || data.pickupTime || data.returnDate || data.returnTime;
    
    if (!hasData) {
      const today = new Date();
      
      // Pickup: Tomorrow
      const pickupDate = new Date(today);
      pickupDate.setDate(today.getDate() + 1);
      const pickupDateStr = pickupDate.toISOString().split('T')[0];
      
      // Return: Day after tomorrow
      const returnDate = new Date(today);
      returnDate.setDate(today.getDate() + 2);
      const returnDateStr = returnDate.toISOString().split('T')[0];
      
      onUpdate({
        pickupDate: pickupDateStr,
        pickupTime: '09:00',
        returnDate: returnDateStr,
        returnTime: '18:00',
      });
    }
  }, []); // Only run on mount

  const locations = [
    { value: 'Dubai Airport Terminal 1', label: 'Dubai Airport T1' },
    { value: 'Dubai Airport Terminal 2', label: 'Dubai Airport T2' },
    { value: 'Dubai Airport Terminal 3', label: 'Dubai Airport T3' },
    { value: 'Abu Dhabi Airport', label: 'Abu Dhabi Airport' },
    { value: 'Sharjah Airport', label: 'Sharjah Airport' },
    { value: 'Dubai Marina Branch', label: 'Dubai Marina' },
    { value: 'Downtown Dubai Branch', label: 'Downtown Dubai' },
    { value: 'Abu Dhabi Corniche Branch', label: 'Abu Dhabi Corniche' },
    { value: 'Deira City Centre Branch', label: 'Deira City Centre' },
    { value: 'Mall of the Emirates Branch', label: 'Mall of the Emirates' },
  ];

  const handleSameLocationChange = (checked: boolean) => {
    setSameLocation(checked);
    if (checked && data.pickupLocation) {
      onUpdate({ returnLocation: data.pickupLocation });
    }
  };

  const calculateDuration = () => {
    if (data.pickupDate && data.pickupTime && data.returnDate && data.returnTime) {
      const pickup = new Date(`${data.pickupDate}T${data.pickupTime}`);
      const returnDt = new Date(`${data.returnDate}T${data.returnTime}`);
      const diffMs = returnDt.getTime() - pickup.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return { days: diffDays, hours: diffHours, valid: diffMs > 0 };
    }
    return null;
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dates & Locations</h2>
        <p className="text-muted-foreground">
          Select pickup and return dates, times, and locations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Date & Time */}
        <Card className="border-[hsl(var(--chart-1))]/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[hsl(var(--chart-1))]">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold">Pickup</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickup-date">Date *</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={data.pickupDate}
                  onChange={(e) => onUpdate({ pickupDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="pickup-time">Time *</Label>
                <Input
                  id="pickup-time"
                  type="time"
                  value={data.pickupTime}
                  onChange={(e) => onUpdate({ pickupTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Date & Time */}
        <Card className="border-[hsl(var(--chart-2))]/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[hsl(var(--chart-2))]">
              <Clock className="h-5 w-5" />
              <h3 className="font-semibold">Return</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="return-date">Date *</Label>
                <Input
                  id="return-date"
                  type="date"
                  value={data.returnDate}
                  onChange={(e) => onUpdate({ returnDate: e.target.value })}
                  min={data.pickupDate || new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="return-time">Time *</Label>
                <Input
                  id="return-time"
                  type="time"
                  value={data.returnTime}
                  onChange={(e) => onUpdate({ returnTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duration Display */}
      {duration && (
        <Card className={duration.valid ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRight className={duration.valid ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-destructive'} />
                <div>
                  <p className="text-sm font-medium text-foreground">Rental Duration</p>
                  {duration.valid ? (
                    <p className="text-xs text-muted-foreground">
                      {duration.days} day{duration.days !== 1 ? 's' : ''}
                      {duration.hours > 0 && `, ${duration.hours} hour${duration.hours !== 1 ? 's' : ''}`}
                    </p>
                  ) : (
                    <p className="text-xs text-destructive">Invalid date range</p>
                  )}
                </div>
              </div>
              {duration.valid && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {duration.days} {duration.days === 1 ? 'Day' : 'Days'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Location */}
        <div className="space-y-2">
          <Label htmlFor="pickup-location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[hsl(var(--chart-1))]" />
            Pickup Location *
          </Label>
          <Select value={data.pickupLocation} onValueChange={(value) => {
            onUpdate({ pickupLocation: value });
            if (sameLocation) {
              onUpdate({ returnLocation: value });
            }
          }}>
            <SelectTrigger id="pickup-location">
              <SelectValue placeholder="Select pickup location" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {locations.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Return Location */}
        <div className="space-y-2">
          <Label htmlFor="return-location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[hsl(var(--chart-2))]" />
            Return Location *
          </Label>
          <Select 
            value={data.returnLocation} 
            onValueChange={(value) => onUpdate({ returnLocation: value })}
            disabled={sameLocation}
          >
            <SelectTrigger id="return-location">
              <SelectValue placeholder="Select return location" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {locations.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Same Location Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="same-location" 
          checked={sameLocation}
          onCheckedChange={handleSameLocationChange}
        />
        <label
          htmlFor="same-location"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Return to same location (No one-way fee)
        </label>
      </div>

      {/* One-way Fee Notice */}
      {data.pickupLocation && data.returnLocation && data.pickupLocation !== data.returnLocation && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">One-way rental:</span> A one-way fee of AED 150 will be applied as pickup and return locations are different.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Advanced Date Options */}
      <Collapsible open={advancedOptionsOpen} onOpenChange={setAdvancedOptionsOpen}>
        <Card className="border-dashed">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-4 flex items-center justify-between hover:bg-accent/50"
            >
              <span className="font-medium text-sm">Advanced Date Options</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${advancedOptionsOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grace-period" className="text-sm">Grace Period (minutes)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    placeholder="30"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Extra time before late fees apply
                  </p>
                </div>
                <div>
                  <Label htmlFor="billing-cycle" className="text-sm">Billing Cycle</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="billing-cycle" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="after-hours" />
                <label
                  htmlFor="after-hours"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Allow after-hours pickup/return (+AED 50)
                </label>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default DatesLocations;

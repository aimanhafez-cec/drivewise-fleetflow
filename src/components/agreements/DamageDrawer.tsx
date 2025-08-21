import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
interface DamageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marker: any;
  onSave: (markerData: any) => void;
}
export const DamageDrawer: React.FC<DamageDrawerProps> = ({
  open,
  onOpenChange,
  marker,
  onSave
}) => {
  const [formData, setFormData] = useState({
    damageType: 'SCRATCH',
    severity: 'LOW',
    event: 'OUT',
    timestamp: new Date(),
    notes: '',
    photos: [] as File[]
  });
  const [showCalendar, setShowCalendar] = useState(false);
  useEffect(() => {
    if (marker) {
      setFormData({
        damageType: marker.damageType || 'SCRATCH',
        severity: marker.severity || 'LOW',
        event: marker.event || 'OUT',
        timestamp: new Date(),
        notes: '',
        photos: []
      });
    }
  }, [marker]);
  const handleSubmit = () => {
    if (!marker) return;
    const markerData = {
      line_id: marker.lineId,
      side: marker.side,
      x: marker.x,
      y: marker.y,
      damage_type: formData.damageType,
      severity: formData.severity,
      event: formData.event,
      occurred_at: formData.timestamp.toISOString(),
      notes: formData.notes,
      photos: formData.photos.map(file => ({
        name: file.name,
        url: ''
      })) // In real app, upload files first
    };
    onSave(markerData);
  };
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };
  const isFormValid = () => {
    if (formData.severity === 'HIGH' && formData.photos.length === 0) {
      return false;
    }
    return true;
  };
  return <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent id="damage-drawer" className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Record Damage</DrawerTitle>
          <DrawerDescription className="text-slate-50">
            Add details about the vehicle damage. Fields marked * are required.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {/* Damage Type */}
          <div className="space-y-2">
            <Label htmlFor="damageType">Damage Type *</Label>
            <Select value={formData.damageType} onValueChange={value => setFormData(prev => ({
            ...prev,
            damageType: value
          }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCRATCH">Scratch</SelectItem>
                <SelectItem value="DENT">Dent</SelectItem>
                <SelectItem value="CRACK">Crack</SelectItem>
                <SelectItem value="PAINT">Paint Damage</SelectItem>
                <SelectItem value="GLASS">Glass Damage</SelectItem>
                <SelectItem value="TIRE">Tire Damage</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <Select value={formData.severity} onValueChange={value => setFormData(prev => ({
            ...prev,
            severity: value
          }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MED">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event */}
          <div className="space-y-2">
            <Label htmlFor="event">Event *</Label>
            <Select value={formData.event} onValueChange={value => setFormData(prev => ({
            ...prev,
            event: value
          }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUT">Check Out</SelectItem>
                <SelectItem value="IN">Check In</SelectItem>
                <SelectItem value="EXCHANGE">Exchange</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <Label>Timestamp *</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.timestamp && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.timestamp ? format(formData.timestamp, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.timestamp} onSelect={date => {
                if (date) {
                  setFormData(prev => ({
                    ...prev,
                    timestamp: date
                  }));
                  setShowCalendar(false);
                }
              }} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Additional details about the damage..." value={formData.notes} onChange={e => setFormData(prev => ({
            ...prev,
            notes: e.target.value
          }))} rows={3} className="bg-slate-50" />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos">
              Photos {formData.severity === 'HIGH' && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              <Input id="photos" type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="file:mr-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 mx-0 px-[5px] my-[23px] py-0" />
              {formData.photos.length > 0 && <div className="grid grid-cols-2 gap-2">
                  {formData.photos.map((photo, index) => <div key={index} className="relative border rounded-lg p-2 flex items-center justify-between">
                      <span className="text-sm truncate">{photo.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => removePhoto(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>)}
                </div>}
              {formData.severity === 'HIGH' && formData.photos.length === 0 && <p className="text-sm text-red-500">At least one photo is required for high severity damage</p>}
            </div>
          </div>
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!isFormValid()} className="flex-1">
              Save Damage Record
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>;
};
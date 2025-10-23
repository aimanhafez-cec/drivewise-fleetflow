import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

interface ScheduleIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduleIntegrationModal({ open, onClose }: ScheduleIntegrationModalProps) {
  const [frequency, setFrequency] = useState<string>('daily');
  const [selectedEmirates, setSelectedEmirates] = useState<string[]>(['DXB', 'AUH']);

  const handleSave = () => {
    toast.success('Integration schedule saved (Demo mode)');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily (08:00 AM)</SelectItem>
                <SelectItem value="weekly">Weekly (Monday 08:00 AM)</SelectItem>
                <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Emirate Feeds</Label>
            <div className="grid grid-cols-2 gap-2">
              {['DXB', 'AUH', 'SHJ', 'AJM', 'RAK', 'UAQ', 'FUJ'].map(emirate => (
                <Button
                  key={emirate}
                  variant={selectedEmirates.includes(emirate) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedEmirates(prev =>
                      prev.includes(emirate)
                        ? prev.filter(e => e !== emirate)
                        : [...prev, emirate]
                    );
                  }}
                >
                  {emirate}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Note: Demo Feature</p>
            <p>This is a demo feature. No actual scheduling occurs. In production, this would configure automated data feeds from UAE authority APIs.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

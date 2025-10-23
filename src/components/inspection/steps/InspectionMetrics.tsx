import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const FUEL_LEVELS = [
  { value: 'E', label: 'Empty', percentage: 0 },
  { value: 'Q1', label: '1/4', percentage: 25 },
  { value: 'H', label: '1/2', percentage: 50 },
  { value: 'Q3', label: '3/4', percentage: 75 },
  { value: 'F', label: 'Full', percentage: 100 }
] as const;

interface InspectionMetricsProps {
  metrics: { odometer?: number; fuelLevel?: string };
  media: any[];
  onChange: (metrics: any, media: any[]) => void;
}

export function InspectionMetrics({ metrics, media, onChange }: InspectionMetricsProps) {
  const [fuelIndex, setFuelIndex] = useState(FUEL_LEVELS.findIndex(f => f.value === metrics.fuelLevel) || 2);

  const updateMetrics = (updates: Partial<typeof metrics>) => {
    onChange({ ...metrics, ...updates }, media);
  };

  const handleFuelChange = (value: number[]) => {
    setFuelIndex(value[0]);
    updateMetrics({ fuelLevel: FUEL_LEVELS[value[0]].value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <Label>Fuel Level</Label>
            <Slider value={[fuelIndex]} onValueChange={handleFuelChange} max={FUEL_LEVELS.length - 1} step={1} />
            <Badge variant="outline">{FUEL_LEVELS[fuelIndex].label}</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="odometer">Odometer Reading (km)</Label>
            <Input
              id="odometer"
              type="number"
              value={metrics.odometer || ''}
              onChange={(e) => updateMetrics({ odometer: parseInt(e.target.value) || undefined })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

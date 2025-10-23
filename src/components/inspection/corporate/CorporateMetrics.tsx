import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Gauge, Camera, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface CorporateMetricsProps {
  metrics: {
    odometer?: number;
    fuelLevel?: string;
    extras?: any[];
  };
  media: any[];
  onChange: (metrics: any, media: any[]) => void;
}

const FUEL_LEVELS = [
  { value: 'E', label: 'Empty', position: 0 },
  { value: 'Q1', label: '1/4', position: 25 },
  { value: 'H', label: '1/2', position: 50 },
  { value: 'Q3', label: '3/4', position: 75 },
  { value: 'F', label: 'Full', position: 100 }
];

export function CorporateMetrics({ metrics, media, onChange }: CorporateMetricsProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);

  const handleOdometerChange = (value: string) => {
    onChange({ ...metrics, odometer: parseInt(value) || 0 }, media);
  };

  const handleFuelLevelChange = (value: number[]) => {
    const position = value[0];
    const closestLevel = FUEL_LEVELS.reduce((prev, curr) => 
      Math.abs(curr.position - position) < Math.abs(prev.position - position) ? curr : prev
    );
    onChange({ ...metrics, fuelLevel: closestLevel.value }, media);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setSelectedPhotos([...selectedPhotos, ...newPhotos]);
      // In real implementation, upload to storage and get URLs
      const newMedia = newPhotos.map((file, idx) => ({
        id: `photo-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        type: 'photo',
        label: file.name
      }));
      onChange(metrics, [...media, ...newMedia]);
    }
  };

  const removePhoto = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    onChange(metrics, newMedia);
  };

  const currentFuelPosition = FUEL_LEVELS.find(f => f.value === metrics.fuelLevel)?.position || 50;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="h-5 w-5" />
            <h3 className="font-semibold">Vehicle Metrics</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometer">Odometer Reading (km)</Label>
            <Input
              id="odometer"
              type="number"
              placeholder="Enter odometer reading"
              value={metrics.odometer || ''}
              onChange={(e) => handleOdometerChange(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label>Fuel Level</Label>
            <div className="space-y-2">
              <Slider
                value={[currentFuelPosition]}
                onValueChange={handleFuelLevelChange}
                max={100}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {FUEL_LEVELS.map(level => (
                  <span 
                    key={level.value}
                    className={metrics.fuelLevel === level.value ? 'font-bold text-primary' : ''}
                  >
                    {level.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <h3 className="font-semibold">Photo Documentation</h3>
          </div>

          <div>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent transition-colors">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photos or drag and drop
                </p>
              </div>
            </Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {media.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {media.map((item, index) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.url}
                    alt={item.label || `Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, X } from 'lucide-react';
import type { DamageSeverity } from '@/types/agreement-wizard';

interface DamageMarkerToolProps {
  markerId: string;
  severity: DamageSeverity;
  type: string;
  notes: string;
  photos: string[];
  onUpdate: (data: { severity: DamageSeverity; type: string; notes: string }) => void;
  onAddPhoto: (photo: string) => void;
  onRemovePhoto: (photo: string) => void;
  onClose: () => void;
}

const damageTypes = [
  'Scratch',
  'Dent',
  'Crack',
  'Broken',
  'Missing',
  'Paint Chip',
  'Rust',
  'Worn',
  'Stain',
  'Tear',
  'Other',
];

const severityOptions: { value: DamageSeverity; label: string; description: string }[] = [
  { value: 'minor', label: 'Minor', description: 'Cosmetic issue, no functional impact' },
  { value: 'moderate', label: 'Moderate', description: 'Noticeable damage, may need repair' },
  { value: 'major', label: 'Major', description: 'Significant damage, requires immediate repair' },
];

export const DamageMarkerTool = ({
  markerId,
  severity,
  type,
  notes,
  photos,
  onUpdate,
  onAddPhoto,
  onRemovePhoto,
  onClose,
}: DamageMarkerToolProps) => {
  const [localSeverity, setLocalSeverity] = useState<DamageSeverity>(severity);
  const [localType, setLocalType] = useState(type);
  const [localNotes, setLocalNotes] = useState(notes);

  const handleSave = () => {
    onUpdate({
      severity: localSeverity,
      type: localType,
      notes: localNotes,
    });
    onClose();
  };

  const handlePhotoCapture = () => {
    // Trigger photo capture - in real implementation, this would open camera
    // For now, we'll use a placeholder
    const mockPhotoUrl = `https://placehold.co/400x300?text=Damage+Photo+${photos.length + 1}`;
    onAddPhoto(mockPhotoUrl);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Damage Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Severity Selection */}
        <div className="space-y-2">
          <Label>Severity</Label>
          <RadioGroup value={localSeverity} onValueChange={(v) => setLocalSeverity(v as DamageSeverity)}>
            {severityOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={option.value} id={`severity-${option.value}`} />
                <div className="space-y-1">
                  <Label htmlFor={`severity-${option.value}`} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Damage Type Selection */}
        <div className="space-y-2">
          <Label>Damage Type</Label>
          <div className="flex flex-wrap gap-2">
            {damageTypes.map((damageType) => (
              <Badge
                key={damageType}
                variant={localType === damageType ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setLocalType(damageType)}
              >
                {damageType}
              </Badge>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Photos ({photos.length})</Label>
            <Button variant="outline" size="sm" onClick={handlePhotoCapture}>
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Damage ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemovePhoto(photo)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="damage-notes">Additional Notes</Label>
          <Textarea
            id="damage-notes"
            placeholder="Describe the damage in detail..."
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

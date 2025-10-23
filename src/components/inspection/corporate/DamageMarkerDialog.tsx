import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUploadDamagePhoto } from '@/hooks/useDamageMarkers';
import type { 
  DamageMarker, 
  DamageMarkerType, 
  DamageMarkerSeverity,
  DamageMarkerSide,
  DamageMarkerPhoto 
} from '@/types/damage-marker';
import { DAMAGE_TYPE_OPTIONS, SEVERITY_OPTIONS } from '@/types/damage-marker';

interface DamageMarkerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<DamageMarker>) => void;
  initialData?: Partial<DamageMarker> & { x: number; y: number; side: DamageMarkerSide };
  clickPosition?: { x: number; y: number; side: DamageMarkerSide };
}

export function DamageMarkerDialog({
  open,
  onClose,
  onSave,
  initialData,
  clickPosition,
}: DamageMarkerDialogProps) {
  const [damageType, setDamageType] = useState<DamageMarkerType>('SCRATCH');
  const [severity, setSeverity] = useState<DamageMarkerSeverity>('LOW');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<DamageMarkerPhoto[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const uploadPhoto = useUploadDamagePhoto();

  useEffect(() => {
    if (initialData) {
      setDamageType(initialData.damage_type || 'SCRATCH');
      setSeverity(initialData.severity || 'LOW');
      setNotes(initialData.notes || '');
      setPhotos(initialData.photos || []);
    } else if (clickPosition) {
      // New marker - reset form
      setDamageType('SCRATCH');
      setSeverity('LOW');
      setNotes('');
      setPhotos([]);
    }
  }, [initialData, clickPosition]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingFiles(files);

    // Upload files (temporary marker ID - will be replaced on save)
    const tempMarkerId = initialData?.id || `temp-${Date.now()}`;
    
    for (const file of files) {
      try {
        const photo = await uploadPhoto.mutateAsync({ file, markerId: tempMarkerId });
        setPhotos(prev => [...prev, photo]);
      } catch (error) {
        console.error('Failed to upload photo:', error);
      }
    }
    
    setUploadingFiles([]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const data: Partial<DamageMarker> = {
      damage_type: damageType,
      severity,
      notes: notes.trim() || null,
      photos,
    };

    if (clickPosition) {
      // New marker
      onSave({
        ...data,
        x: clickPosition.x,
        y: clickPosition.y,
        side: clickPosition.side,
      });
    } else if (initialData) {
      // Existing marker
      onSave({
        ...data,
        id: initialData.id,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setDamageType('SCRATCH');
    setSeverity('LOW');
    setNotes('');
    setPhotos([]);
    setUploadingFiles([]);
    onClose();
  };

  const isValid = damageType && severity;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Damage Marker' : 'Add Damage Marker'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Damage Type */}
          <div className="space-y-2">
            <Label htmlFor="damage-type">
              Damage Type <span className="text-destructive">*</span>
            </Label>
            <Select value={damageType} onValueChange={(v) => setDamageType(v as DamageMarkerType)}>
              <SelectTrigger id="damage-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAMAGE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>
              Severity <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={severity} onValueChange={(v) => setSeverity(v as DamageMarkerSeverity)}>
              <div className="flex gap-4">
                {SEVERITY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the damage in detail..."
              rows={3}
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos">Photos</Label>
            <div className="space-y-2">
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {uploadingFiles.length > 0 ? (
                      <>
                        <ImageIcon className="h-8 w-8 animate-pulse" />
                        <span className="text-sm">Uploading {uploadingFiles.length} photo(s)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Click to upload photos</span>
                        <span className="text-xs">PNG, JPG up to 10MB</span>
                      </>
                    )}
                  </div>
                </Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploadingFiles.length > 0}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || uploadingFiles.length > 0}>
            {initialData?.id ? 'Update' : 'Add'} Marker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

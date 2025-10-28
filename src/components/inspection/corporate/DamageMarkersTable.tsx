import { useState } from 'react';
import { Camera, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DamageMarker, DamageMarkerSeverity, DamageMarkerSide } from '@/types/damage-marker';

interface DamageMarkersTableProps {
  markers: DamageMarker[];
  onAddPhoto?: (markerId: string, file: File) => void;
  readOnly?: boolean;
}

const SIDE_LABELS: Record<DamageMarkerSide, string> = {
  FRONT: 'Front',
  REAR: 'Rear',
  LEFT: 'Left',
  RIGHT: 'Right',
  TOP: 'Top',
};

const SEVERITY_CONFIG: Record<DamageMarkerSeverity, { label: string; color: string }> = {
  LOW: { label: 'Minor', color: 'bg-yellow-500' },
  MED: { label: 'Moderate', color: 'bg-orange-500' },
  HIGH: { label: 'Major', color: 'bg-red-500' },
};

export function DamageMarkersTable({ markers, onAddPhoto, readOnly = false }: DamageMarkersTableProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileInputId, setFileInputId] = useState<string | null>(null);

  const handlePhotoClick = (url: string) => {
    setSelectedImage(url);
  };

  const handleAddPhotoClick = (markerId: string) => {
    setFileInputId(markerId);
    const input = document.getElementById(`photo-input-${markerId}`) as HTMLInputElement;
    input?.click();
  };

  const handleFileChange = (markerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddPhoto) {
      onAddPhoto(markerId, file);
      // Reset input
      e.target.value = '';
    }
  };

  if (markers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No damage markers recorded
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Damage ID</TableHead>
              <TableHead className="w-[100px]">Side</TableHead>
              <TableHead className="w-[140px]">Damage Type</TableHead>
              <TableHead className="w-[120px]">Severity</TableHead>
              <TableHead className="w-[180px]">Attachments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markers.map((marker) => {
              const severityConfig = SEVERITY_CONFIG[marker.severity];
              return (
                <TableRow key={marker.id}>
                  <TableCell className="font-mono text-xs">
                    {marker.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>{SIDE_LABELS[marker.side]}</TableCell>
                  <TableCell className="capitalize">
                    {marker.damage_type.toLowerCase().replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${severityConfig.color} text-white border-0`}
                    >
                      {severityConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      {marker.photos && marker.photos.length > 0 ? (
                        marker.photos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePhotoClick(photo.url)}
                            className="relative w-10 h-10 rounded overflow-hidden border-2 border-border hover:border-primary transition-colors group"
                            title="Click to view full size"
                          >
                            <img
                              src={photo.url}
                              alt={`Damage ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No photos</span>
                      )}
                      {!readOnly && onAddPhoto && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddPhotoClick(marker.id)}
                            className="h-8 gap-1"
                          >
                            <Camera className="w-3 h-3" />
                            Add Photo
                          </Button>
                          <input
                            id={`photo-input-${marker.id}`}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleFileChange(marker.id, e)}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Full-size image viewer dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Damage Photo</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="w-full">
              <img
                src={selectedImage}
                alt="Damage detail"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useDamageMarkers } from '@/hooks/useDamageMarkers';
import { DamageMarkersTable } from './DamageMarkersTable';
import { AlertCircle } from 'lucide-react';

interface DamageMarkersDisplayProps {
  damageMarkerIds: string[];
}

export function DamageMarkersDisplay({ damageMarkerIds }: DamageMarkersDisplayProps) {
  const { data: markers = [], isLoading } = useDamageMarkers(damageMarkerIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No damage markers recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DamageMarkersTable markers={markers} readOnly={true} />
    </div>
  );
}

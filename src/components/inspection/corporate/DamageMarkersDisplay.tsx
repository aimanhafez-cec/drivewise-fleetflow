import { useDamageMarkers } from '@/hooks/useDamageMarkers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { VehicleDiagramSVG } from './VehicleDiagramSVG';
import type { DamageMarkerSide, DamageMarkerSeverity } from '@/types/damage-marker';

interface DamageMarkersDisplayProps {
  damageMarkerIds: string[];
}

const VIEWS = [
  { id: 'FRONT' as const, label: 'Front View' },
  { id: 'REAR' as const, label: 'Rear View' },
  { id: 'LEFT' as const, label: 'Left Side' },
  { id: 'RIGHT' as const, label: 'Right Side' },
  { id: 'TOP' as const, label: 'Top View' },
];

function getSeverityColor(severity: DamageMarkerSeverity) {
  switch (severity) {
    case 'LOW':
      return { color: 'bg-yellow-500', label: 'Minor' };
    case 'MED':
      return { color: 'bg-orange-500', label: 'Moderate' };
    case 'HIGH':
      return { color: 'bg-red-500', label: 'Major' };
  }
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

  // Group markers by side
  const markersBySide = markers.reduce((acc, marker) => {
    if (!acc[marker.side]) {
      acc[marker.side] = [];
    }
    acc[marker.side].push(marker);
    return acc;
  }, {} as Record<DamageMarkerSide, typeof markers>);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map(view => {
          const count = markersBySide[view.id]?.length || 0;
          if (count === 0) return null;
          return (
            <Badge key={view.id} variant="outline">
              {view.label}: {count} {count === 1 ? 'marker' : 'markers'}
            </Badge>
          );
        })}
      </div>

      {/* Damage markers by side */}
      {VIEWS.map(view => {
        const sideMarkers = markersBySide[view.id];
        if (!sideMarkers || sideMarkers.length === 0) return null;

        return (
          <div key={view.id} className="space-y-4">
            <h3 className="text-lg font-semibold">{view.label}</h3>
            
            {/* Vehicle diagram with markers */}
            <div className="relative border rounded-lg p-4 bg-muted/50">
              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                <div className="absolute inset-0">
                  <VehicleDiagramSVG view={view.id} className="w-full h-full" />
                  {sideMarkers.map((marker) => {
                    const severityInfo = getSeverityColor(marker.severity);
                    return (
                      <div
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
                      >
                        <div className={`w-4 h-4 rounded-full ${severityInfo.color} border-2 border-white shadow-lg`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed list of markers */}
            <div className="grid gap-3">
              {sideMarkers.map((marker, index) => {
                const severityInfo = getSeverityColor(marker.severity);
                return (
                  <Card key={marker.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${severityInfo.color} text-white`}>
                            {severityInfo.label}
                          </Badge>
                          <span className="font-medium">{marker.damage_type}</span>
                          <span className="text-sm text-muted-foreground">
                            Position: ({Math.round(marker.x * 100)}%, {Math.round(marker.y * 100)}%)
                          </span>
                        </div>
                        
                        {marker.notes && (
                          <p className="text-sm text-muted-foreground">{marker.notes}</p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Recorded: {new Date(marker.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* Photos */}
                      {marker.photos && marker.photos.length > 0 && (
                        <div className="flex gap-2">
                          {marker.photos.map((photo, photoIndex) => (
                            <div
                              key={photoIndex}
                              className="w-20 h-20 rounded border overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(photo.url, '_blank')}
                            >
                              <img
                                src={photo.url}
                                alt={`Damage photo ${photoIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

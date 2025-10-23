import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { VehicleDiagramSVG } from './VehicleDiagramSVG';
import { DamageMarkerDialog } from './DamageMarkerDialog';
import { 
  useDamageMarkers, 
  useCreateDamageMarker, 
  useUpdateDamageMarker, 
  useDeleteDamageMarker 
} from '@/hooks/useDamageMarkers';
import type { DamageMarker, DamageMarkerSide } from '@/types/damage-marker';
import { SEVERITY_OPTIONS } from '@/types/damage-marker';

interface CorporateDamageMarkingProps {
  vehicleId: string;
  damageMarkerIds: string[];
  onUpdate: (ids: string[]) => void;
}

const VIEWS: { value: DamageMarkerSide; label: string }[] = [
  { value: 'FRONT', label: 'Front' },
  { value: 'REAR', label: 'Rear' },
  { value: 'LEFT', label: 'Left' },
  { value: 'RIGHT', label: 'Right' },
  { value: 'TOP', label: 'Top' },
];

const getSeverityColor = (severity: string) => {
  const option = SEVERITY_OPTIONS.find(s => s.value === severity);
  return option?.color || 'bg-gray-500';
};

export function CorporateDamageMarking({
  vehicleId,
  damageMarkerIds,
  onUpdate
}: CorporateDamageMarkingProps) {
  const [currentView, setCurrentView] = useState<DamageMarkerSide>('TOP');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<DamageMarker | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; side: DamageMarkerSide } | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const { data: markers = [], isLoading } = useDamageMarkers(damageMarkerIds);
  const createMarker = useCreateDamageMarker();
  const updateMarker = useUpdateDamageMarker();
  const deleteMarker = useDeleteDamageMarker();

  const currentViewMarkers = markers.filter(m => m.side === currentView);

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickPosition({ x, y, side: currentView });
    setSelectedMarker(null);
    setDialogOpen(true);
    setIsAddingMarker(false);
  };

  const handleMarkerClick = (marker: DamageMarker, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAddingMarker) {
      setSelectedMarker(marker);
      setClickPosition(null);
      setDialogOpen(true);
    }
  };

  const handleSaveMarker = async (data: Partial<DamageMarker>) => {
    try {
      if (data.id) {
        // Update existing marker
        await updateMarker.mutateAsync({
          id: data.id,
          updates: {
            damage_type: data.damage_type,
            severity: data.severity,
            notes: data.notes,
            photos: data.photos,
          },
        });
      } else {
        // Create new marker
        const newMarkerId = await createMarker.mutateAsync({
          line_id: null,
          event: 'OUT',
          side: data.side!,
          x: data.x!,
          y: data.y!,
          damage_type: data.damage_type!,
          severity: data.severity!,
          notes: data.notes,
          photos: data.photos,
        });
        
        onUpdate([...damageMarkerIds, newMarkerId]);
      }
    } catch (error) {
      console.error('Failed to save marker:', error);
    }
  };

  const handleDeleteMarker = async (markerId: string) => {
    try {
      await deleteMarker.mutateAsync(markerId);
      onUpdate(damageMarkerIds.filter(id => id !== markerId));
    } catch (error) {
      console.error('Failed to delete marker:', error);
    }
  };

  const handleClearView = () => {
    if (confirm(`Remove all ${currentViewMarkers.length} damage marker(s) from ${currentView} view?`)) {
      currentViewMarkers.forEach(marker => {
        handleDeleteMarker(marker.id);
      });
    }
  };

  if (!vehicleId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please select a vehicle first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="rounded-lg border border-dashed p-4 bg-muted/50">
        <p className="text-sm font-medium mb-2">Instructions:</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Click "Add Damage Marker" then click on the vehicle diagram to mark damage</li>
          <li>Select damage type and severity for each marker</li>
          <li>View all 5 angles: Front, Rear, Left, Right, Top</li>
          <li>Hover over markers to see damage details</li>
          <li>Click existing markers to edit or remove them</li>
        </ul>
      </div>

      {/* View Selector */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((view) => {
          const count = markers.filter(m => m.side === view.value).length;
          return (
            <Button
              key={view.value}
              variant={currentView === view.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView(view.value)}
            >
              {view.label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isAddingMarker ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsAddingMarker(!isAddingMarker)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isAddingMarker ? 'Click on vehicle to mark' : 'Add Damage Marker'}
        </Button>
        
        {currentViewMarkers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearView}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear View ({currentViewMarkers.length})
          </Button>
        )}
      </div>

      {/* Vehicle Diagram */}
      <Card className="relative overflow-hidden">
        <div
          ref={diagramRef}
          className={`relative w-full aspect-[3/2] bg-muted/10 ${
            isAddingMarker ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onClick={handleDiagramClick}
        >
          <VehicleDiagramSVG view={currentView} className="w-full h-full" />

          {/* Damage Markers */}
          {currentViewMarkers.map((marker) => (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={(e) => handleMarkerClick(marker, e)}
            >
              <div
                className={`w-6 h-6 rounded-full ${getSeverityColor(marker.severity)} border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125`}
              />
              
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg border">
                  <div className="font-medium">
                    {SEVERITY_OPTIONS.find(s => s.value === marker.severity)?.label} - {marker.damage_type}
                  </div>
                  {marker.notes && (
                    <div className="text-muted-foreground mt-1 max-w-[200px] whitespace-normal">
                      {marker.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMarker(marker.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Instructions overlay */}
          {isAddingMarker && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border">
                <p className="text-sm font-medium">Click on the vehicle to add a damage marker</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground font-medium">Severity:</span>
        {SEVERITY_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${option.color}`} />
            <span>{option.label}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {markers.length > 0 && (
        <div className="rounded-lg border p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">Damage Summary:</p>
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((view) => {
              const count = markers.filter(m => m.side === view.value).length;
              if (count === 0) return null;
              return (
                <Badge key={view.value} variant="outline">
                  {view.label}: {count} marker{count !== 1 ? 's' : ''}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Damage Marker Dialog */}
      <DamageMarkerDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedMarker(null);
          setClickPosition(null);
        }}
        onSave={handleSaveMarker}
        initialData={selectedMarker || undefined}
        clickPosition={clickPosition || undefined}
      />
    </div>
  );
}

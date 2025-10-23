import { Canvas, useThree } from '@react-three/fiber';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, RotateCw, Play, Pause, Trash2 } from 'lucide-react';
import { CarModel3D } from './CarModel3D';
import { DamageMarker3D } from './DamageMarker3D';
import { Scene3D } from './Scene3D';
import { DamageMarker } from '@/types/agreement-wizard';
import { DamageDrawer } from '@/components/agreements/DamageDrawer';
import { Vector3, Raycaster } from 'three';

interface Vehicle3DDamageInspectionProps {
  markers: DamageMarker[];
  onAddMarker: (marker: Omit<DamageMarker, 'id'>) => void;
  onRemoveMarker: (id: string) => void;
  disabled?: boolean;
  agreementId: string;
  lineId: string;
}

export const Vehicle3DDamageInspection: React.FC<Vehicle3DDamageInspectionProps> = ({
  markers,
  onAddMarker,
  onRemoveMarker,
  disabled = false,
  agreementId,
  lineId
}) => {
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; worldPos: Vector3 } | null>(null);
  const [isDamageDrawerOpen, setIsDamageDrawerOpen] = useState(false);

  const handleCanvasClick = useCallback((event: any) => {
    if (!isMarkingMode || disabled) return;

    // Get the intersection point
    if (event.intersections && event.intersections.length > 0) {
      const intersection = event.intersections[0];
      const worldPos = intersection.point;
      
      // Normalize coordinates for storage (0-1 range)
      const x = (worldPos.x + 5) / 10; // Assuming car is roughly -5 to 5 on x
      const y = (worldPos.y + 2) / 4;  // Assuming car is roughly -2 to 2 on y
      
      setClickPosition({ x, y, worldPos });
      setIsDamageDrawerOpen(true);
    }
  }, [isMarkingMode, disabled]);

  const handleDamageDrawerSave = (damageData: any) => {
    if (!clickPosition) return;

    // Map severity from DamageDrawer format to DamageMarker format
    const severityMap: Record<string, 'minor' | 'moderate' | 'major'> = {
      'LOW': 'minor',
      'MEDIUM': 'moderate',
      'HIGH': 'major'
    };

    const newMarker: Omit<DamageMarker, 'id'> = {
      x: clickPosition.x,
      y: clickPosition.y,
      worldPosition: {
        x: clickPosition.worldPos.x,
        y: clickPosition.worldPos.y,
        z: clickPosition.worldPos.z
      },
      severity: severityMap[damageData.severity] || 'minor',
      type: damageData.damage_type,
      photos: damageData.photos?.map((p: any) => p.url || '') || [],
      notes: damageData.notes || '',
      side: damageData.side || 'GENERAL'
    };

    onAddMarker(newMarker);
    setClickPosition(null);
    setIsDamageDrawerOpen(false);
    setIsMarkingMode(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
        return 'bg-yellow-500';
      case 'moderate':
        return 'bg-orange-500';
      case 'major':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={isMarkingMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMarkingMode(!isMarkingMode)}
                disabled={disabled}
              >
                <Target className="h-4 w-4 mr-2" />
                {isMarkingMode ? 'Marking Mode ON' : 'Mark Damage'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRotate(!autoRotate)}
              >
                {autoRotate ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Auto-Rotate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset camera view
                  window.location.reload();
                }}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <Badge variant="secondary">
                {markers.length} {markers.length === 1 ? 'Marker' : 'Markers'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Canvas */}
      <Card>
        <CardContent className="p-0">
          <div className="relative" style={{ height: '600px' }}>
            <Canvas
              camera={{ position: [5, 2, 5], fov: 50 }}
              shadows
            >
              <Scene3D autoRotate={autoRotate} enableZoom={true} />
              <CarModel3D 
                modelPath="/models/car.glb" 
                onClick={handleCanvasClick}
              />
              
              {/* Render Damage Markers */}
              {markers.map((marker) => {
                if (!marker.worldPosition) return null;
                
                return (
                  <DamageMarker3D
                    key={marker.id}
                    position={[
                      marker.worldPosition.x,
                      marker.worldPosition.y,
                      marker.worldPosition.z
                    ]}
                    severity={marker.severity}
                    type={marker.type}
                    notes={marker.notes}
                    onRemove={() => onRemoveMarker(marker.id)}
                  />
                );
              })}
            </Canvas>

            {/* Instructions Overlay */}
            {isMarkingMode && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium">Click on the car to mark damage</p>
              </div>
            )}

            {markers.length === 0 && !isMarkingMode && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg text-center max-w-md">
                  <p className="text-sm font-medium mb-2">Interactive 3D Vehicle Inspection</p>
                  <p className="text-xs text-muted-foreground">
                    Drag to rotate • Scroll to zoom • Click "Mark Damage" to add markers
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Damage Markers List */}
      {markers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Damage Markers ({markers.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markers.forEach(m => onRemoveMarker(m.id))}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              <div className="grid gap-2">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(marker.severity)}`} />
                      <div>
                        <div className="text-sm font-medium">{marker.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {marker.severity} • {marker.notes || 'No notes'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMarker(marker.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Severity Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-xs">
            <span className="font-medium">Severity:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Minor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Major</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Drawer for adding new markers */}
      <DamageDrawer
        open={isDamageDrawerOpen}
        onOpenChange={(open) => {
          setIsDamageDrawerOpen(open);
          if (!open) {
            setClickPosition(null);
            setIsMarkingMode(false);
          }
        }}
        marker={clickPosition ? {
          lineId: lineId,
          x: clickPosition.x,
          y: clickPosition.y,
          side: 'GENERAL'
        } : null}
        onSave={handleDamageDrawerSave}
      />
    </div>
  );
};

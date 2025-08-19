import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Car } from 'lucide-react';

interface StandaloneDamageMarkingProps {
  vehicleId: string;
  existingMarkerIds: string[];
  onUpdate: (data: { damageMarkerIds: string[] }) => void;
}

const VEHICLE_SIDES = [
  { id: 'FRONT', label: 'Front' },
  { id: 'REAR', label: 'Rear' },
  { id: 'LEFT', label: 'Left' },
  { id: 'RIGHT', label: 'Right' },
  { id: 'TOP', label: 'Top' }
];

export const StandaloneDamageMarking: React.FC<StandaloneDamageMarkingProps> = ({
  vehicleId,
  existingMarkerIds,
  onUpdate
}) => {
  const [markerIds, setMarkerIds] = useState<string[]>(existingMarkerIds || []);
  const [currentSide, setCurrentSide] = useState('FRONT');
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    setMarkerIds(existingMarkerIds || []);
  }, [existingMarkerIds]);

  const handleMarkersUpdate = (newMarkerIds: string[]) => {
    setMarkerIds(newMarkerIds);
    onUpdate({ damageMarkerIds: newMarkerIds });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // Create a new damage marker
    const newMarker = {
      id: `marker-${Date.now()}`,
      x,
      y,
      side: currentSide,
      damage_type: 'scratch',
      severity: 'minor',
      event: 'inspection'
    };

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    
    const newMarkerIds = [...markerIds, newMarker.id];
    handleMarkersUpdate(newMarkerIds);
  };

  const getVehicleOutline = () => {
    switch (currentSide) {
      case 'FRONT':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <rect x="60" y="20" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" rx="10" />
            <rect x="70" y="10" width="60" height="10" fill="none" stroke="currentColor" strokeWidth="2" rx="5" />
            <circle cx="80" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="120" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="90" y="50" width="20" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="100" y="110" textAnchor="middle" className="text-xs">Front View</text>
          </svg>
        );
      case 'REAR':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <rect x="60" y="20" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" rx="10" />
            <rect x="70" y="100" width="60" height="10" fill="none" stroke="currentColor" strokeWidth="2" rx="5" />
            <rect x="75" y="30" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="113" y="30" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="90" y="60" width="20" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="100" y="110" textAnchor="middle" className="text-xs">Rear View</text>
          </svg>
        );
      case 'LEFT':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <path d="M20 40 L180 40 L180 80 L20 80 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="85" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="150" cy="85" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="30" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="60" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="125" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="155" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="100" y="110" textAnchor="middle" className="text-xs">Left Side</text>
          </svg>
        );
      case 'RIGHT':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <path d="M20 40 L180 40 L180 80 L20 80 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="85" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="150" cy="85" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="30" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="60" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="125" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="155" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="100" y="110" textAnchor="middle" className="text-xs">Right Side</text>
          </svg>
        );
      case 'TOP':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <rect x="40" y="20" width="120" height="80" fill="none" stroke="currentColor" strokeWidth="2" rx="15" />
            <rect x="50" y="30" width="20" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="130" y="30" width="20" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="75" y="35" width="50" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="85" y="80" width="30" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="100" y="110" textAnchor="middle" className="text-xs">Top View</text>
          </svg>
        );
      default:
        return null;
    }
  };

  const hasDamage = markerIds.length > 0;
  const currentSideMarkers = markers.filter(m => m.side === currentSide);

  return (
    <div id="step-damage" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Damage Marking</h3>
        <p className="text-muted-foreground">
          Mark any damage, scratches, dents, or issues on the vehicle diagram.
        </p>
      </div>

      {/* Damage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Condition Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {hasDamage ? (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {markerIds.length} damage marker{markerIds.length !== 1 ? 's' : ''} found
                </Badge>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  No damage markers
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Vehicle Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Side Selection */}
            <div className="flex flex-wrap gap-2">
              {VEHICLE_SIDES.map((side) => (
                <Button
                  key={side.id}
                  variant={currentSide === side.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSide(side.id)}
                >
                  {side.label}
                </Button>
              ))}
            </div>

            {/* Vehicle Diagram Canvas */}
            <div
              className="relative h-64 bg-gray-50 rounded-lg cursor-crosshair border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              onClick={handleCanvasClick}
            >
              {/* Vehicle Outline */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {getVehicleOutline()}
              </div>

              {/* Damage Markers */}
              {currentSideMarkers.map((marker) => {
                const left = marker.x * 100;
                const top = marker.y * 100;
                
                return (
                  <div
                    key={marker.id}
                    className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    title={`${marker.damage_type} - ${marker.severity}`}
                  />
                );
              })}

              {/* Click Instruction */}
              {currentSideMarkers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Click on the diagram to add damage markers</p>
                    <p className="text-xs mt-1">Current view: {VEHICLE_SIDES.find(s => s.id === currentSide)?.label}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click on the vehicle diagram to mark damage locations</li>
              <li>• Use different views (Front, Rear, Left, Right, Top) to thoroughly inspect the vehicle</li>
              <li>• Each marker represents damage at that location</li>
              <li>• Switch between different views to mark all sides of the vehicle</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
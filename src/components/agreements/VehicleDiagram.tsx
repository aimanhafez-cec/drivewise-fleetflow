import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VehicleDiagramProps {
  lineId: string;
  onMarkerClick: (x: number, y: number, lineId: string, side: string) => void;
  markers: any[];
  comparisonMarkers?: any[];
  currentSide: string;
  onSideChange: (side: string) => void;
  getSeverityColor: (severity: string) => string;
}

const VEHICLE_SIDES = [
  { id: 'FRONT', label: 'Front' },
  { id: 'REAR', label: 'Rear' },
  { id: 'LEFT', label: 'Left' },
  { id: 'RIGHT', label: 'Right' },
  { id: 'TOP', label: 'Top' }
];

export const VehicleDiagram: React.FC<VehicleDiagramProps> = ({
  lineId,
  onMarkerClick,
  markers,
  comparisonMarkers = [],
  currentSide,
  onSideChange,
  getSeverityColor
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    onMarkerClick(x, y, lineId, currentSide);
  };

  const renderMarker = (marker: any, index: number, isComparison: boolean = false) => {
    const left = marker.x * 100;
    const top = marker.y * 100;
    
    return (
      <div
        key={`${marker.id}-${index}`}
        className={`absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
          isComparison ? 'ring-2 ring-blue-500' : ''
        } ${getSeverityColor(marker.severity)}`}
        style={{ left: `${left}%`, top: `${top}%` }}
        title={`${marker.damage_type} - ${marker.severity} (${marker.event})`}
      />
    );
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

  return (
    <div className="space-y-4">
      {/* Side Selection */}
      <div className="flex flex-wrap gap-2">
        {VEHICLE_SIDES.map((side) => (
          <Button
            key={side.id}
            variant={currentSide === side.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSideChange(side.id)}
          >
            {side.label}
          </Button>
        ))}
      </div>

      {/* Vehicle Diagram Canvas */}
      <Card>
        <CardContent className="p-4">
          <div
            ref={canvasRef}
            id={`damage-canvas-${lineId}-${currentSide}`}
            className="relative h-64 bg-gray-50 rounded-lg cursor-crosshair border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            onClick={handleCanvasClick}
          >
            {/* Vehicle Outline */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {getVehicleOutline()}
            </div>

            {/* Damage Markers */}
            {markers.map((marker, index) => renderMarker(marker, index, false))}
            
            {/* Comparison Markers (IN vs OUT) */}
            {comparisonMarkers.map((marker, index) => renderMarker(marker, index, true))}

            {/* Click Instruction */}
            {markers.length === 0 && comparisonMarkers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-sm">Click on the diagram to add damage markers</p>
                  <p className="text-xs mt-1">Current view: {VEHICLE_SIDES.find(s => s.id === currentSide)?.label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Marker Info */}
          {(markers.length > 0 || comparisonMarkers.length > 0) && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">Damage Markers on {VEHICLE_SIDES.find(s => s.id === currentSide)?.label}:</div>
              <div className="flex flex-wrap gap-2">
                {markers.map((marker) => (
                  <Badge key={marker.id} variant="secondary" className="text-xs">
                    {marker.damage_type} ({marker.event})
                  </Badge>
                ))}
                {comparisonMarkers.map((marker) => (
                  <Badge key={marker.id} variant="outline" className="text-xs border-blue-500">
                    {marker.damage_type} (Comparison)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
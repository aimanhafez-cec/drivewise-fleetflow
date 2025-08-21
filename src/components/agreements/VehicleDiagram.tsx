import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VehicleDiagramProps {
  lineId: string;
  onMarkerClick: (x: number, y: number, lineId: string, side: string) => void;
  markers: any[];
  comparisonMarkers?: any[];
  getSeverityColor: (severity: string) => string;
}

export const VehicleDiagram: React.FC<VehicleDiagramProps> = ({
  lineId,
  onMarkerClick,
  markers,
  comparisonMarkers = [],
  getSeverityColor
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // Determine which part of the vehicle was clicked based on coordinates
    let side = 'GENERAL';
    
    // Top view (center area)
    if (x >= 0.2 && x <= 0.8 && y >= 0.3 && y <= 0.7) {
      side = 'TOP';
    }
    // Front view (top)
    else if (x >= 0.3 && x <= 0.7 && y >= 0.05 && y <= 0.25) {
      side = 'FRONT';
    }
    // Rear view (bottom)
    else if (x >= 0.3 && x <= 0.7 && y >= 0.75 && y <= 0.95) {
      side = 'REAR';
    }
    // Left side door
    else if (x >= 0.05 && x <= 0.15 && y >= 0.3 && y <= 0.7) {
      side = 'LEFT';
    }
    // Right side door
    else if (x >= 0.85 && x <= 0.95 && y >= 0.3 && y <= 0.7) {
      side = 'RIGHT';
    }

    onMarkerClick(x, y, lineId, side);
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

  return (
    <Card>
      <CardContent className="p-4">
        <div
          ref={canvasRef}
          id={`damage-canvas-${lineId}`}
          className="relative bg-white rounded-lg cursor-crosshair border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
          onClick={handleCanvasClick}
          style={{ minHeight: '400px' }}
        >
          {/* Vehicle Diagram Background */}
          <img 
            src="/lovable-uploads/95ba5480-060f-4175-97a7-068b6811f68f.png"
            alt="Vehicle Damage Diagram"
            className="w-full h-full object-contain"
            style={{ minHeight: '400px' }}
          />

          {/* Damage Markers */}
          {markers.map((marker, index) => renderMarker(marker, index, false))}
          
          {/* Comparison Markers (IN vs OUT) */}
          {comparisonMarkers.map((marker, index) => renderMarker(marker, index, true))}

          {/* Click Instruction */}
          {markers.length === 0 && comparisonMarkers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <div className="text-center text-white bg-black bg-opacity-70 p-4 rounded-lg">
                <p className="text-sm font-medium">Click on the diagram to add damage markers</p>
                <p className="text-xs mt-1">Click on any part of the vehicle to mark damage</p>
              </div>
            </div>
          )}
        </div>

        {/* Marker Info */}
        {(markers.length > 0 || comparisonMarkers.length > 0) && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-white">Damage Markers:</div>
            <div className="flex flex-wrap gap-2">
              {markers.map((marker) => (
                <Badge key={marker.id} variant="secondary" className="text-xs">
                  {marker.damage_type} - {marker.side} ({marker.event})
                </Badge>
              ))}
              {comparisonMarkers.map((marker) => (
                <Badge key={marker.id} variant="outline" className="text-xs border-blue-500">
                  {marker.damage_type} - {marker.side} (Comparison)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
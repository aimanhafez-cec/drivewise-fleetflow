import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, RotateCw, Trash2 } from 'lucide-react';
import type { DamageMarker, VehicleView } from '@/types/agreement-wizard';

interface VehicleDiagramInteractiveProps {
  markers: DamageMarker[];
  currentView: VehicleView;
  onAddMarker: (marker: Omit<DamageMarker, 'id'>) => void;
  onRemoveMarker: (id: string) => void;
  onViewChange: (view: VehicleView) => void;
  disabled?: boolean;
}

const views: { value: VehicleView; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'rear', label: 'Rear' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' },
  { value: 'top', label: 'Top View' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'minor': return 'bg-yellow-500';
    case 'moderate': return 'bg-orange-500';
    case 'major': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const VehicleDiagramInteractive = ({
  markers,
  currentView,
  onAddMarker,
  onRemoveMarker,
  onViewChange,
  disabled = false,
}: VehicleDiagramInteractiveProps) => {
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddMarker({
      view: currentView,
      x,
      y,
      severity: 'minor',
      type: 'scratch',
      photos: [],
      notes: '',
    });

    setIsAddingMarker(false);
  };

  const currentViewMarkers = markers.filter(m => m.view === currentView);

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="flex flex-wrap gap-2">
        {views.map((view) => (
          <Button
            key={view.value}
            variant={currentView === view.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange(view.value)}
            disabled={disabled}
          >
            {view.label}
            {markers.filter(m => m.view === view.value).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {markers.filter(m => m.view === view.value).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isAddingMarker ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsAddingMarker(!isAddingMarker)}
          disabled={disabled}
        >
          <Car className="h-4 w-4 mr-2" />
          {isAddingMarker ? 'Click on vehicle to mark' : 'Add Damage Marker'}
        </Button>
        
        {currentViewMarkers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              currentViewMarkers.forEach(m => onRemoveMarker(m.id));
            }}
            disabled={disabled}
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
          className={`relative w-full aspect-[3/2] bg-muted/20 ${
            isAddingMarker && !disabled ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onClick={handleDiagramClick}
        >
          {/* Vehicle Outline SVG */}
          <svg
            viewBox="0 0 300 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Vehicle shape based on current view */}
            {currentView === 'front' && (
              <g>
                {/* Front view - simplified car front */}
                <rect x="50" y="40" width="200" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="90" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="210" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="80" y="50" width="140" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </g>
            )}
            {currentView === 'rear' && (
              <g>
                {/* Rear view - similar to front */}
                <rect x="50" y="40" width="200" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="90" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="210" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="80" y="130" width="140" height="25" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </g>
            )}
            {currentView === 'left' && (
              <g>
                {/* Left side view */}
                <path d="M 30 100 L 50 80 L 100 70 L 200 70 L 250 80 L 270 100 L 270 130 L 250 150 L 50 150 L 30 130 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="80" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="220" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
              </g>
            )}
            {currentView === 'right' && (
              <g>
                {/* Right side view - mirrored left */}
                <path d="M 270 100 L 250 80 L 200 70 L 100 70 L 50 80 L 30 100 L 30 130 L 50 150 L 250 150 L 270 130 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="220" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="80" cy="150" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
              </g>
            )}
            {currentView === 'top' && (
              <g>
                {/* Top view */}
                <rect x="80" y="30" width="140" height="140" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="90" y="50" width="120" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="90" y="110" width="120" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </g>
            )}
          </svg>

          {/* Damage Markers */}
          {currentViewMarkers.map((marker) => (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              <div
                className={`w-6 h-6 rounded-full ${getSeverityColor(marker.severity)} border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Could open marker details dialog here
                }}
              />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                  {marker.type} ({marker.severity})
                </div>
              </div>
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMarker(marker.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {/* Instructions overlay */}
          {isAddingMarker && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium">Click on the vehicle to add a damage marker</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Severity:</span>
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
    </div>
  );
};

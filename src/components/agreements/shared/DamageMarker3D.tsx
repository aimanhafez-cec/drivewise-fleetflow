import { Html } from '@react-three/drei';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DamageMarker3DProps {
  position: [number, number, number];
  severity: 'minor' | 'moderate' | 'major';
  type: string;
  notes: string;
  onRemove: () => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'minor':
      return '#fbbf24'; // yellow
    case 'moderate':
      return '#f97316'; // orange
    case 'major':
      return '#ef4444'; // red
    default:
      return '#9ca3af'; // gray
  }
};

export const DamageMarker3D: React.FC<DamageMarker3DProps> = ({
  position,
  severity,
  type,
  notes,
  onRemove
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Marker Sphere */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 0.15 : 0.1}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color={getSeverityColor(severity)} 
          emissive={getSeverityColor(severity)}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Label on Hover */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg min-w-[200px]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {severity}
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm font-medium text-foreground mb-1">{type}</div>
            {notes && <div className="text-xs text-muted-foreground">{notes}</div>}
          </div>
        </Html>
      )}
    </group>
  );
};

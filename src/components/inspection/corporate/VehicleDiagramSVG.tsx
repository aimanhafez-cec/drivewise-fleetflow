import type { DamageMarkerSide } from '@/types/damage-marker';
import rearImg from '@/assets/vehicle-views/rear.png';
import frontImg from '@/assets/vehicle-views/front.png';
import topImg from '@/assets/vehicle-views/top.png';
import leftImg from '@/assets/vehicle-views/left.png';
import rightImg from '@/assets/vehicle-views/right.png';

interface VehicleDiagramSVGProps {
  view: DamageMarkerSide;
  className?: string;
}

const VIEW_IMAGES: Record<DamageMarkerSide, string> = {
  REAR: rearImg,
  FRONT: frontImg,
  TOP: topImg,
  LEFT: leftImg,
  RIGHT: rightImg,
};

export function VehicleDiagramSVG({ view, className = '' }: VehicleDiagramSVGProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-background ${className}`}>
      <img
        src={VIEW_IMAGES[view]}
        alt={`Vehicle ${view.toLowerCase()} view`}
        className="max-w-full max-h-full object-contain"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}

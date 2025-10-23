import type { DamageMarkerSide } from '@/types/damage-marker';

interface VehicleDiagramSVGProps {
  view: DamageMarkerSide;
  className?: string;
}

export function VehicleDiagramSVG({ view, className = '' }: VehicleDiagramSVGProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* TOP VIEW - Bird's eye view */}
      {view === 'TOP' && (
        <g id="top-view">
          {/* Main vehicle body */}
          <rect 
            x="80" 
            y="20" 
            width="140" 
            height="160" 
            rx="8" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          
          {/* Windscreen */}
          <rect x="90" y="25" width="120" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Bonnet */}
          <line x1="100" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="1"/>
          
          {/* Front doors */}
          <line x1="100" y1="70" x2="200" y2="70" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear doors */}
          <line x1="100" y1="120" x2="200" y2="120" stroke="currentColor" strokeWidth="1"/>
          
          {/* Boot */}
          <line x1="100" y1="150" x2="200" y2="150" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear window */}
          <rect x="90" y="155" width="120" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Left Front Wheel */}
          <circle cx="70" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          
          {/* Right Front Wheel */}
          <circle cx="230" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          
          {/* Left Rear Wheel */}
          <circle cx="70" cy="140" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          
          {/* Right Rear Wheel */}
          <circle cx="230" cy="140" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
        </g>
      )}

      {/* REAR VIEW */}
      {view === 'REAR' && (
        <g id="rear-view">
          {/* Main body outline */}
          <rect 
            x="60" 
            y="40" 
            width="180" 
            height="120" 
            rx="8" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          
          {/* Rear Window */}
          <rect x="80" y="50" width="140" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Boot/Trunk */}
          <line x1="80" y1="100" x2="220" y2="100" stroke="currentColor" strokeWidth="1"/>
          
          {/* Bumper */}
          <rect x="70" y="135" width="160" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Left Tail Light */}
          <rect x="65" y="105" width="12" height="25" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Right Tail Light */}
          <rect x="223" y="105" width="12" height="25" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Left Wheel */}
          <circle cx="90" cy="170" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="90" cy="170" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Right Wheel */}
          <circle cx="210" cy="170" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="210" cy="170" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
        </g>
      )}

      {/* FRONT VIEW */}
      {view === 'FRONT' && (
        <g id="front-view">
          {/* Main body outline */}
          <rect 
            x="60" 
            y="60" 
            width="180" 
            height="100" 
            rx="8" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          
          {/* Windscreen - angled */}
          <path 
            d="M 90 30 L 80 60 L 220 60 L 210 30 Z"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          />
          
          {/* Bonnet */}
          <line x1="80" y1="80" x2="220" y2="80" stroke="currentColor" strokeWidth="1"/>
          
          {/* Grille */}
          <rect x="110" y="110" width="80" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Bumper */}
          <rect x="70" y="145" width="160" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Left Headlight */}
          <ellipse cx="85" cy="100" rx="15" ry="12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Right Headlight */}
          <ellipse cx="215" cy="100" rx="15" ry="12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Left Wheel */}
          <circle cx="90" cy="170" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="90" cy="170" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Right Wheel */}
          <circle cx="210" cy="170" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="210" cy="170" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
        </g>
      )}

      {/* LEFT SIDE VIEW */}
      {view === 'LEFT' && (
        <g id="left-view">
          {/* Main body outline - side profile */}
          <path 
            d="M 30 80 L 30 90 L 50 100 L 50 120 L 250 120 L 250 100 L 270 90 L 270 80 L 240 80 L 240 50 L 100 50 L 100 80 Z"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          
          {/* Windscreen */}
          <line x1="100" y1="50" x2="95" y2="80" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Front Door */}
          <line x1="120" y1="80" x2="120" y2="120" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear Door */}
          <line x1="180" y1="80" x2="180" y2="120" stroke="currentColor" strokeWidth="1"/>
          
          {/* Back Window */}
          <line x1="240" y1="50" x2="245" y2="80" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Roof */}
          <rect x="110" y="55" width="120" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Front Window */}
          <rect x="105" y="60" width="25" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear Window */}
          <rect x="190" y="60" width="25" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Front Wheel */}
          <circle cx="80" cy="140" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="80" cy="140" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear Wheel */}
          <circle cx="220" cy="140" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="220" cy="140" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
        </g>
      )}

      {/* RIGHT SIDE VIEW */}
      {view === 'RIGHT' && (
        <g id="right-view">
          {/* Main body outline - mirror of left side */}
          <path 
            d="M 270 80 L 270 90 L 250 100 L 250 120 L 50 120 L 50 100 L 30 90 L 30 80 L 60 80 L 60 50 L 200 50 L 200 80 Z"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          
          {/* Windscreen */}
          <line x1="200" y1="50" x2="205" y2="80" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Front Door */}
          <line x1="180" y1="80" x2="180" y2="120" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear Door */}
          <line x1="120" y1="80" x2="120" y2="120" stroke="currentColor" strokeWidth="1"/>
          
          {/* Back Window */}
          <line x1="60" y1="50" x2="55" y2="80" stroke="currentColor" strokeWidth="1.5"/>
          
          {/* Roof */}
          <rect x="70" y="55" width="120" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Front Window */}
          <rect x="170" y="60" width="25" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear Window */}
          <rect x="85" y="60" width="25" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Front Wheel */}
          <circle cx="220" cy="140" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="220" cy="140" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
          
          {/* Rear Wheel */}
          <circle cx="80" cy="140" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="80" cy="140" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
        </g>
      )}
    </svg>
  );
}

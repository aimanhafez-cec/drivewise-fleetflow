import type { DamageMarkerSide } from '@/types/damage-marker';

interface VehicleDiagramSVGProps {
  view: DamageMarkerSide;
  className?: string;
}

export function VehicleDiagramSVG({ view, className = '' }: VehicleDiagramSVGProps) {
  const getViewBox = () => {
    switch (view) {
      case 'TOP':
        return '0 0 800 1000';
      case 'REAR':
      case 'FRONT':
        return '0 0 900 600';
      case 'LEFT':
      case 'RIGHT':
        return '0 0 1000 600';
      default:
        return '0 0 800 1000';
    }
  };

  return (
    <svg
      viewBox={getViewBox()}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .vehicle-outline { fill: white; stroke: #8B9DC3; stroke-width: 3; }
          .vehicle-section { fill: none; stroke: #A0AEC0; stroke-width: 2; }
          .vehicle-wheel { fill: white; stroke: #8B9DC3; stroke-width: 3; }
          .vehicle-wheel-inner { fill: none; stroke: #A0AEC0; stroke-width: 2; }
          .vehicle-label { fill: #4A5568; font-family: system-ui, -apple-system, sans-serif; }
          .vehicle-label-large { font-size: 18px; font-weight: 600; }
          .vehicle-label-medium { font-size: 14px; font-weight: 500; }
          .vehicle-label-small { font-size: 11px; font-weight: 600; }
          .vehicle-label-tiny { font-size: 10px; font-weight: 500; }
        `}</style>
      </defs>

      {/* TOP VIEW - Bird's eye view */}
      {view === 'TOP' && (
        <g id="top-view">
          {/* Main vehicle body outline with rounded corners */}
          <path 
            d="M 200 100 Q 180 100 180 120 L 180 880 Q 180 900 200 900 L 600 900 Q 620 900 620 880 L 620 120 Q 620 100 600 100 Z"
            className="vehicle-outline"
          />
          
          {/* Windscreen */}
          <rect x="220" y="130" width="360" height="80" rx="8" className="vehicle-section"/>
          <text x="400" y="178" textAnchor="middle" className="vehicle-label vehicle-label-medium">WINDSCREEN</text>
          
          {/* Bonnet */}
          <rect x="220" y="220" width="360" height="100" rx="4" className="vehicle-section"/>
          <text x="400" y="278" textAnchor="middle" className="vehicle-label vehicle-label-large">BONNET</text>
          
          {/* Roof - center section */}
          <rect x="220" y="330" width="360" height="240" rx="4" className="vehicle-section"/>
          <text x="400" y="460" textAnchor="middle" className="vehicle-label vehicle-label-large">ROOF</text>
          
          {/* Boot */}
          <rect x="220" y="580" width="360" height="170" rx="4" className="vehicle-section"/>
          <text x="400" y="675" textAnchor="middle" className="vehicle-label vehicle-label-large">BOOT</text>
          
          {/* Rear window */}
          <rect x="220" y="760" width="360" height="80" rx="8" className="vehicle-section"/>
          <text x="400" y="808" textAnchor="middle" className="vehicle-label vehicle-label-medium">REAR WINDOW</text>
          
          {/* Left Front Wheel */}
          <circle cx="200" cy="280" r="45" className="vehicle-wheel"/>
          <circle cx="200" cy="280" r="30" className="vehicle-wheel-inner"/>
          <text x="200" y="287" textAnchor="middle" className="vehicle-label vehicle-label-small">CAP</text>
          
          {/* Right Front Wheel */}
          <circle cx="600" cy="280" r="45" className="vehicle-wheel"/>
          <circle cx="600" cy="280" r="30" className="vehicle-wheel-inner"/>
          <text x="600" y="287" textAnchor="middle" className="vehicle-label vehicle-label-small">CAP</text>
          
          {/* Left Rear Wheel */}
          <circle cx="200" cy="720" r="45" className="vehicle-wheel"/>
          <circle cx="200" cy="720" r="30" className="vehicle-wheel-inner"/>
          <text x="200" y="727" textAnchor="middle" className="vehicle-label vehicle-label-small">CAP</text>
          
          {/* Right Rear Wheel */}
          <circle cx="600" cy="720" r="45" className="vehicle-wheel"/>
          <circle cx="600" cy="720" r="30" className="vehicle-wheel-inner"/>
          <text x="600" y="727" textAnchor="middle" className="vehicle-label vehicle-label-small">CAP</text>
          
          {/* Left Front Door */}
          <rect x="165" y="330" width="50" height="120" rx="4" className="vehicle-section"/>
          <text x="140" y="395" textAnchor="end" className="vehicle-label vehicle-label-medium">DOOR</text>
          
          {/* Left Rear Door */}
          <rect x="165" y="455" width="50" height="120" rx="4" className="vehicle-section"/>
          <text x="140" y="520" textAnchor="end" className="vehicle-label vehicle-label-medium">DOOR</text>
          
          {/* Right Front Door */}
          <rect x="585" y="330" width="50" height="120" rx="4" className="vehicle-section"/>
          <text x="660" y="395" textAnchor="start" className="vehicle-label vehicle-label-medium">DOOR</text>
          
          {/* Right Rear Door */}
          <rect x="585" y="455" width="50" height="120" rx="4" className="vehicle-section"/>
          <text x="660" y="520" textAnchor="start" className="vehicle-label vehicle-label-medium">DOOR</text>
          
          {/* Left Wing */}
          <path d="M 160 240 L 140 240 L 140 320 L 160 320" className="vehicle-section"/>
          <text x="115" y="285" textAnchor="end" className="vehicle-label vehicle-label-small">WING</text>
          
          {/* Right Wing */}
          <path d="M 640 240 L 660 240 L 660 320 L 640 320" className="vehicle-section"/>
          <text x="685" y="285" textAnchor="start" className="vehicle-label vehicle-label-small">WING</text>
          
          {/* Left Headlight */}
          <ellipse cx="180" cy="180" rx="25" ry="35" className="vehicle-section"/>
          <text x="120" y="185" textAnchor="end" className="vehicle-label vehicle-label-tiny">HEADLIGHTS</text>
          
          {/* Right Headlight */}
          <ellipse cx="620" cy="180" rx="25" ry="35" className="vehicle-section"/>
          <text x="680" y="185" textAnchor="start" className="vehicle-label vehicle-label-tiny">HEADLIGHTS</text>
          
          {/* Left Wing Mirror */}
          <rect x="160" y="310" width="15" height="30" rx="2" className="vehicle-wheel"/>
          
          {/* Right Wing Mirror */}
          <rect x="625" y="310" width="15" height="30" rx="2" className="vehicle-wheel"/>
        </g>
      )}

      {/* REAR VIEW */}
      {view === 'REAR' && (
        <g id="rear-view">
          {/* Main body outline */}
          <path 
            d="M 150 100 Q 120 100 120 130 L 120 500 Q 120 520 140 520 L 760 520 Q 780 520 780 500 L 780 130 Q 780 100 750 100 Z"
            className="vehicle-outline"
          />
          
          {/* Rear Window */}
          <rect x="200" y="130" width="500" height="120" rx="8" className="vehicle-section"/>
          <text x="450" y="198" textAnchor="middle" className="vehicle-label vehicle-label-large">REAR WINDOW</text>
          
          {/* Boot/Trunk */}
          <rect x="200" y="260" width="500" height="180" rx="4" className="vehicle-section"/>
          <text x="450" y="362" textAnchor="middle" className="vehicle-label vehicle-label-large">BOOT</text>
          
          {/* Bumper */}
          <rect x="180" y="450" width="540" height="50" rx="6" className="vehicle-section"/>
          <text x="450" y="482" textAnchor="middle" className="vehicle-label vehicle-label-medium">BUMPER</text>
          
          {/* Left Tail Light */}
          <rect x="150" y="320" width="40" height="80" rx="4" className="vehicle-section"/>
          <text x="130" y="365" textAnchor="end" className="vehicle-label vehicle-label-small">TAIL</text>
          
          {/* Right Tail Light */}
          <rect x="710" y="320" width="40" height="80" rx="4" className="vehicle-section"/>
          <text x="770" y="365" textAnchor="start" className="vehicle-label vehicle-label-small">TAIL</text>
          
          {/* Left Wheel */}
          <circle cx="240" cy="520" r="55" className="vehicle-wheel"/>
          <circle cx="240" cy="520" r="40" className="vehicle-wheel-inner"/>
          <circle cx="240" cy="520" r="25" className="vehicle-wheel-inner"/>
          
          {/* Right Wheel */}
          <circle cx="660" cy="520" r="55" className="vehicle-wheel"/>
          <circle cx="660" cy="520" r="40" className="vehicle-wheel-inner"/>
          <circle cx="660" cy="520" r="25" className="vehicle-wheel-inner"/>
        </g>
      )}

      {/* FRONT VIEW */}
      {view === 'FRONT' && (
        <g id="front-view">
          {/* Main body outline */}
          <path 
            d="M 150 180 Q 120 180 120 210 L 120 500 Q 120 520 140 520 L 760 520 Q 780 520 780 500 L 780 210 Q 780 180 750 180 Z"
            className="vehicle-outline"
          />
          
          {/* Windscreen - angled trapezoid */}
          <path 
            d="M 250 100 L 200 180 L 700 180 L 650 100 Z"
            className="vehicle-section"
          />
          <text x="450" y="148" textAnchor="middle" className="vehicle-label vehicle-label-medium">WINDSCREEN</text>
          
          {/* Bonnet */}
          <rect x="200" y="190" width="500" height="140" rx="4" className="vehicle-section"/>
          <text x="450" y="270" textAnchor="middle" className="vehicle-label vehicle-label-large">BONNET</text>
          
          {/* Grille */}
          <rect x="280" y="340" width="340" height="60" rx="4" className="vehicle-section"/>
          <text x="450" y="377" textAnchor="middle" className="vehicle-label vehicle-label-medium">GRILLE</text>
          
          {/* Bumper */}
          <rect x="180" y="410" width="540" height="60" rx="6" className="vehicle-section"/>
          <text x="450" y="448" textAnchor="middle" className="vehicle-label vehicle-label-medium">BUMPER</text>
          
          {/* Left Headlight */}
          <ellipse cx="220" cy="360" rx="50" ry="40" className="vehicle-section"/>
          <text x="150" y="368" textAnchor="end" className="vehicle-label vehicle-label-small">HEADLIGHT</text>
          
          {/* Right Headlight */}
          <ellipse cx="680" cy="360" rx="50" ry="40" className="vehicle-section"/>
          <text x="750" y="368" textAnchor="start" className="vehicle-label vehicle-label-small">HEADLIGHT</text>
          
          {/* Left Wheel */}
          <circle cx="240" cy="520" r="55" className="vehicle-wheel"/>
          <circle cx="240" cy="520" r="40" className="vehicle-wheel-inner"/>
          <circle cx="240" cy="520" r="25" className="vehicle-wheel-inner"/>
          
          {/* Right Wheel */}
          <circle cx="660" cy="520" r="55" className="vehicle-wheel"/>
          <circle cx="660" cy="520" r="40" className="vehicle-wheel-inner"/>
          <circle cx="660" cy="520" r="25" className="vehicle-wheel-inner"/>
          
          {/* Left Wing Mirror */}
          <rect x="140" y="240" width="30" height="20" rx="3" className="vehicle-wheel"/>
          
          {/* Right Wing Mirror */}
          <rect x="730" y="240" width="30" height="20" rx="3" className="vehicle-wheel"/>
        </g>
      )}

      {/* LEFT SIDE VIEW */}
      {view === 'LEFT' && (
        <g id="left-view">
          {/* Main body outline - side profile with curves */}
          <path 
            d="M 150 200 Q 120 200 120 230 L 120 280 Q 120 300 140 300 L 200 300 L 200 380 L 850 380 L 850 300 L 900 300 Q 920 300 920 280 L 920 230 Q 920 200 890 200 L 780 200 L 780 150 Q 780 120 750 120 L 350 120 Q 320 120 320 150 L 320 200 Z"
            className="vehicle-outline"
          />
          
          {/* Windscreen */}
          <path d="M 320 150 L 290 200 L 380 200 L 350 150 Z" className="vehicle-section"/>
          <text x="335" y="183" textAnchor="middle" className="vehicle-label vehicle-label-small">WINDSCREEN</text>
          
          {/* Front Door */}
          <rect x="390" y="200" width="180" height="180" rx="4" className="vehicle-section"/>
          <text x="480" y="300" textAnchor="middle" className="vehicle-label vehicle-label-medium">FRONT DOOR</text>
          
          {/* Rear Door */}
          <rect x="580" y="200" width="180" height="180" rx="4" className="vehicle-section"/>
          <text x="670" y="300" textAnchor="middle" className="vehicle-label vehicle-label-medium">REAR DOOR</text>
          
          {/* Roof */}
          <path d="M 350 130 L 750 130 L 750 200 L 350 200 Z" className="vehicle-section"/>
          <text x="550" y="173" textAnchor="middle" className="vehicle-label vehicle-label-medium">ROOF</text>
          
          {/* Front Window */}
          <rect x="400" y="150" width="80" height="40" rx="3" className="vehicle-section"/>
          
          {/* Rear Window */}
          <rect x="600" y="150" width="80" height="40" rx="3" className="vehicle-section"/>
          
          {/* Back Window */}
          <path d="M 760 200 L 790 200 L 820 150 L 790 150 Z" className="vehicle-section"/>
          
          {/* Headlight */}
          <ellipse cx="160" cy="250" rx="30" ry="35" className="vehicle-section"/>
          <text x="100" y="258" textAnchor="end" className="vehicle-label vehicle-label-tiny">HEADLIGHT</text>
          
          {/* Tail Light */}
          <rect x="870" y="240" width="20" height="50" rx="3" className="vehicle-section"/>
          <text x="950" y="268" textAnchor="start" className="vehicle-label vehicle-label-tiny">TAIL</text>
          
          {/* Wing Mirror */}
          <rect x="350" y="180" width="25" height="15" rx="2" className="vehicle-wheel"/>
          
          {/* Front Wheel */}
          <circle cx="300" cy="420" r="60" className="vehicle-wheel"/>
          <circle cx="300" cy="420" r="45" className="vehicle-wheel-inner"/>
          <circle cx="300" cy="420" r="30" className="vehicle-wheel-inner"/>
          
          {/* Rear Wheel */}
          <circle cx="750" cy="420" r="60" className="vehicle-wheel"/>
          <circle cx="750" cy="420" r="45" className="vehicle-wheel-inner"/>
          <circle cx="750" cy="420" r="30" className="vehicle-wheel-inner"/>
        </g>
      )}

      {/* RIGHT SIDE VIEW */}
      {view === 'RIGHT' && (
        <g id="right-view">
          {/* Main body outline - mirror of left side */}
          <path 
            d="M 850 200 Q 880 200 880 230 L 880 280 Q 880 300 860 300 L 800 300 L 800 380 L 150 380 L 150 300 L 100 300 Q 80 300 80 280 L 80 230 Q 80 200 110 200 L 220 200 L 220 150 Q 220 120 250 120 L 650 120 Q 680 120 680 150 L 680 200 Z"
            className="vehicle-outline"
          />
          
          {/* Windscreen */}
          <path d="M 680 150 L 710 200 L 620 200 L 650 150 Z" className="vehicle-section"/>
          <text x="665" y="183" textAnchor="middle" className="vehicle-label vehicle-label-small">WINDSCREEN</text>
          
          {/* Front Door */}
          <rect x="430" y="200" width="180" height="180" rx="4" className="vehicle-section"/>
          <text x="520" y="300" textAnchor="middle" className="vehicle-label vehicle-label-medium">FRONT DOOR</text>
          
          {/* Rear Door */}
          <rect x="240" y="200" width="180" height="180" rx="4" className="vehicle-section"/>
          <text x="330" y="300" textAnchor="middle" className="vehicle-label vehicle-label-medium">REAR DOOR</text>
          
          {/* Roof */}
          <path d="M 250 130 L 650 130 L 650 200 L 250 200 Z" className="vehicle-section"/>
          <text x="450" y="173" textAnchor="middle" className="vehicle-label vehicle-label-medium">ROOF</text>
          
          {/* Front Window */}
          <rect x="520" y="150" width="80" height="40" rx="3" className="vehicle-section"/>
          
          {/* Rear Window */}
          <rect x="320" y="150" width="80" height="40" rx="3" className="vehicle-section"/>
          
          {/* Back Window */}
          <path d="M 240 200 L 210 200 L 180 150 L 210 150 Z" className="vehicle-section"/>
          
          {/* Headlight */}
          <ellipse cx="840" cy="250" rx="30" ry="35" className="vehicle-section"/>
          <text x="900" y="258" textAnchor="start" className="vehicle-label vehicle-label-tiny">HEADLIGHT</text>
          
          {/* Tail Light */}
          <rect x="110" y="240" width="20" height="50" rx="3" className="vehicle-section"/>
          <text x="50" y="268" textAnchor="end" className="vehicle-label vehicle-label-tiny">TAIL</text>
          
          {/* Wing Mirror */}
          <rect x="625" y="180" width="25" height="15" rx="2" className="vehicle-wheel"/>
          
          {/* Front Wheel */}
          <circle cx="700" cy="420" r="60" className="vehicle-wheel"/>
          <circle cx="700" cy="420" r="45" className="vehicle-wheel-inner"/>
          <circle cx="700" cy="420" r="30" className="vehicle-wheel-inner"/>
          
          {/* Rear Wheel */}
          <circle cx="250" cy="420" r="60" className="vehicle-wheel"/>
          <circle cx="250" cy="420" r="45" className="vehicle-wheel-inner"/>
          <circle cx="250" cy="420" r="30" className="vehicle-wheel-inner"/>
        </g>
      )}
    </svg>
  );
}

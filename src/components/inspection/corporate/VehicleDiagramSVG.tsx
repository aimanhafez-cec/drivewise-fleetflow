import type { DamageMarkerSide } from '@/types/damage-marker';

interface VehicleDiagramSVGProps {
  view: DamageMarkerSide;
  className?: string;
}

export function VehicleDiagramSVG({ view, className = '' }: VehicleDiagramSVGProps) {
  return (
    <svg
      viewBox="0 0 600 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {view === 'TOP' && (
        <g>
          {/* Main body */}
          <rect x="150" y="50" width="300" height="300" rx="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          
          {/* Windscreen */}
          <rect x="175" y="80" width="250" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="115" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">WINDSCREEN</text>
          
          {/* Bonnet/Hood */}
          <rect x="175" y="155" width="250" height="50" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="185" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">BONNET</text>
          
          {/* Roof */}
          <rect x="175" y="220" width="250" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="255" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">ROOF</text>
          
          {/* Boot/Trunk */}
          <rect x="175" y="295" width="250" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="320" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">BOOT</text>
          
          {/* Left doors */}
          <rect x="155" y="155" width="15" height="45" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <rect x="155" y="205" width="15" height="75" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <text x="110" y="180" className="fill-muted-foreground text-[10px] font-medium">L.DOOR</text>
          <text x="110" y="245" className="fill-muted-foreground text-[10px] font-medium">L.DOOR</text>
          
          {/* Right doors */}
          <rect x="430" y="155" width="15" height="45" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <rect x="430" y="205" width="15" height="75" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <text x="480" y="180" className="fill-muted-foreground text-[10px] font-medium">R.DOOR</text>
          <text x="480" y="245" className="fill-muted-foreground text-[10px] font-medium">R.DOOR</text>
          
          {/* Left wing mirror */}
          <rect x="135" y="135" width="10" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          
          {/* Right wing mirror */}
          <rect x="455" y="135" width="10" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
        </g>
      )}

      {view === 'FRONT' && (
        <g>
          {/* Main body */}
          <rect x="100" y="120" width="400" height="200" rx="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          
          {/* Windscreen */}
          <path d="M 150 120 L 150 160 L 450 160 L 450 120" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="145" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">WINDSCREEN</text>
          
          {/* Headlights */}
          <ellipse cx="180" cy="280" rx="35" ry="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <ellipse cx="420" cy="280" rx="35" ry="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="180" y="285" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">LIGHT</text>
          <text x="420" y="285" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">LIGHT</text>
          
          {/* Grille */}
          <rect x="220" y="255" width="160" height="50" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="285" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">GRILLE</text>
          
          {/* Bumper */}
          <rect x="120" y="310" width="360" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="325" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">BUMPER</text>
          
          {/* Left wheel */}
          <circle cx="180" cy="340" r="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="180" cy="340" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          
          {/* Right wheel */}
          <circle cx="420" cy="340" r="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="420" cy="340" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          
          {/* Wing mirrors */}
          <rect x="80" y="180" width="15" height="35" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <rect x="505" y="180" width="15" height="35" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <text x="50" y="200" className="fill-muted-foreground text-[9px] font-medium">L.WING</text>
          <text x="530" y="200" className="fill-muted-foreground text-[9px] font-medium">R.WING</text>
        </g>
      )}

      {view === 'REAR' && (
        <g>
          {/* Main body */}
          <rect x="100" y="120" width="400" height="200" rx="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          
          {/* Rear windscreen */}
          <path d="M 150 120 L 150 160 L 450 160 L 450 120" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="145" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">REAR WINDOW</text>
          
          {/* Tail lights */}
          <rect x="140" y="270" width="45" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <rect x="415" y="270" width="45" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="162" y="290" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">TAIL</text>
          <text x="437" y="290" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">TAIL</text>
          
          {/* Boot/Trunk area */}
          <rect x="200" y="240" width="200" height="65" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="275" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">BOOT</text>
          
          {/* Bumper */}
          <rect x="120" y="310" width="360" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="300" y="325" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">BUMPER</text>
          
          {/* Left wheel */}
          <circle cx="180" cy="340" r="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="180" cy="340" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          
          {/* Right wheel */}
          <circle cx="420" cy="340" r="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="420" cy="340" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
        </g>
      )}

      {view === 'LEFT' && (
        <g>
          {/* Main body */}
          <path d="M 80 200 L 120 150 L 200 130 L 400 130 L 480 150 L 520 200 L 520 240 L 480 290 L 120 290 L 80 240 Z" 
            fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          
          {/* Windows */}
          <path d="M 130 160 L 160 145 L 240 140 L 240 160" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <path d="M 250 140 L 330 140 L 330 160 L 250 160" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="190" y="155" className="fill-muted-foreground text-[10px] font-medium">F.WINDOW</text>
          <text x="270" y="155" className="fill-muted-foreground text-[10px] font-medium">R.WINDOW</text>
          
          {/* Doors */}
          <line x1="240" y1="160" x2="240" y2="280" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" strokeDasharray="5,5" />
          <text x="180" y="230" className="fill-muted-foreground text-xs font-medium">F.DOOR</text>
          <text x="270" y="230" className="fill-muted-foreground text-xs font-medium">R.DOOR</text>
          
          {/* Front wheel */}
          <circle cx="180" cy="300" r="35" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="180" cy="300" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="180" y="305" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">WHEEL</text>
          
          {/* Rear wheel */}
          <circle cx="420" cy="300" r="35" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="420" cy="300" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="420" y="305" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">WHEEL</text>
          
          {/* Headlight */}
          <ellipse cx="110" cy="220" rx="15" ry="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="70" y="225" className="fill-muted-foreground text-[9px] font-medium">LIGHT</text>
          
          {/* Wing mirror */}
          <rect x="110" y="175" width="15" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <text x="90" y="192" className="fill-muted-foreground text-[9px] font-medium">WING</text>
        </g>
      )}

      {view === 'RIGHT' && (
        <g>
          {/* Main body - mirrored */}
          <path d="M 520 200 L 480 150 L 400 130 L 200 130 L 120 150 L 80 200 L 80 240 L 120 290 L 480 290 L 520 240 Z" 
            fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          
          {/* Windows */}
          <path d="M 470 160 L 440 145 L 360 140 L 360 160" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <path d="M 350 140 L 270 140 L 270 160 L 350 160" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="410" y="155" className="fill-muted-foreground text-[10px] font-medium">F.WINDOW</text>
          <text x="295" y="155" className="fill-muted-foreground text-[10px] font-medium">R.WINDOW</text>
          
          {/* Doors */}
          <line x1="360" y1="160" x2="360" y2="280" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" strokeDasharray="5,5" />
          <text x="380" y="230" className="fill-muted-foreground text-xs font-medium">F.DOOR</text>
          <text x="290" y="230" className="fill-muted-foreground text-xs font-medium">R.DOOR</text>
          
          {/* Front wheel */}
          <circle cx="420" cy="300" r="35" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="420" cy="300" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="420" y="305" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">WHEEL</text>
          
          {/* Rear wheel */}
          <circle cx="180" cy="300" r="35" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
          <circle cx="180" cy="300" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="180" y="305" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">WHEEL</text>
          
          {/* Headlight */}
          <ellipse cx="490" cy="220" rx="15" ry="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60" />
          <text x="510" y="225" className="fill-muted-foreground text-[9px] font-medium">LIGHT</text>
          
          {/* Wing mirror */}
          <rect x="475" y="175" width="15" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40" />
          <text x="495" y="192" className="fill-muted-foreground text-[9px] font-medium">WING</text>
        </g>
      )}
    </svg>
  );
}

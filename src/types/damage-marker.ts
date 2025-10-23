export type DamageMarkerType = 
  | 'SCRATCH' 
  | 'DENT' 
  | 'CRACK' 
  | 'PAINT' 
  | 'GLASS' 
  | 'TIRE' 
  | 'BENT'
  | 'CAVED'
  | 'BROKEN'
  | 'LOOSE'
  | 'CRACKED'
  | 'FADED'
  | 'SCRAPPED'
  | 'PILLED'
  | 'CRUSHED'
  | 'MISSING'
  | 'OTHER';

export type DamageMarkerSeverity = 'LOW' | 'MED' | 'HIGH';
export type DamageMarkerSide = 'FRONT' | 'REAR' | 'LEFT' | 'RIGHT' | 'TOP';
export type DamageMarkerEvent = 'OUT' | 'IN' | 'EXCHANGE';

export interface DamageMarkerPhoto {
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface DamageMarker {
  id: string;
  line_id: string;
  event: DamageMarkerEvent;
  side: DamageMarkerSide;
  x: number;
  y: number;
  damage_type: DamageMarkerType;
  severity: DamageMarkerSeverity;
  notes: string | null;
  photos: DamageMarkerPhoto[];
  occurred_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDamageMarkerInput {
  line_id: string;
  event: DamageMarkerEvent;
  side: DamageMarkerSide;
  x: number;
  y: number;
  damage_type: DamageMarkerType;
  severity: DamageMarkerSeverity;
  notes?: string;
  photos?: DamageMarkerPhoto[];
}

export interface UpdateDamageMarkerInput {
  damage_type?: DamageMarkerType;
  severity?: DamageMarkerSeverity;
  notes?: string;
  photos?: DamageMarkerPhoto[];
}

export const DAMAGE_TYPE_OPTIONS = [
  { value: 'SCRATCH', label: 'Scratches' },
  { value: 'DENT', label: 'Dent' },
  { value: 'BENT', label: 'Bent' },
  { value: 'CAVED', label: 'Caved' },
  { value: 'BROKEN', label: 'Broken' },
  { value: 'LOOSE', label: 'Loose' },
  { value: 'CRACKED', label: 'Cracked' },
  { value: 'FADED', label: 'Faded' },
  { value: 'SCRAPPED', label: 'Scrapped' },
  { value: 'PILLED', label: 'Pilled' },
  { value: 'CRUSHED', label: 'Crushed' },
  { value: 'MISSING', label: 'Missing' },
  { value: 'CRACK', label: 'Crack' },
  { value: 'PAINT', label: 'Paint Damage' },
  { value: 'GLASS', label: 'Glass Damage' },
  { value: 'TIRE', label: 'Tire/Rim Damage' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const SEVERITY_OPTIONS = [
  { value: 'LOW', label: 'Minor', color: 'bg-yellow-500' },
  { value: 'MED', label: 'Moderate', color: 'bg-orange-500' },
  { value: 'HIGH', label: 'Major', color: 'bg-red-500' },
] as const;

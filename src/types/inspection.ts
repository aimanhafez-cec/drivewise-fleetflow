export const DAMAGE_TYPES = [
  'Scratches',
  'Dent',
  'Bent',
  'Caved',
  'Broken',
  'Loose',
  'Cracked',
  'Faded',
  'Scrapped',
  'Pilled',
  'Crushed',
  'Missing'
] as const;

export type DamageType = typeof DAMAGE_TYPES[number];

export const INSPECTION_TYPES = [
  { value: 'RENTAL_CHECKOUT', label: 'Rental Check-out' },
  { value: 'RENTAL_CHECKIN', label: 'Rental Check-in' },
  { value: 'PERIODIC', label: 'Periodic Inspection' },
  { value: 'RANDOM', label: 'Random Inspection' }
] as const;

export type InspectionType = 'RENTAL_CHECKOUT' | 'RENTAL_CHECKIN' | 'PERIODIC' | 'RANDOM';
export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'APPROVED';
export type ChecklistItem = 'OK' | 'DAMAGE';
export type FuelLevel = 'E' | 'Q1' | 'H' | 'Q3' | 'F';

export interface InspectionChecklist {
  exterior?: ChecklistItem;
  glass?: ChecklistItem;
  tires_rims?: ChecklistItem;
  interior?: ChecklistItem;
  accessories?: ChecklistItem;
}

export interface InspectionMetrics {
  odometer?: number;
  fuelLevel?: FuelLevel;
}

export interface InspectionMedia {
  id: string;
  url: string;
  type: 'photo' | 'video';
  label?: string;
}

export interface InspectionAttachment {
  id: string;
  url: string;
  filename: string;
  type: string;
}

export interface InspectionSignature {
  imageUrl: string;
  name: string;
  signedAt: string;
}

export interface InspectionMaster {
  id: string;
  inspection_no: string;
  inspection_type: InspectionType;
  vehicle_id: string | null;
  vin: string | null;
  agreement_id: string | null;
  line_id: string | null;
  item_code: string | null;
  status: InspectionStatus;
  entry_date: string;
  completed_date: string | null;
  checklist: InspectionChecklist;
  metrics: InspectionMetrics;
  damage_marker_ids: string[];
  media: InspectionMedia[];
  performed_by_user_id: string | null;
  inspector_name: string | null;
  location_id: string | null;
  device_info: string | null;
  signature: InspectionSignature | null;
  attachments: InspectionAttachment[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleOption {
  vehicleId: string;
  vin: string;
  itemCode: string;
  description: string;
  agreementId?: string;
  agreementNo?: string;
  lineId?: string;
  driverName?: string;
}

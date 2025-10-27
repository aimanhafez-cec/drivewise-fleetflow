import type { InspectionData, DamageMarker } from '@/types/agreement-wizard';

/**
 * Mock Inspection Data for UAE Rental Car Business
 * Realistic scenarios based on Dubai/UAE rental operations
 */

// Mock Check-Out Inspection Data
export const mockCheckOutInspection: InspectionData = {
  timestamp: '2025-10-13T09:30:00.000Z',
  inspectorId: 'INS-001',
  inspectorName: 'Mohammed Al Hashimi',
  preHandoverChecklist: {
    vehicleCleaned: true,
    vehicleFueled: true,
    documentsReady: true,
    keysAvailable: true,
    warningLightsOk: true,
  },
  fuelLevel: 100, // Full tank at checkout
  odometerReading: 45230, // Starting odometer
  odometerPhoto: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop',
  fuelGaugePhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  damageMarkers: [
    {
      id: 'dmg-checkout-001',
      view: 'rear',
      x: 0.45,
      y: 0.65,
      severity: 'minor',
      type: 'SCRATCH',
      photos: [
        'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=400&h=300&fit=crop'
      ],
      notes: 'Small scratch on rear bumper, 3cm, pre-existing',
      side: 'REAR',
      event: 'checkout',
      estimatedCost: 200,
      repairDescription: 'Minor touch-up, pre-existing'
    },
    {
      id: 'dmg-checkout-002',
      view: 'left',
      x: 0.35,
      y: 0.40,
      severity: 'minor',
      type: 'DENT',
      photos: [
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop'
      ],
      notes: 'Very small dent on driver door, barely visible',
      side: 'LEFT',
      event: 'checkout',
      estimatedCost: 300,
      repairDescription: 'Cosmetic, pre-existing'
    }
  ],
  photos: {
    exterior: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop', // Front
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop', // Rear
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop', // Left side
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop', // Right side
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop', // Front-left corner
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop', // Front-right corner
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop', // Rear-left corner
      'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop', // Rear-right corner
    ],
    interior: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop', // Dashboard
      'https://images.unsplash.com/photo-1521657141597-ce62a8b0ba01?w=800&h=600&fit=crop', // Front seats
      'https://images.unsplash.com/photo-1619976215249-0b68b29f4a5e?w=800&h=600&fit=crop', // Rear seats
      'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800&h=600&fit=crop', // Trunk
      'https://images.unsplash.com/photo-1600705722908-bab1af25681b?w=800&h=600&fit=crop', // Roof liner
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop', // Floor mats
    ],
    documents: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop', // Mulkiya (registration)
      'https://images.unsplash.com/photo-1554224311-beee2b73c77d?w=800&h=600&fit=crop', // Insurance card
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=600&fit=crop', // Registration certificate
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop', // Salik tag
    ],
    damages: [
      'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=600&fit=crop',
    ],
  },
  inspectionChecklist: {
    'exterior-Front bumper': true,
    'exterior-Rear bumper': false, // Minor scratch noted
    'exterior-Hood': true,
    'exterior-Trunk/Boot': true,
    'exterior-Roof': true,
    'exterior-Front left door': false, // Minor dent noted
    'exterior-Front right door': true,
    'exterior-Rear left door': true,
    'exterior-Rear right door': true,
    'interior-Dashboard': true,
    'interior-Steering wheel': true,
    'interior-Front seats': true,
    'interior-Rear seats': true,
    'interior-Floor mats': true,
    'interior-Trunk interior': true,
  },
  notes: 'Vehicle in excellent condition. Two minor pre-existing damages documented. All documents verified. Customer briefed on Salik and traffic rules.',
};

// Mock Check-In Inspection Data (Vehicle Returned)
export const mockCheckInInspection: InspectionData = {
  timestamp: '2025-10-20T14:30:00.000Z',
  inspectorId: 'INS-002',
  inspectorName: 'Fatima Al Zaabi',
  preHandoverChecklist: {
    vehicleCleaned: true,
    vehicleFueled: false, // Customer returned with low fuel
    documentsReady: true,
    keysAvailable: true,
    warningLightsOk: true,
  },
  fuelLevel: 25, // Only quarter tank - will incur fuel charge
  odometerReading: 45890, // 660 km driven (160 km excess)
  odometerPhoto: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop',
  fuelGaugePhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  damageMarkers: [
    // New damages found during check-in
    {
      id: 'dmg-checkin-001',
      view: 'front',
      x: 0.35,
      y: 0.75,
      severity: 'moderate',
      type: 'DENT',
      photos: [
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=400&h=300&fit=crop'
      ],
      notes: 'Moderate dent on front bumper left side, 5cm diameter, paint chipped',
      side: 'FRONT',
      event: 'checkin',
      estimatedCost: 850,
      repairDescription: 'Bumper repair and repaint required'
    },
    {
      id: 'dmg-checkin-002',
      view: 'left',
      x: 0.50,
      y: 0.50,
      severity: 'minor',
      type: 'SCRATCH',
      photos: [
        'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400&h=300&fit=crop'
      ],
      notes: 'Scratch on driver door, 10cm long, clear coat only',
      side: 'LEFT',
      event: 'checkin',
      estimatedCost: 350,
      repairDescription: 'Clear coat and polish'
    },
    {
      id: 'dmg-checkin-003',
      view: 'front',
      x: 0.50,
      y: 0.35,
      severity: 'major',
      type: 'CRACK',
      photos: [
        'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&h=300&fit=crop'
      ],
      notes: 'Stone chip expanded to 15cm crack in windshield, driver side',
      side: 'FRONT',
      event: 'checkin',
      estimatedCost: 1200,
      repairDescription: 'Full windshield replacement - insurance claim'
    },
    {
      id: 'dmg-checkin-004',
      view: 'left',
      x: 0.25,
      y: 0.45,
      severity: 'minor',
      type: 'SCRATCH',
      photos: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
      ],
      notes: 'Scratch on left side mirror housing, 5cm',
      side: 'LEFT',
      event: 'checkin',
      estimatedCost: 250,
      repairDescription: 'Mirror housing repaint'
    },
    {
      id: 'dmg-checkin-005',
      view: 'right',
      x: 0.60,
      y: 0.80,
      severity: 'minor',
      type: 'DENT',
      photos: [
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop'
      ],
      notes: 'Small dent on right rear door, 3cm, no paint damage',
      side: 'RIGHT',
      event: 'checkin',
      estimatedCost: 400,
      repairDescription: 'PDR (Paintless Dent Repair)'
    }
  ],
  photos: {
    exterior: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop',
    ],
    interior: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1521657141597-ce62a8b0ba01?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1619976215249-0b68b29f4a5e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600705722908-bab1af25681b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop',
    ],
    documents: [],
    damages: [
      'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop',
    ],
  },
  inspectionChecklist: {
    'exterior-Front bumper': false, // New dent found
    'exterior-Rear bumper': false, // Pre-existing scratch
    'exterior-Hood': true,
    'exterior-Trunk/Boot': true,
    'exterior-Roof': true,
    'exterior-Front left door': false, // Pre-existing dent + new scratch
    'exterior-Front right door': true,
    'exterior-Rear left door': true,
    'exterior-Rear right door': false, // New dent
    'exterior-Left side mirror': false, // New scratch
    'exterior-Front windshield': false, // New crack
    'interior-Dashboard': true,
    'interior-Steering wheel': true,
    'interior-Front seats': true,
    'interior-Rear seats': true,
    'interior-Floor mats': true,
    'interior-Trunk interior': true,
  },
  notes: 'Vehicle returned 4.5 hours late. Multiple new damages found: dent on front bumper, scratch on driver door, windshield crack (major - insurance), mirror scratch, and small dent on rear door. Fuel level significantly low. 18 Salik trips recorded. Customer acknowledged all damages during walk-around inspection.',
};

// Mock scenario variations for testing
export const mockScenarioCleanReturn: InspectionData = {
  ...mockCheckInInspection,
  fuelLevel: 100,
  odometerReading: 45430, // Only 200 km driven, within limit
  damageMarkers: [], // No new damages
  notes: 'Perfect return! Vehicle in same condition as check-out. No new damages. Fuel tank full. Returned on time.',
};

export const mockScenarioHeavyDamage: InspectionData = {
  ...mockCheckInInspection,
  damageMarkers: [
    ...mockCheckInInspection.damageMarkers,
    {
      id: 'dmg-heavy-001',
      view: 'rear',
      x: 0.50,
      y: 0.70,
      severity: 'major',
      type: 'BROKEN',
      photos: ['https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=400&h=300&fit=crop'],
      notes: 'Rear tail light completely broken',
      side: 'REAR',
      event: 'checkin',
      estimatedCost: 800,
      repairDescription: 'Full tail light assembly replacement'
    },
    {
      id: 'dmg-heavy-002',
      view: 'right',
      x: 0.75,
      y: 0.85,
      severity: 'moderate',
      type: 'DENT',
      photos: ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop'],
      notes: 'Rim damage on right rear wheel',
      side: 'RIGHT',
      event: 'checkin',
      estimatedCost: 1200,
      repairDescription: 'Alloy wheel replacement'
    }
  ],
  notes: 'Significant damages. Multiple areas affected. Manager approval required for final charges.',
};

/**
 * Additional charge calculations based on UAE rental standards
 */
export const mockAdditionalCharges = {
  fuelShortage: {
    checkOutLevel: 100,
    checkInLevel: 25,
    difference: 75,
    tankCapacity: 60, // liters
    missingLiters: 45,
    pricePerLiter: 4.5, // AED
    totalCharge: 202.5, // AED
  },
  excessKilometers: {
    checkOutOdometer: 45230,
    checkInOdometer: 45890,
    driven: 660,
    included: 500,
    excess: 160,
    ratePerKm: 2.0, // AED
    totalCharge: 320.0, // AED
  },
  cleaningFee: {
    required: false,
    reason: 'Interior acceptable, minor dust only',
    charge: 0,
    // If required: 150 AED for standard, 300 AED for deep cleaning
  },
  lateReturn: {
    scheduledReturn: '2025-10-20T10:00:00.000Z',
    actualReturn: '2025-10-20T14:30:00.000Z',
    lateHours: 4.5,
    gracePeriod: 0.5, // 30 minutes
    chargeableHours: 4,
    ratePerHour: 50, // AED
    totalCharge: 250, // AED (rounded up to 5 hours)
  },
  salikCharges: {
    trips: 18,
    ratePerTrip: 8.0, // AED (increased rate as of 2024)
    totalCharge: 144.0, // AED
    // Common gates: Sheikh Zayed Road, Al Maktoum Bridge, Al Garhoud Bridge, Business Bay Crossing
  },
  parkingFines: {
    fines: 0,
    totalCharge: 0,
    // Would include any parking violations during rental period
  },
  trafficFines: {
    fines: 0,
    totalCharge: 0,
    // Would include any traffic violations (speed cameras, red light, etc.)
  }
};

/**
 * Complete financial summary
 */
export const mockFinancialSummary = {
  damageCharges: {
    frontBumperDent: 850,
    driverDoorScratch: 350,
    windshieldCrack: 0, // Insurance claim
    mirrorScratch: 250,
    rearDoorDent: 400,
    subtotal: 1850,
  },
  additionalCharges: {
    fuel: 202.5,
    excessKm: 320.0,
    cleaning: 0,
    lateReturn: 250,
    salik: 144.0,
    subtotal: 916.5,
  },
  summary: {
    damageSubtotal: 1850,
    additionalSubtotal: 916.5,
    subtotal: 2766.5,
    vatRate: 0.05,
    vatAmount: 138.33,
    grandTotal: 2904.83,
    securityDeposit: 1500,
    additionalPaymentRequired: 1404.83,
  },
};

/**
 * UAE-specific pricing reference
 */
export const uaeDamagePricing = {
  scratches: {
    minor: { min: 150, max: 400, description: 'Less than 5cm, clear coat only' },
    moderate: { min: 400, max: 800, description: '5-15cm, paint layer affected' },
    major: { min: 800, max: 1500, description: 'Over 15cm or multiple panels' },
  },
  dents: {
    minor: { min: 300, max: 600, description: 'Cosmetic, PDR possible' },
    moderate: { min: 600, max: 1200, description: 'Panel work required' },
    major: { min: 1200, max: 3000, description: 'Panel replacement needed' },
  },
  glass: {
    chipRepair: { min: 100, max: 200, description: 'Small chip, repairable' },
    crackMinor: { min: 500, max: 800, description: 'Short crack' },
    crackMajor: { min: 1000, max: 2500, description: 'Windshield replacement' },
    sideWindow: { min: 400, max: 800, description: 'Side window replacement' },
  },
  lights: {
    headlight: { min: 600, max: 1500, description: 'Headlight assembly' },
    taillight: { min: 400, max: 1200, description: 'Tail light assembly' },
    fogLight: { min: 300, max: 600, description: 'Fog light replacement' },
  },
  mirrors: {
    cover: { min: 200, max: 400, description: 'Mirror cover replacement' },
    housing: { min: 300, max: 800, description: 'Complete mirror assembly' },
    glass: { min: 100, max: 250, description: 'Mirror glass only' },
  },
  wheels: {
    tire: { min: 250, max: 600, description: 'Single tire replacement' },
    rim: { min: 400, max: 1500, description: 'Alloy wheel replacement' },
    hubcap: { min: 50, max: 150, description: 'Wheel cover' },
  },
  interior: {
    seatStain: { min: 200, max: 500, description: 'Professional cleaning' },
    seatBurn: { min: 300, max: 800, description: 'Upholstery repair' },
    dashboardCrack: { min: 400, max: 1200, description: 'Dashboard repair/replacement' },
    carpetStain: { min: 150, max: 400, description: 'Deep cleaning or replacement' },
  },
  vat: 0.05, // 5% UAE VAT
};

import { addDays, nextFriday, nextSunday, startOfDay, format } from 'date-fns';

export interface BookingDates {
  pickupDate: string; // YYYY-MM-DD format
  pickupTime: string; // HH:mm format
  returnDate: string; // YYYY-MM-DD format
  returnTime: string; // HH:mm format
}

export interface BookingPreset {
  name: string;
  description: string;
  getDates: () => BookingDates;
}

/**
 * Get the next Friday from today (or today if it's Friday)
 */
function getNextFriday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // If today is Friday (5), return today
  if (dayOfWeek === 5) {
    return startOfDay(today);
  }
  
  // Otherwise get next Friday
  return startOfDay(nextFriday(today));
}

/**
 * Get the Sunday following a given date
 */
function getFollowingSunday(fromDate: Date): Date {
  return startOfDay(nextSunday(fromDate));
}

/**
 * Get tomorrow's date
 */
function getTomorrow(): Date {
  return startOfDay(addDays(new Date(), 1));
}

/**
 * Get a date N days from today
 */
function getDateAfterDays(days: number): Date {
  return startOfDay(addDays(new Date(), days));
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Predefined booking presets
 */
export const BOOKING_PRESETS: Record<string, BookingPreset> = {
  weekend: {
    name: "Weekend Booking",
    description: "Friday to Sunday rental",
    getDates: () => {
      const pickupDate = getNextFriday();
      const returnDate = getFollowingSunday(pickupDate);
      
      return {
        pickupDate: formatDate(pickupDate),
        pickupTime: "16:00", // Weekend pickups typically in afternoon
        returnDate: formatDate(returnDate),
        returnTime: "20:00", // Sunday evening return
      };
    }
  },
  
  week: {
    name: "Week Booking",
    description: "7-day rental starting tomorrow",
    getDates: () => {
      const pickupDate = getTomorrow();
      const returnDate = getDateAfterDays(8); // +1 for tomorrow, +7 for week
      
      return {
        pickupDate: formatDate(pickupDate),
        pickupTime: "10:00",
        returnDate: formatDate(returnDate),
        returnTime: "10:00",
      };
    }
  },
  
  month: {
    name: "Month Booking",
    description: "30-day rental starting tomorrow",
    getDates: () => {
      const pickupDate = getTomorrow();
      const returnDate = getDateAfterDays(31); // +1 for tomorrow, +30 for month
      
      return {
        pickupDate: formatDate(pickupDate),
        pickupTime: "10:00",
        returnDate: formatDate(returnDate),
        returnTime: "10:00",
      };
    }
  },
  
  custom: {
    name: "Custom Booking",
    description: "User-defined dates",
    getDates: () => {
      // For custom bookings, just provide tomorrow as default
      const pickupDate = getTomorrow();
      const returnDate = getDateAfterDays(8);
      
      return {
        pickupDate: formatDate(pickupDate),
        pickupTime: "10:00",
        returnDate: formatDate(returnDate),
        returnTime: "10:00",
      };
    }
  }
};

/**
 * Smart defaults interface matching the useLastBooking return type
 */
export interface SmartDefaults {
  reservationType?: string;
  vehicleClassId?: string;
  pickupLocationId?: string;
  returnLocationId?: string;
  selectedAddOns?: Array<{ id: string; name: string }>;
  addOnCharges?: Array<{ addon_id: string; charge_amount: number }>;
  insurancePackageId?: string;
}

/**
 * Partial booking data structure
 */
export interface PartialBookingData {
  customerId?: string;
  customerName?: string;
  reservationType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  pickupLocationId?: string;
  returnLocationId?: string;
  vehicleClassId?: string;
  selectedAddOns?: Array<{ id: string; name: string }>;
  addOnCharges?: Array<{ addon_id: string; charge_amount: number }>;
  insurancePackageId?: string;
}

/**
 * Apply a booking preset and merge with smart defaults
 * 
 * @param presetType - Type of preset (weekend, week, month, custom)
 * @param smartDefaults - Optional smart defaults from customer history
 * @returns Partial booking data with dates and smart defaults applied
 */
export function applyBookingPreset(
  presetType: string,
  smartDefaults?: SmartDefaults
): PartialBookingData {
  console.log(`[BookingPresets] Applying ${presetType} preset with smart defaults:`, smartDefaults);
  
  // Get the preset
  const preset = BOOKING_PRESETS[presetType] || BOOKING_PRESETS.custom;
  
  // Calculate dates
  const dates = preset.getDates();
  
  // Build the booking data
  const bookingData: PartialBookingData = {
    // Dates from preset
    pickupDate: dates.pickupDate,
    pickupTime: dates.pickupTime,
    returnDate: dates.returnDate,
    returnTime: dates.returnTime,
    
    // Smart defaults from customer history (if available)
    reservationType: smartDefaults?.reservationType,
    vehicleClassId: smartDefaults?.vehicleClassId,
    pickupLocationId: smartDefaults?.pickupLocationId,
    returnLocationId: smartDefaults?.returnLocationId,
    selectedAddOns: smartDefaults?.selectedAddOns,
    addOnCharges: smartDefaults?.addOnCharges,
    insurancePackageId: smartDefaults?.insurancePackageId,
  };
  
  console.log(`[BookingPresets] Generated booking data:`, bookingData);
  
  return bookingData;
}

/**
 * Get a human-readable description of a preset
 */
export function getPresetDescription(presetType: string): string {
  const preset = BOOKING_PRESETS[presetType];
  if (!preset) return "Custom booking";
  
  const dates = preset.getDates();
  return `${preset.description} (${dates.pickupDate} to ${dates.returnDate})`;
}

/**
 * Validate if a preset type is supported
 */
export function isValidPresetType(presetType: string): boolean {
  return presetType in BOOKING_PRESETS;
}

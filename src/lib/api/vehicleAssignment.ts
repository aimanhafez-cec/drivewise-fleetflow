import { supabase } from '@/integrations/supabase/client';

export interface VehicleAssignmentRequest {
  agreementLineId: string;
  vehicleId: string;
  checkoutLocation: string;
  checkinLocation?: string;
  checkoutFuel?: number;
  checkoutOdometer?: number;
  notes?: string;
}

export interface VehicleAvailabilityCheck {
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  excludeAgreementId?: string;
}

class VehicleAssignmentAPI {
  /**
   * Assign a vehicle to an agreement line
   */
  async assignVehicleToLine(request: VehicleAssignmentRequest) {
    const {
      agreementLineId,
      vehicleId,
      checkoutLocation,
      checkinLocation,
      checkoutFuel = 100,
      checkoutOdometer = 0,
      notes
    } = request;

    // Start a transaction-like operation
    // First, check if vehicle is still available
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('status', 'available')
      .maybeSingle();

    if (vehicleError) throw vehicleError;
    if (!vehicle) throw new Error('Vehicle is no longer available');

    // Update the agreement line
    const { error: lineError } = await supabase
      .from('agreement_lines')
      .update({
        vehicle_id: vehicleId,
        out_location_id: checkoutLocation,
        in_location_id: checkinLocation || checkoutLocation,
        // Store checkout conditions in the rate_breakdown for now
        rate_breakdown: {
          ...({}), // Previous rate breakdown if any
          checkout_conditions: {
            fuel_level: checkoutFuel,
            odometer: checkoutOdometer,
            assigned_at: new Date().toISOString(),
            notes: notes || null
          }
        }
      })
      .eq('id', agreementLineId);

    if (lineError) throw lineError;

    // Update vehicle status to rented
    const { error: statusError } = await supabase
      .from('vehicles')
      .update({ status: 'rented' })
      .eq('id', vehicleId);

    if (statusError) throw statusError;

    return {
      success: true,
      agreementLineId,
      vehicleId,
      message: 'Vehicle assigned successfully'
    };
  }

  /**
   * Check if a vehicle is available for the given date range
   */
  async checkVehicleAvailability(check: VehicleAvailabilityCheck): Promise<boolean> {
    const { vehicleId, startDate, endDate, excludeAgreementId } = check;

    // Check if vehicle exists and is in available status
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('status')
      .eq('id', vehicleId)
      .maybeSingle();

    if (vehicleError || !vehicle) return false;
    if (vehicle.status !== 'available') return false;

    // Check for overlapping agreements
    let query = supabase
      .from('agreement_lines')
      .select('id, check_out_at, check_in_at')
      .eq('vehicle_id', vehicleId)
      .not('check_out_at', 'is', null)
      .not('check_in_at', 'is', null);

    if (excludeAgreementId) {
      query = query.neq('agreement_id', excludeAgreementId);
    }

    const { data: existingLines, error: linesError } = await query;

    if (linesError) return false;

    // Check for date overlaps
    const hasOverlap = existingLines?.some(line => {
      const lineStart = new Date(line.check_out_at);
      const lineEnd = new Date(line.check_in_at);
      
      // Check if dates overlap
      return startDate < lineEnd && endDate > lineStart;
    });

    return !hasOverlap;
  }

  /**
   * Get available vehicles for a date range
   */
  async getAvailableVehicles(startDate: Date, endDate: Date, categoryId?: string) {
    // First get all vehicles that are in available status
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        categories (
          name,
          icon
        )
      `)
      .eq('status', 'available');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: vehicles, error: vehiclesError } = await query;

    if (vehiclesError) throw vehiclesError;
    if (!vehicles) return [];

    // Filter out vehicles that have conflicting bookings
    const availableVehicles = [];
    
    for (const vehicle of vehicles) {
      const isAvailable = await this.checkVehicleAvailability({
        vehicleId: vehicle.id,
        startDate,
        endDate
      });
      
      if (isAvailable) {
        availableVehicles.push(vehicle);
      }
    }

    return availableVehicles;
  }

  /**
   * Unassign a vehicle from an agreement line
   */
  async unassignVehicleFromLine(agreementLineId: string) {
    // Get the current assignment
    const { data: line, error: lineError } = await supabase
      .from('agreement_lines')
      .select('vehicle_id')
      .eq('id', agreementLineId)
      .maybeSingle();

    if (lineError) throw lineError;
    if (!line?.vehicle_id) throw new Error('No vehicle assigned to this line');

    // Remove vehicle assignment from line
    const { error: updateLineError } = await supabase
      .from('agreement_lines')
      .update({
        vehicle_id: null,
        out_location_id: null,
        in_location_id: null,
        rate_breakdown: null
      })
      .eq('id', agreementLineId);

    if (updateLineError) throw updateLineError;

    // Update vehicle status back to available
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ status: 'available' })
      .eq('id', line.vehicle_id);

    if (vehicleError) throw vehicleError;

    return {
      success: true,
      agreementLineId,
      vehicleId: line.vehicle_id,
      message: 'Vehicle unassigned successfully'
    };
  }

  /**
   * Bulk assign vehicles to multiple agreement lines
   */
  async bulkAssignVehicles(assignments: VehicleAssignmentRequest[]) {
    const results = [];
    
    for (const assignment of assignments) {
      try {
        const result = await this.assignVehicleToLine(assignment);
        results.push({ ...result, success: true });
      } catch (error) {
        results.push({
          agreementLineId: assignment.agreementLineId,
          vehicleId: assignment.vehicleId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}

export const vehicleAssignmentAPI = new VehicleAssignmentAPI();
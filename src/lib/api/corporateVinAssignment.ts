import { supabase } from '@/integrations/supabase/client';

export interface VinAssignmentStats {
  awaitingCount: number;
  assignedCount: number;
  totalLines: number;
  progressPercent: number;
}

export interface VehicleLine {
  agreementId: string;
  agreementNo: string;
  lineNo: number;
  contractNo: string;
  itemCode: string;
  itemDescription: string;
  vehicleClass: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  monthlyRate: number;
  isAssigned: boolean;
  assignedVin?: string;
  assignedVehicleId?: string;
  assignmentId?: string;
  assignedLicensePlate?: string;
}

export interface AvailableVin {
  id: string;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  odometer: number;
  location?: string;
}

export interface AssignVinRequest {
  agreementId: string;
  lineNo: number;
  contractNo: string;
  vehicleId: string;
  vin: string;
  itemCode: string;
  checkoutLocationId?: string;
  checkinLocationId?: string;
  checkoutFuelLevel?: number;
  checkoutOdometer?: number;
  checkoutNotes?: string;
}

class CorporateVinAssignmentAPI {
  /**
   * Get dashboard statistics for VIN assignments
   */
  async getDashboardStats(agreementId?: string): Promise<VinAssignmentStats> {
    // Get all signed agreements with their lines
    let agreementsQuery = supabase
      .from('corporate_leasing_agreements')
      .select('id, agreement_items')
      .eq('status', 'customer_accepted');

    if (agreementId) {
      agreementsQuery = agreementsQuery.eq('id', agreementId);
    }

    const { data: agreements, error: agreementsError } = await agreementsQuery;
    
    if (agreementsError) throw agreementsError;
    if (!agreements) return { awaitingCount: 0, assignedCount: 0, totalLines: 0, progressPercent: 0 };

    // Count total lines from all signed agreements
    let totalLines = 0;
    agreements.forEach(agreement => {
      const items = agreement.agreement_items as any[];
      totalLines += items?.length || 0;
    });

    // Get all assignments
    let assignmentsQuery = supabase
      .from('corporate_leasing_line_assignments')
      .select('id, agreement_id, line_no, status')
      .eq('status', 'assigned');

    if (agreementId) {
      assignmentsQuery = assignmentsQuery.eq('agreement_id', agreementId);
    }

    const { data: assignments, error: assignmentsError } = await assignmentsQuery;
    
    if (assignmentsError) throw assignmentsError;

    const assignedCount = assignments?.length || 0;
    const awaitingCount = totalLines - assignedCount;
    const progressPercent = totalLines > 0 ? Math.round((assignedCount / totalLines) * 100) : 0;

    return {
      awaitingCount,
      assignedCount,
      totalLines,
      progressPercent
    };
  }

  /**
   * Get vehicle lines for assignment with filters and pagination
   */
  async getVehicleLines(options?: {
    agreementId?: string;
    search?: string;
    status?: 'all' | 'assigned' | 'not_assigned';
    page?: number;
    pageSize?: number;
  }): Promise<{ lines: VehicleLine[]; total: number }> {
    const { agreementId, search, status = 'all', page = 1, pageSize = 25 } = options || {};

    // Get agreements with their assignments
    let agreementsQuery = supabase
      .from('corporate_leasing_agreements')
      .select(`
        id,
        agreement_no,
        agreement_items,
        corporate_leasing_line_assignments (
          id,
          line_no,
          vehicle_id,
          vin,
          status,
          vehicles (
            license_plate
          )
        )
      `)
      .eq('status', 'customer_accepted');

    if (agreementId) {
      agreementsQuery = agreementsQuery.eq('id', agreementId);
    }

    const { data: agreements, error: agreementsError } = await agreementsQuery;
    
    if (agreementsError) throw agreementsError;
    if (!agreements) return { lines: [], total: 0 };

    // Transform data into VehicleLine format
    const allLines: VehicleLine[] = [];

    agreements.forEach(agreement => {
      const items = (agreement.agreement_items as any[]) || [];
      const assignments = (agreement.corporate_leasing_line_assignments as any[]) || [];

      items.forEach((item, index) => {
        const lineNo = index + 1;
        const contractNo = `${agreement.agreement_no}-${String(lineNo).padStart(2, '0')}`;
        
        // Find assignment for this line
        const assignment = assignments.find((a: any) => a.line_no === lineNo && a.status === 'assigned');

        const line: VehicleLine = {
          agreementId: agreement.id,
          agreementNo: agreement.agreement_no,
          lineNo,
          contractNo,
          itemCode: item._vehicleMeta?.itemCode || '',
          itemDescription: item.item_description || '',
          vehicleClass: item._vehicleMeta?.category || '',
          startDate: item.pickup_at || '',
          endDate: item.return_at || '',
          durationMonths: item.duration_months || 0,
          monthlyRate: item.monthly_rate || 0,
          isAssigned: !!assignment,
          assignedVin: assignment?.vin,
          assignedVehicleId: assignment?.vehicle_id,
          assignmentId: assignment?.id,
          assignedLicensePlate: assignment?.vehicles?.license_plate
        };

        allLines.push(line);
      });
    });

    // Apply filters
    let filteredLines = allLines;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLines = filteredLines.filter(line =>
        line.agreementNo.toLowerCase().includes(searchLower) ||
        line.contractNo.toLowerCase().includes(searchLower) ||
        line.itemDescription.toLowerCase().includes(searchLower) ||
        line.assignedVin?.toLowerCase().includes(searchLower)
      );
    }

    if (status === 'assigned') {
      filteredLines = filteredLines.filter(line => line.isAssigned);
    } else if (status === 'not_assigned') {
      filteredLines = filteredLines.filter(line => !line.isAssigned);
    }

    const total = filteredLines.length;

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLines = filteredLines.slice(startIndex, endIndex);

    return { lines: paginatedLines, total };
  }

  /**
   * Get available VINs for a specific item code
   */
  async getAvailableVins(itemCode: string): Promise<AvailableVin[]> {
    // Parse item code to extract vehicle specs
    // Format: "HON-CRV-2023-SIL-SUV" or similar
    const parts = itemCode.split('-');
    if (parts.length < 3) {
      throw new Error('Invalid item code format');
    }

    // Extract make, model, year from item code
    const makeCode = parts[0];
    const modelCode = parts[1];
    const yearStr = parts[2];
    const colorCode = parts[3];

    // Map codes to full names (we need to query by actual values)
    // For now, we'll search by year and try to match
    const year = parseInt(yearStr);

    // Get all available vehicles and filter
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, vin, license_plate, make, model, year, color, odometer')
      .eq('status', 'available')
      .eq('year', year)
      .order('odometer', { ascending: true });

    if (error) throw error;
    if (!vehicles) return [];

    // Filter by make/model match (case insensitive partial match)
    const filtered = vehicles.filter(v => {
      const makeMatch = v.make?.toLowerCase().includes(makeCode.toLowerCase()) || 
                        makeCode.toLowerCase().includes(v.make?.toLowerCase() || '');
      const modelMatch = v.model?.toLowerCase().includes(modelCode.toLowerCase()) ||
                         modelCode.toLowerCase().includes(v.model?.toLowerCase() || '');
      return makeMatch && modelMatch;
    });

    return filtered as AvailableVin[];
  }

  /**
   * Assign a VIN to a contract line
   */
  async assignVin(request: AssignVinRequest): Promise<void> {
    const {
      agreementId,
      lineNo,
      contractNo,
      vehicleId,
      vin,
      itemCode,
      checkoutLocationId,
      checkinLocationId,
      checkoutFuelLevel,
      checkoutOdometer,
      checkoutNotes
    } = request;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Start transaction-like operations
    // 1. Check if vehicle is still available
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, status')
      .eq('id', vehicleId)
      .eq('status', 'available')
      .maybeSingle();

    if (vehicleError) throw vehicleError;
    if (!vehicle) throw new Error('Vehicle is no longer available');

    // 2. Check if line is not already assigned
    const { data: existingAssignment, error: checkError } = await supabase
      .from('corporate_leasing_line_assignments')
      .select('id')
      .eq('agreement_id', agreementId)
      .eq('line_no', lineNo)
      .eq('status', 'assigned')
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingAssignment) throw new Error('This line already has a VIN assigned');

    // 3. Create assignment
    const { error: assignmentError } = await supabase
      .from('corporate_leasing_line_assignments')
      .insert({
        agreement_id: agreementId,
        line_no: lineNo,
        contract_no: contractNo,
        vehicle_id: vehicleId,
        vin: vin,
        item_code: itemCode,
        assigned_by: user?.id,
        checkout_location_id: checkoutLocationId,
        checkin_location_id: checkinLocationId,
        checkout_fuel_level: checkoutFuelLevel,
        checkout_odometer: checkoutOdometer,
        checkout_notes: checkoutNotes,
        status: 'assigned'
      });

    if (assignmentError) throw assignmentError;

    // 4. Update vehicle status to rented
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ status: 'rented' })
      .eq('id', vehicleId);

    if (updateError) throw updateError;
  }

  /**
   * Unassign a VIN from a contract line
   */
  async unassignVin(assignmentId: string): Promise<void> {
    // Get assignment details
    const { data: assignment, error: getError } = await supabase
      .from('corporate_leasing_line_assignments')
      .select('vehicle_id, status')
      .eq('id', assignmentId)
      .eq('status', 'assigned')
      .maybeSingle();

    if (getError) throw getError;
    if (!assignment) throw new Error('Assignment not found or already cancelled');

    // Update assignment status to cancelled
    const { error: cancelError } = await supabase
      .from('corporate_leasing_line_assignments')
      .update({ status: 'cancelled' })
      .eq('id', assignmentId);

    if (cancelError) throw cancelError;

    // Update vehicle status back to available
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ status: 'available' })
      .eq('id', assignment.vehicle_id);

    if (vehicleError) throw vehicleError;
  }
}

export const corporateVinAssignmentAPI = new CorporateVinAssignmentAPI();

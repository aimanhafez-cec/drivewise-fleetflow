import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DriverAssignmentStats {
  totalLines: number;
  assignedLines: number;
  unassignedLines: number;
  assignmentProgress: number;
}

export interface AssignedDriver {
  id: string; // assignment record id
  driverId: string;
  driverName: string;
  licenseNumber: string;
  phoneNumber: string;
  isPrimary: boolean;
  assignmentDate: string;
  assignmentEndDate?: string;
  notes?: string;
}

export interface DriverLine {
  lineId: string;
  lineNumber: number;
  itemCode: string;
  itemDescription: string;
  agreementNumber: string;
  customerName: string;
  contractStartDate: string;
  contractEndDate: string;
  assignedDrivers: AssignedDriver[];
  driverCount: number;
  isAssigned: boolean;
}

export interface AssignDriverRequest {
  lineId: string;
  driverId: string;
  isPrimary: boolean;
  assignmentStartDate: string;
  assignmentEndDate?: string;
  notes?: string;
}

// ============================================================================
// Corporate Driver Assignment API
// ============================================================================

class CorporateDriverAssignmentAPI {
  /**
   * Get dashboard statistics for driver assignments
   */
  async getDashboardStats(agreementId?: string): Promise<DriverAssignmentStats> {
    try {
      let query = supabase
        .from('corporate_leasing_lines')
        .select('id, agreement_id');

      if (agreementId) {
        query = query.eq('agreement_id', agreementId);
      }

      // Only include lines from active agreements
      const { data: agreements } = await supabase
        .from('corporate_leasing_agreements')
        .select('id')
        .eq('status', 'active');

      const signedAgreementIds = agreements?.map(a => a.id) || [];
      
      if (signedAgreementIds.length === 0) {
        return {
          totalLines: 0,
          assignedLines: 0,
          unassignedLines: 0,
          assignmentProgress: 0,
        };
      }

      query = query.in('agreement_id', signedAgreementIds);

      const { data: lines, error } = await query;

      if (error) throw error;

      const totalLines = lines?.length || 0;

      // Get lines with active driver assignments
      const { data: assignments } = await supabase
        .from('corporate_leasing_line_drivers')
        .select('line_id')
        .is('removed_date', null)
        .in('line_id', lines?.map(l => l.id) || []);

      const assignedLineIds = new Set(assignments?.map(a => a.line_id) || []);
      const assignedLines = assignedLineIds.size;
      const unassignedLines = totalLines - assignedLines;
      const assignmentProgress = totalLines > 0 ? Math.round((assignedLines / totalLines) * 100) : 0;

      return {
        totalLines,
        assignedLines,
        unassignedLines,
        assignmentProgress,
      };
    } catch (error) {
      console.error('Error fetching driver assignment stats:', error);
      throw error;
    }
  }

  /**
   * Get vehicle lines with driver assignment information
   */
  async getDriverLines(options?: {
    agreementId?: string;
    search?: string;
    status?: 'all' | 'assigned' | 'not_assigned';
    page?: number;
    pageSize?: number;
  }): Promise<{ data: DriverLine[]; totalCount: number }> {
    try {
      const { agreementId, search, status = 'all', page = 1, pageSize = 20 } = options || {};

      // Get active agreements first
      const { data: agreements } = await supabase
        .from('corporate_leasing_agreements')
        .select('id, agreement_no, customer_id, customers(name)')
        .eq('status', 'active');

      if (!agreements || agreements.length === 0) {
        return { data: [], totalCount: 0 };
      }

      let agreementIds = agreements.map(a => a.id);
      
      if (agreementId) {
        agreementIds = agreementIds.filter(id => id === agreementId);
      }

      // Build query for lines
      let query = supabase
        .from('corporate_leasing_lines')
        .select('*', { count: 'exact' })
        .in('agreement_id', agreementIds);

      // Apply search filter
      if (search) {
        query = query.or(`item_code.ilike.%${search}%,item_description.ilike.%${search}%`);
      }

      // Get all lines first
      const { data: lines, count, error } = await query.order('line_number');

      if (error) throw error;
      if (!lines) return { data: [], totalCount: 0 };

      // Get all driver assignments for these lines
      const lineIds = lines.map(l => l.id);
      const { data: assignments } = await supabase
        .from('corporate_leasing_line_drivers')
        .select(`
          id,
          line_id,
          driver_id,
          is_primary,
          assignment_start_date,
          assignment_end_date,
          notes,
          drivers(full_name, license_number, phone_number)
        `)
        .in('line_id', lineIds)
        .is('removed_date', null);

      // Build driver lines with assignment info
      const driverLines: DriverLine[] = lines.map(line => {
        const agreement = agreements.find(a => a.id === line.agreement_id);
        const lineAssignments = assignments?.filter(a => a.line_id === line.id) || [];

        const assignedDrivers: AssignedDriver[] = lineAssignments.map(a => ({
          id: a.id,
          driverId: a.driver_id,
          driverName: (a.drivers as any)?.full_name || 'Unknown Driver',
          licenseNumber: (a.drivers as any)?.license_number || '',
          phoneNumber: (a.drivers as any)?.phone_number || '',
          isPrimary: a.is_primary || false,
          assignmentDate: a.assignment_start_date,
          assignmentEndDate: a.assignment_end_date,
          notes: a.notes,
        }));

        return {
          lineId: line.id,
          lineNumber: line.line_number,
          itemCode: line.item_code,
          itemDescription: line.item_description || '',
          agreementNumber: agreement?.agreement_no || '',
          customerName: (agreement?.customers as any)?.name || '',
          contractStartDate: line.lease_start_date,
          contractEndDate: line.lease_end_date,
          assignedDrivers,
          driverCount: assignedDrivers.length,
          isAssigned: assignedDrivers.length > 0,
        };
      });

      // Apply status filter
      let filteredLines = driverLines;
      if (status === 'assigned') {
        filteredLines = driverLines.filter(l => l.isAssigned);
      } else if (status === 'not_assigned') {
        filteredLines = driverLines.filter(l => !l.isAssigned);
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLines = filteredLines.slice(startIndex, endIndex);

      return {
        data: paginatedLines,
        totalCount: filteredLines.length,
      };
    } catch (error) {
      console.error('Error fetching driver lines:', error);
      throw error;
    }
  }

  /**
   * Assign a driver to a vehicle line
   */
  async assignDriver(request: AssignDriverRequest): Promise<void> {
    try {
      const { lineId, driverId, isPrimary, assignmentStartDate, assignmentEndDate, notes } = request;

      // If setting as primary, first unset any existing primary for this line
      if (isPrimary) {
        await supabase
          .from('corporate_leasing_line_drivers')
          .update({ is_primary: false })
          .eq('line_id', lineId)
          .is('removed_date', null);
      }

      // Get agreement_id from line
      const { data: line } = await supabase
        .from('corporate_leasing_lines')
        .select('agreement_id')
        .eq('id', lineId)
        .single();

      if (!line) throw new Error('Line not found');

      // Create the assignment
      const { error } = await supabase
        .from('corporate_leasing_line_drivers')
        .insert({
          agreement_id: line.agreement_id,
          line_id: lineId,
          driver_id: driverId,
          is_primary: isPrimary,
          assignment_start_date: assignmentStartDate,
          assignment_end_date: assignmentEndDate,
          notes,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  /**
   * Remove a driver assignment
   */
  async removeDriver(assignmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('corporate_leasing_line_drivers')
        .update({ removed_at: new Date().toISOString() })
        .eq('id', assignmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing driver:', error);
      throw error;
    }
  }

  /**
   * Update driver assignment details
   */
  async updateDriverAssignment(
    assignmentId: string,
    updates: {
      isPrimary?: boolean;
      assignmentStartDate?: string;
      assignmentEndDate?: string;
      notes?: string;
    }
  ): Promise<void> {
    try {
      // If setting as primary, get the line_id first
      if (updates.isPrimary) {
        const { data: assignment } = await supabase
          .from('corporate_leasing_line_drivers')
          .select('line_id')
          .eq('id', assignmentId)
          .single();

        if (assignment) {
          // Unset other primaries for this line
          await supabase
            .from('corporate_leasing_line_drivers')
            .update({ is_primary: false })
            .eq('line_id', assignment.line_id)
            .is('removed_date', null);
        }
      }

      const updateData: any = {};
      if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary;
      if (updates.assignmentStartDate) updateData.assignment_start_date = updates.assignmentStartDate;
      if (updates.assignmentEndDate !== undefined) updateData.assignment_end_date = updates.assignmentEndDate;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('corporate_leasing_line_drivers')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating driver assignment:', error);
      throw error;
    }
  }
}

export const corporateDriverAssignmentAPI = new CorporateDriverAssignmentAPI();

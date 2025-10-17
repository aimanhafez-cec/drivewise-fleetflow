import { useMemo } from 'react';
import { useCostSheets, useCostSheet } from './useCostSheet';

interface VehicleChange {
  type: 'added' | 'removed' | 'modified' | 'count_mismatch';
  lineNo: number;
  field?: string;
  detail: string;
}

export const useDetectVehicleChanges = (quoteId: string, quoteItems: any[]) => {
  const { data: costSheets } = useCostSheets(quoteId);
  
  // Get latest approved cost sheet
  const latestApproved = useMemo(() => {
    return costSheets?.find(cs => cs.status === 'approved');
  }, [costSheets]);
  
  // Fetch full cost sheet with lines
  const { data: fullCostSheet } = useCostSheet(latestApproved?.id);
  
  // Detect changes between current quote items and cost sheet lines
  const changes = useMemo((): VehicleChange[] => {
    if (!fullCostSheet?.lines || !quoteItems) return [];
    
    const detectedChanges: VehicleChange[] = [];
    const costSheetLines = fullCostSheet.lines;
    
    // Check line count mismatch
    if (quoteItems.length !== costSheetLines.length) {
      detectedChanges.push({
        type: 'count_mismatch',
        lineNo: 0,
        detail: `Line count changed: ${costSheetLines.length} → ${quoteItems.length}`,
      });
    }
    
    // Check each line for changes
    quoteItems.forEach((quoteItem, idx) => {
      const costSheetLine = costSheetLines[idx];
      
      if (!costSheetLine) {
        detectedChanges.push({
          type: 'added',
          lineNo: quoteItem.line_no,
          detail: `New vehicle line added`,
        });
        return;
      }
      
      // Compare vehicle_id or vehicle_class_id
      if (quoteItem.vehicle_id && quoteItem.vehicle_id !== costSheetLine.vehicle_id) {
        detectedChanges.push({
          type: 'modified',
          lineNo: quoteItem.line_no,
          field: 'vehicle_id',
          detail: `Vehicle changed on line ${quoteItem.line_no}`,
        });
      }
      
      if (quoteItem.vehicle_class_id && quoteItem.vehicle_class_id !== costSheetLine.vehicle_class_id) {
        detectedChanges.push({
          type: 'modified',
          lineNo: quoteItem.line_no,
          field: 'vehicle_class_id',
          detail: `Vehicle class changed on line ${quoteItem.line_no}`,
        });
      }
      
      // Compare monthly_rate (quoted rate vs actual)
      if (Math.abs((quoteItem.monthly_rate || 0) - (costSheetLine.quoted_rate_per_month_aed || 0)) > 0.01) {
        detectedChanges.push({
          type: 'modified',
          lineNo: quoteItem.line_no,
          field: 'monthly_rate',
          detail: `Rate changed on line ${quoteItem.line_no}: ${costSheetLine.quoted_rate_per_month_aed} → ${quoteItem.monthly_rate}`,
        });
      }
      
      // Compare lease term
      const quoteItemTerm = quoteItem.lease_term_months || quoteItem.duration_months || 0;
      if (quoteItemTerm !== costSheetLine.lease_term_months) {
        detectedChanges.push({
          type: 'modified',
          lineNo: quoteItem.line_no,
          field: 'lease_term_months',
          detail: `Lease term changed on line ${quoteItem.line_no}: ${costSheetLine.lease_term_months} → ${quoteItemTerm} months`,
        });
      }
      
      // Compare quantity
      if (quoteItem.quantity && quoteItem.quantity !== (costSheetLine as any).quantity) {
        detectedChanges.push({
          type: 'modified',
          lineNo: quoteItem.line_no,
          field: 'quantity',
          detail: `Quantity changed on line ${quoteItem.line_no}`,
        });
      }
    });
    
    // Check for removed lines
    costSheetLines.forEach((costSheetLine, idx) => {
      if (idx >= quoteItems.length) {
        detectedChanges.push({
          type: 'removed',
          lineNo: costSheetLine.line_no,
          detail: `Vehicle line ${costSheetLine.line_no} removed`,
        });
      }
    });
    
    return detectedChanges;
  }, [fullCostSheet, quoteItems]);
  
  return {
    hasChanges: changes.length > 0,
    obsoleteCostSheetId: latestApproved?.id,
    changeDetails: changes,
    latestApprovedCostSheet: latestApproved,
  };
};
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CostSheetHeader } from './CostSheetHeader';
import { CostSheetVehicleTable } from './CostSheetVehicleTable';
import { CostSheetSummary } from './CostSheetSummary';
import { CostSheetStatusBadge } from './CostSheetStatusBadge';
import {
  useCostSheet,
  useCalculateCostSheet,
  useSubmitCostSheet,
  useApproveCostSheet,
  useUpdateCostSheetStatus,
} from '@/hooks/useCostSheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CostSheetDrawerProps {
  open: boolean;
  onClose: () => void;
  quoteId: string;
  costSheetId: string | null;
  quoteDurationMonths: number;
}

export const CostSheetDrawer: React.FC<CostSheetDrawerProps> = ({
  open,
  onClose,
  quoteId,
  costSheetId,
  quoteDurationMonths,
}) => {
  const { data: costSheet, isLoading } = useCostSheet(costSheetId || undefined);
  const calculateMutation = useCalculateCostSheet();
  const submitMutation = useSubmitCostSheet();
  const approveMutation = useApproveCostSheet();
  const updateStatusMutation = useUpdateCostSheetStatus();
  const { toast } = useToast();

  const [headerData, setHeaderData] = useState({
    financing_rate_percent: 6.0,
    overhead_percent: 5.0,
    target_margin_percent: 15.0,
    residual_value_percent: 40.0,
    notes_assumptions: '',
  });

  useEffect(() => {
    if (costSheet) {
      setHeaderData({
        financing_rate_percent: costSheet.financing_rate_percent,
        overhead_percent: costSheet.overhead_percent,
        target_margin_percent: costSheet.target_margin_percent,
        residual_value_percent: costSheet.residual_value_percent,
        notes_assumptions: costSheet.notes_assumptions || '',
      });
    }
  }, [costSheet]);

  const handleCalculate = () => {
    calculateMutation.mutate({
      quote_id: quoteId,
      financing_rate: headerData.financing_rate_percent,
      overhead_percent: headerData.overhead_percent,
      target_margin: headerData.target_margin_percent,
      residual_value_percent: headerData.residual_value_percent,
    });
  };

  const handleSubmit = () => {
    if (!costSheet) return;
    
    const lowMarginLines = costSheet.lines?.filter(l => l.actual_margin_percent < 5) || [];
    if (lowMarginLines.length > 0) {
      toast({
        title: 'Cannot Submit',
        description: `${lowMarginLines.length} line(s) have margins below 5%. Please adjust costs or rates.`,
        variant: 'destructive',
      });
      return;
    }

    submitMutation.mutate({
      cost_sheet_id: costSheet.id,
      notes: headerData.notes_assumptions,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {costSheet ? (
              <>
                Cost Sheet: {costSheet.cost_sheet_no}
                <CostSheetStatusBadge status={costSheet.status} />
              </>
            ) : (
              'Create New Cost Sheet'
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="space-y-4 p-1">
            {costSheet && (
              <div className="bg-muted/30 p-3 rounded-md border">
                <div className="flex items-center gap-4 flex-wrap">
                  <Label className="text-sm font-medium min-w-fit">Status (Demo Mode):</Label>
                  <Select
                    value={costSheet.status}
                    onValueChange={(value) => {
                      if (costSheet.id) {
                        updateStatusMutation.mutate({
                          cost_sheet_id: costSheet.id,
                          status: value as any,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Manually change for testing
                  </p>
                </div>
              </div>
            )}
          
          <CostSheetHeader
            financingRate={headerData.financing_rate_percent}
            overheadPercent={headerData.overhead_percent}
            targetMargin={headerData.target_margin_percent}
            residualValue={headerData.residual_value_percent}
            leaseTerm={quoteDurationMonths}
            notes={headerData.notes_assumptions}
            onChange={(field, value) => {
              const mapping: Record<string, string> = {
                financingRate: 'financing_rate_percent',
                overheadPercent: 'overhead_percent',
                targetMargin: 'target_margin_percent',
                residualValue: 'residual_value_percent',
                notes: 'notes_assumptions',
              };
              const key = mapping[field] || field;
              setHeaderData(prev => ({ ...prev, [key]: value }));
            }}
          />

          {costSheet?.lines && costSheet.lines.length > 0 && (
            <>
              <CostSheetVehicleTable lines={costSheet.lines} />
              <CostSheetSummary 
                lines={costSheet.lines} 
                targetMargin={headerData.target_margin_percent}
              />
            </>
          )}

            <div className="flex gap-3 justify-end pt-4 border-t">
            {!costSheet && (
              <Button
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
              >
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Cost Sheet'}
              </Button>
            )}

            {costSheet?.status === 'draft' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                >
                  {calculateMutation.isPending ? 'Recalculating...' : 'Recalculate'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit & Auto-Approve'}
                </Button>
              </>
            )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

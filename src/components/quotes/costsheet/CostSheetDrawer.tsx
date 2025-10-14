import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, Send, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CostSheetHeader } from './CostSheetHeader';
import { CostSheetVehicleTable } from './CostSheetVehicleTable';
import { CostSheetSummary } from './CostSheetSummary';
import { CostSheetStatusBadge } from './CostSheetStatusBadge';
import { 
  useCostSheet, 
  useCalculateCostSheet, 
  useSubmitCostSheet,
  useApproveCostSheet 
} from '@/hooks/useCostSheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CostSheetDrawerProps {
  open: boolean;
  onClose: () => void;
  quoteId: string;
  quoteDurationMonths: number;
}

export const CostSheetDrawer: React.FC<CostSheetDrawerProps> = ({
  open,
  onClose,
  quoteId,
  quoteDurationMonths,
}) => {
  const { data: costSheet, isLoading } = useCostSheet(quoteId);
  const calculateMutation = useCalculateCostSheet();
  const submitMutation = useSubmitCostSheet();
  const approveMutation = useApproveCostSheet();
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

  // Check if quote has changed (vehicles added/removed)
  useEffect(() => {
    if (costSheet && quoteId) {
      const checkForChanges = async () => {
        const { data: quote } = await supabase
          .from('quotes')
          .select('quote_items')
          .eq('id', quoteId)
          .single();
        
        if (quote) {
          const currentVehicleCount = Array.isArray(quote.quote_items) ? quote.quote_items.length : 0;
          const costSheetVehicleCount = costSheet.lines?.length || 0;
          
          if (currentVehicleCount !== costSheetVehicleCount) {
            toast({
              title: 'Quote has changed',
              description: `Quote has ${currentVehicleCount} vehicle(s) but cost sheet has ${costSheetVehicleCount}. Click "Recalculate" to update.`,
              variant: 'destructive',
              duration: 10000,
            });
          }
        }
      };
      
      checkForChanges();
    }
  }, [costSheet, quoteId, toast]);

  const handleCalculate = () => {
    calculateMutation.mutate({
      quote_id: quoteId,
      ...headerData,
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

  const handleApprove = () => {
    if (!costSheet) return;
    approveMutation.mutate({
      cost_sheet_id: costSheet.id,
      action: 'approved',
      apply_suggested_rates: true,
    });
  };

  const handleReject = () => {
    if (!costSheet) return;
    approveMutation.mutate({
      cost_sheet_id: costSheet.id,
      action: 'rejected',
    });
  };

  const isDisabled = costSheet?.status === 'approved' || costSheet?.status === 'pending_approval';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Cost Sheet</SheetTitle>
                <SheetDescription>
                  Calculate costs and profitability for this quote
                </SheetDescription>
              </div>
              {costSheet && <CostSheetStatusBadge status={costSheet.status} />}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-6">
              <div className="px-6 pt-6">
                {!costSheet && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No cost sheet exists yet. Click "Calculate Cost Sheet" to generate one based on default values.
                    </AlertDescription>
                  </Alert>
                )}

                <CostSheetHeader
                  financingRate={headerData.financing_rate_percent}
                  overheadPercent={headerData.overhead_percent}
                  targetMargin={headerData.target_margin_percent}
                  residualValue={headerData.residual_value_percent}
                  leaseTerm={quoteDurationMonths}
                  notes={headerData.notes_assumptions}
                  disabled={isDisabled}
                  onChange={(field, value) => setHeaderData(prev => ({ ...prev, [field]: value }))}
                />
              </div>

              {costSheet?.lines && costSheet.lines.length > 0 && (
                <>
                  <CostSheetVehicleTable
                    lines={costSheet.lines}
                    disabled={isDisabled}
                  />

                  <div className="px-6 pb-6">
                    <CostSheetSummary
                      lines={costSheet.lines}
                      targetMargin={headerData.target_margin_percent}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="px-6 py-4 bg-muted/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {costSheet?.status === 'approved' && (
                <Button
                  onClick={() => {
                    approveMutation.mutate({
                      cost_sheet_id: costSheet.id,
                      action: 'approved',
                      apply_suggested_rates: true,
                    });
                  }}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Suggested Rates to Quote
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={handleCalculate}
                disabled={calculateMutation.isPending || isDisabled}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${calculateMutation.isPending ? 'animate-spin' : ''}`} />
                {costSheet ? 'Recalculate' : 'Calculate Cost Sheet'}
              </Button>

              {costSheet?.status === 'draft' && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || !costSheet}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}

              {costSheet?.status === 'pending_approval' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={approveMutation.isPending}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
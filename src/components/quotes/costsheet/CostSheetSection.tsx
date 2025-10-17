import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Plus, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CostSheetList } from './CostSheetList';
import { CostSheetDrawer } from './CostSheetDrawer';
import { useCostSheets } from '@/hooks/useCostSheet';

interface CostSheetSectionProps {
  quoteId: string;
  quoteDurationMonths: number;
  hasUnsavedChanges?: boolean;
  onSaveRequired?: () => void;
}

export const CostSheetSection: React.FC<CostSheetSectionProps> = ({
  quoteId,
  quoteDurationMonths,
  hasUnsavedChanges = false,
  onSaveRequired,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCostSheetId, setSelectedCostSheetId] = useState<string | null>(null);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [waitingToOpen, setWaitingToOpen] = useState(false);
  const { data: costSheets = [], isLoading } = useCostSheets(quoteId);

  const handleCreateNew = () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges) {
      setShowSaveWarning(true);
      return;
    }
    
    // Proceed normally
    setSelectedCostSheetId(null);
    setDrawerOpen(true);
  };

  const handleSaveAndProceed = () => {
    setShowSaveWarning(false);
    setWaitingToOpen(true);
    onSaveRequired?.();
  };

  // Watch for save completion
  useEffect(() => {
    if (!hasUnsavedChanges && waitingToOpen) {
      setSelectedCostSheetId(null);
      setDrawerOpen(true);
      setWaitingToOpen(false);
    }
  }, [hasUnsavedChanges, waitingToOpen]);

  const handleViewCostSheet = (costSheetId: string) => {
    setSelectedCostSheetId(costSheetId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedCostSheetId(null);
  };

  const latestObsolete = useMemo(() => {
    return costSheets.find(cs => cs.status === 'obsolete');
  }, [costSheets]);

  return (
    <>
      <Card className="p-6">
        {/* Obsolete Cost Sheet Alert */}
        {latestObsolete && (
          <Alert variant="destructive" className="mb-4 border-amber-600 bg-amber-50 dark:bg-amber-950/40">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-900 dark:text-amber-200">Cost Sheet Out of Sync</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Cost sheet <strong>{latestObsolete.cost_sheet_no}</strong> is obsolete because vehicle lines have changed. 
              Create a new cost sheet to reflect current vehicle details.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Warning Alert */}
        {hasUnsavedChanges && (
          <Alert className="mb-4 border-amber-300 bg-amber-50 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <AlertTitle className="text-amber-900 dark:text-amber-200">Unsaved Changes Detected</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Please save your vehicle line changes before generating a cost sheet. 
              Cost sheets are calculated from saved database records.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Cost Sheets</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage cost sheet versions for profitability analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-700">
                Unsaved Changes
              </Badge>
            )}
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Cost Sheet
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading cost sheets...
          </div>
        ) : (
          <CostSheetList
            costSheets={costSheets}
            onViewCostSheet={handleViewCostSheet}
          />
        )}
      </Card>

      {/* Warning Dialog */}
      <AlertDialog open={showSaveWarning} onOpenChange={setShowSaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Unsaved Vehicle Lines
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to vehicle lines. Cost sheets are generated 
              from saved data in the database. Would you like to save your changes first?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndProceed}>
              Save and Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CostSheetDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        quoteId={quoteId}
        costSheetId={selectedCostSheetId}
        quoteDurationMonths={quoteDurationMonths}
      />
    </>
  );
};

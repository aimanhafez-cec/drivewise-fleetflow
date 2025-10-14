import React, { useState } from 'react';
import { Calculator, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CostSheetList } from './CostSheetList';
import { CostSheetDrawer } from './CostSheetDrawer';
import { useCostSheets } from '@/hooks/useCostSheet';

interface CostSheetSectionProps {
  quoteId: string;
  quoteDurationMonths: number;
}

export const CostSheetSection: React.FC<CostSheetSectionProps> = ({
  quoteId,
  quoteDurationMonths,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCostSheetId, setSelectedCostSheetId] = useState<string | null>(null);
  const { data: costSheets = [], isLoading } = useCostSheets(quoteId);

  const handleCreateNew = () => {
    setSelectedCostSheetId(null);
    setDrawerOpen(true);
  };

  const handleViewCostSheet = (costSheetId: string) => {
    setSelectedCostSheetId(costSheetId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedCostSheetId(null);
  };

  return (
    <>
      <Card className="p-6">
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
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Cost Sheet
          </Button>
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

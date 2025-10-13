import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { CostSheetStatusBadge } from './CostSheetStatusBadge';
import { useCostSheet } from '@/hooks/useCostSheet';

interface CostSheetButtonProps {
  quoteId: string;
  onOpen: () => void;
}

export const CostSheetButton: React.FC<CostSheetButtonProps> = ({ 
  quoteId, 
  onOpen 
}) => {
  const { data: costSheet } = useCostSheet(quoteId);

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">Cost Sheet</h3>
        <p className="text-xs text-muted-foreground">
          {costSheet 
            ? 'Review and manage profitability calculations' 
            : 'Calculate costs and margins for this quote'}
        </p>
      </div>
      
      {costSheet && (
        <CostSheetStatusBadge status={costSheet.status} />
      )}
      
      <Button onClick={onOpen} variant="outline">
        <Calculator className="h-4 w-4 mr-2" />
        {costSheet ? 'View Cost Sheet' : 'Prepare Cost Sheet'}
      </Button>
    </div>
  );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileCheck, X } from 'lucide-react';
import type { TrafficFineFilters } from '@/lib/api/trafficFinesCorporate';

interface QuickFilterBarProps {
  filters: TrafficFineFilters;
  onFiltersChange: (filters: TrafficFineFilters) => void;
}

export function QuickFilterBar({ filters, onFiltersChange }: QuickFilterBarProps) {
  const isUnpaidOnly = filters.status?.length === 1 && filters.status[0] === 'unpaid';
  const isLinkedToContract = filters.contract_id !== undefined;
  
  const hasActiveQuickFilters = isUnpaidOnly || isLinkedToContract;

  const toggleUnpaidOnly = () => {
    if (isUnpaidOnly) {
      // Remove unpaid filter
      onFiltersChange({ ...filters, status: undefined });
    } else {
      // Set unpaid filter only
      onFiltersChange({ ...filters, status: ['unpaid'] });
    }
  };

  const toggleLinkedToContract = () => {
    if (isLinkedToContract) {
      // Remove contract filter
      const { contract_id, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      // Set contract filter (empty string means "has contract")
      onFiltersChange({ ...filters, contract_id: '' });
    }
  };

  const clearQuickFilters = () => {
    const { status, contract_id, ...rest } = filters;
    onFiltersChange(rest);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">Quick Filters:</span>
      
      <Button
        variant={isUnpaidOnly ? 'default' : 'outline'}
        size="sm"
        onClick={toggleUnpaidOnly}
        className={isUnpaidOnly ? 'bg-destructive hover:bg-destructive/90' : ''}
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Unpaid Only
      </Button>

      <Button
        variant={isLinkedToContract ? 'default' : 'outline'}
        size="sm"
        onClick={toggleLinkedToContract}
      >
        <FileCheck className="h-4 w-4 mr-2" />
        Linked to Contract
      </Button>

      {hasActiveQuickFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearQuickFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear Quick Filters
        </Button>
      )}
    </div>
  );
}

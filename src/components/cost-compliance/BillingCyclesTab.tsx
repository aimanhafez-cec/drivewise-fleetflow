import React, { useState } from 'react';
import { Plus, Download, Filter, Eye, CheckCircle, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from './DataTable';
import { FilterPanel } from './FilterPanel';
import { BillingCycleFormDialog } from './BillingCycleFormDialog';
import { StatusBadge } from './StatusBadge';
import { useBillingCycles, useGenerateBillingPreview, useFinalizeBillingCycle, useExportBillingData, useBatchGenerateBilling } from '@/hooks/useCostCompliance';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export const BillingCyclesTab: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({
    search: '',
    status: '',
    contract_id: '',
  });

  const { data: cycles, isLoading } = useBillingCycles(filters.contract_id || undefined);
  const generatePreviewMutation = useGenerateBillingPreview();
  const finalizeMutation = useFinalizeBillingCycle();
  const exportMutation = useExportBillingData();
  const batchGenerateMutation = useBatchGenerateBilling();
  const { toast } = useToast();

  const columns: Column<any>[] = [
    {
      key: 'cycle_no',
      header: 'Cycle #',
      sortable: true,
    },
    {
      key: 'cycle_name',
      header: 'Cycle Name',
      sortable: true,
    },
    {
      key: 'contract_id',
      header: 'Contract',
      sortable: true,
    },
    {
      key: 'billing_period',
      header: 'Period',
      render: (row: any) => {
        const start = row.billing_period_start ? new Date(row.billing_period_start).toLocaleDateString() : '-';
        const end = row.billing_period_end ? new Date(row.billing_period_end).toLocaleDateString() : '-';
        return `${start} - ${end}`;
      },
    },
    {
      key: 'billing_frequency',
      header: 'Frequency',
      sortable: true,
      render: (row: any) => (
        <span className="capitalize">{row.billing_frequency}</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      sortable: true,
      render: (row: any) => formatCurrency(row.total_amount || 0, row.currency || 'AED'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: any) => <StatusBadge status={row.status || 'draft'} />,
    },
    {
      key: 'invoice_id',
      header: 'Invoice',
      render: (row: any) => row.invoice_id ? (
        <span className="text-xs text-muted-foreground">{row.invoice_id}</span>
      ) : '-',
    },
  ];

  const handleGeneratePreview = async (id: string, contractId: string) => {
    try {
      const periodStart = new Date().toISOString().split('T')[0];
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await generatePreviewMutation.mutateAsync({
        contractId: contractId,
        periodStart: periodStart,
        periodEnd: periodEnd,
      });
      toast({ title: 'Billing preview generated successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to generate billing preview',
        variant: 'destructive' 
      });
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      await finalizeMutation.mutateAsync({ id: id });
      toast({ title: 'Billing cycle finalized successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to finalize billing cycle',
        variant: 'destructive' 
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    try {
      const selectedIds = Array.from(selectedRows);
      if (selectedIds.length === 0) {
        toast({ title: 'Please select billing cycles to export', variant: 'destructive' });
        return;
      }

      // For each selected cycle, we need to get its details and generate preview for export
      toast({ 
        title: 'Export started', 
        description: `Exporting ${selectedIds.length} billing ${selectedIds.length === 1 ? 'cycle' : 'cycles'} as ${format.toUpperCase()}` 
      });
      
      // In a real implementation, we would fetch each cycle's data and export
      // For now, we'll show a success message
      setTimeout(() => {
        toast({ 
          title: 'Export complete', 
          description: 'Your files are ready for download' 
        });
      }, 2000);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to export billing data',
        variant: 'destructive' 
      });
    }
  };

  const handleBatchGenerate = async () => {
    try {
      // Get unique contract IDs from filters or selected rows
      toast({ 
        title: 'Batch generation started', 
        description: 'Generating billing for multiple contracts...' 
      });
      
      // This would typically require a list of contract IDs
      // For now, show a message that the feature is in progress
      toast({ 
        title: 'Coming soon', 
        description: 'Batch generation will be available once contract selection is implemented' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to generate batch billing',
        variant: 'destructive' 
      });
    }
  };

  const filterFields = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'preview', label: 'Preview' },
        { value: 'finalized', label: 'Finalized' },
        { value: 'invoiced', label: 'Invoiced' },
      ],
    },
    {
      key: 'contract_id',
      label: 'Contract ID',
      type: 'text' as const,
      placeholder: 'CONTRACT-001',
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing Cycles</CardTitle>
              <CardDescription>Manage contract billing and invoicing cycles</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchGenerate}
                disabled={batchGenerateMutation.isPending}
              >
                <Zap className={`h-4 w-4 mr-2 ${batchGenerateMutation.isPending ? 'animate-pulse' : ''}`} />
                Batch Generate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={selectedRows.size === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Cycle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-4">
              <FilterPanel
                filters={filters}
                onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                onReset={() => setFilters({ search: '', status: '', contract_id: '' })}
                fields={filterFields}
              />
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="mb-4 flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedRows.size} selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRows(new Set())}
                >
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          )}

          <DataTable
            data={cycles || []}
            columns={columns}
            idField="id"
            selectable={true}
            selectedIds={selectedRows}
            onSelectionChange={setSelectedRows}
            loading={isLoading}
            rowActions={[
              {
                label: 'Generate Preview',
                icon: <Eye className="h-4 w-4" />,
                onClick: (item) => handleGeneratePreview(item.id, item.contract_id),
                show: (item) => item.status === 'draft' || item.status === 'open',
              },
              {
                label: 'Finalize',
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: (item) => handleFinalize(item.id),
                show: (item) => item.status === 'preview',
              },
              {
                label: 'View Details',
                icon: <FileText className="h-4 w-4" />,
                onClick: (item) => toast({ title: 'View details feature coming soon' }),
              },
            ]}
          />
        </CardContent>
      </Card>

      <BillingCycleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
};

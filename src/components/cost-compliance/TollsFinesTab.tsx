import React, { useState } from 'react';
import { Plus, Download, Filter, CheckCircle, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from './DataTable';
import { FilterPanel } from './FilterPanel';
import { TollFineBulkActions } from './BulkActionToolbar';
import { TollFineFormDialog } from './TollFineFormDialog';
import { StatusBadge } from './StatusBadge';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useTollsFines, useDeleteTollFine, useAcknowledgeTollFine, useMarkTollFinePaid, useDisputeTollFine, useSyncWithExternalSystems } from '@/hooks/useTollsFines';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { TollFineFilters } from '@/lib/api/tollsFines';

export const TollsFinesTab: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    search: '',
    type: '',
    status: '',
    vehicle_id: '',
    customer_id: '',
    date_from: '',
    date_to: '',
    sync_status: '',
  });

  const tollFineFilters: TollFineFilters = {
    type: filters.type ? (filters.type as 'toll' | 'fine') : undefined,
    status: filters.status || undefined,
    vehicle_id: filters.vehicle_id || undefined,
    customer_id: filters.customer_id || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    sync_status: filters.sync_status || undefined,
    search: filters.search || undefined,
  };

  const { data: records, isLoading } = useTollsFines(tollFineFilters);
  const deleteMutation = useDeleteTollFine();
  const acknowledgeMutation = useAcknowledgeTollFine();
  const markPaidMutation = useMarkTollFinePaid();
  const disputeMutation = useDisputeTollFine();
  const syncMutation = useSyncWithExternalSystems();
  const { toast } = useToast();

  const columns: Column<any>[] = [
    {
      key: 'toll_fine_no',
      header: 'Number',
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (row: any) => (
        <span className="capitalize font-medium">{row.type}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row: any) => (
        <span className="text-sm capitalize">{row.category?.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'vehicle_id',
      header: 'Vehicle',
      sortable: true,
      render: (row: any) => row.vehicle_id || '-',
    },
    {
      key: 'total_amount',
      header: 'Amount',
      sortable: true,
      render: (row: any) => formatCurrency(row.total_amount || row.amount || 0, row.currency || 'AED'),
    },
    {
      key: 'incident_date',
      header: 'Date',
      sortable: true,
      render: (row: any) => row.incident_date ? new Date(row.incident_date).toLocaleDateString() : '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: any) => <StatusBadge status={row.status || 'pending'} />,
    },
    {
      key: 'sync_status',
      header: 'Sync',
      render: (row: any) => <SyncStatusIndicator status={row.sync_status || 'manual'} />,
    },
  ];

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Record deleted successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete record',
        variant: 'destructive' 
      });
    }
  };

  const handleAcknowledge = async () => {
    try {
      for (const id of Array.from(selectedRows)) {
        await acknowledgeMutation.mutateAsync({ id });
      }
      toast({ title: `${selectedRows.size} records acknowledged` });
      setSelectedRows(new Set());
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to acknowledge records',
        variant: 'destructive' 
      });
    }
  };

  const handleMarkPaid = async () => {
    try {
      const reference = `BULK-PAY-${Date.now()}`;
      for (const id of Array.from(selectedRows)) {
        await markPaidMutation.mutateAsync({ id, payment_reference: reference });
      }
      toast({ title: `${selectedRows.size} records marked as paid` });
      setSelectedRows(new Set());
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to mark records as paid',
        variant: 'destructive' 
      });
    }
  };

  const handleDispute = async () => {
    try {
      for (const id of Array.from(selectedRows)) {
        await disputeMutation.mutateAsync({ id, notes: 'Disputed via bulk action' });
      }
      toast({ title: `${selectedRows.size} records disputed` });
      setSelectedRows(new Set());
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to dispute records',
        variant: 'destructive' 
      });
    }
  };

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync(undefined);
      toast({ title: 'Sync with external systems started' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to sync with external systems',
        variant: 'destructive' 
      });
    }
  };

  const handleExport = () => {
    toast({ title: 'Export started', description: 'Your file will download shortly' });
  };

  const filterFields = [
    {
      key: 'type',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: 'toll', label: 'Toll' },
        { value: 'fine', label: 'Fine' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'acknowledged', label: 'Acknowledged' },
        { value: 'paid', label: 'Paid' },
        { value: 'disputed', label: 'Disputed' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    {
      key: 'sync_status',
      label: 'Sync Status',
      type: 'select' as const,
      options: [
        { value: 'manual', label: 'Manual' },
        { value: 'synced', label: 'Synced' },
        { value: 'pending', label: 'Pending Sync' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      key: 'date_from',
      label: 'From Date',
      type: 'date' as const,
    },
    {
      key: 'date_to',
      label: 'To Date',
      type: 'date' as const,
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tolls & Fines</CardTitle>
              <CardDescription>Manage toll charges and traffic violations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
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
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingRecord(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Record
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
                onReset={() => setFilters({ search: '', type: '', status: '', vehicle_id: '', customer_id: '', date_from: '', date_to: '', sync_status: '' })}
                fields={filterFields}
              />
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="mb-4">
              <TollFineBulkActions
                selectedCount={selectedRows.size}
                onClearSelection={() => setSelectedRows(new Set())}
                onAcknowledge={handleAcknowledge}
                onMarkPaid={handleMarkPaid}
                onDispute={handleDispute}
                onLinkContract={() => toast({ title: 'Link to contract feature coming soon' })}
                onExport={handleExport}
              />
            </div>
          )}

          <DataTable
            data={records || []}
            columns={columns}
            idField="id"
            selectable={true}
            selectedIds={selectedRows}
            onSelectionChange={setSelectedRows}
            loading={isLoading}
            rowActions={[
              {
                label: 'Edit',
                onClick: handleEdit,
              },
              {
                label: 'Acknowledge',
                onClick: (item) => acknowledgeMutation.mutateAsync({ id: item.id }),
                show: (item) => item.status === 'pending',
              },
              {
                label: 'Mark Paid',
                onClick: (item) => markPaidMutation.mutateAsync({ 
                  id: item.id, 
                  payment_reference: `PAY-${Date.now()}` 
                }),
                show: (item) => item.status !== 'paid',
              },
              {
                label: 'Delete',
                onClick: (item) => handleDelete(item.id),
                destructive: true,
              },
            ]}
          />
        </CardContent>
      </Card>

      <TollFineFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingRecord(null);
        }}
        tollFine={editingRecord}
      />
    </div>
  );
};

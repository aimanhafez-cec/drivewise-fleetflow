import React, { useState } from 'react';
import { Plus, Download, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from './DataTable';
import { FilterPanel } from './FilterPanel';
import { ExceptionBulkActions } from './BulkActionToolbar';
import { ExceptionFormDialog } from './ExceptionFormDialog';
import { StatusBadge } from './StatusBadge';
import { ExceptionAlert } from './ExceptionAlert';
import { useComplianceExceptions, useDeleteException, useResolveException } from '@/hooks/useComplianceExceptions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export const ExceptionsTab: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingException, setEditingException] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    search: '',
    exception_type: '',
    status: '',
    severity: '',
    vehicle_id: '',
    customer_id: '',
    date_from: '',
    date_to: '',
  });

  const { data: exceptions, isLoading } = useComplianceExceptions({
    source_module: filters.exception_type ? (filters.exception_type as any) : undefined,
    status: filters.status || undefined,
    severity: filters.severity || undefined,
    vehicle_id: filters.vehicle_id || undefined,
    customer_id: filters.customer_id || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  });

  const deleteMutation = useDeleteException();
  const resolveMutation = useResolveException();
  const { toast } = useToast();

  // Count critical exceptions
  const criticalCount = exceptions?.filter(e => e.severity === 'critical' && e.status === 'open').length || 0;

  const columns: Column<any>[] = [
    {
      key: 'exception_no',
      header: 'Exception #',
      sortable: true,
    },
    {
      key: 'exception_type',
      header: 'Type',
      sortable: true,
      render: (row: any) => (
        <span className="capitalize">{row.exception_type?.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (row: any) => {
        const colors = {
          low: 'text-blue-600',
          medium: 'text-yellow-600',
          high: 'text-orange-600',
          critical: 'text-red-600',
        };
        return (
          <span className={`font-medium capitalize ${colors[row.severity as keyof typeof colors] || ''}`}>
            {row.severity}
          </span>
        );
      },
    },
    {
      key: 'vehicle_id',
      header: 'Vehicle',
      sortable: true,
      render: (row: any) => row.vehicle_id || '-',
    },
    {
      key: 'customer_id',
      header: 'Customer',
      sortable: true,
      render: (row: any) => row.customer_id || '-',
    },
    {
      key: 'amount_involved',
      header: 'Amount',
      sortable: true,
      render: (row: any) => row.amount_involved ? formatCurrency(row.amount_involved, row.currency || 'AED') : '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: any) => <StatusBadge status={row.status || 'pending'} />,
    },
    {
      key: 'assigned_to',
      header: 'Assigned',
      render: (row: any) => row.assigned_to || 'Unassigned',
    },
  ];

  const handleEdit = (exception: any) => {
    setEditingException(exception);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Exception deleted successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete exception',
        variant: 'destructive' 
      });
    }
  };

  const handleApprove = async () => {
    try {
      for (const id of Array.from(selectedRows)) {
        await resolveMutation.mutateAsync({ id, resolution: { resolution_notes: 'Approved via bulk action', status: 'resolved' } });
      }
      toast({ title: `${selectedRows.size} exceptions approved` });
      setSelectedRows(new Set());
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to approve exceptions',
        variant: 'destructive' 
      });
    }
  };

  const handleDismiss = async () => {
    try {
      for (const id of Array.from(selectedRows)) {
        await resolveMutation.mutateAsync({ id, resolution: { resolution_notes: 'Dismissed via bulk action', status: 'dismissed' } });
      }
      toast({ title: `${selectedRows.size} exceptions dismissed` });
      setSelectedRows(new Set());
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to dismiss exceptions',
        variant: 'destructive' 
      });
    }
  };

  const handleExport = () => {
    toast({ title: 'Export started', description: 'Your file will download shortly' });
  };

  const filterFields = [
    {
      key: 'exception_type',
      label: 'Exception Type',
      type: 'select' as const,
      options: [
        { value: 'billing', label: 'Billing' },
        { value: 'pricing', label: 'Pricing' },
        { value: 'contract_terms', label: 'Contract Terms' },
        { value: 'usage', label: 'Usage' },
        { value: 'overcharge', label: 'Overcharge' },
        { value: 'undercharge', label: 'Undercharge' },
        { value: 'missing_charge', label: 'Missing Charge' },
        { value: 'duplicate_charge', label: 'Duplicate Charge' },
        { value: 'rate_error', label: 'Rate Error' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'severity',
      label: 'Severity',
      type: 'select' as const,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'open', label: 'Open' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' },
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
      {criticalCount > 0 && (
        <ExceptionAlert
          severity="critical"
          title={`${criticalCount} Critical ${criticalCount === 1 ? 'Exception' : 'Exceptions'}`}
          description={`${criticalCount} critical ${criticalCount === 1 ? 'exception requires' : 'exceptions require'} immediate attention`}
          onView={() => setFilters(prev => ({ ...prev, severity: 'critical', status: 'open' }))}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance Exceptions</CardTitle>
              <CardDescription>Review and resolve billing and compliance exceptions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
                  setEditingException(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Exception
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
                onReset={() => setFilters({ search: '', exception_type: '', status: '', severity: '', vehicle_id: '', customer_id: '', date_from: '', date_to: '' })}
                fields={filterFields}
              />
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="mb-4">
              <ExceptionBulkActions
                selectedCount={selectedRows.size}
                onClearSelection={() => setSelectedRows(new Set())}
                onApprove={handleApprove}
                onDismiss={handleDismiss}
                onReassign={() => toast({ title: 'Reassign feature coming soon' })}
                onEscalate={() => toast({ title: 'Escalate feature coming soon' })}
              />
            </div>
          )}

          <DataTable
            data={exceptions || []}
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
                label: 'Approve',
                onClick: (item) => resolveMutation.mutateAsync({ id: item.id, resolution: { resolution_notes: 'Approved', status: 'resolved' } }),
                show: (item) => item.status === 'open',
              },
              {
                label: 'Dismiss',
                onClick: (item) => resolveMutation.mutateAsync({ id: item.id, resolution: { resolution_notes: 'Dismissed', status: 'dismissed' } }),
                show: (item) => item.status === 'open',
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

      <ExceptionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingException(null);
        }}
        exception={editingException}
      />
    </div>
  );
};

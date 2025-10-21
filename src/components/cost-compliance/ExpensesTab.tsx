import React, { useState } from 'react';
import { Plus, Download, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from './DataTable';
import { FilterPanel } from './FilterPanel';
import { BulkActionToolbar } from './BulkActionToolbar';
import { ExpenseFormDialog } from './ExpenseFormDialog';
import { StatusBadge } from './StatusBadge';
import { useTollsFines, useDeleteTollFine } from '@/hooks/useTollsFines';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { TollFineFilters } from '@/lib/api/tollsFines';

export const ExpensesTab: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    search: '',
    category: '',
    status: '',
    vehicle_id: '',
    customer_id: '',
    date_from: '',
    date_to: '',
  });

  const tollFineFilters: TollFineFilters = {
    status: filters.status || undefined,
    vehicle_id: filters.vehicle_id || undefined,
    customer_id: filters.customer_id || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    search: filters.search || undefined,
  };

  const { data: expenses, isLoading } = useTollsFines(tollFineFilters);
  const deleteMutation = useDeleteTollFine();
  const { toast } = useToast();

  const columns: Column<any>[] = [
    {
      key: 'toll_fine_no',
      header: 'Expense #',
      sortable: true,
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
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row: any) => (
        <span className="capitalize">{row.category}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row: any) => formatCurrency(row.amount || 0, row.currency || 'USD'),
    },
    {
      key: 'incident_date',
      header: 'Date',
      sortable: true,
      render: (row: any) => row.incident_date ? new Date(row.incident_date).toLocaleDateString() : '-',
    },
    {
      key: 'payment_status',
      header: 'Status',
      sortable: true,
      render: (row: any) => <StatusBadge status={row.payment_status || 'pending'} />,
    },
  ];

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Expense deleted successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete expense',
        variant: 'destructive' 
      });
    }
  };

  const handleExport = () => {
    toast({ title: 'Export started', description: 'Your file will download shortly' });
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedRows).map(id => deleteMutation.mutateAsync(id)));
      toast({ title: `${selectedRows.size} expenses deleted` });
      setSelectedRows(new Set());
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete expenses',
        variant: 'destructive' 
      });
    }
  };

  const filterFields = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'fuel', label: 'Fuel' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'toll', label: 'Toll' },
        { value: 'fine', label: 'Fine' },
        { value: 'parking', label: 'Parking' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'disputed', label: 'Disputed' },
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
              <CardTitle>Expenses</CardTitle>
              <CardDescription>Track and manage vehicle expenses</CardDescription>
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
                  setEditingExpense(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Expense
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
                onReset={() => setFilters({ search: '', category: '', status: '', vehicle_id: '', customer_id: '', date_from: '', date_to: '' })}
                fields={filterFields}
              />
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="mb-4">
              <BulkActionToolbar
                selectedCount={selectedRows.size}
                onClearSelection={() => setSelectedRows(new Set())}
                actions={[
                  {
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4 mr-1" />,
                    onClick: handleBulkDelete,
                    variant: 'destructive' as const,
                  },
                  {
                    label: 'Export',
                    icon: <Download className="h-4 w-4 mr-1" />,
                    onClick: handleExport,
                    variant: 'outline' as const,
                  },
                ]}
              />
            </div>
          )}

          <DataTable
            data={expenses || []}
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
                label: 'Delete',
                onClick: (item) => handleDelete(item.id),
                destructive: true,
              },
            ]}
          />
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingExpense(null);
        }}
        expense={editingExpense}
      />
    </div>
  );
};

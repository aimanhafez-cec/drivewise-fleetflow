import { useState } from "react";
import { useExpenses, useApproveExpense, useRejectExpense, useMarkExpenseAsPaid, useDeleteExpense } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Check, X, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExpenseFilters, ExpenseCategory, ExpenseStatus } from "@/lib/api/expenses";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ExpensesList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: expenses, isLoading } = useExpenses(filters);
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const markPaidMutation = useMarkExpenseAsPaid();
  const deleteMutation = useDeleteExpense();

  const updateFilter = (key: keyof ExpenseFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const getStatusBadgeVariant = (status: ExpenseStatus) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending_approval':
        return 'secondary';
      case 'paid':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCategoryDisplay = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Description, vendor..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              updateFilter("category", value === "all" ? undefined : (value as ExpenseCategory))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="fuel">Fuel</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="tolls">Tolls</SelectItem>
              <SelectItem value="parking">Parking</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="repairs">Repairs</SelectItem>
              <SelectItem value="tires">Tires</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="depreciation">Depreciation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? undefined : (value as ExpenseStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => setFilters({})}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : !expenses || expenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No expenses found
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Expense No</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {expense.expense_no || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {expense.vehicles ? (
                      <div>
                        <div className="font-medium text-sm">
                          {expense.vehicles.make} {expense.vehicles.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expense.vehicles.license_plate}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">General</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryDisplay(expense.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {expense.vendor_name || (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(expense.status)}>
                      {getCategoryDisplay(expense.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {expense.status === 'pending_approval' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveMutation.mutate(expense.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectMutation.mutate({ id: expense.id, reason: 'Rejected' })}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {expense.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markPaidMutation.mutate(expense.id)}
                          disabled={markPaidMutation.isPending}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      {expense.status === 'draft' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/operations/expenses/${expense.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

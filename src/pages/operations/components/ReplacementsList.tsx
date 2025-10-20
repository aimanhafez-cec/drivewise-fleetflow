import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { useReplacements, useApproveReplacement, useRejectReplacement, useDeleteReplacement } from '@/hooks/useReplacements';
import { CustodyFilters } from '@/lib/api/replacements';
import { format } from 'date-fns';
import ReplacementFiltersBar from './ReplacementFiltersBar';
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

interface ReplacementsListProps {
  filters?: CustodyFilters;
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const },
  pending_approval: { label: 'Pending Approval', variant: 'secondary' as const },
  approved: { label: 'Approved', variant: 'default' as const },
  active: { label: 'Active', variant: 'default' as const },
  closed: { label: 'Closed', variant: 'outline' as const },
  voided: { label: 'Voided', variant: 'destructive' as const },
};

const reasonConfig = {
  accident: 'Accident',
  breakdown: 'Breakdown',
  maintenance: 'Maintenance',
  damage: 'Damage',
  other: 'Other',
};

const ReplacementsList: React.FC<ReplacementsListProps> = ({ filters: initialFilters }) => {
  const [filters, setFilters] = useState<CustodyFilters>(initialFilters || {});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: replacements, isLoading } = useReplacements(filters);
  const approveMutation = useApproveReplacement();
  const rejectMutation = useRejectReplacement();
  const deleteMutation = useDeleteReplacement();

  const handleApprove = (id: string) => {
    // In a real app, get the actual user ID
    approveMutation.mutate({ id, approver_id: 'current-user-id' });
  };

  const handleReject = (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectMutation.mutate({ id, rejector_id: 'current-user-id', rejection_reason: reason });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading replacements...</div>;
  }

  if (!replacements || replacements.length === 0) {
    return (
      <div className="space-y-4">
        <ReplacementFiltersBar filters={filters} onFiltersChange={setFilters} />
        <div className="text-center py-8 text-muted-foreground">
          No replacement requests found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReplacementFiltersBar filters={filters} onFiltersChange={setFilters} />
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Custody No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Original Vehicle</TableHead>
              <TableHead>Replacement Vehicle</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {replacements.map((replacement: any) => (
              <TableRow key={replacement.id}>
                <TableCell className="font-medium">{replacement.custody_no}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{replacement.customer?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{replacement.customer?.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {replacement.original_vehicle ? (
                    <div>
                      <p className="font-medium">{replacement.original_vehicle.license_plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {replacement.original_vehicle.make} {replacement.original_vehicle.model}
                      </p>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {replacement.replacement_vehicle ? (
                    <div>
                      <p className="font-medium">{replacement.replacement_vehicle.license_plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {replacement.replacement_vehicle.make} {replacement.replacement_vehicle.model}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{reasonConfig[replacement.reason_code as keyof typeof reasonConfig]}</Badge>
                </TableCell>
                <TableCell>{format(new Date(replacement.effective_from), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {replacement.expected_return_date
                    ? format(new Date(replacement.expected_return_date), 'MMM dd, yyyy')
                    : 'TBD'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[replacement.status as keyof typeof statusConfig].variant}>
                    {statusConfig[replacement.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {replacement.sla_breached ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">Breached</span>
                    </div>
                  ) : (
                    <span className="text-xs text-green-600">On Track</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {replacement.status === 'pending_approval' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(replacement.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(replacement.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    {replacement.status === 'pending_approval' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(replacement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Replacement Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this replacement request? This action cannot be undone.
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
};

export default ReplacementsList;

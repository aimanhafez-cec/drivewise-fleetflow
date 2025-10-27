import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle,
  X,
  Mail,
  Download,
  Trash2,
  MoreVertical,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  totalCount: number;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedIds,
  onClearSelection,
  totalCount,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Bulk status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status: status as 'pending' | 'confirmed' | 'checked_out' | 'completed' | 'cancelled' })
        .in('id', selectedIds);

      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: 'Status Updated',
        description: `${selectedIds.length} reservation(s) marked as ${status}`,
      });
      onClearSelection();
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: 'Reservations Deleted',
        description: `${selectedIds.length} reservation(s) have been deleted`,
      });
      onClearSelection();
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    
    switch (action) {
      case 'confirm':
        updateStatusMutation.mutate('confirmed');
        break;
      case 'cancel':
        updateStatusMutation.mutate('cancelled');
        break;
      case 'email':
        handleBulkEmail();
        break;
      case 'export':
        handleBulkExport();
        break;
      case 'delete':
        setConfirmDialogOpen(true);
        break;
      case 'convert':
        handleBulkConvert();
        break;
      default:
        break;
    }
  };

  const handleBulkEmail = () => {
    toast({
      title: 'Sending Emails',
      description: `Preparing to send emails to ${selectedIds.length} customer(s)`,
    });
    // TODO: Implement actual bulk email functionality
  };

  const handleBulkExport = () => {
    toast({
      title: 'Exporting Data',
      description: `Exporting ${selectedIds.length} reservation(s) to CSV`,
    });
    // TODO: Implement actual export functionality
  };

  const handleBulkConvert = () => {
    toast({
      title: 'Converting Reservations',
      description: `Converting ${selectedIds.length} reservation(s) to agreements`,
    });
    // TODO: Implement bulk convert to agreement
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          {/* Selection Info */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {selectedIds.length}
            </Badge>
            <span className="text-sm font-medium">
              {selectedIds.length === totalCount ? 'All' : selectedIds.length} of {totalCount} selected
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('confirm')}
              disabled={updateStatusMutation.isPending}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('email')}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('export')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('convert')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Convert
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('cancel')}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Reservations
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Reservations
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Clear Selection */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Reservation(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected
              reservations and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

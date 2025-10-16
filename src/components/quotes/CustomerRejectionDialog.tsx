import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMarkQuoteRejected, useMarkQuoteLost } from "@/hooks/useQuoteActions";
import { useCreateQuoteVersion } from "@/hooks/useCreateQuoteVersion";
import { XCircle, FileEdit, TrendingDown } from "lucide-react";

interface CustomerRejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  quoteNumber: string;
}

export const CustomerRejectionDialog: React.FC<CustomerRejectionDialogProps> = ({
  open,
  onOpenChange,
  quoteId,
  quoteNumber,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [showLossDialog, setShowLossDialog] = useState(false);

  const markRejectedMutation = useMarkQuoteRejected();
  const markLostMutation = useMarkQuoteLost();
  const createVersionMutation = useCreateQuoteVersion();

  const handleCreateVersion = async () => {
    if (!rejectionReason.trim()) return;

    try {
      // Mark as rejected first
      await markRejectedMutation.mutateAsync({
        quoteId,
        rejectionReason,
      });

      // Create new version
      await createVersionMutation.mutateAsync(quoteId);

      onOpenChange(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to create version:", error);
    }
  };

  const handleMarkAsLost = async () => {
    if (!rejectionReason.trim()) return;

    try {
      // Mark as rejected
      await markRejectedMutation.mutateAsync({
        quoteId,
        rejectionReason,
      });

      // Show loss reason dialog
      setShowLossDialog(true);
    } catch (error) {
      console.error("Failed to mark as rejected:", error);
    }
  };

  const handleConfirmLoss = async () => {
    if (!lossReason.trim()) return;

    try {
      await markLostMutation.mutateAsync({
        quoteId,
        lossReason,
      });

      setShowLossDialog(false);
      onOpenChange(false);
      setRejectionReason("");
      setLossReason("");
    } catch (error) {
      console.error("Failed to mark as lost:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Customer Rejected Quote
            </DialogTitle>
            <DialogDescription>
              Record why customer rejected quote {quoteNumber} and choose next action
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Why did the customer reject this quote?"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateVersion}
              disabled={!rejectionReason.trim() || markRejectedMutation.isPending || createVersionMutation.isPending}
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Create Version 2 & Revise
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkAsLost}
              disabled={!rejectionReason.trim() || markRejectedMutation.isPending}
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLossDialog} onOpenChange={setShowLossDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Loss</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for losing this opportunity
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="loss-reason">Loss Reason *</Label>
            <Textarea
              id="loss-reason"
              placeholder="Why was this opportunity lost?"
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowLossDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLoss}
              disabled={!lossReason.trim() || markLostMutation.isPending}
            >
              {markLostMutation.isPending ? "Saving..." : "Confirm Loss"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

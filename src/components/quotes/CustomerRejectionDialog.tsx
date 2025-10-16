import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LOVSelect } from "@/components/ui/lov-select";
import { useMarkQuoteRejected, useMarkQuoteLost } from "@/hooks/useQuoteActions";
import { useCreateQuoteVersion } from "@/hooks/useCreateQuoteVersion";
import { useLossReasons } from "@/hooks/useWinLossReasons";
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
  const [lossReasonId, setLossReasonId] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const { data: lossReasons, isLoading: isLoadingReasons } = useLossReasons();
  const markRejectedMutation = useMarkQuoteRejected();
  const markLostMutation = useMarkQuoteLost();
  const createVersionMutation = useCreateQuoteVersion();

  const handleCreateVersion = async () => {
    try {
      // First mark as rejected
      await markRejectedMutation.mutateAsync({
        quoteId,
        lossReasonId,
        winLossNotes: additionalNotes.trim() || undefined,
      });

      // Then create new version
      await createVersionMutation.mutateAsync(quoteId);

      onOpenChange(false);
      setLossReasonId("");
      setAdditionalNotes("");
    } catch (error) {
      console.error("Failed to process rejection:", error);
    }
  };

  const handleMarkAsLost = async () => {
    try {
      // Mark as rejected and lost in one step
      await markRejectedMutation.mutateAsync({
        quoteId,
        lossReasonId,
        winLossNotes: additionalNotes.trim() || undefined,
      });

      await markLostMutation.mutateAsync({
        quoteId,
        lossReasonId,
        winLossNotes: additionalNotes.trim() || undefined,
      });

      onOpenChange(false);
      setLossReasonId("");
      setAdditionalNotes("");
    } catch (error) {
      console.error("Failed to mark as lost:", error);
    }
  };

  return (
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
            <Label htmlFor="loss-reason">Loss Reason *</Label>
            <LOVSelect
              value={lossReasonId}
              onChange={(value) => setLossReasonId(value as string)}
              items={lossReasons?.map(r => ({ id: r.id, label: r.reason_label })) || []}
              placeholder="Select a loss reason..."
              isLoading={isLoadingReasons}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="additional-notes"
              placeholder="Add any additional context about why the customer rejected..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
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
            disabled={!lossReasonId || markRejectedMutation.isPending || createVersionMutation.isPending}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Create Version 2 & Revise
          </Button>
          <Button
            variant="destructive"
            onClick={handleMarkAsLost}
            disabled={!lossReasonId || markRejectedMutation.isPending}
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Mark as Lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

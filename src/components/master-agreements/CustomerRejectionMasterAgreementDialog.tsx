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
import { XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CustomerRejectionMasterAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  agreementNumber: string;
}

export const CustomerRejectionMasterAgreementDialog: React.FC<CustomerRejectionMasterAgreementDialogProps> = ({
  open,
  onOpenChange,
  agreementId,
  agreementNumber,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for the rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Update agreement to customer_rejected status
      const { error: updateError } = await supabase
        .from('corporate_leasing_agreements')
        .update({
          customer_acceptance_status: 'rejected',
          customer_rejection_reason: rejectionReason.trim(),
          customer_comments: additionalNotes.trim() || null,
          status: 'customer_rejected',
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['master-agreement', agreementId] });
      queryClient.invalidateQueries({ queryKey: ['master-agreements:list'] });

      toast({
        title: 'Customer Rejection Recorded',
        description: `Master agreement ${agreementNumber} has been marked as rejected.`,
      });

      onOpenChange(false);
      setRejectionReason("");
      setAdditionalNotes("");
    } catch (error: any) {
      console.error("Failed to process rejection:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record customer rejection',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Customer Rejected Master Agreement
          </DialogTitle>
          <DialogDescription>
            Record that customer has rejected master agreement {agreementNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Why did the customer reject this master agreement?"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="additional-notes"
              placeholder="Add any additional context about the rejection..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !rejectionReason.trim()}
          >
            {isSubmitting ? "Saving..." : "Mark as Rejected"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

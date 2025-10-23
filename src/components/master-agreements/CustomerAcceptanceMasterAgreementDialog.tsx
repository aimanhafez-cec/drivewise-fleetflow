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
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CustomerAcceptanceMasterAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  agreementNumber: string;
}

export const CustomerAcceptanceMasterAgreementDialog: React.FC<CustomerAcceptanceMasterAgreementDialogProps> = ({
  open,
  onOpenChange,
  agreementId,
  agreementNumber,
}) => {
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Update agreement to customer_signed status
      const { error: updateError } = await supabase
        .from('corporate_leasing_agreements')
        .update({
          customer_acceptance_status: 'accepted',
          customer_signed_at: new Date().toISOString(),
          customer_comments: additionalNotes.trim() || null,
          status: 'customer_accepted',
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['master-agreement', agreementId] });
      queryClient.invalidateQueries({ queryKey: ['master-agreements:list'] });

      toast({
        title: 'Customer Signature Recorded',
        description: `Master agreement ${agreementNumber} has been marked as signed.`,
      });

      onOpenChange(false);
      setAdditionalNotes("");
    } catch (error: any) {
      console.error("Failed to process acceptance:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record customer acceptance',
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
            <CheckCircle className="h-5 w-5 text-green-600" />
            Customer Signed Master Agreement
          </DialogTitle>
          <DialogDescription>
            Record that customer has signed master agreement {agreementNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="additional-notes">Signature Notes (Optional)</Label>
            <Textarea
              id="additional-notes"
              placeholder="Add any notes about the signing process..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Saving..." : "Mark as Signed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
import { useMarkQuoteAccepted } from "@/hooks/useQuoteActions";
import { useConvertQuoteToMasterAgreement } from "@/hooks/useConvertQuoteToMasterAgreement";
import { CheckCircle } from "lucide-react";

interface CustomerAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  quoteNumber: string;
}

export const CustomerAcceptanceDialog: React.FC<CustomerAcceptanceDialogProps> = ({
  open,
  onOpenChange,
  quoteId,
  quoteNumber,
}) => {
  const [winReason, setWinReason] = useState("");
  const [convertNow, setConvertNow] = useState(false);

  const markAcceptedMutation = useMarkQuoteAccepted();
  const convertMutation = useConvertQuoteToMasterAgreement();

  const handleSubmit = async () => {
    try {
      // First mark as accepted
      await markAcceptedMutation.mutateAsync({
        quoteId,
        winReason,
      });

      // If user wants to convert now, trigger conversion
      if (convertNow) {
        await convertMutation.mutateAsync(quoteId);
      }

      onOpenChange(false);
      setWinReason("");
      setConvertNow(false);
    } catch (error) {
      console.error("Failed to process acceptance:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Customer Accepted Quote
          </DialogTitle>
          <DialogDescription>
            Record that customer has accepted quote {quoteNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="win-reason">Win Reason *</Label>
            <Textarea
              id="win-reason"
              placeholder="Why did the customer accept this quote?"
              value={winReason}
              onChange={(e) => setWinReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="convert-now"
              checked={convertNow}
              onCheckedChange={(checked) => setConvertNow(checked as boolean)}
            />
            <Label htmlFor="convert-now" className="cursor-pointer">
              Convert to Master Agreement now
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!winReason.trim() || markAcceptedMutation.isPending || convertMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {convertMutation.isPending
              ? "Converting..."
              : markAcceptedMutation.isPending
              ? "Saving..."
              : "Mark as Accepted"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

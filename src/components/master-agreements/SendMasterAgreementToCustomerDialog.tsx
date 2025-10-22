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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSendMasterAgreementToCustomer } from "@/hooks/useMasterAgreement";

interface SendMasterAgreementToCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  agreementNumber: string;
  customerName: string;
  customerEmail: string;
}

export const SendMasterAgreementToCustomerDialog: React.FC<SendMasterAgreementToCustomerDialogProps> = ({
  open,
  onOpenChange,
  agreementId,
  agreementNumber,
  customerName,
  customerEmail,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(customerEmail);
  const [customMessage, setCustomMessage] = useState("");
  const [expirationDays, setExpirationDays] = useState("30");

  const sendMutation = useSendMasterAgreementToCustomer();

  const handleSend = () => {
    sendMutation.mutate(
      {
        agreement_id: agreementId,
        recipient_email: recipientEmail,
        custom_message: customMessage || undefined,
        expiration_days: parseInt(expirationDays),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRecipientEmail(customerEmail);
          setCustomMessage("");
          setExpirationDays("30");
        },
      }
    );
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSend = recipientEmail && isValidEmail(recipientEmail) && !sendMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Master Agreement to Customer
          </DialogTitle>
          <DialogDescription>
            The customer will receive a secure link to review and digitally sign the master agreement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Agreement Info */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Agreement Number:</span>
              <span className="font-medium">{agreementNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{customerName}</span>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Customer Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={!isValidEmail(recipientEmail) && recipientEmail ? "border-destructive" : ""}
            />
            {!isValidEmail(recipientEmail) && recipientEmail && (
              <p className="text-sm text-destructive">Please enter a valid email address</p>
            )}
          </div>

          {/* Demo Tip */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Demo Tip:</strong> For demo purposes, you can replace the customer email with your own to see what they receive.
            </AlertDescription>
          </Alert>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the email..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will appear in the email sent to the customer.
            </p>
          </div>

          {/* Link Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiration" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Link Expiration
            </Label>
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger id="expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The secure link will expire after this period.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sendMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="min-w-[120px]"
          >
            {sendMutation.isPending ? "Sending..." : "Send Master Agreement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

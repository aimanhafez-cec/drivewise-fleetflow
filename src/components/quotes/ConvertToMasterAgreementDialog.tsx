import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConvertQuoteToMasterAgreement } from "@/hooks/useConvertQuoteToMasterAgreement";
import { FileText, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Link } from "react-router-dom";

interface ConvertToMasterAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
}

export const ConvertToMasterAgreementDialog: React.FC<ConvertToMasterAgreementDialogProps> = ({
  open,
  onOpenChange,
  quote,
}) => {
  const convertMutation = useConvertQuoteToMasterAgreement();

  // Validation checks
  const hasCustomer = !!quote?.customer_id;
  const hasVehicles = quote?.quote_items && quote.quote_items.length > 0;
  const isAccepted = quote?.status === "accepted";
  const isAlreadyConverted = quote?.converted_to_agreement === true;

  const canConvert = hasCustomer && hasVehicles && isAccepted && !isAlreadyConverted;

  const handleConvert = async () => {
    if (!canConvert) return;

    try {
      await convertMutation.mutateAsync(quote.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to convert:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Convert to Master Agreement
          </DialogTitle>
          <DialogDescription>
            This will create a Corporate Leasing Agreement from quote {quote?.quote_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Already Converted Warning */}
          {isAlreadyConverted && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  This quote has already been converted to agreement <strong>{quote.agreement_no}</strong>
                </span>
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0 text-destructive-foreground"
                >
                  <Link to={`/corporate-leasing/${quote.agreement_id}`}>
                    View Agreement <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Pre-check validations */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Pre-Conversion Checks</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {hasCustomer ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">Customer information available</span>
              </div>
              <div className="flex items-center gap-2">
                {hasVehicles ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">At least one vehicle in quote</span>
              </div>
              <div className="flex items-center gap-2">
                {isAccepted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">Quote status is accepted</span>
              </div>
              <div className="flex items-center gap-2">
                {!isAlreadyConverted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">Quote not already converted</span>
              </div>
            </div>
          </div>

          {!canConvert && !isAlreadyConverted && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cannot convert: Please ensure quote is accepted and has all required information.
              </AlertDescription>
            </Alert>
          )}

          {/* Quote Summary */}
          {canConvert && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Quote Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Quote Number:</span>
                  <p className="font-medium">{quote.quote_number}</p>
                </div>
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium">{quote.customer?.full_name || "N/A"}</p>
              </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">{quote.duration_days || "N/A"} days</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Vehicles:</span>
                  <p className="font-medium">{quote.quote_items?.length || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-medium">{formatCurrency(quote.total_amount || 0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={!canConvert || convertMutation.isPending}
          >
            {convertMutation.isPending ? "Converting..." : "Convert to Master Agreement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentReceipt } from './PaymentReceipt';
import type { SplitPaymentItem } from '@/lib/api/agreement-payments';

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementNo: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number;
  splitPayments: SplitPaymentItem[];
  securityDepositHeld?: number;
  securityDepositRefund?: number;
  chargesBreakdown?: {
    label: string;
    amount: number;
  }[];
  completedAt: string;
}

/**
 * Dialog wrapper for PaymentReceipt component
 * Shows payment receipt in a modal dialog
 */
export const PaymentReceiptDialog: React.FC<PaymentReceiptDialogProps> = ({
  open,
  onOpenChange,
  ...receiptProps
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
          <DialogDescription>
            Transaction completed successfully. You can print, download, or share this receipt.
          </DialogDescription>
        </DialogHeader>
        <PaymentReceipt {...receiptProps} />
      </DialogContent>
    </Dialog>
  );
};

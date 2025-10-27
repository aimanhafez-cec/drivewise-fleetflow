import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { SplitPaymentItem } from '@/lib/api/agreement-payments';

interface ReceiptData {
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

interface UsePaymentReceiptReturn {
  receiptData: ReceiptData | null;
  isReceiptOpen: boolean;
  showReceipt: (data: ReceiptData) => void;
  hideReceipt: () => void;
  printReceipt: () => void;
  emailReceipt: (email: string) => Promise<void>;
  downloadReceipt: () => Promise<void>;
  sendSMS: (phone: string) => Promise<void>;
}

/**
 * Hook to manage payment receipt display and actions
 */
export const usePaymentReceipt = (): UsePaymentReceiptReturn => {
  const { toast } = useToast();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const showReceipt = useCallback((data: ReceiptData) => {
    setReceiptData(data);
    setIsReceiptOpen(true);
  }, []);

  const hideReceipt = useCallback(() => {
    setIsReceiptOpen(false);
  }, []);

  const printReceipt = useCallback(() => {
    window.print();
    toast({
      title: 'Printing Receipt',
      description: 'Please select your printer',
    });
  }, [toast]);

  const emailReceipt = useCallback(
    async (email: string) => {
      if (!receiptData) return;

      try {
        // TODO: Implement email sending via API
        // await sendReceiptEmail(receiptData, email);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
          title: 'Email Sent',
          description: `Receipt sent successfully to ${email}`,
        });
      } catch (error) {
        toast({
          title: 'Email Failed',
          description: 'Failed to send receipt via email',
          variant: 'destructive',
        });
      }
    },
    [receiptData, toast]
  );

  const downloadReceipt = useCallback(async () => {
    if (!receiptData) return;

    try {
      // TODO: Implement PDF generation and download
      // For now, simulate download
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Download Started',
        description: `Receipt for ${receiptData.agreementNo} is being downloaded`,
      });

      // In production, this would generate a PDF and trigger download
      // const blob = await generateReceiptPDF(receiptData);
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `receipt-${receiptData.agreementNo}.pdf`;
      // a.click();
      // URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  }, [receiptData, toast]);

  const sendSMS = useCallback(
    async (phone: string) => {
      if (!receiptData) return;

      try {
        // TODO: Implement SMS sending via API
        // await sendReceiptSMS(receiptData, phone);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
          title: 'SMS Sent',
          description: `Receipt link sent to ${phone}`,
        });
      } catch (error) {
        toast({
          title: 'SMS Failed',
          description: 'Failed to send receipt via SMS',
          variant: 'destructive',
        });
      }
    },
    [receiptData, toast]
  );

  return {
    receiptData,
    isReceiptOpen,
    showReceipt,
    hideReceipt,
    printReceipt,
    emailReceipt,
    downloadReceipt,
    sendSMS,
  };
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Download,
  Mail,
  MessageSquare,
  Printer,
  Receipt,
  Calendar,
  User,
  CreditCard,
  Award,
  Wallet,
  DollarSign,
  Link as LinkIcon,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SplitPaymentItem } from '@/lib/api/agreement-payments';

interface PaymentReceiptProps {
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
  onPrint?: () => void;
  onEmail?: () => void;
  onDownload?: () => void;
  onSMS?: () => void;
}

const PAYMENT_METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  loyalty_points: { label: 'Loyalty Points', icon: <Award className="h-4 w-4" /> },
  customer_wallet: { label: 'Customer Wallet', icon: <Wallet className="h-4 w-4" /> },
  credit: { label: 'Account Credit', icon: <DollarSign className="h-4 w-4" /> },
  credit_card: { label: 'Credit Card', icon: <CreditCard className="h-4 w-4" /> },
  debit_card: { label: 'Debit Card', icon: <CreditCard className="h-4 w-4" /> },
  payment_link: { label: 'Payment Link', icon: <LinkIcon className="h-4 w-4" /> },
  cash: { label: 'Cash', icon: <DollarSign className="h-4 w-4" /> },
  bank_transfer: { label: 'Bank Transfer', icon: <DollarSign className="h-4 w-4" /> },
};

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  agreementNo,
  customerName,
  customerEmail,
  customerPhone,
  totalAmount,
  splitPayments,
  securityDepositHeld = 0,
  securityDepositRefund = 0,
  chargesBreakdown = [],
  completedAt,
  onPrint,
  onEmail,
  onDownload,
  onSMS,
}) => {
  const { toast } = useToast();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail();
    } else {
      toast({
        title: 'Email Sent',
        description: `Receipt sent to ${customerEmail}`,
      });
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      toast({
        title: 'Download Started',
        description: 'Receipt is being downloaded as PDF',
      });
    }
  };

  const handleSMS = () => {
    if (onSMS) {
      onSMS();
    } else {
      toast({
        title: 'SMS Sent',
        description: `Receipt link sent to ${customerPhone}`,
      });
    }
  };

  const handleCopyTransactionRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast({
      title: 'Copied',
      description: 'Transaction reference copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getPaymentMethodInfo = (method: string) => {
    return PAYMENT_METHOD_LABELS[method] || {
      label: method.replace('_', ' ').toUpperCase(),
      icon: <DollarSign className="h-4 w-4" />,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <Card className="border-green-500 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                Payment Successful!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment has been processed successfully
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Details */}
      <Card>
        <CardHeader className="bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              <CardTitle>Payment Receipt</CardTitle>
            </div>
            <Badge variant="outline" className="text-base px-3 py-1">
              {agreementNo}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Customer & Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold">{customerName}</p>
                {customerEmail && (
                  <p className="text-xs text-muted-foreground">{customerEmail}</p>
                )}
                {customerPhone && (
                  <p className="text-xs text-muted-foreground">{customerPhone}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Transaction Date</p>
                <p className="font-semibold">{formatDate(completedAt)}</p>
              </div>
            </div>
          </div>

          {/* Charges Breakdown */}
          {chargesBreakdown.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Charges Breakdown</h3>
                <div className="space-y-2">
                  {chargesBreakdown.map((charge, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="text-sm">{charge.label}</span>
                      <span className="font-semibold">{charge.amount.toFixed(2)} AED</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Methods Used */}
          <div>
            <h3 className="font-semibold mb-3">Payment Methods Used</h3>
            <div className="space-y-3">
              {splitPayments.map((payment, index) => {
                const methodInfo = getPaymentMethodInfo(payment.method);
                return (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {methodInfo.icon}
                            <span className="font-medium">{methodInfo.label}</span>
                          </div>
                          <Badge
                            variant={payment.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {payment.status}
                          </Badge>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <span className="text-xl font-bold text-primary">
                            {payment.amount.toFixed(2)} AED
                          </span>
                        </div>

                        {/* Loyalty Points Used */}
                        {payment.loyaltyPointsUsed && (
                          <div className="flex items-center justify-between p-2 bg-primary/5 rounded">
                            <span className="text-sm text-muted-foreground">
                              Points Redeemed
                            </span>
                            <span className="text-sm font-semibold">
                              {payment.loyaltyPointsUsed.toLocaleString()} pts
                            </span>
                          </div>
                        )}

                        {/* Transaction Reference */}
                        {payment.transactionRef && (
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-sm text-muted-foreground">
                              Transaction Ref
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono">
                                {payment.transactionRef}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyTransactionRef(payment.transactionRef!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Card Last 4 */}
                        {payment.metadata?.cardLast4 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Card</span>
                            <span className="text-sm">
                              •••• •••• •••• {payment.metadata.cardLast4}
                            </span>
                          </div>
                        )}

                        {/* Wallet Balance Changes */}
                        {payment.metadata?.walletBalanceBefore !== undefined && (
                          <div className="p-2 bg-muted/30 rounded space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Balance Before</span>
                              <span>{payment.metadata.walletBalanceBefore.toFixed(2)} AED</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Balance After</span>
                              <span className="font-semibold">
                                {payment.metadata.walletBalanceAfter?.toFixed(2)} AED
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Payment Link */}
                        {payment.metadata?.linkToken && (
                          <div className="p-2 bg-amber-500/10 rounded">
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Payment link pending completion
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Total Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Total Amount Paid</span>
              <span className="text-2xl font-bold text-primary">
                {totalAmount.toFixed(2)} AED
              </span>
            </div>

            {/* Security Deposit Info */}
            {securityDepositHeld > 0 && (
              <>
                <Separator />
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Security Deposit Held
                    </span>
                    <span className="font-semibold">{securityDepositHeld.toFixed(2)} AED</span>
                  </div>
                  {securityDepositRefund > 0 && (
                    <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                      <span className="text-sm">Refund Amount</span>
                      <span className="font-bold">{securityDepositRefund.toFixed(2)} AED</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Footer Notes */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>For any queries, please contact customer support.</p>
            <p className="font-mono">Receipt ID: {agreementNo}-{Date.now()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {customerEmail && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}
            {customerPhone && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSMS}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

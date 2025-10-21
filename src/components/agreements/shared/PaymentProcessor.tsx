import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Wallet, Building, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/lib/api/agreement-payments';

interface PaymentProcessorProps {
  amount: number;
  depositAmount?: number;
  onPaymentComplete: (transactionRef: string, method: PaymentMethod) => void;
  onDepositAuthorize?: (authorizationRef: string) => void;
  disabled?: boolean;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: any }[] = [
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: Wallet },
];

export const PaymentProcessor = ({
  amount,
  depositAmount,
  onPaymentComplete,
  onDepositAuthorize,
  disabled = false,
}: PaymentProcessorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateCardDetails = () => {
    if (selectedMethod !== 'credit_card' && selectedMethod !== 'debit_card') {
      return true;
    }

    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }

    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    if (!cardCvv.match(/^\d{3,4}$/)) {
      toast.error('Please enter a valid CVV');
      return false;
    }

    if (!cardName.trim()) {
      toast.error('Please enter cardholder name');
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateCardDetails()) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would integrate with a real payment gateway
      const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      onPaymentComplete(transactionRef, selectedMethod);
      
      setIsSuccess(true);
      toast.success('Payment processed successfully');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const authorizeDeposit = async () => {
    if (!validateCardDetails()) return;

    setIsProcessing(true);

    try {
      // Simulate authorization
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, this would authorize the hold amount
      const authorizationRef = `AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (onDepositAuthorize) {
        onDepositAuthorize(authorizationRef);
      }
      
      toast.success('Security deposit authorized');
    } catch (error) {
      toast.error('Authorization failed. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful</h3>
            <p className="text-muted-foreground">
              Your payment of AED {amount.toFixed(2)} has been processed successfully.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment to proceed with the agreement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Amount</span>
            <span className="font-medium">AED {amount.toFixed(2)}</span>
          </div>
          {depositAmount && depositAmount > 0 && (
            <>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Security Deposit (Hold)</span>
                <span className="font-medium">AED {depositAmount.toFixed(2)}</span>
              </div>
            </>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total to Process</span>
            <span>AED {(amount + (depositAmount || 0)).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as PaymentMethod)}>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.value}
                  className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label
                    htmlFor={method.value}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{method.label}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Card Details Form */}
        {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    if (formatted.replace(/\s/g, '').length <= 16) {
                      setCardNumber(formatted);
                    }
                  }}
                  maxLength={19}
                  disabled={disabled || isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry">Expiry Date</Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => {
                      const formatted = formatExpiry(e.target.value);
                      if (formatted.length <= 5) {
                        setCardExpiry(formatted);
                      }
                    }}
                    maxLength={5}
                    disabled={disabled || isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    placeholder="123"
                    type="password"
                    value={cardCvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCardCvv(value);
                      }
                    }}
                    maxLength={4}
                    disabled={disabled || isProcessing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="Name as shown on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  disabled={disabled || isProcessing}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cash Payment Instructions */}
        {selectedMethod === 'cash' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <strong>Cash Payment:</strong> Please provide cash payment at the branch. Our staff will issue a receipt upon payment.
            </p>
          </div>
        )}

        {/* Bank Transfer Instructions */}
        {selectedMethod === 'bank_transfer' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
            <p className="text-sm text-blue-700">
              <strong>Bank Transfer Details:</strong>
            </p>
            <div className="text-xs space-y-1 text-blue-600">
              <p>Bank: Emirates NBD</p>
              <p>Account Name: Rental Company LLC</p>
              <p>Account Number: 1234567890</p>
              <p>IBAN: AE070331234567890123456</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={processPayment}
            disabled={disabled || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay AED {amount.toFixed(2)}
              </>
            )}
          </Button>

          {depositAmount && depositAmount > 0 && onDepositAuthorize && (
            <Button
              variant="outline"
              onClick={authorizeDeposit}
              disabled={disabled || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Authorizing...
                </>
              ) : (
                `Authorize Deposit (AED ${depositAmount.toFixed(2)})`
              )}
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <p className="text-xs text-muted-foreground text-center">
          🔒 Your payment information is secure and encrypted. We do not store your card details.
        </p>
      </CardContent>
    </Card>
  );
};

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, Building2, Wallet, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DownPaymentFormProps {
  amount: number;
  onPaymentComplete: (transactionId: string) => void;
}

const DownPaymentForm = ({ amount, onPaymentComplete }: DownPaymentFormProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleSubmitPayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      toast({
        title: "Payment Successful",
        description: `Down payment of AED ${amount.toFixed(2)} has been processed.`,
      });
      
      onPaymentComplete(transactionId);
      setProcessing(false);
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'card',
      icon: CreditCard,
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
    },
    {
      id: 'bank_transfer',
      icon: Building2,
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
    },
    {
      id: 'cash',
      icon: Wallet,
      name: 'Cash',
      description: 'Pay at branch',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Down Payment</h2>
        <p className="text-muted-foreground">
          Secure your booking with a down payment
        </p>
      </div>

      {/* Amount Display */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Amount Due Now</p>
          <p className="text-4xl font-bold text-primary">AED {amount.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            const isSelected = paymentMethod === method.id;
            
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
                }`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-3 rounded-lg ${
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="card-number">Card Number *</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                className="mt-1"
                maxLength={19}
              />
            </div>

            <div>
              <Label htmlFor="card-name">Cardholder Name *</Label>
              <Input
                id="card-name"
                placeholder="Name on card"
                value={cardDetails.cardName}
                onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date *</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                  className="mt-1"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className="mt-1"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitPayment}
                disabled={processing || !cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay AED ${amount.toFixed(2)}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer Instructions */}
      {paymentMethod === 'bank_transfer' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Bank Transfer Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-medium">Emirates NBD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-medium">AutoStrad Car Rental LLC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-medium">1234567890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBAN:</span>
                <span className="font-medium">AE070331234567890123456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SWIFT Code:</span>
                <span className="font-medium">EBILAEAD</span>
              </div>
            </div>
            
            <div className="pt-4">
              <Label htmlFor="reference">Transfer Reference Number *</Label>
              <Input
                id="reference"
                placeholder="Enter bank transfer reference"
                className="mt-1"
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmitPayment}
              disabled={processing}
            >
              Confirm Transfer & Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cash Payment Notice */}
      {paymentMethod === 'cash' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Cash Payment</h3>
            <p className="text-sm text-muted-foreground">
              Please visit our branch to complete the cash payment. A booking reference will be generated, and the booking will be confirmed once payment is received.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> The vehicle will be reserved for 24 hours. Please complete payment within this time to confirm your booking.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmitPayment}
              disabled={processing}
            >
              Generate Booking Reference
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Your payment information is encrypted and secure. We use industry-standard SSL encryption.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownPaymentForm;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';

interface DemoPaymentProps {
  amount: number;
  agreementNo: string;
  onPaymentComplete: () => void;
}

const DemoPayment: React.FC<DemoPaymentProps> = ({ 
  amount, 
  agreementNo, 
  onPaymentComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleDemoPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setPaymentCompleted(true);
    
    // Complete the flow after showing success
    setTimeout(() => {
      onPaymentComplete();
    }, 2000);
  };

  if (paymentCompleted) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">
            Payment Successful!
          </h3>
          <p className="text-black mb-4">
            Agreement {agreementNo} has been created and payment processed.
          </p>
          <Badge variant="default" className="bg-green-100 text-green-800">
            AED {amount.toFixed(2)} Paid
          </Badge>
          <p className="text-sm text-black mt-4">
            Redirecting to agreement details...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CreditCard className="h-5 w-5" />
          Demo Payment Processing
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Agreement Summary */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-black">Agreement Number:</span>
            <Badge variant="outline">{agreementNo}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-black">Total Amount:</span>
            <span className="text-xl font-bold text-black">AED {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Demo Payment Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-black">Demo Credit Card</h4>
              <p className="text-sm text-black">**** **** **** 1234</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-black">Cardholder</p>
              <p className="font-medium text-black">Demo User</p>
            </div>
            <div>
              <p className="text-black">Expiry</p>
              <p className="font-medium text-black">12/25</p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="flex items-center gap-4 text-sm text-black">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure Demo Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Instant Processing</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleDemoPayment}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-semibold"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay AED ${amount.toFixed(2)} - Demo Mode`
          )}
        </Button>

        <p className="text-center text-xs text-black">
          This is a demo payment. No real transaction will be processed.
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoPayment;
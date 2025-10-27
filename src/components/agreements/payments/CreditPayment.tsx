import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreditPaymentProps {
  amount: number;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  onAmountChange: (amount: number) => void;
  onProcessCredit: (amount: number) => void;
  disabled?: boolean;
}

export const CreditPayment: React.FC<CreditPaymentProps> = ({
  amount,
  creditLimit,
  creditUsed,
  creditAvailable,
  onAmountChange,
  onProcessCredit,
  disabled = false,
}) => {
  const [selectedAmount, setSelectedAmount] = useState(amount);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditUtilization = (creditUsed / creditLimit) * 100;
  const newCreditUsed = creditUsed + selectedAmount;
  const newUtilization = (newCreditUsed / creditLimit) * 100;

  const handleAmountChange = (value: number) => {
    setSelectedAmount(value);
    onAmountChange(value);
    
    if (value > creditAvailable) {
      setError('Amount exceeds available credit limit');
    } else if (value <= 0) {
      setError('Amount must be greater than 0');
    } else {
      setError(null);
    }
  };

  const handleUseMax = () => {
    const maxAmount = Math.min(creditAvailable, amount);
    handleAmountChange(maxAmount);
  };

  const handleProcess = () => {
    if (!termsAccepted) {
      setError('Please accept the credit terms');
      return;
    }
    if (selectedAmount > creditAvailable) {
      setError('Amount exceeds available credit');
      return;
    }
    onProcessCredit(selectedAmount);
  };

  const canProcess = termsAccepted && selectedAmount > 0 && selectedAmount <= creditAvailable && !error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Account Credit Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credit Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Credit Limit</p>
            <p className="text-lg font-semibold">{creditLimit.toFixed(2)} AED</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Credit</p>
            <p className="text-lg font-semibold text-primary">{creditAvailable.toFixed(2)} AED</p>
          </div>
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Credit Utilization</p>
              <p className="text-sm font-medium">{creditUtilization.toFixed(1)}%</p>
            </div>
            <Progress value={creditUtilization} className="h-2" />
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="credit-amount">Credit Amount (AED)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="credit-amount"
              type="number"
              value={selectedAmount}
              onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
              min={0}
              max={creditAvailable}
              step={0.01}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseMax}
              disabled={disabled}
            >
              Use Max
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum available: {creditAvailable.toFixed(2)} AED
          </p>
        </div>

        {/* New Utilization Preview */}
        {selectedAmount > 0 && (
          <div className="p-4 bg-primary/5 rounded-lg space-y-3">
            <p className="text-sm font-medium">After This Transaction</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Credit Used</p>
                <p className="font-semibold">{newCreditUsed.toFixed(2)} AED</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining Credit</p>
                <p className="font-semibold">{(creditLimit - newCreditUsed).toFixed(2)} AED</p>
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground">New Utilization</p>
                  <p className="font-medium">{newUtilization.toFixed(1)}%</p>
                </div>
                <Progress 
                  value={newUtilization} 
                  className={`h-2 ${newUtilization > 80 ? 'bg-orange-200' : ''}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Credit Terms */}
        <div className="space-y-3 p-4 border rounded-lg">
          <p className="text-sm font-medium">Credit Terms & Conditions</p>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
            <li>Credit charges will be added to your account balance</li>
            <li>Payment is due within 30 days from the statement date</li>
            <li>Late payment fees may apply (3% per month on overdue balance)</li>
            <li>Your credit limit may be reviewed based on payment history</li>
            <li>All credit transactions are subject to approval</li>
          </ul>
          
          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="credit-terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              disabled={disabled}
            />
            <Label 
              htmlFor="credit-terms" 
              className="text-sm font-normal cursor-pointer leading-tight"
            >
              I understand and accept the credit terms and conditions
            </Label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Indicator */}
        {canProcess && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Ready to process {selectedAmount.toFixed(2)} AED using account credit
            </AlertDescription>
          </Alert>
        )}

        {/* Process Button */}
        <Button
          onClick={handleProcess}
          disabled={disabled || !canProcess}
          className="w-full"
          size="lg"
        >
          Apply Credit Payment ({selectedAmount.toFixed(2)} AED)
        </Button>
      </CardContent>
    </Card>
  );
};

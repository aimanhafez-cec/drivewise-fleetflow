import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Wallet, AlertCircle, CheckCircle2, TrendingUp, History } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface WalletTransaction {
  id: string;
  date: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
}

interface CustomerWalletPaymentProps {
  amount: number;
  walletBalance: number;
  onAmountChange: (amount: number) => void;
  onProcessWallet: (amount: number) => void;
  disabled?: boolean;
  recentTransactions?: WalletTransaction[];
}

export const CustomerWalletPayment: React.FC<CustomerWalletPaymentProps> = ({
  amount,
  walletBalance,
  onAmountChange,
  onProcessWallet,
  disabled = false,
  recentTransactions = [],
}) => {
  const [selectedAmount, setSelectedAmount] = useState(Math.min(amount, walletBalance));
  const [error, setError] = useState<string | null>(null);

  const remainingBalance = walletBalance - selectedAmount;
  const percentageUsed = (selectedAmount / walletBalance) * 100;

  const handleAmountChange = (value: number) => {
    setSelectedAmount(value);
    onAmountChange(value);
    
    if (value > walletBalance) {
      setError('Amount exceeds wallet balance');
    } else if (value <= 0) {
      setError('Amount must be greater than 0');
    } else {
      setError(null);
    }
  };

  const handleUseMax = () => {
    const maxAmount = Math.min(walletBalance, amount);
    handleAmountChange(maxAmount);
  };

  const handleSliderChange = (values: number[]) => {
    handleAmountChange(values[0]);
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (walletBalance * percentage) / 100;
    const actualAmount = Math.min(quickAmount, amount);
    handleAmountChange(actualAmount);
  };

  const handleProcess = () => {
    if (selectedAmount > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }
    onProcessWallet(selectedAmount);
  };

  const canProcess = selectedAmount > 0 && selectedAmount <= walletBalance && !error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Customer Wallet Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Balance Display */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Active
            </Badge>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {walletBalance.toFixed(2)} <span className="text-lg">AED</span>
          </p>
        </div>

        {/* Amount Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="wallet-amount">Amount to Use (AED)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="wallet-amount"
                type="number"
                value={selectedAmount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                min={0}
                max={walletBalance}
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
                Max
              </Button>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Use Slider</Label>
              <span className="text-sm font-medium">{percentageUsed.toFixed(0)}%</span>
            </div>
            <Slider
              value={[selectedAmount]}
              onValueChange={handleSliderChange}
              max={Math.min(walletBalance, amount)}
              min={0}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0 AED</span>
              <span>{Math.min(walletBalance, amount).toFixed(2)} AED</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAmount(percentage)}
                disabled={disabled}
              >
                {percentage}%
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Balance After Payment Preview */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <p className="text-sm font-medium">After This Payment</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Amount Deducted</p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                -{selectedAmount.toFixed(2)} AED
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining Balance</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {remainingBalance.toFixed(2)} AED
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <Label>Recent Transactions</Label>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type === 'credit'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {transaction.amount.toFixed(2)} AED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
              Ready to deduct {selectedAmount.toFixed(2)} AED from wallet
            </AlertDescription>
          </Alert>
        )}

        {/* Warning for Insufficient Balance */}
        {walletBalance < amount && selectedAmount === walletBalance && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Wallet balance ({walletBalance.toFixed(2)} AED) is less than the required amount ({amount.toFixed(2)} AED). 
              You'll need to add another payment method for the remaining {(amount - walletBalance).toFixed(2)} AED.
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
          Use Wallet Balance ({selectedAmount.toFixed(2)} AED)
        </Button>
      </CardContent>
    </Card>
  );
};

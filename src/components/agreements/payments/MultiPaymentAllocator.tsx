import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Wallet, 
  Award 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validatePaymentAllocation, formatValidationErrors } from '@/lib/api/payment-validation';
import type { 
  PaymentAllocation, 
  SplitPaymentItem, 
  CustomerPaymentProfile,
  PaymentMethod 
} from '@/lib/api/agreement-payments';

interface MultiPaymentAllocatorProps {
  totalAmount: number;
  customerProfile: CustomerPaymentProfile | null;
  allocation: PaymentAllocation;
  onAllocationChange: (allocation: PaymentAllocation) => void;
  onPaymentComplete: (payments: SplitPaymentItem[]) => void;
  disabled?: boolean;
}

const LOYALTY_POINTS_CONVERSION_RATE = 100; // 100 points = 1 AED
const MIN_LOYALTY_POINTS = 1000; // Minimum 1000 points to redeem

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { value: 'loyalty_points', label: 'Loyalty Points', icon: <Award className="h-4 w-4" /> },
  { value: 'customer_wallet', label: 'Customer Wallet', icon: <Wallet className="h-4 w-4" /> },
  { value: 'credit', label: 'Account Credit', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'credit_card', label: 'Credit Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'debit_card', label: 'Debit Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'payment_link', label: 'Payment Link', icon: <LinkIcon className="h-4 w-4" /> },
  { value: 'cash', label: 'Cash', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: <DollarSign className="h-4 w-4" /> },
];

export const MultiPaymentAllocator: React.FC<MultiPaymentAllocatorProps> = ({
  totalAmount,
  customerProfile,
  allocation,
  onAllocationChange,
  onPaymentComplete,
  disabled = false,
}) => {
  const [payments, setPayments] = useState<SplitPaymentItem[]>(allocation.payments);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate allocated and remaining amounts
  const allocatedAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - allocatedAmount;

  // Update parent when payments change
  useEffect(() => {
    const newAllocation: PaymentAllocation = {
      totalAmount,
      allocatedAmount,
      remainingAmount,
      payments,
    };
    onAllocationChange(newAllocation);
    
    // Validate using comprehensive validator
    const validationResult = validatePaymentAllocation(newAllocation, customerProfile || undefined);
    setErrors(validationResult.errors);
  }, [payments, totalAmount, allocatedAmount, remainingAmount, onAllocationChange, customerProfile]);

  const validateAllocation = (currentPayments: SplitPaymentItem[]) => {
    // Validation is now handled by useEffect with comprehensive validator
    // This function is kept for backward compatibility
  };

  const addPaymentMethod = () => {
    const newPayment: SplitPaymentItem = {
      method: 'credit_card',
      amount: Math.max(0, remainingAmount),
      status: 'pending',
    };
    setPayments([...payments, newPayment]);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, updates: Partial<SplitPaymentItem>) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], ...updates };
    setPayments(newPayments);
  };

  const updatePaymentAmount = (index: number, amount: number) => {
    const payment = payments[index];
    
    if (payment.method === 'loyalty_points') {
      const points = amount * LOYALTY_POINTS_CONVERSION_RATE;
      updatePayment(index, { 
        amount, 
        loyaltyPointsUsed: points,
        pointsValue: amount 
      });
    } else {
      updatePayment(index, { amount });
    }
  };

  const updateLoyaltyPoints = (index: number, points: number) => {
    const aedValue = points / LOYALTY_POINTS_CONVERSION_RATE;
    updatePayment(index, { 
      loyaltyPointsUsed: points,
      pointsValue: aedValue,
      amount: aedValue 
    });
  };

  const getMaxAmount = (method: PaymentMethod): number => {
    const remaining = remainingAmount;
    
    switch (method) {
      case 'loyalty_points':
        if (!customerProfile) return 0;
        const maxPoints = customerProfile.loyaltyPoints;
        return Math.min(maxPoints / LOYALTY_POINTS_CONVERSION_RATE, remaining);
      
      case 'customer_wallet':
        if (!customerProfile) return 0;
        return Math.min(customerProfile.walletBalance, remaining);
      
      case 'credit':
        if (!customerProfile) return 0;
        return Math.min(customerProfile.creditAvailable, remaining);
      
      default:
        return remaining;
    }
  };

  const handleProcessPayment = () => {
    if (errors.length > 0) return;
    if (remainingAmount > 0.01) {
      setErrors(['Please allocate the full amount before processing']);
      return;
    }
    
    onPaymentComplete(payments.map(p => ({ ...p, status: 'completed' })));
  };

  const getMethodIcon = (method: PaymentMethod) => {
    return paymentMethodOptions.find(opt => opt.value === method)?.icon || <DollarSign className="h-4 w-4" />;
  };

  const isAllocationComplete = Math.abs(remainingAmount) < 0.01 && errors.length === 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Amount Due</p>
              <p className="text-2xl font-bold text-foreground">
                {totalAmount.toFixed(2)} <span className="text-lg">AED</span>
              </p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Allocated</p>
              <p className="text-2xl font-bold text-primary">
                {allocatedAmount.toFixed(2)} <span className="text-lg">AED</span>
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              remainingAmount > 0.01 ? 'bg-orange-500/10' : 'bg-green-500/10'
            }`}>
              <p className="text-sm text-muted-foreground mb-1">Remaining</p>
              <p className={`text-2xl font-bold ${
                remainingAmount > 0.01 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {remainingAmount.toFixed(2)} <span className="text-lg">AED</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Profile Summary */}
      {customerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Wallet className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-lg font-semibold">{customerProfile.walletBalance.toFixed(2)} AED</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Award className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-lg font-semibold">{customerProfile.loyaltyPoints.toLocaleString()} pts</p>
                  <p className="text-xs text-muted-foreground">
                    ≈ {(customerProfile.loyaltyPoints / LOYALTY_POINTS_CONVERSION_RATE).toFixed(2)} AED
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Credit</p>
                  <p className="text-lg font-semibold">{customerProfile.creditAvailable.toFixed(2)} AED</p>
                  <p className="text-xs text-muted-foreground">
                    Limit: {customerProfile.creditLimit.toFixed(2)} AED
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Allocate amounts across one or more payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.map((payment, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Method Selection and Remove Button */}
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-2 py-1">
                      #{index + 1}
                    </Badge>
                    <Select
                      value={payment.method}
                      onValueChange={(value: PaymentMethod) => {
                        updatePayment(index, { method: value, amount: 0, loyaltyPointsUsed: 0 });
                      }}
                      disabled={disabled}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePayment(index)}
                      disabled={disabled || payments.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Loyalty Points Slider */}
                  {payment.method === 'loyalty_points' && customerProfile && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Points to Redeem</Label>
                        <span className="text-sm font-medium">
                          {payment.loyaltyPointsUsed?.toLocaleString() || 0} pts
                        </span>
                      </div>
                      <Slider
                        value={[payment.loyaltyPointsUsed || 0]}
                        onValueChange={([value]) => updateLoyaltyPoints(index, value)}
                        max={Math.min(
                          customerProfile.loyaltyPoints,
                          remainingAmount * LOYALTY_POINTS_CONVERSION_RATE + (payment.loyaltyPointsUsed || 0)
                        )}
                        min={0}
                        step={100}
                        disabled={disabled}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>0 pts</span>
                        <span>{customerProfile.loyaltyPoints.toLocaleString()} pts available</span>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm font-medium">
                          AED Value: {payment.amount.toFixed(2)} AED
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Conversion: 100 points = 1 AED
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Amount Input for other methods */}
                  {payment.method !== 'loyalty_points' && (
                    <div className="space-y-3">
                      <Label>Amount (AED)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => updatePaymentAmount(index, parseFloat(e.target.value) || 0)}
                          min={0}
                          max={getMaxAmount(payment.method)}
                          step={0.01}
                          disabled={disabled}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePaymentAmount(index, getMaxAmount(payment.method))}
                          disabled={disabled}
                        >
                          Max
                        </Button>
                      </div>
                      {payment.method === 'customer_wallet' && customerProfile && (
                        <p className="text-xs text-muted-foreground">
                          Max: {Math.min(customerProfile.walletBalance, remainingAmount + payment.amount).toFixed(2)} AED
                        </p>
                      )}
                      {payment.method === 'credit' && customerProfile && (
                        <p className="text-xs text-muted-foreground">
                          Max: {Math.min(customerProfile.creditAvailable, remainingAmount + payment.amount).toFixed(2)} AED
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.method)}
                    <span className="text-sm font-medium">
                      {paymentMethodOptions.find(opt => opt.value === payment.method)?.label}
                    </span>
                    <Badge variant={payment.amount > 0 ? 'default' : 'secondary'} className="ml-auto">
                      {payment.amount.toFixed(2)} AED
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Payment Method Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={addPaymentMethod}
            disabled={disabled || remainingAmount < 0.01}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isAllocationComplete && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Payment allocation complete. Ready to process.
          </AlertDescription>
        </Alert>
      )}

      {/* Process Payment Button */}
      <Button
        onClick={handleProcessPayment}
        disabled={disabled || !isAllocationComplete}
        className="w-full"
        size="lg"
      >
        Process Payment {isAllocationComplete && `(${allocatedAmount.toFixed(2)} AED)`}
      </Button>
    </div>
  );
};

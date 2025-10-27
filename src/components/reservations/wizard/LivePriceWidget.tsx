import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  Car,
  Shield,
  Plus,
  Receipt,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';
import type { ReservationWizardData } from './ReservationWizardContext';

interface LivePriceWidgetProps {
  wizardData: ReservationWizardData;
  className?: string;
}

interface PriceBreakdown {
  label: string;
  amount: number;
  icon?: React.ReactNode;
  type?: 'positive' | 'negative' | 'neutral';
}

export const LivePriceWidget: React.FC<LivePriceWidgetProps> = ({
  wizardData,
  className,
}) => {
  // Calculate price breakdown
  const breakdown = useMemo<PriceBreakdown[]>(() => {
    const items: PriceBreakdown[] = [];

    // Base rental price
    const basePrice = wizardData.totalAmount || 0;
    if (basePrice > 0) {
      items.push({
        label: 'Base Rental',
        amount: basePrice,
        icon: <Car className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Insurance
    const insuranceCost = 0; // Calculate based on insurance level
    if (insuranceCost > 0) {
      items.push({
        label: 'Insurance',
        amount: insuranceCost,
        icon: <Shield className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Add-ons
    const addOnsCost = (wizardData.globalAddOns || []).reduce(
      (sum, addonId: string) => {
        const price = wizardData.globalAddOnPrices?.[addonId] || 0;
        return sum + price;
      },
      0
    );
    if (addOnsCost > 0) {
      items.push({
        label: 'Add-ons',
        amount: addOnsCost,
        icon: <Plus className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Discount
    const discount = wizardData.discountValue || 0;
    if (discount > 0) {
      items.push({
        label: 'Discount',
        amount: -discount,
        icon: <TrendingUp className="h-4 w-4" />,
        type: 'positive',
      });
    }

    return items;
  }, [wizardData]);

  const subtotal = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * 0.05); // 5% tax
  const total = subtotal + taxAmount;

  const downPayment = wizardData.downPaymentAmount || 0;
  const balanceDue = total - downPayment;

  const hasData = breakdown.length > 0 || total > 0;

  return (
    <Card
      className={cn(
        'sticky top-4 border-2 border-primary/20 shadow-lg',
        className
      )}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Price Calculator
          </CardTitle>
          <Badge variant="outline" className="bg-background">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {hasData ? (
          <div className="space-y-3">
            {/* Breakdown Items */}
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'text-muted-foreground',
                      item.type === 'positive' && 'text-emerald-600',
                      item.type === 'negative' && 'text-red-600'
                    )}
                  >
                    {item.icon}
                  </div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span
                  className={cn(
                    'font-medium',
                    item.type === 'positive' && 'text-emerald-600',
                    item.type === 'negative' && 'text-red-600'
                  )}
                >
                  {item.amount < 0 ? '-' : ''}
                  {formatCurrency(Math.abs(item.amount))}
                </span>
              </div>
            ))}

            <Separator className="my-2" />

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span className="text-muted-foreground">
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <Separator className="my-2" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">Total</span>
              </div>
              <span className="font-bold text-2xl text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Payment Breakdown */}
            {downPayment > 0 && (
              <>
                <Separator className="my-2" />
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(downPayment)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Balance Due</span>
                    <span className="font-bold">
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Duration Info */}
            {wizardData.pickupDate && wizardData.returnDate && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-center">
                <span className="text-muted-foreground">
                  {(() => {
                    const pickup = new Date(
                      `${wizardData.pickupDate}T${wizardData.pickupTime || '00:00'}`
                    );
                    const returnDate = new Date(
                      `${wizardData.returnDate}T${wizardData.returnTime || '00:00'}`
                    );
                    const days = Math.ceil(
                      (returnDate.getTime() - pickup.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return `${days} day${days !== 1 ? 's' : ''} rental`;
                  })()}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Fill in reservation details to see live pricing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

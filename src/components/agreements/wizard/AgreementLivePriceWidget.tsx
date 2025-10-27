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
  Wrench,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface AgreementLivePriceWidgetProps {
  wizardData: EnhancedWizardData;
  className?: string;
}

interface PriceBreakdown {
  label: string;
  amount: number;
  icon?: React.ReactNode;
  type?: 'positive' | 'negative' | 'neutral';
}

export const AgreementLivePriceWidget: React.FC<AgreementLivePriceWidgetProps> = ({
  wizardData,
  className,
}) => {
  // Calculate price breakdown from agreement data
  const breakdown = useMemo<PriceBreakdown[]>(() => {
    const items: PriceBreakdown[] = [];
    const pricing = wizardData.step3?.pricingBreakdown;

    if (!pricing) return items;

    // Base rental rate
    if (pricing.baseRate > 0) {
      items.push({
        label: 'Base Rental',
        amount: pricing.baseRate,
        icon: <Car className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Insurance
    if (pricing.insurance > 0) {
      items.push({
        label: 'Insurance',
        amount: pricing.insurance,
        icon: <Shield className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Maintenance
    if (pricing.maintenance > 0) {
      items.push({
        label: 'Maintenance',
        amount: pricing.maintenance,
        icon: <Wrench className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Add-ons
    if (pricing.addons > 0) {
      items.push({
        label: 'Add-ons',
        amount: pricing.addons,
        icon: <Plus className="h-4 w-4" />,
        type: 'neutral',
      });
    }

    // Discount
    if (pricing.discount > 0) {
      items.push({
        label: 'Discount',
        amount: -pricing.discount,
        icon: <TrendingUp className="h-4 w-4" />,
        type: 'positive',
      });
    }

    return items;
  }, [wizardData.step3?.pricingBreakdown]);

  const pricing = wizardData.step3?.pricingBreakdown;
  const subtotal = pricing?.subtotal || 0;
  const taxAmount = pricing?.vat || 0;
  const total = pricing?.total || 0;

  const advancePayment = wizardData.step5?.advancePayment?.amount || 0;
  const balanceDue = total - advancePayment;

  const hasData = breakdown.length > 0 || total > 0;

  // Calculate duration from dates
  const duration = useMemo(() => {
    const pickupDate = wizardData.step1?.pickupDateTime;
    const dropoffDate = wizardData.step1?.dropoffDateTime;

    if (!pickupDate || !dropoffDate) return null;

    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const days = Math.ceil(
      (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)
    );

    return `${days} day${days !== 1 ? 's' : ''} rental`;
  }, [wizardData.step1?.pickupDateTime, wizardData.step1?.dropoffDateTime]);

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
            Agreement Pricing
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
              <span className="text-muted-foreground">VAT (5%)</span>
              <span className="text-muted-foreground">
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <Separator className="my-2" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">Total Amount</span>
              </div>
              <span className="font-bold text-2xl text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Payment Breakdown */}
            {advancePayment > 0 && (
              <>
                <Separator className="my-2" />
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Advance Payment</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(advancePayment)}
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
            {duration && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-center">
                <span className="text-muted-foreground">{duration}</span>
              </div>
            )}

            {/* Agreement Type Badge */}
            {wizardData.step1?.agreementType && (
              <div className="mt-2 flex items-center justify-center">
                <Badge variant="secondary" className="capitalize">
                  {wizardData.step1.agreementType.replace('_', ' ')} Agreement
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Complete pricing configuration to see live pricing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

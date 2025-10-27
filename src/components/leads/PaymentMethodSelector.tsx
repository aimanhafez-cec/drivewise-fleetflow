import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { getAvailablePaymentOptions, calculateProcessingFee } from '@/data/uaePaymentOptions';

interface PaymentMethodSelectorProps {
  amount: number;
  currency?: string;
  onPaymentMethodChange: (methodId: string, processingFee: number) => void;
}

export const PaymentMethodSelector = ({ 
  amount, 
  currency = 'AED',
  onPaymentMethodChange 
}: PaymentMethodSelectorProps) => {
  const { locale } = useLocale();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  const availableOptions = getAvailablePaymentOptions(amount, currency);

  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId);
    const fee = calculateProcessingFee(amount, methodId);
    onPaymentMethodChange(methodId, fee);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {locale === 'ar' ? 'طرق الدفع المتاحة' : 'Available Payment Methods'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
          <div className="space-y-3">
            {availableOptions.map((option) => {
              const fee = calculateProcessingFee(amount, option.id);
              const isSelected = selectedMethod === option.id;
              
              return (
                <div
                  key={option.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleMethodChange(option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="text-base font-medium cursor-pointer flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{locale === 'ar' ? option.name_ar : option.name_en}</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {locale === 'ar' ? option.description_ar : option.description_en}
                    </p>
                    {option.provider && (
                      <Badge variant="outline" className="mt-2">
                        {option.provider}
                      </Badge>
                    )}
                    {fee > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {locale === 'ar' 
                          ? `رسوم المعالجة: ${fee.toFixed(2)} درهم` 
                          : `Processing fee: AED ${fee.toFixed(2)}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
          <p className="text-muted-foreground">
            {locale === 'ar'
              ? '💡 نصيحة: الدفع نقداً عند الاستلام بدون رسوم معالجة'
              : '💡 Tip: Cash on delivery has no processing fees'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

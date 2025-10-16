import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { Receipt } from "lucide-react";

interface QuoteInitialFeesProps {
  quote: any;
}

const formatFeeType = (feeType: string): string => {
  if (!feeType || typeof feeType !== 'string') return 'Fee';
  
  // Convert to title case and add "Fee" suffix if not present
  const formatted = feeType
    .trim()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formatted.includes('Fee') ? formatted : `${formatted} Fee`;
};

export const QuoteInitialFees: React.FC<QuoteInitialFeesProps> = ({ quote }) => {
  const initialFees = quote.initial_fees || [];
  
  if (!initialFees || initialFees.length === 0) {
    return null; // Don't show the card if no initial fees
  }

  const totalFees = initialFees.reduce((sum: number, fee: any) => 
    sum + (parseFloat(fee.amount) || 0), 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <CardTitle>Initial Fees</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {initialFees.map((fee: any, index: number) => (
            <div key={index} className="flex justify-between items-start pb-3 border-b last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{fee.fee_type ? formatFeeType(fee.fee_type) : 'Unknown Fee'}</p>
                {fee.description && (
                  <p className="text-sm text-muted-foreground">{fee.description}</p>
                )}
              </div>
              <p className="font-semibold">{formatCurrency(fee.amount, quote.currency || 'AED')}</p>
            </div>
          ))}
          
          {initialFees.length > 1 && (
            <>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Initial Fees</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(totalFees, quote.currency || 'AED')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

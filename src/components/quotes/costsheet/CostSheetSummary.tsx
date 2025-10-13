import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CostSheetLine } from '@/hooks/useCostSheet';
import { formatCurrency } from '@/lib/utils/currency';

interface CostSheetSummaryProps {
  lines: CostSheetLine[];
  targetMargin: number;
}

export const CostSheetSummary: React.FC<CostSheetSummaryProps> = ({ 
  lines, 
  targetMargin 
}) => {
  const totalMonthlyCost = lines.reduce((sum, l) => sum + l.total_cost_per_month_aed, 0);
  const totalRevenue = lines.reduce((sum, l) => sum + l.quoted_rate_per_month_aed, 0);
  const averageMargin = totalRevenue > 0 ? ((totalRevenue - totalMonthlyCost) / totalRevenue) * 100 : 0;
  
  const lowestMarginLine = lines.reduce(
    (min, l) => l.actual_margin_percent < min.margin ? { line_no: l.line_no, margin: l.actual_margin_percent } : min,
    { line_no: 0, margin: 100 }
  );

  const lowMarginLines = lines.filter(l => l.actual_margin_percent < 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cost Sheet Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Monthly Cost</div>
            <div className="text-xl font-bold">{formatCurrency(totalMonthlyCost, 'AED')}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
            <div className="text-xl font-bold">{formatCurrency(totalRevenue, 'AED')}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Average Margin</div>
            <div className={`text-xl font-bold ${
              averageMargin >= targetMargin 
                ? 'text-green-600 dark:text-green-400' 
                : averageMargin >= 10 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {averageMargin.toFixed(1)}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Lowest Margin</div>
            <div className="text-xl font-bold text-muted-foreground">
              Line {lowestMarginLine.line_no}: {lowestMarginLine.margin.toFixed(1)}%
            </div>
          </div>
        </div>

        {lowMarginLines.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Warning: {lowMarginLines.length} vehicle line(s) have margins below 10%. 
              Lines: {lowMarginLines.map(l => l.line_no).join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
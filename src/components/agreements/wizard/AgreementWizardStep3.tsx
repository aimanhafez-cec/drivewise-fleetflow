import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, DollarSign, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface AgreementWizardStep3Props {
  data: {
    rateAdjustments?: any[];
    chargeAdjustments?: any[];
  };
  reservation: any;
  wizardData: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const AgreementWizardStep3: React.FC<AgreementWizardStep3Props> = ({
  data,
  reservation,
  wizardData,
  onChange,
  errors,
}) => {
  // Mock rate data - in real app, this would come from rate engine
  const baseRates = [
    {
      id: '1',
      description: 'Daily Rate',
      quantity: 2,
      unitPrice: 75.00,
      total: 150.00,
    },
    {
      id: '2',
      description: 'Weekend Surcharge',
      quantity: 1,
      unitPrice: 25.00,
      total: 25.00,
    },
  ];

  const additions = [
    {
      id: '1',
      description: 'GPS Navigation',
      amount: 15.00,
    },
  ];

  const taxes = [
    {
      id: '1',
      description: 'Sales Tax (8.5%)',
      rate: 0.085,
      taxableAmount: 175.00,
      amount: 14.88,
    },
  ];

  const subtotal = baseRates.reduce((sum, rate) => sum + rate.total, 0) + 
                  additions.reduce((sum, add) => sum + add.amount, 0);
  const taxTotal = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const grandTotal = subtotal + taxTotal;

  // Check if rates have changed since reservation creation
  const ratesChanged = false; // Mock - in real app, compare with original rates

  const handleRepriceLines = () => {
    // Implementation for repricing lines
    console.log('Repricing lines...');
  };

  return (
    <div id="wiz-step-rates" className="space-y-6">
      {/* Rate Change Alert */}
      {ratesChanged && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Rates have changed since this reservation was created. 
              <Button variant="link" className="p-0 h-auto" onClick={handleRepriceLines}>
                Click here to reprice lines
              </Button>
            </span>
            <Badge variant="destructive">Reprice Recommended</Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rates & Charges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Base Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baseRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.description}</TableCell>
                      <TableCell className="text-right">{rate.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rate.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(rate.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Additions */}
          <Card>
            <CardHeader>
              <CardTitle>Additions & Services</CardTitle>
            </CardHeader>
            <CardContent>
              {additions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {additions.map((addition) => (
                      <TableRow key={addition.id}>
                        <TableCell className="font-medium">{addition.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(addition.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No additional services selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Taxes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Taxes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax</TableHead>
                    <TableHead className="text-right">Taxable Amount</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxes.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">{tax.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(tax.taxableAmount)}</TableCell>
                      <TableCell className="text-right">{(tax.rate * 100).toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tax.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <Card id="summary-card" className="sticky top-6">
            <CardHeader>
              <CardTitle>Summary of Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Rate:</span>
                  <span>{formatCurrency(baseRates.reduce((sum, rate) => sum + rate.total, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Additions:</span>
                  <span>{formatCurrency(additions.reduce((sum, add) => sum + add.amount, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(taxTotal)}</span>
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Grand Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Advance Paid:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-medium text-card-foreground">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  FileText, 
  CreditCard, 
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface AgreementFinancialTabProps {
  agreement: any;
}

export const AgreementFinancialTab: React.FC<AgreementFinancialTabProps> = ({ agreement }) => {
  // Fetch invoices
  const { data: invoices } = useQuery({
    queryKey: ['agreement:invoices', agreement.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('agreement_id', agreement.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch payments
  const { data: payments } = useQuery({
    queryKey: ['agreement:payments', agreement.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', agreement.customer_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const balanceDue = (agreement.total_amount || 0) - totalPaid;

  return (
    <div className="space-y-6">
      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Breakdown</CardTitle>
          <CardDescription>Detailed cost structure for this agreement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Base Vehicle Rate (per month)</span>
              <span className="font-medium">
                {formatCurrency(agreement.base_vehicle_rate_per_month || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Insurance ({agreement.insurance_package_type || 'N/A'})</span>
              <span className="font-medium">
                {formatCurrency(agreement.monthly_insurance_cost_per_vehicle || 0)}
              </span>
            </div>

            {agreement.monthly_maintenance_cost_per_vehicle > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Maintenance Package</span>
                <span className="font-medium">
                  {formatCurrency(agreement.monthly_maintenance_cost_per_vehicle || 0)}
                </span>
              </div>
            )}

            {agreement.roadside_assistance_cost_monthly > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Roadside Assistance</span>
                <span className="font-medium">
                  {formatCurrency(agreement.roadside_assistance_cost_monthly || 0)}
                </span>
              </div>
            )}

            {agreement.replacement_vehicle_cost_monthly > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Replacement Vehicle Coverage</span>
                <span className="font-medium">
                  {formatCurrency(agreement.replacement_vehicle_cost_monthly || 0)}
                </span>
              </div>
            )}

            {/* Add-ons */}
            {agreement.add_ons && Array.isArray(agreement.add_ons) && agreement.add_ons.length > 0 && (
              <>
                <Separator className="my-2" />
                <p className="text-sm font-medium">Add-ons & Extras</p>
                {agreement.add_ons.map((addon: any, index: number) => (
                  <div key={index} className="flex justify-between items-center pl-4">
                    <span className="text-sm text-muted-foreground">{addon.name || addon.type}</span>
                    <span className="font-medium">
                      {formatCurrency(addon.price || addon.cost || 0)}
                    </span>
                  </div>
                ))}
              </>
            )}

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">
                {formatCurrency((agreement.total_amount || 0) / 1.05)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">VAT (5%)</span>
              <span className="font-medium">
                {formatCurrency((agreement.total_amount || 0) * 0.05 / 1.05)}
              </span>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount</span>
              <span>{formatCurrency(agreement.total_amount || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-medium">{formatCurrency(agreement.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Balance Due</span>
                <span className={`font-bold text-lg ${balanceDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>

            <Button className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </CardContent>
        </Card>

        {/* Outstanding Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Outstanding Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unpaid Rental Charges</span>
              <span className="font-medium">{formatCurrency(balanceDue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Tolls</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Fines</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Excess Mileage</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-medium">
              <span>Total Outstanding</span>
              <span className="text-destructive">{formatCurrency(balanceDue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoices
              </CardTitle>
              <CardDescription>All invoices for this agreement</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No invoices generated yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>All payments received for this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.transaction_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payments recorded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Payment {
  id: string;
  payment_date: string;
  payment_type: string;
  payment_method: string;
  amount: number;
  payment_status: string;
  transaction_id?: string;
  notes?: string;
}

interface ReservationPaymentHistoryProps {
  payments: Payment[];
  totalAmount: number;
  downPaymentRequired: number;
}

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-600" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
  }
};

const getPaymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    down_payment: 'Down Payment',
    balance: 'Balance Payment',
    full: 'Full Payment',
  };
  return labels[type] || type;
};

export const ReservationPaymentHistory: React.FC<ReservationPaymentHistoryProps> = ({
  payments,
  totalAmount,
  downPaymentRequired,
}) => {
  const totalPaid = payments
    .filter((p) => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = totalAmount - totalPaid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
            <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Down Payment</p>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(downPaymentRequired)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Balance Due</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(balanceDue)}
            </p>
          </div>
        </div>

        {/* Payment List */}
        {payments.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{getPaymentTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(payment.payment_status)}>
                        <span className="flex items-center gap-1">
                          {getPaymentStatusIcon(payment.payment_status)}
                          {payment.payment_status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {payment.transaction_id || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No payments recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

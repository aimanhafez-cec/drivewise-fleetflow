import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth } from 'date-fns';

interface PaymentStats {
  pendingCount: number;
  pendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  collectedThisMonth: number;
  paidCount: number;
}

export function PaymentStatusCard() {
  const navigate = useNavigate();

  const { data: paymentStats, isLoading } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async (): Promise<PaymentStats> => {
      const monthStart = startOfMonth(new Date());

      // Get pending invoices
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'pending');

      // Get overdue invoices
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('total_amount, due_date')
        .eq('status', 'overdue');

      // Get paid invoices this month
      const { data: paidInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid')
        .gte('updated_at', monthStart.toISOString());

      const pendingAmount = pendingInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
      const overdueAmount = overdueInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
      const collectedThisMonth = paidInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

      return {
        pendingCount: pendingInvoices?.length || 0,
        pendingAmount,
        overdueCount: overdueInvoices?.length || 0,
        overdueAmount,
        collectedThisMonth,
        paidCount: paidInvoices?.length || 0
      };
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const formatCurrency = (value: number) => {
    return `AED ${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    );
  }

  if (!paymentStats) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load payment data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Payment Status</h3>
            <p className="text-sm text-muted-foreground">Invoice tracking</p>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="space-y-4 mb-6">
        {/* Pending Payments */}
        <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-r-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-foreground">Pending Payments</h4>
            </div>
            {paymentStats.pendingCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {paymentStats.pendingCount}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(paymentStats.pendingAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {paymentStats.pendingCount} invoice{paymentStats.pendingCount !== 1 ? 's' : ''} awaiting payment
          </p>
        </div>

        {/* Overdue Payments */}
        <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 rounded-r-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-foreground">Overdue</h4>
            </div>
            {paymentStats.overdueCount > 0 && (
              <Badge variant="destructive">
                {paymentStats.overdueCount}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-red-600 mb-1">
            {formatCurrency(paymentStats.overdueAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {paymentStats.overdueCount > 0 
              ? `${paymentStats.overdueCount} overdue invoice${paymentStats.overdueCount !== 1 ? 's' : ''}`
              : 'No overdue payments'}
          </p>
        </div>

        {/* Collected This Month */}
        <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-r-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-foreground">Collected This Month</h4>
            </div>
            {paymentStats.paidCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {paymentStats.paidCount}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(paymentStats.collectedThisMonth)}
          </p>
          <p className="text-xs text-muted-foreground">
            {paymentStats.paidCount} payment{paymentStats.paidCount !== 1 ? 's' : ''} received
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button 
          className="w-full" 
          onClick={() => navigate('/finance/invoices')}
        >
          Process Payments
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/reports?type=financial')}
        >
          View Financial Reports
        </Button>
      </div>
    </Card>
  );
}

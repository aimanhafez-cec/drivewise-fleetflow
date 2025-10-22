import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle,
  DollarSign,
  FileWarning,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceStats {
  pendingTollsAmount: number;
  pendingTollsCount: number;
  pendingFinesAmount: number;
  pendingFinesCount: number;
  openExceptionsCount: number;
  resolvedThisMonth: number;
}

export function ComplianceOverview() {
  const navigate = useNavigate();

  const { data: complianceStats, isLoading } = useQuery({
    queryKey: ['compliance-stats'],
    queryFn: async (): Promise<ComplianceStats> => {
      // Fetch tolls and fines data
      const { data: tollsFines } = await supabase
        .from('tolls_fines')
        .select('amount, type, status');

      // Fetch exceptions data
      const { data: exceptions } = await supabase
        .from('compliance_exceptions')
        .select('status, resolved_at');

      const pendingTolls = tollsFines?.filter(tf => 
        tf.type === 'toll' && tf.status === 'pending'
      ) || [];

      const pendingFines = tollsFines?.filter(tf => 
        tf.type === 'fine' && tf.status === 'pending'
      ) || [];

      const openExceptions = exceptions?.filter(e => 
        e.status === 'open' || e.status === 'pending'
      ) || [];

      const resolvedThisMonth = exceptions?.filter(e => {
        if (!e.resolved_at) return false;
        const resolved = new Date(e.resolved_at);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return resolved >= monthStart;
      }).length || 0;

      return {
        pendingTollsAmount: pendingTolls.reduce((sum, t) => sum + Number(t.amount || 0), 0),
        pendingTollsCount: pendingTolls.length,
        pendingFinesAmount: pendingFines.reduce((sum, f) => sum + Number(f.amount || 0), 0),
        pendingFinesCount: pendingFines.length,
        openExceptionsCount: openExceptions.length,
        resolvedThisMonth
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
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    );
  }

  if (!complianceStats) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load compliance data</p>
        </div>
      </Card>
    );
  }

  const totalPendingAmount = complianceStats.pendingTollsAmount + complianceStats.pendingFinesAmount;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <FileWarning className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Cost Compliance</h3>
            <p className="text-sm text-muted-foreground">Tolls, fines & exceptions</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/operations/compliance')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Total Pending Amount */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(totalPendingAmount)}
            </p>
          </div>
          <DollarSign className="h-12 w-12 text-amber-600 opacity-50" />
        </div>
      </div>

      {/* Compliance Items */}
      <div className="space-y-4">
        {/* Tolls (Salik/Darb) */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Pending Tolls</h4>
                <p className="text-xs text-muted-foreground">Salik & Darb charges</p>
              </div>
            </div>
            {complianceStats.pendingTollsCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {complianceStats.pendingTollsCount} items
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount due</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(complianceStats.pendingTollsAmount)}
            </span>
          </div>
          {complianceStats.pendingTollsCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => navigate('/operations/tolls-fines?type=toll&status=pending')}
            >
              Process Tolls
            </Button>
          )}
        </div>

        {/* Traffic Fines */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Traffic Fines</h4>
                <p className="text-xs text-muted-foreground">Pending violations</p>
              </div>
            </div>
            {complianceStats.pendingFinesCount > 0 && (
              <Badge variant="destructive">
                {complianceStats.pendingFinesCount} fines
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount due</span>
            <span className="text-lg font-bold text-red-600">
              {formatCurrency(complianceStats.pendingFinesAmount)}
            </span>
          </div>
          {complianceStats.pendingFinesCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => navigate('/operations/tolls-fines?type=fine&status=pending')}
            >
              Review Fines
            </Button>
          )}
        </div>

        {/* Compliance Exceptions */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <FileWarning className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Exceptions</h4>
                <p className="text-xs text-muted-foreground">Open cases</p>
              </div>
            </div>
            {complianceStats.openExceptionsCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {complianceStats.openExceptionsCount} open
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open cases</span>
              <span className="text-lg font-bold text-purple-600">
                {complianceStats.openExceptionsCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Resolved this month</span>
              <span className="text-sm font-semibold text-green-600">
                {complianceStats.resolvedThisMonth}
              </span>
            </div>
          </div>
          {complianceStats.openExceptionsCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => navigate('/operations/exceptions')}
            >
              Manage Exceptions
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">
              Compliance Status
            </span>
          </div>
          <Badge 
            variant={
              complianceStats.openExceptionsCount === 0 && totalPendingAmount < 1000
                ? "default"
                : "secondary"
            }
          >
            {complianceStats.openExceptionsCount === 0 && totalPendingAmount < 1000
              ? "Good Standing"
              : "Needs Attention"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

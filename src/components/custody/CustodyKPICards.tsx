import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Clock, AlertCircle, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import type { CustodyKPIs } from "@/lib/api/custody";

interface CustodyKPICardsProps {
  metrics?: CustodyKPIs;
  isLoading?: boolean;
}

export function CustodyKPICards({ metrics, isLoading }: CustodyKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Active Custodies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Custody</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.active_custodies}</div>
          <p className="text-xs text-muted-foreground">
            Vehicles currently in custody
          </p>
        </CardContent>
      </Card>

      {/* Open Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.open_approvals}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting management approval
          </p>
        </CardContent>
      </Card>

      {/* SLA Compliance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SLA On-Time</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.sla_on_time_percentage?.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            On-time approvals & handovers
          </p>
        </CardContent>
      </Card>

      {/* Unposted Charges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unposted Charges</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.unposted_charges}</div>
          <p className="text-xs text-muted-foreground">
            Charges awaiting posting
          </p>
        </CardContent>
      </Card>

      {/* Avg Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avg_duration_days?.toFixed(0) || '0'} days
          </div>
          <p className="text-xs text-muted-foreground">
            Average custody period
          </p>
        </CardContent>
      </Card>

      {/* Total Cost This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost (MTD)</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            AED {metrics.total_cost_this_month?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Total cost this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

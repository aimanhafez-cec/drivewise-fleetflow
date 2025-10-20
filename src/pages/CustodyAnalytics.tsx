import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustodyKPICards } from "@/components/custody";
import { StandardLineChart } from "@/components/charts/StandardLineChart";
import { StandardBarChart } from "@/components/charts/StandardBarChart";
import { StandardPieChart } from "@/components/charts/StandardPieChart";
import { useCustodyAnalytics } from "@/hooks/useCustodyAnalytics";
import { custodyApi } from "@/lib/api/custody";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatNumber } from "@/lib/utils/chartUtils";

export default function CustodyAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Fetch KPIs for the cards
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['custody-kpis'],
    queryFn: () => custodyApi.getCustodyKPIs()
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useCustodyAnalytics(dateRange);

  const handleExport = () => {
    if (!analytics?.rawData) return;
    
    const csv = [
      ['Date', 'Custody No', 'Vehicle', 'Custodian', 'Status', 'Reason'].join(','),
      ...analytics.rawData.map(c => [
        new Date(c.created_at).toLocaleDateString(),
        c.custody_no,
        c.original_vehicle_id || 'N/A',
        c.custodian_name,
        c.status,
        c.reason_code
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custody-analytics-${new Date().toISOString()}.csv`;
    a.click();
  };

  const statusChartConfig = {
    active: { label: "Active", color: "hsl(var(--chart-1))" },
    pending_approval: { label: "Pending Approval", color: "hsl(var(--chart-2))" },
    closed: { label: "Closed", color: "hsl(var(--chart-3))" },
    voided: { label: "Voided", color: "hsl(var(--chart-4))" },
  };

  const custodianTypeChartConfig = {
    internal: { label: "Internal", color: "hsl(var(--chart-1))" },
    customer: { label: "Customer", color: "hsl(var(--chart-2))" },
    vendor: { label: "Vendor", color: "hsl(var(--chart-3))" },
    insurance: { label: "Insurance", color: "hsl(var(--chart-4))" },
  };

  const trendChartConfig = {
    custody: { label: "Custody Count", color: "hsl(var(--chart-1))" },
    cost: { label: "Cost", color: "hsl(var(--chart-2))" },
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custody Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive custody metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <CustodyKPICards metrics={kpiData} isLoading={kpiLoading} />

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="custodians">Custodians</TabsTrigger>
          <TabsTrigger value="reasons">Reasons</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custody & Cost Trends</CardTitle>
              <CardDescription>
                Daily custody transactions and associated costs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <StandardLineChart
                  data={analytics?.trends || []}
                  config={trendChartConfig}
                  xAxisKey="date"
                  lines={[
                    { dataKey: "custody", name: "Custody Count" },
                    { dataKey: "cost", name: "Cost (AED)" }
                  ]}
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>
                  Custody transactions by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <StandardPieChart
                    data={Object.entries(analytics?.statusDistribution || {}).map(([name, value]) => ({
                      name: name.replace('_', ' ').toUpperCase(),
                      value
                    }))}
                    config={statusChartConfig}
                    height={300}
                    dataKey="value"
                    nameKey="name"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custodian Type Distribution</CardTitle>
                <CardDescription>
                  Custody transactions by custodian type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <StandardPieChart
                    data={Object.entries(analytics?.custodianTypeDistribution || {}).map(([name, value]) => ({
                      name: name.toUpperCase(),
                      value
                    }))}
                    config={custodianTypeChartConfig}
                    height={300}
                    dataKey="value"
                    nameKey="name"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custodians Tab */}
        <TabsContent value="custodians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Custodians</CardTitle>
              <CardDescription>
                Custodians with the most custody transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <StandardBarChart
                  data={analytics?.custodianStats || []}
                  config={{
                    count: { label: "Count", color: "hsl(var(--chart-1))" },
                    totalCost: { label: "Total Cost", color: "hsl(var(--chart-2))" }
                  }}
                  xAxisKey="custodian"
                  bars={[
                    { dataKey: "count", name: "Custody Count" },
                    { dataKey: "totalCost", name: "Total Cost (AED)" }
                  ]}
                  height={400}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reasons Tab */}
        <TabsContent value="reasons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custody Reasons</CardTitle>
              <CardDescription>
                Most common reasons for custody transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <StandardBarChart
                  data={analytics?.reasonStats || []}
                  config={{
                    count: { label: "Count", color: "hsl(var(--chart-1))" }
                  }}
                  xAxisKey="reason"
                  bars={[
                    { dataKey: "count", name: "Count" }
                  ]}
                  height={400}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {analytics?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Custody</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.metrics.totalCustody)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.metrics.totalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{analytics.metrics.averageDuration.toFixed(1)} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold">{analytics.metrics.slaCompliance.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

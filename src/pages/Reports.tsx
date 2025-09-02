import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, Download, Filter, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import FleetStatusReport from '@/components/reports/FleetStatusReport';
import MaintenanceReport from '@/components/reports/MaintenanceReport';
import ReservationsReport from '@/components/reports/ReservationsReport';
import DamageReport from '@/components/reports/DamageReport';
import RentalHistoryReport from '@/components/reports/RentalHistoryReport';
import PreferencesTrendsReport from '@/components/reports/PreferencesTrendsReport';
import SatisfactionFeedbackReport from '@/components/reports/SatisfactionFeedbackReport';
import LateReturnAnalysisReport from '@/components/reports/LateReturnAnalysisReport';
import RevenueBreakdownReport from '@/components/reports/RevenueBreakdownReport';
import CostAnalysisReport from '@/components/reports/CostAnalysisReport';
import ProfitabilityReport from '@/components/reports/ProfitabilityReport';
import OutstandingPaymentsReport from '@/components/reports/OutstandingPaymentsReport';
const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  useEffect(() => {
    console.log('Reports component mounted with date range:', date);
    console.log('All report components should be available');
  }, [date]);
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analytics for fleet operations and customer insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant="outline" className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? date.to ? <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </> : format(date.from, "LLL dd, y") : <span>Pick a date range</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Report Tabs */}
      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-950">
          <TabsTrigger value="operations">
            Internal Operations Reports
          </TabsTrigger>
          <TabsTrigger value="customer-insights">
            Customer Insight Reports
          </TabsTrigger>
          <TabsTrigger value="financial">
            Financial Reports
          </TabsTrigger>
        </TabsList>

        {/* Internal Operations Reports */}
        <TabsContent value="operations" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73.2%</div>
                <p className="text-xs text-muted-foreground">
                  +5.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">93</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  3 overdue services
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Operations Sub-tabs */}
          <Tabs defaultValue="fleet-status" className="space-y-4">
            <TabsList>
              <TabsTrigger value="fleet-status">
                Fleet Status & Utilization
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                Maintenance & Service
              </TabsTrigger>
              <TabsTrigger value="reservations">
                Reservations & Availability
              </TabsTrigger>
              <TabsTrigger value="damage">
                Vehicle Damage & Incidents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fleet-status" className="space-y-4">
              <FleetStatusReport dateRange={date} />
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <MaintenanceReport dateRange={date} />
            </TabsContent>

            <TabsContent value="reservations" className="space-y-4">
              <ReservationsReport dateRange={date} />
            </TabsContent>

            <TabsContent value="damage" className="space-y-4">
              <DamageReport dateRange={date} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Customer Insight Reports */}
        <TabsContent value="customer-insights" className="space-y-6">
          {/* Customer Insights Sub-tabs */}
          <Tabs defaultValue="rental-history" className="space-y-4">
            <TabsList className="bg-slate-950">
              <TabsTrigger value="rental-history">
                Rental History & Loyalty
              </TabsTrigger>
              <TabsTrigger value="preferences">
                Preferences & Trends
              </TabsTrigger>
              <TabsTrigger value="satisfaction">
                Satisfaction & Feedback
              </TabsTrigger>
              <TabsTrigger value="late-returns">
                Late Return Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rental-history" className="space-y-4">
              <RentalHistoryReport dateRange={date} />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <PreferencesTrendsReport dateRange={date} />
            </TabsContent>

            <TabsContent value="satisfaction" className="space-y-4">
              <SatisfactionFeedbackReport dateRange={date} />
            </TabsContent>

            <TabsContent value="late-returns" className="space-y-4">
              <LateReturnAnalysisReport dateRange={date} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          {/* Financial Reports Sub-tabs */}
          <Tabs defaultValue="revenue-breakdown" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue-breakdown">
                Revenue Breakdown & Trends
              </TabsTrigger>
              <TabsTrigger value="cost-analysis">
                Cost Analysis & Expenses
              </TabsTrigger>
              <TabsTrigger value="profitability">
                Profitability Analysis
              </TabsTrigger>
              <TabsTrigger value="outstanding-payments">
                Outstanding Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="revenue-breakdown" className="space-y-4">
              <RevenueBreakdownReport dateRange={date} />
            </TabsContent>

            <TabsContent value="cost-analysis" className="space-y-4">
              <CostAnalysisReport dateRange={date} />
            </TabsContent>

            <TabsContent value="profitability" className="space-y-4">
              <ProfitabilityReport dateRange={date} />
            </TabsContent>

            <TabsContent value="outstanding-payments" className="space-y-4">
              <OutstandingPaymentsReport dateRange={date} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Reports;
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { NewFleetStatusReport } from '@/components/reports/NewFleetStatusReport';
import { NewRevenueReport } from '@/components/reports/NewRevenueReport';
import { NewReservationsReport } from '@/components/reports/NewReservationsReport';
import { NewMaintenanceReport } from '@/components/reports/NewMaintenanceReport';

const ReportsNew = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reports Dashboard</h1>
          <p className="text-white/70 mt-2">
            Comprehensive analytics for fleet operations and customer insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                  !date && "text-white/70"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Report Tabs */}
      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border border-white/20">
          <TabsTrigger 
            value="fleet"
            className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20"
          >
            Fleet Status
          </TabsTrigger>
          <TabsTrigger 
            value="revenue"
            className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger 
            value="reservations"
            className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20"
          >
            Reservations
          </TabsTrigger>
          <TabsTrigger 
            value="maintenance"
            className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20"
          >
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <NewFleetStatusReport dateRange={date} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <NewRevenueReport dateRange={date} />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <NewReservationsReport dateRange={date} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <NewMaintenanceReport dateRange={date} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsNew;
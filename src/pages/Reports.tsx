import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarIcon, 
  Download, 
  FileText, 
  Sheet, 
  File,
  Car,
  Wrench,
  Calendar as CalendarIcon2,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import FleetStatusReport from '@/components/reports/FleetStatusReport';
import MaintenanceReport from '@/components/reports/MaintenanceReport';
import ReservationsReport from '@/components/reports/ReservationsReport';
import { DamageIncidentReport } from '@/components/reports/DamageIncidentReport';

interface DateRange {
  from: Date;
  to: Date;
}

const Reports = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReport, setActiveReport] = useState('fleet-status');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['internal-operations']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const exportData = (format: 'pdf' | 'excel' | 'csv') => {
    // TODO: Implement export functionality
    console.log(`Exporting ${activeReport} as ${format}`);
  };

  const reportCategories = [
    {
      id: 'internal-operations',
      title: 'Internal Operations Reports',
      reports: [
        { id: 'fleet-status', title: 'Fleet Status & Utilization', icon: Car },
        { id: 'maintenance', title: 'Maintenance & Service Schedule', icon: Wrench },
        { id: 'reservations', title: 'Reservations & Availability', icon: CalendarIcon2 },
        { id: 'damage', title: 'Vehicle Damage & Incident', icon: AlertTriangle }
      ]
    },
    {
      id: 'customer-insights',
      title: 'Customer Insights Reports',
      reports: []
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      reports: []
    }
  ];

  const renderReportContent = () => {
    switch (activeReport) {
      case 'fleet-status':
        return <FleetStatusReport dateRange={dateRange} filters={{ branch: selectedBranch, vehicleType: selectedVehicleType, status: selectedStatus }} />;
      case 'maintenance':
        return <MaintenanceReport dateRange={dateRange} filters={{ branch: selectedBranch, vehicleType: selectedVehicleType, status: selectedStatus }} />;
      case 'reservations':
        return <ReservationsReport dateRange={dateRange} filters={{ branch: selectedBranch, vehicleType: selectedVehicleType, status: selectedStatus }} />;
      case 'damage':
        return <DamageIncidentReport dateRange={dateRange} filters={{ branch: selectedBranch, vehicleType: selectedVehicleType, status: selectedStatus }} />;
      default:
        return <div className="text-center text-muted-foreground py-8">Select a report from the sidebar</div>;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Reports Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Internal operations insights</p>
        </div>
        
        <div className="px-3">
          {reportCategories.map((category) => (
            <div key={category.id} className="mb-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => toggleCategory(category.id)}
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="mr-2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-card-foreground">{category.title}</span>
              </Button>
              
              {expandedCategories.includes(category.id) && (
                <div className="ml-6 space-y-1">
                  {category.reports.length > 0 ? (
                    category.reports.map((report) => (
                      <Button
                        key={report.id}
                        variant={activeReport === report.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => setActiveReport(report.id)}
                      >
                        <report.icon className="mr-2 h-4 w-4" />
                        <span className="text-sm">{report.title}</span>
                      </Button>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Coming soon...
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Filters Bar */}
        <div className="border-b bg-card px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                  ) : (
                    'Select date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Branch Filter */}
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="airport">Airport</SelectItem>
                <SelectItem value="mall">Mall Location</SelectItem>
              </SelectContent>
            </Select>

            {/* Vehicle Type Filter */}
            <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All vehicle types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('excel')}>
                <Sheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <File className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
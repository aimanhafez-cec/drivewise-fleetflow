import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, RotateCcw, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  VehicleClassSelect,
  VehicleMakeSelect,
  VehicleModelSelect,
  LocationSelect
} from "@/components/ui/select-components";

interface PlannerFiltersProps {
  filters: {
    vehicleClass: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleVin: string;
    locations: string[];
    status: string[];
    salesperson: string;
    dateRange: {
      from?: Date;
      to?: Date;
    };
  };
  onFiltersChange: (filters: PlannerFiltersProps["filters"]) => void;
  onReset: () => void;
}

export const PlannerFilters: React.FC<PlannerFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter("status", newStatus);
  };

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    updateFilter("locations", newLocations);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "dateRange") {
      const dateRange = value as { from?: Date; to?: Date };
      return dateRange.from || dateRange.to;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value && value !== "";
  });

  const statusOptions = [
    "Open", "Online", "Walk-in", "Overdue", "Closed", "Pending Payment", "Pending Deposit"
  ];

  return (
    <Card className="sticky top-4 z-10 shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Vehicle Class */}
          <div className="space-y-2">
            <Label htmlFor="flt-class">Vehicle Class</Label>
            <VehicleClassSelect
              value={filters.vehicleClass || undefined}
              onChange={(value) => updateFilter("vehicleClass", typeof value === 'string' ? value : "")}
              placeholder="All Classes"
              allowClear={true}
              data-testid="flt-class"
            />
          </div>

          {/* Vehicle Make */}
          <div className="space-y-2">
            <Label htmlFor="flt-make">Make</Label>
            <VehicleMakeSelect
              value={filters.vehicleMake || undefined}
              onChange={(value) => updateFilter("vehicleMake", typeof value === 'string' ? value : "")}
              classId={filters.vehicleClass || undefined}
              placeholder="All Makes"
              allowClear={true}
              data-testid="flt-make"
            />
          </div>

          {/* Vehicle Model */}
          <div className="space-y-2">
            <Label htmlFor="flt-model">Model</Label>
            <VehicleModelSelect
              value={filters.vehicleModel || undefined}
              onChange={(value) => updateFilter("vehicleModel", typeof value === 'string' ? value : "")}
              make={filters.vehicleMake || undefined}
              classId={filters.vehicleClass || undefined}
              placeholder="All Models"
              allowClear={true}
              data-testid="flt-model"
            />
          </div>

          {/* VIN Search */}
          <div className="space-y-2">
            <Label htmlFor="flt-vin">VIN/License</Label>
            <Input
              id="flt-vin"
              data-testid="flt-vin"
              placeholder="Search VIN or License"
              value={filters.vehicleVin}
              onChange={(e) => updateFilter("vehicleVin", e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd")} -{" "}
                        {format(filters.dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to
                  }}
                  onSelect={(range) => updateFilter("dateRange", range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                data-testid="btn-search"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onReset}
                disabled={!hasActiveFilters}
                data-testid="btn-reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status and Location Filters */}
        <div className="mt-4 space-y-3">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2" data-testid="flt-status">
              {statusOptions.map(status => (
                <Badge
                  key={status}
                  variant={filters.status.includes(status) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleStatus(status)}
                >
                  {status}
                  {filters.status.includes(status) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Locations</Label>
            <LocationSelect
              value={filters.locations}
              onChange={(value) => updateFilter("locations", Array.isArray(value) ? value : value ? [value] : [])}
              multiple={true}
              placeholder="Select locations"
              allowClear={true}
              data-testid="flt-locations"
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Clear All
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.vehicleClass && (
                <Badge variant="secondary">Class: {filters.vehicleClass}</Badge>
              )}
              {filters.vehicleMake && (
                <Badge variant="secondary">Make: {filters.vehicleMake}</Badge>
              )}
              {filters.vehicleModel && (
                <Badge variant="secondary">Model: {filters.vehicleModel}</Badge>
              )}
              {filters.vehicleVin && (
                <Badge variant="secondary">VIN: {filters.vehicleVin}</Badge>
              )}
              {filters.status.length > 0 && (
                <Badge variant="secondary">Status: {filters.status.length} selected</Badge>
              )}
              {filters.locations.length > 0 && (
                <Badge variant="secondary">Locations: {filters.locations.length} selected</Badge>
              )}
              {filters.dateRange.from && (
                <Badge variant="secondary">
                  Date: {format(filters.dateRange.from, "MMM dd")}
                  {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
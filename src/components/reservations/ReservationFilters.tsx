import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Package, Car, Hash, Calendar } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { SavedViewsManager } from './SavedViewsManager';

export interface ReservationFilterState {
  search?: string;
  reservationType?: string;
  paymentStatus?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface ReservationFiltersProps {
  filters: ReservationFilterState;
  onFiltersChange: (filters: ReservationFilterState) => void;
  onClear: () => void;
  activeViewId?: string;
}

export const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  activeViewId,
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Saved Views Manager */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Apply filters and save them for quick access
          </div>
          <SavedViewsManager
            currentFilters={filters}
            onApplyView={onFiltersChange}
            activeViewId={activeViewId}
          />
        </div>
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, phone, or reservation number..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9 bg-background"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Reservation Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Reservation Type
            </Label>
            <Select
              value={filters.reservationType || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  reservationType: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vehicle_class">Vehicle Class</SelectItem>
                <SelectItem value="make_model">Make + Model</SelectItem>
                <SelectItem value="specific_vin">Specific VIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Payment Status
            </Label>
            <Select
              value={filters.paymentStatus || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  paymentStatus: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" />
              Status
            </Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">From Date</Label>
            <DatePicker
              value={filters.dateFrom}
              onChange={(date) =>
                onFiltersChange({ ...filters, dateFrom: date || undefined })
              }
              placeholder="Start date"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">To Date</Label>
            <DatePicker
              value={filters.dateTo}
              onChange={(date) =>
                onFiltersChange({ ...filters, dateTo: date || undefined })
              }
              placeholder="End date"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

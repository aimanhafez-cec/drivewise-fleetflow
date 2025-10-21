import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface AgreementFilters {
  search: string;
  status: string[];
  agreementDateFrom: Date | undefined;
  agreementDateTo: Date | undefined;
  checkoutDateFrom: Date | undefined;
  checkoutDateTo: Date | undefined;
  returnDateFrom: Date | undefined;
  returnDateTo: Date | undefined;
  paymentStatus: string;
  locationType: string;
}

interface AgreementListFiltersProps {
  filters: AgreementFilters;
  onFiltersChange: (filters: AgreementFilters) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'pending_return', label: 'Pending Return' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
];

const paymentStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
];

export const AgreementListFilters: React.FC<AgreementListFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof AgreementFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatuses);
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status.length > 0 ||
    filters.agreementDateFrom ||
    filters.agreementDateTo ||
    filters.checkoutDateFrom ||
    filters.checkoutDateTo ||
    filters.returnDateFrom ||
    filters.returnDateTo ||
    filters.paymentStatus !== 'all';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Quick Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by agreement no., customer name, Emirates ID, phone, vehicle plate..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={onReset}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Status Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status.value}
                variant={filters.status.includes(status.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleStatus(status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4 mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Agreement Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Agreement Date</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.agreementDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.agreementDateFrom ? (
                          format(filters.agreementDateFrom, "MMM dd, yyyy")
                        ) : (
                          <span>From</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.agreementDateFrom}
                        onSelect={(date) => updateFilter('agreementDateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.agreementDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.agreementDateTo ? (
                          format(filters.agreementDateTo, "MMM dd, yyyy")
                        ) : (
                          <span>To</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.agreementDateTo}
                        onSelect={(date) => updateFilter('agreementDateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Checkout Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Checkout Date</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.checkoutDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.checkoutDateFrom ? (
                          format(filters.checkoutDateFrom, "MMM dd, yyyy")
                        ) : (
                          <span>From</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.checkoutDateFrom}
                        onSelect={(date) => updateFilter('checkoutDateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.checkoutDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.checkoutDateTo ? (
                          format(filters.checkoutDateTo, "MMM dd, yyyy")
                        ) : (
                          <span>To</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.checkoutDateTo}
                        onSelect={(date) => updateFilter('checkoutDateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Return Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Return Date</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.returnDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.returnDateFrom ? (
                          format(filters.returnDateFrom, "MMM dd, yyyy")
                        ) : (
                          <span>From</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.returnDateFrom}
                        onSelect={(date) => updateFilter('returnDateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.returnDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.returnDateTo ? (
                          format(filters.returnDateTo, "MMM dd, yyyy")
                        ) : (
                          <span>To</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.returnDateTo}
                        onSelect={(date) => updateFilter('returnDateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) => updateFilter('paymentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlobalSearchBar } from './GlobalSearchBar';
import type { DateRangeFilter } from '@/lib/api/admin-dashboard';

interface DashboardHeaderProps {
  dateFilter: DateRangeFilter;
  onDateFilterChange: (filter: DateRangeFilter) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ 
  dateFilter, 
  onDateFilterChange, 
  onRefresh,
  isRefreshing = false 
}: DashboardHeaderProps) {
  const handleFilterChange = (value: string) => {
    onDateFilterChange({ type: value as DateRangeFilter['type'] });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time operations overview
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Global Search */}
          <GlobalSearchBar />
          
          {/* Date Filter */}
          <Select value={dateFilter.type} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Beta Badge */}
          <Badge variant="secondary" className="hidden sm:flex">
            New Dashboard
          </Badge>
        </div>
      </div>

      {/* Filter Info */}
      <div className="mt-4 text-xs text-muted-foreground">
        Showing data for: <span className="font-semibold text-foreground">
          {dateFilter.type === 'today' && 'Today'}
          {dateFilter.type === 'week' && 'This Week'}
          {dateFilter.type === 'month' && 'This Month'}
          {dateFilter.type === 'quarter' && 'This Quarter'}
          {dateFilter.type === 'year' && 'This Year'}
        </span>
      </div>
    </div>
  );
}

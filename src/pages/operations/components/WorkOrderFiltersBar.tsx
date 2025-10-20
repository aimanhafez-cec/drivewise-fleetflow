import React from 'react';
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
import { Search, X } from 'lucide-react';
import { WorkOrderFilters } from '@/lib/api/maintenance';

interface WorkOrderFiltersBarProps {
  filters: WorkOrderFilters;
  onFiltersChange: (filters: WorkOrderFilters) => void;
}

const WorkOrderFiltersBar: React.FC<WorkOrderFiltersBarProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleReasonChange = (value: string) => {
    if (value === 'all') {
      const { reason, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, reason: [value as any] });
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: [value as any] });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (value === 'all') {
      const { priority, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, priority: [value as any] });
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof WorkOrderFilters] !== undefined && 
    filters[key as keyof WorkOrderFilters] !== ''
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by work order # or description..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <Select value={filters.reason?.[0] || 'all'} onValueChange={handleReasonChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            <SelectItem value="pm">Preventive Maintenance</SelectItem>
            <SelectItem value="breakdown">Breakdown</SelectItem>
            <SelectItem value="accident">Accident</SelectItem>
            <SelectItem value="recall">Recall</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status?.[0] || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
            <SelectItem value="qa">QA</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority?.[0] || 'all'} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.reason && (
            <Badge variant="secondary">
              Reason: {filters.reason[0]}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleReasonChange('all')} />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary">
              Status: {filters.status[0]}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleStatusChange('all')} />
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary">
              Priority: {filters.priority[0]}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handlePriorityChange('all')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkOrderFiltersBar;

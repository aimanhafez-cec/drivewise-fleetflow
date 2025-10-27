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
import { Search, RefreshCw, X } from 'lucide-react';
import { sourceTypes } from '@/data/leadSources';

export interface LeadFiltersState {
  search: string;
  sourceType: string;
  status: string[];
  priority: string;
}

interface LeadFiltersProps {
  filters: LeadFiltersState;
  onFiltersChange: (filters: LeadFiltersState) => void;
  onReset: () => void;
  onRefresh: () => void;
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  { value: 'quoted', label: 'Quoted', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  { value: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
];

export const LeadFilters = ({ filters, onFiltersChange, onReset, onRefresh }: LeadFiltersProps) => {
  const toggleStatus = (status: string) => {
    const currentStatuses = filters.status;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.sourceType !== 'all' || 
    filters.status.length > 0 || 
    filters.priority !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by lead ID, name, email, phone..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onReset}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Status Quick Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        {statusOptions.map((status) => (
          <Badge
            key={status.value}
            variant={filters.status.includes(status.value) ? 'default' : 'outline'}
            className={`cursor-pointer transition-all ${
              filters.status.includes(status.value) 
                ? status.color 
                : 'hover:bg-muted'
            }`}
            onClick={() => toggleStatus(status.value)}
          >
            {status.label}
            {filters.status.includes(status.value) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </Badge>
        ))}
      </div>

      {/* Source Type and Priority Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filters.sourceType}
          onValueChange={(value) => onFiltersChange({ ...filters, sourceType: value })}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Source type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sourceTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

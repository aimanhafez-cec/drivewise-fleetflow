import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustodyFilters, CustodyStatus, CustodyReasonCode } from '@/lib/api/replacements';

interface ReplacementFiltersBarProps {
  filters: CustodyFilters;
  onFiltersChange: (filters: CustodyFilters) => void;
}

const ReplacementFiltersBar: React.FC<ReplacementFiltersBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: [value as CustodyStatus] });
    }
  };

  const handleReasonChange = (value: string) => {
    if (value === 'all') {
      const { reason_code, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, reason_code: [value as CustodyReasonCode] });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by custody number, notes..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status?.[0] || 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending_approval">Pending Approval</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="voided">Voided</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.reason_code?.[0] || 'all'}
        onValueChange={handleReasonChange}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Reason" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Reasons</SelectItem>
          <SelectItem value="accident">Accident</SelectItem>
          <SelectItem value="breakdown">Breakdown</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="damage">Damage</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default ReplacementFiltersBar;

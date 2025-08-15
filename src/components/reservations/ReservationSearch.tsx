import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface ReservationSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customer?: string;
}

export const ReservationSearch: React.FC<ReservationSearchProps> = ({ 
  onSearch, 
  isLoading = false 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onSearch({});
  };

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Primary search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, reservation number..."
                value={filters.query || ''}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="icon"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={handleSearch} disabled={isLoading}>
              Search
            </Button>
            {(filters.query || filters.status || filters.dateFrom || filters.dateTo) && (
              <Button onClick={handleClear} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select 
                value={filters.status || ''} 
                onValueChange={(value) => updateFilter('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />

              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
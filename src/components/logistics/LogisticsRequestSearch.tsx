import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';

export interface LogisticsSearchFilters {
  requestId?: string;
  type?: string;
  subtype?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

interface LogisticsRequestSearchProps {
  onSearch: (filters: LogisticsSearchFilters) => void;
  onReset: () => void;
}

export const LogisticsRequestSearch = ({ onSearch, onReset }: LogisticsRequestSearchProps) => {
  const [localFilters, setLocalFilters] = useState<LogisticsSearchFilters>({
    requestId: '',
    type: 'all',
    subtype: 'all',
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: '',
    location: '',
  });

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      requestId: '',
      type: 'all',
      subtype: 'all',
      status: 'all',
      priority: 'all',
      dateFrom: '',
      dateTo: '',
      location: '',
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const handleInputChange = (field: keyof LogisticsSearchFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request ID */}
          <div className="space-y-2">
            <Label htmlFor="requestId" className="text-sm font-medium text-muted-foreground">
              Request ID
            </Label>
            <Input
              id="requestId"
              placeholder="Search by Request ID..."
              value={localFilters.requestId}
              onChange={(e) => handleInputChange('requestId', e.target.value)}
            />
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-muted-foreground">
              Request Type
            </Label>
            <Select value={localFilters.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Contract-Related">Contract-Related</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="Maintenance Transfer">Maintenance Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Subtype */}
          <div className="space-y-2">
            <Label htmlFor="subtype" className="text-sm font-medium text-muted-foreground">
              Request Subtype
            </Label>
            <Select value={localFilters.subtype} onValueChange={(value) => handleInputChange('subtype', value)}>
              <SelectTrigger id="subtype">
                <SelectValue placeholder="All subtypes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subtypes</SelectItem>
                <SelectItem value="Vehicle Delivery">Vehicle Delivery</SelectItem>
                <SelectItem value="Vehicle Pick-up">Vehicle Pick-up</SelectItem>
                <SelectItem value="Refuel">Refuel</SelectItem>
                <SelectItem value="Wash">Wash</SelectItem>
                <SelectItem value="Tires & Batteries">Tires & Batteries</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-muted-foreground">
              Request Status
            </Label>
            <Select value={localFilters.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-sm font-medium text-muted-foreground">
              Request Date From
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={localFilters.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-sm font-medium text-muted-foreground">
              Request Date To
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={localFilters.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-muted-foreground">
              Priority
            </Label>
            <Select value={localFilters.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-muted-foreground">
              Location
            </Label>
            <Input
              id="location"
              placeholder="Search by location..."
              value={localFilters.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

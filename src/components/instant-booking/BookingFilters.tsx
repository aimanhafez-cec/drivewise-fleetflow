import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BookingFiltersProps {
  filters: {
    search: string;
    status: string;
    reservationType: string;
    dateFrom: string;
    dateTo: string;
    location: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const BookingFilters = ({ filters, onFilterChange }: BookingFiltersProps) => {
  const handleReset = () => {
    onFilterChange('search', '');
    onFilterChange('status', 'all');
    onFilterChange('reservationType', 'all');
    onFilterChange('dateFrom', '');
    onFilterChange('dateTo', '');
    onFilterChange('location', '');
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filter & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by RO#, Customer, Phone, Emirates ID..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_out">Active / Checked Out</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Reservation Type Filter */}
          <Select value={filters.reservationType} onValueChange={(value) => onFilterChange('reservationType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Reservation Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vehicle_class">Vehicle Class</SelectItem>
              <SelectItem value="make_model">Make + Model</SelectItem>
              <SelectItem value="specific_vin">Specific VIN</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From */}
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          />

          {/* Date To */}
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
          />
        </div>

        {/* Location Filter (Second Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
          <Select value={filters.location} onValueChange={(value) => onFilterChange('location', value)}>
            <SelectTrigger className="lg:col-span-2">
              <SelectValue placeholder="Pickup Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              <SelectItem value="Dubai Airport Terminal 1">Dubai Airport T1</SelectItem>
              <SelectItem value="Dubai Airport Terminal 2">Dubai Airport T2</SelectItem>
              <SelectItem value="Dubai Airport Terminal 3">Dubai Airport T3</SelectItem>
              <SelectItem value="Abu Dhabi Airport">Abu Dhabi Airport</SelectItem>
              <SelectItem value="Sharjah Airport">Sharjah Airport</SelectItem>
              <SelectItem value="Dubai Marina Branch">Dubai Marina</SelectItem>
              <SelectItem value="Downtown Dubai Branch">Downtown Dubai</SelectItem>
              <SelectItem value="Deira City Centre">Deira City Centre</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={handleReset}
            className="lg:col-start-6"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFilters;

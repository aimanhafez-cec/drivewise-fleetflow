import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Settings, MapPin, CreditCard } from 'lucide-react';
import BookingStatsCards from '@/components/instant-booking/BookingStatsCards';
import BookingsTable from '@/components/instant-booking/BookingsTable';
import BookingFilters from '@/components/instant-booking/BookingFilters';

const InstantBooking = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    reservationType: 'all',
    dateFrom: '',
    dateTo: '',
    location: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNewBooking = () => {
    // Will be implemented in Phase 2
    navigate('/instant-booking/new');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Instant Booking Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all instant bookings across your fleet
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/instant-booking/analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/instant-booking/settings')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Locations
            </Button>
            <Button
              variant="outline"
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Payment Gateway
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--chart-1))] hover:opacity-90 text-primary-foreground"
              onClick={handleNewBooking}
            >
              <Plus className="h-4 w-4" />
              New Instant Booking
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <BookingStatsCards />

        {/* Filters & Search */}
        <BookingFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Bookings Table */}
        <BookingsTable filters={filters} />
      </div>
    </div>
  );
};

export default InstantBooking;

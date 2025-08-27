import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calendar, MapPin, Zap } from 'lucide-react';
import { format, getMonth } from 'date-fns';
import { MONTHLY_TRENDS_CONFIG, VEHICLE_CATEGORY_COLORS } from '@/lib/chartConfig';
import { formatNumber, currencyTooltipFormatter } from '@/lib/utils/chartUtils';

interface PreferencesTrendsReportProps {
  dateRange?: DateRange;
}

const PreferencesTrendsReport: React.FC<PreferencesTrendsReportProps> = ({ dateRange }) => {
  const { data: vehiclePreferences, isLoading } = useQuery({
    queryKey: ['vehicle-preferences', dateRange],
    queryFn: async () => {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          id,
          vehicles!inner(
            id,
            make,
            model,
            categories(name)
          )
        `);

      if (error) throw error;

      // Count vehicle category preferences
      const categoryCount: Record<string, number> = {};
      const makeCount: Record<string, number> = {};

      reservations?.forEach(reservation => {
        const vehicle = reservation.vehicles;
        if (vehicle) {
          // Category preference
          const categoryName = vehicle.categories?.name || 'Uncategorized';
          categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;

          // Make preference
          const make = vehicle.make;
          makeCount[make] = (makeCount[make] || 0) + 1;
        }
      });

      const categories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count, percentage: (count / reservations.length) * 100 }))
        .sort((a, b) => b.count - a.count);

      const makes = Object.entries(makeCount)
        .map(([name, count]) => ({ name, count, percentage: (count / reservations.length) * 100 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return { categories, makes, totalReservations: reservations.length };
    },
  });

  const { data: seasonalTrends } = useQuery({
    queryKey: ['seasonal-trends', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('start_datetime, created_at')
        .order('start_datetime');

      if (error) throw error;

      // Group by month
      const monthlyBookings: Record<number, number> = {};
      data?.forEach(reservation => {
        const month = getMonth(new Date(reservation.start_datetime));
        monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
      });

      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      return monthNames.map((name, index) => ({
        month: name,
        bookings: monthlyBookings[index] || 0
      }));
    },
  });

  const { data: locationPreferences } = useQuery({
    queryKey: ['location-preferences', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('pickup_location, return_location');

      if (error) throw error;

      const locationCount: Record<string, number> = {};
      
      data?.forEach(reservation => {
        if (reservation.pickup_location) {
          locationCount[reservation.pickup_location] = (locationCount[reservation.pickup_location] || 0) + 1;
        }
        if (reservation.return_location && reservation.return_location !== reservation.pickup_location) {
          locationCount[reservation.return_location] = (locationCount[reservation.return_location] || 0) + 0.5;
        }
      });

      return Object.entries(locationCount)
        .map(([location, count]) => ({ location, count: Math.round(count) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  const { data: addOnPreferences } = useQuery({
    queryKey: ['addon-preferences', dateRange],
    queryFn: async () => {
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('add_ons')
        .not('add_ons', 'is', null);

      const { data: agreements, error: agreementsError } = await supabase
        .from('agreements')
        .select('add_ons')
        .not('add_ons', 'is', null);

      if (reservationsError || agreementsError) throw reservationsError || agreementsError;

      const addOnCount: Record<string, number> = {};
      let totalWithAddOns = 0;

      // Process reservations
      reservations?.forEach(reservation => {
        if (reservation.add_ons && Array.isArray(reservation.add_ons)) {
          reservation.add_ons.forEach((addOn: any) => {
            if (addOn.name) {
              addOnCount[addOn.name] = (addOnCount[addOn.name] || 0) + 1;
              totalWithAddOns++;
            }
          });
        }
      });

      // Process agreements
      agreements?.forEach(agreement => {
        if (agreement.add_ons && Array.isArray(agreement.add_ons)) {
          agreement.add_ons.forEach((addOn: any) => {
            if (addOn.name) {
              addOnCount[addOn.name] = (addOnCount[addOn.name] || 0) + 1;
              totalWithAddOns++;
            }
          });
        }
      });

      return Object.entries(addOnCount)
        .map(([name, count]) => ({ 
          name, 
          count, 
          percentage: totalWithAddOns > 0 ? (count / totalWithAddOns) * 100 : 0 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  const { data: bookingChannels } = useQuery({
    queryKey: ['booking-channels', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('booking_type');

      if (error) throw error;

      const channelCount: Record<string, number> = {};
      data?.forEach(reservation => {
        const type = reservation.booking_type || 'STANDARD';
        channelCount[type] = (channelCount[type] || 0) + 1;
      });

      return Object.entries(channelCount).map(([type, count]) => ({
        type: type === 'INSTANT' ? 'Instant Booking' : 'Standard Booking',
        count,
        percentage: data.length > 0 ? (count / data.length) * 100 : 0
      }));
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading preferences and trends data...</div>;
  }

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiclePreferences?.categories[0]?.name || 'N/A'}</div>
            <p className="text-xs text-card-foreground">
              {vehiclePreferences?.categories[0]?.percentage.toFixed(1)}% of all bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Season</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seasonalTrends && seasonalTrends.reduce((peak, current) => 
                current.bookings > peak.bookings ? current : peak
              ).month}
            </div>
            <p className="text-xs text-card-foreground">
              Highest booking month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationPreferences?.[0]?.location || 'N/A'}</div>
            <p className="text-xs text-card-foreground">
              {locationPreferences?.[0]?.count || 0} reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add-on Adoption</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {addOnPreferences && addOnPreferences.length > 0 
                ? `${addOnPreferences.reduce((sum, addon) => sum + addon.count, 0)}` 
                : '0'}
            </div>
            <p className="text-xs text-card-foreground">
              Total add-ons selected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vehicle Category Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Category Preferences</CardTitle>
            <CardDescription className='text-card-foreground'>Most popular vehicle categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={vehiclePreferences?.categories.slice(0, 6).reduce((acc, item, index) => ({
                ...acc,
                [item.name]: { 
                  label: item.name, 
                  color: VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length] 
                }
              }), {}) || {}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehiclePreferences?.categories.slice(0, 6)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(220, 91%, 60%)"
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Seasonal Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Booking Trends</CardTitle>
            <CardDescription className='text-card-foreground'>Bookings by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={MONTHLY_TRENDS_CONFIG}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke={MONTHLY_TRENDS_CONFIG.bookings.color}
                    strokeWidth={3}
                    dot={{ fill: MONTHLY_TRENDS_CONFIG.bookings.color, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Booking Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Channels</CardTitle>
            <CardDescription className='text-card-foreground'>Distribution of booking types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={bookingChannels?.reduce((acc, item, index) => ({
                ...acc,
                [item.type.toLowerCase().replace(' ', '_')]: { 
                  label: item.type, 
                  color: VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length] 
                }
              }), {}) || {}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingChannels}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="type"
                  >
                    {bookingChannels?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length]}
                        stroke="hsl(var(--background))" 
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Location Preferences</CardTitle>
            <CardDescription className='text-card-foreground'>Most popular pickup/return locations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                count: { label: "Reservations", color: "hsl(142, 76%, 36%)" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationPreferences} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="location" 
                    type="category" 
                    width={100}
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(142, 76%, 36%)"
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Add-ons Popularity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Add-ons</CardTitle>
          <CardDescription className='text-card-foreground'>Most frequently selected additional services</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className='bg-muted'>
              <TableRow>
                <TableHead>Add-on</TableHead>
                <TableHead>Times Selected</TableHead>
                <TableHead>Adoption Rate</TableHead>
                <TableHead>Popularity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addOnPreferences?.map((addon, index) => (
                <TableRow key={addon.name}>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>{addon.count}</TableCell>
                  <TableCell>{addon.percentage.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant={index < 3 ? "default" : "secondary"}>
                      {index < 3 ? "High" : "Medium"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesTrendsReport;
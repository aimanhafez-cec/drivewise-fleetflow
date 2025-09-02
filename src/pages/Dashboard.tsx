import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Car, Calendar, Users, DollarSign, AlertTriangle, Search, MapPin, Clock, CreditCard, Zap, Home, Bell, User, Settings, BarChart3, FileText, Package, Shield, Plus, TrendingUp, Menu, X, Calendar as CalendarIcon, BookOpen, Target, Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const navigate = useNavigate();
  const [customerSearchTerm, setCustomerSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Fetch current reservations count
  const {
    data: reservationsCount = 0
  } = useQuery({
    queryKey: ['dashboard-reservations-count'],
    queryFn: async () => {
      const {
        count,
        error
      } = await supabase.from('reservations').select('*', {
        count: 'exact',
        head: true
      }).in('status', ['confirmed', 'pending']);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch vehicle status data
  const {
    data: vehicleStatusData = []
  } = useQuery({
    queryKey: ['dashboard-vehicle-status'],
    queryFn: async () => {
      console.log('Fetching vehicle status data...');
      const {
        data,
        error
      } = await supabase.from('vehicles').select('status');
      if (error) {
        console.error('Error fetching vehicle status:', error);
        throw error;
      }

      console.log('Raw vehicle data:', data);

      // Count vehicles by status
      const statusCounts = data.reduce((acc, vehicle) => {
        const status = vehicle.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('Status counts:', statusCounts);

      // Transform to chart format
      const chartData = [{
        name: 'Available',
        value: statusCounts.available || 0,
        color: '#10B981'
      }, {
        name: 'Rented',
        value: statusCounts.rented || 0,
        color: '#33CFCF'
      }, {
        name: 'Maintenance',
        value: statusCounts.maintenance || 0,
        color: '#F59E0B'
      }, {
        name: 'Out of Service',
        value: statusCounts.out_of_service || 0,
        color: '#EF4444'
      }].filter(item => item.value > 0);

      console.log('Final chart data:', chartData);
      return chartData;
    }
  });

  // Search agreements by customer name
  const searchCustomerAgreements = async () => {
    if (!customerSearchTerm.trim()) return;
    try {
      const {
        data,
        error
      } = await supabase.from('agreements').select(`
          *,
          customers!inner(
            id,
            full_name,
            email,
            phone
          ),
          vehicles(
            make,
            model,
            year,
            license_plate
          )
        `).ilike('customers.full_name', `%${customerSearchTerm}%`).order('created_at', {
        ascending: false
      }).limit(5);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching agreements:', error);
      setSearchResults([]);
    }
  };
  const kpiStats = [{
    title: 'Reservations',
    value: reservationsCount.toString(),
    icon: Calendar,
    color: 'text-teal-accent',
    iconBg: 'bg-teal-overlay'
  }, {
    title: 'Returns',
    value: '0',
    icon: Car,
    color: 'text-available',
    iconBg: 'bg-teal-overlay'
  }, {
    title: 'On Rent',
    value: '14',
    icon: Car,
    color: 'text-teal-accent',
    iconBg: 'bg-teal-overlay'
  }, {
    title: 'Overdues',
    value: '14',
    icon: Clock,
    color: 'text-maintenance',
    iconBg: 'bg-teal-overlay'
  }, {
    title: 'Pending Payment',
    value: '8',
    icon: CreditCard,
    color: 'text-teal-accent',
    iconBg: 'bg-teal-overlay'
  }, {
    title: 'Service Alerts',
    value: '3',
    icon: AlertTriangle,
    color: 'text-destructive',
    iconBg: 'bg-teal-overlay'
  }];
  const quickActions = [{
    name: 'Reservations',
    icon: Calendar,
    path: '/reservations',
    description: 'Manage bookings'
  }, {
    name: 'Vehicles',
    icon: Car,
    path: '/vehicles',
    description: 'Fleet management'
  }, {
    name: 'Customers',
    icon: Users,
    path: '/customers',
    description: 'Customer database'
  }, {
    name: 'Reports',
    icon: BarChart3,
    path: '/reports',
    description: 'Analytics & insights'
  }, {
    name: 'Agreements',
    icon: FileText,
    path: '/agreements',
    description: 'Contract management'
  }, {
    name: 'Inspections',
    icon: Shield,
    path: '/inspections',
    description: 'Vehicle checks'
  }, {
    name: 'Planner',
    icon: CalendarIcon,
    path: '/planner',
    description: 'Schedule view'
  }, {
    name: 'Settings',
    icon: Settings,
    path: '/settings',
    description: 'System config'
  }];
  const appCards = [{
    name: 'Quick Book',
    icon: Zap,
    color: 'bg-teal-accent',
    path: '/instant-booking'
  }, {
    name: 'Reservations',
    icon: Calendar,
    color: 'bg-primary',
    path: '/reservations'
  }, {
    name: 'Fleet Status',
    icon: Car,
    color: 'bg-available',
    path: '/vehicles'
  }, {
    name: 'Revenue',
    icon: TrendingUp,
    color: 'bg-teal-light',
    path: '/reports'
  }, {
    name: 'Customers',
    icon: Users,
    color: 'bg-primary',
    path: '/customers'
  }, {
    name: 'Analytics',
    icon: BarChart3,
    color: 'bg-teal-accent',
    path: '/reports'
  }, {
    name: 'Maintenance',
    icon: Wrench,
    color: 'bg-maintenance',
    path: '/vehicles'
  }, {
    name: 'Agreements',
    icon: FileText,
    color: 'bg-primary',
    path: '/agreements'
  }, {
    name: 'Inspections',
    icon: Shield,
    color: 'bg-teal-light',
    path: '/inspections'
  }];
  
  const rateData = [{
    vehicleType: 'Full Size',
    mileage: 100,
    rate: 80
  }, {
    vehicleType: 'Mid-Size',
    mileage: 100,
    rate: 70
  }, {
    vehicleType: 'Mini Van',
    mileage: 100,
    rate: 20
  }, {
    vehicleType: 'SUV',
    mileage: 100,
    rate: 150
  }, {
    vehicleType: 'Luxury',
    mileage: 0,
    rate: 60
  }, {
    vehicleType: 'Sedan',
    mileage: 0,
    rate: 130
  }, {
    vehicleType: 'Compact',
    mileage: 0,
    rate: 10
  }];
  const salesData = [{
    name: 'Jan',
    previousTotal: 2000,
    total: 3000
  }, {
    name: 'Feb',
    previousTotal: 2500,
    total: 3200
  }, {
    name: 'Mar',
    previousTotal: 3000,
    total: 3800
  }, {
    name: 'Apr',
    previousTotal: 3200,
    total: 4200
  }, {
    name: 'May',
    previousTotal: 3500,
    total: 4500
  }, {
    name: 'Jun',
    previousTotal: 3800,
    total: 4800
  }];

  console.log('Vehicle status data for charts:', vehicleStatusData);
  console.log('Sales data for charts:', salesData);
  return <div className="w-full min-w-0 space-y-4 sm:space-y-6">
        {/* Main Content */}
        <div className="w-full">
          {/* Greeting */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Good morning, Fleet Manager</h1>
            <p className="text-white/80 text-sm sm:text-base">Manage your fleet operations efficiently</p>
          </div>

          {/* Apps Grid */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6">
              {appCards.map(app => <Card key={app.name} className="bg-card hover:bg-teal-light transition-all duration-300 cursor-pointer group border-0 shadow-card rounded-xl" onClick={() => navigate(app.path)}>
                  <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${app.color} group-hover:shadow-lg transition-shadow`}>
                      <app.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-black font-medium text-sm sm:text-base">{app.name}</h3>
                    </div>
                  </CardContent>
                </Card>)}
              
              {/* Add New Card */}
              <Card className="bg-transparent border-2 border-dashed border-teal-accent hover:bg-teal-overlay/20 transition-colors cursor-pointer group rounded-xl">
                <CardContent className="p-6 flex items-center justify-center gap-4">
                  <Plus className="h-6 w-6 text-teal-accent" />
                  <span className="text-teal-accent font-medium">Add New</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {kpiStats.map(stat => <Card key={stat.title} className="bg-card border-0 shadow-card rounded-xl">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-black/80 mb-1">{stat.title}</p>
                      <p className="text-lg sm:text-2xl font-bold text-black">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                      <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Quick Lookup */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-black">Quick Lookup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Select defaultValue="license">
                    <SelectTrigger className="w-32 bg-black/10 text-black border-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-black/20">
                      <SelectItem value="license" className="text-black">License No.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="License No." className="flex-1 bg-black/10 text-black placeholder:text-black/70 border-black/20" />
                  <Button className="bg-teal-accent hover:bg-teal-light text-white px-6">
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Agreement Search */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-black">Search Customer Agreements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter customer name..." className="flex-1 bg-black/10 text-black placeholder:text-black/70 border-black/20" value={customerSearchTerm} onChange={e => {
                  setCustomerSearchTerm(e.target.value);
                  searchCustomerAgreements();
                }} />
                  <Button className="bg-teal-accent hover:bg-teal-light text-black px-6" onClick={searchCustomerAgreements}>
                    Search
                  </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map(agreement => <div key={agreement.id} className="p-3 bg-teal-overlay/20 border border-teal-light rounded-lg hover:bg-teal-overlay/40 cursor-pointer transition-colors" onClick={() => navigate(`/agreements/${agreement.id}`)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-black">{agreement.customers?.full_name}</p>
                            <p className="text-sm text-black/80">
                              Agreement #{agreement.agreement_no || 'N/A'}
                            </p>
                            <p className="text-sm text-black/80">
                              {agreement.vehicles ? `${agreement.vehicles.year} ${agreement.vehicles.make} ${agreement.vehicles.model} (${agreement.vehicles.license_plate})` : 'No vehicle assigned'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-black">
                              AED {agreement.total_amount || '0.00'}
                            </p>
                            <p className="text-xs text-black/80 capitalize">
                              {agreement.status}
                            </p>
                          </div>
                        </div>
                      </div>)}
                  </div>}
                
                {customerSearchTerm && searchResults.length === 0 && <p className="text-black/80 text-sm mt-2">No agreements found for this customer.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Vehicle Status */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-black">Vehicle Status</CardTitle>
                <Select defaultValue="fullsize">
                  <SelectTrigger className="w-32 bg-black/10 text-black border-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-black/20">
                    <SelectItem value="fullsize" className="text-black">Full Size</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 flex-shrink-0 border border-black/20 rounded">
                    {vehicleStatusData.length > 0 ? (
                      <PieChart width={128} height={128}>
                        <Pie 
                          data={vehicleStatusData} 
                          cx={64} 
                          cy={64} 
                          innerRadius={40} 
                          outerRadius={60} 
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={1}
                        >
                          {vehicleStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#0A7A7D',
                            border: '1px solid #33CFCF',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }} 
                        />
                      </PieChart>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-black text-xs">
                        Loading chart...
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-black">
                        {vehicleStatusData.reduce((sum, item) => sum + item.value, 0)}
                      </span>
                      <span className="text-xs text-black/80">Total</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {vehicleStatusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-black">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-black">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Summary */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-black">Rate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-3 gap-2 mb-4">
                   <Select defaultValue="middletown">
                     <SelectTrigger className="bg-black/10 text-black border-black/20">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-card border-black/20">
                       <SelectItem value="middletown" className="text-black">Middletown</SelectItem>
                     </SelectContent>
                   </Select>
                   <Select defaultValue="base">
                     <SelectTrigger className="bg-black/10 text-black border-black/20">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-card border-black/20">
                       <SelectItem value="base" className="text-black">base</SelectItem>
                     </SelectContent>
                   </Select>
                   <Select defaultValue="daily">
                     <SelectTrigger className="bg-black/10 text-black border-black/20">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-card border-black/20">
                       <SelectItem value="daily" className="text-black">Daily</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary hover:bg-secondary border-teal-light">
                        <TableHead className="text-white font-medium">Vehicle Type</TableHead>
                        <TableHead className="text-white font-medium">Mileage</TableHead>
                        <TableHead className="text-white font-medium">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateData.map((row, index) => <TableRow key={index} className="border-teal-light hover:bg-teal-overlay/20">
                          <TableCell className="font-medium text-black">{row.vehicleType}</TableCell>
                           <TableCell className="text-black">{row.mileage}</TableCell>
                           <TableCell className="text-black">{row.rate}</TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Status */}
          <Card className="bg-card border-0 shadow-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-black">Sales Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full border border-black/20 rounded p-4">
                {salesData.length > 0 ? (
                  <AreaChart 
                    width={400}
                    height={200}
                    data={salesData} 
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,228,229,0.3)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#000000ff" 
                      fontSize={12}
                      tick={{ fill: '#000000ff' }}
                    />
                    <YAxis 
                      stroke="#000000ff" 
                      fontSize={12}
                      tick={{ fill: '#000000ff' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#0A7A7D',
                        border: '1px solid #33CFCF',
                        borderRadius: '8px',
                        color: '#000000ff'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="previousTotal" 
                      stackId="1" 
                      stroke="#007C7E" 
                      fill="#007C7E" 
                      fillOpacity={0.6} 
                      name="Previous Total" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stackId="2" 
                      stroke="#33CFCF" 
                      fill="#33CFCF" 
                      fillOpacity={0.8} 
                      name="Total" 
                    />
                  </AreaChart>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-white">
                    No sales data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>;
};
export default Dashboard;
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
      const {
        data,
        error
      } = await supabase.from('vehicles').select('status');
      if (error) throw error;

      // Count vehicles by status
      const statusCounts = data.reduce((acc, vehicle) => {
        const status = vehicle.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Transform to chart format
      return [{
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
  return <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="bg-secondary h-16 flex items-center justify-between px-6 shadow-soft">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden text-white hover:bg-teal-overlay" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-xl font-bold text-white">FleetMaster</div>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search vehicles, customers, reservations..." className="pl-10 bg-white text-gray-900 border-0 rounded-full shadow-sm" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white hover:bg-teal-overlay">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-teal-overlay relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-teal-overlay">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Quick Actions Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-teal-overlay/80 transition-all duration-300 min-h-[calc(100vh-4rem)] lg:block ${sidebarCollapsed ? 'fixed lg:relative' : 'hidden lg:block'} z-20`}>
          <div className="p-4">
            <h3 className={`text-white font-medium mb-4 ${sidebarCollapsed ? 'hidden' : 'block'}`}>Quick Actions</h3>
            <nav className="space-y-2">
              {quickActions.map(action => <button key={action.name} onClick={() => navigate(action.path)} className="w-full flex items-center gap-3 p-3 text-white hover:bg-teal-light rounded-lg transition-colors group">
                  <action.icon className="h-5 w-5 text-teal-accent group-hover:text-white transition-colors" />
                  {!sidebarCollapsed && <div className="text-left">
                      <div className="font-medium">{action.name}</div>
                      <div className="text-xs text-muted opacity-80">{action.description}</div>
                    </div>}
                </button>)}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Good morning, Fleet Manager</h1>
          </div>

          {/* Apps Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {appCards.map(app => <Card key={app.name} className="bg-card hover:bg-teal-light transition-all duration-300 cursor-pointer group border-0 shadow-card rounded-xl" onClick={() => navigate(app.path)}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${app.color} group-hover:shadow-lg transition-shadow`}>
                      <app.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{app.name}</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {kpiStats.map(stat => <Card key={stat.title} className="bg-card border-0 shadow-card rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Quick Lookup */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">Quick Lookup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Select defaultValue="license">
                    <SelectTrigger className="w-32 bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="license">License No.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="License No." className="flex-1 bg-white text-gray-900" />
                  <Button className="bg-teal-accent hover:bg-teal-light text-white px-6">
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Agreement Search */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">Search Customer Agreements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter customer name..." className="flex-1 bg-white text-gray-900" value={customerSearchTerm} onChange={e => {
                  setCustomerSearchTerm(e.target.value);
                  searchCustomerAgreements();
                }} />
                  <Button className="bg-teal-accent hover:bg-teal-light text-white px-6" onClick={searchCustomerAgreements}>
                    Search
                  </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map(agreement => <div key={agreement.id} className="p-3 bg-teal-overlay/20 border border-teal-light rounded-lg hover:bg-teal-overlay/40 cursor-pointer transition-colors" onClick={() => navigate(`/agreements/${agreement.id}`)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">{agreement.customers?.full_name}</p>
                            <p className="text-sm text-muted">
                              Agreement #{agreement.agreement_no || 'N/A'}
                            </p>
                            <p className="text-sm text-muted">
                              {agreement.vehicles ? `${agreement.vehicles.year} ${agreement.vehicles.make} ${agreement.vehicles.model} (${agreement.vehicles.license_plate})` : 'No vehicle assigned'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">
                              AED {agreement.total_amount || '0.00'}
                            </p>
                            <p className="text-xs text-muted capitalize">
                              {agreement.status}
                            </p>
                          </div>
                        </div>
                      </div>)}
                  </div>}
                
                {customerSearchTerm && searchResults.length === 0 && <p className="text-muted text-sm mt-2">No agreements found for this customer.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Vehicle Status */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Vehicle Status</CardTitle>
                <Select defaultValue="fullsize">
                  <SelectTrigger className="w-32 bg-white text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fullsize">Full Size</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                          {vehicleStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {vehicleStatusData.reduce((sum, item) => sum + item.value, 0)}
                      </span>
                      <span className="text-xs text-muted">Total</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    {vehicleStatusData.map((item, index) => <div key={index} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: item.color
                      }}></div>
                          <span className="text-sm text-white">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{item.value}</span>
                      </div>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Summary */}
            <Card className="bg-card border-0 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">Rate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Select defaultValue="middletown">
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="middletown">Middletown</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="base">
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">base</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="daily">
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
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
                          <TableCell className="font-medium text-white">{row.vehicleType}</TableCell>
                          <TableCell className="text-muted">{row.mileage}</TableCell>
                          <TableCell className="text-muted">{row.rate}</TableCell>
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
              <CardTitle className="text-white">Sales Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,228,229,0.3)" />
                    <XAxis dataKey="name" stroke="#C7E4E5" />
                    <YAxis stroke="#C7E4E5" />
                    <Tooltip contentStyle={{
                    backgroundColor: 'rgba(10,122,125,0.9)',
                    border: '1px solid #33CFCF',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }} />
                    <Area type="monotone" dataKey="previousTotal" stackId="1" stroke="#007C7E" fill="#007C7E" fillOpacity={0.6} name="Previous Total" />
                    <Area type="monotone" dataKey="total" stackId="2" stroke="#33CFCF" fill="#33CFCF" fillOpacity={0.8} name="Total" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>;
};
export default Dashboard;
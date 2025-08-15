import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Car, 
  Calendar, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Search,
  MapPin,
  Clock,
  CreditCard
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch current reservations count
  const { data: reservationsCount = 0 } = useQuery({
    queryKey: ['dashboard-reservations-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'pending']);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const kpiStats = [
    {
      title: 'Reservations',
      value: reservationsCount.toString(),
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Returns',
      value: '0', 
      icon: Car,
      color: 'bg-green-100 text-green-600',
      iconBg: 'bg-green-50'
    },
    {
      title: 'On Rent',
      value: '14',
      icon: Car,
      color: 'bg-cyan-100 text-cyan-600',
      iconBg: 'bg-cyan-50'
    },
    {
      title: 'Overdues',
      value: '14',
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
      iconBg: 'bg-amber-50'
    },
    {
      title: 'Pending Payment',
      value: '8',
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-600',
      iconBg: 'bg-purple-50'
    },
    {
      title: 'Service Alerts',
      value: '3',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      iconBg: 'bg-red-50'
    },
  ];

  const vehicleStatusData = [
    { name: 'Available', value: 1, color: '#10B981' },
    { name: 'In Service', value: 1, color: '#3B82F6' },
    { name: 'On Rent', value: 1, color: '#06B6D4' },
  ];

  const rateData = [
    { vehicleType: 'Full Size', mileage: 100, rate: 80 },
    { vehicleType: 'Mid-Size', mileage: 100, rate: 70 },
    { vehicleType: 'Mini Van', mileage: 100, rate: 20 },
    { vehicleType: 'SUV', mileage: 100, rate: 150 },
    { vehicleType: 'Luxury', mileage: 0, rate: 60 },
    { vehicleType: 'Sedan', mileage: 0, rate: 130 },
    { vehicleType: 'Compact', mileage: 0, rate: 10 },
  ];

  const salesData = [
    { name: 'Jan', previousTotal: 2000, total: 3000 },
    { name: 'Feb', previousTotal: 2500, total: 3200 },
    { name: 'Mar', previousTotal: 3000, total: 3800 },
    { name: 'Apr', previousTotal: 3200, total: 4200 },
    { name: 'May', previousTotal: 3500, total: 4500 },
    { name: 'Jun', previousTotal: 3800, total: 4800 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="middletown">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="middletown">Locations</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2"
            onClick={() => navigate('/reservations/new')}
          >
            Reservations
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2">
            Start Rental
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2">
            Inquiries
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiStats.map((stat, index) => (
          <Card key={stat.title} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[1]}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Lookup */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Quick Lookup</h3>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="license">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="license">License No.</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="License No." className="flex-1" />
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
              Search
            </Button>
          </div>
        </Card>

        {/* Quick Check-In Agreement */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Quick Check-In Agreement</h3>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Vehicle No." className="flex-1" />
            <Input placeholder="Agreement No." className="flex-1" />
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
              Search
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Vehicle Status</h3>
            <Select defaultValue="fullsize">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullsize">Full Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">1</span>
                <span className="text-xs text-gray-500">OnRent</span>
              </div>
            </div>
            <div className="flex-1">
              {vehicleStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Rate Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Rate Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Select defaultValue="middletown">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="middletown">Middletown</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="base">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">base</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800 hover:bg-slate-800">
                <TableHead className="text-white font-medium">Vehicle Type</TableHead>
                <TableHead className="text-white font-medium">Mileage</TableHead>
                <TableHead className="text-white font-medium">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.vehicleType}</TableCell>
                  <TableCell>{row.mileage}</TableCell>
                  <TableCell>{row.rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Sales Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Sales Status</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="previousTotal" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Previous Total"
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
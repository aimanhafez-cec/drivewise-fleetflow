import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Vehicles',
      value: '24',
      description: '3 available now',
      icon: Car,
      trend: '+2.5%',
    },
    {
      title: 'Active Reservations',
      value: '18',
      description: '5 starting today',
      icon: Calendar,
      trend: '+12.3%',
    },
    {
      title: 'Total Customers',
      value: '156',
      description: '8 new this month',
      icon: Users,
      trend: '+5.1%',
    },
    {
      title: 'Monthly Revenue',
      value: '$24,580',
      description: 'Goal: $25,000',
      icon: DollarSign,
      trend: '+8.2%',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'reservation',
      message: 'New reservation created for Toyota Camry',
      time: '2 minutes ago',
      icon: Calendar,
    },
    {
      id: 2,
      type: 'return',
      message: 'Vehicle returned: Honda Civic (Plate: ABC-123)',
      time: '15 minutes ago',
      icon: Car,
    },
    {
      id: 3,
      type: 'customer',
      message: 'New customer registered: John Smith',
      time: '1 hour ago',
      icon: Users,
    },
    {
      id: 4,
      type: 'alert',
      message: 'Vehicle maintenance due: Ford Explorer',
      time: '2 hours ago',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your rental business.
          </p>
        </div>
        <Button onClick={() => navigate('/reservations/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <span className="flex items-center text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your rental system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/reservations/new')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Create Reservation
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/vehicles/new')}
            >
              <Car className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/customers/new')}
            >
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/reports')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
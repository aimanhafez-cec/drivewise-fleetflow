import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Car, 
  Circle,
  ArrowRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { FleetKPIs } from '@/lib/api/admin-dashboard';

interface FleetStatusBoardProps {
  fleetData: FleetKPIs | undefined;
  isLoading: boolean;
}

export function FleetStatusBoard({ fleetData, isLoading }: FleetStatusBoardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </Card>
    );
  }

  if (!fleetData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load fleet data</p>
        </div>
      </Card>
    );
  }

  const statusData = [
    { 
      name: 'Available', 
      value: fleetData.availableVehicles, 
      color: '#10B981',
      status: 'available'
    },
    { 
      name: 'On Rent', 
      value: fleetData.onRentVehicles, 
      color: '#0EA5E9',
      status: 'rented'
    },
    { 
      name: 'Maintenance', 
      value: fleetData.maintenanceVehicles, 
      color: '#F59E0B',
      status: 'maintenance'
    },
    { 
      name: 'Out of Service', 
      value: fleetData.outOfServiceVehicles, 
      color: '#EF4444',
      status: 'out_of_service'
    }
  ];

  const handleStatusClick = (status: string) => {
    navigate(`/vehicles?status=${status}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-2xl font-bold" style={{ color: data.payload.color }}>
            {data.value}
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value / fleetData.totalFleetSize) * 100).toFixed(1)}% of fleet
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Car className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Fleet Status</h3>
            <p className="text-sm text-muted-foreground">Vehicle distribution</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/vehicles')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Fleet Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">
            {fleetData.totalFleetSize}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Vehicles</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {fleetData.utilizationRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Utilization Rate</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {fleetData.availabilityRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Availability Rate</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              onClick={(data) => handleStatusClick(data.status)}
              style={{ cursor: 'pointer' }}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status Legend with Click Actions */}
      <div className="space-y-3">
        {statusData.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => handleStatusClick(item.status)}
          >
            <div className="flex items-center gap-3">
              <Circle 
                className="h-3 w-3" 
                fill={item.color}
                stroke={item.color}
              />
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {item.value}
              </Badge>
              <span className="text-xs text-muted-foreground min-w-[50px] text-right">
                {((item.value / fleetData.totalFleetSize) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => navigate('/planner')}
        >
          <span>View Fleet Planner</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => navigate('/operations/custody')}
        >
          <span>Manage Custody</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

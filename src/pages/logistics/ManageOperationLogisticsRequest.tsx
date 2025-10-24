import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Download } from 'lucide-react';
import { NewLogisticsRequestSheet } from '@/components/logistics/NewLogisticsRequestSheet';
import { toast } from '@/hooks/use-toast';

const ManageOperationLogisticsRequest = () => {
  const [isNewRequestSheetOpen, setIsNewRequestSheetOpen] = useState(false);
  const [requests, setRequests] = useState([
    {
      id: 'LR-2024-001',
      type: 'Contract-Related',
      subtype: 'Vehicle Delivery',
      status: 'pending',
      location: 'Dubai Marina',
      date: '2024-01-20',
      priority: 'high',
    },
    {
      id: 'LR-2024-002',
      type: 'Maintenance Transfer',
      subtype: 'Maintenance Workshop',
      status: 'in-transit',
      location: 'Business Bay',
      date: '2024-01-19',
      priority: 'medium',
    },
    {
      id: 'LR-2024-003',
      type: 'Contract-Related',
      subtype: 'Vehicle Pick-up',
      status: 'completed',
      location: 'Downtown Dubai',
      date: '2024-01-18',
      priority: 'low',
    },
    {
      id: 'LR-2024-004',
      type: 'Internal',
      subtype: 'Wash',
      status: 'pending',
      location: 'Palm Jumeirah',
      date: '2024-01-20',
      priority: 'high',
    },
    {
      id: 'LR-2024-005',
      type: 'Internal',
      subtype: 'Refuel',
      status: 'in-transit',
      location: 'Jumeirah Beach',
      date: '2024-01-19',
      priority: 'urgent',
    },
  ]);

  const stats = [
    { title: 'Total Requests', value: '156', change: '+12%' },
    { title: 'Pending', value: '23', change: '+5%' },
    { title: 'In Transit', value: '45', change: '+8%' },
    { title: 'Completed', value: '88', change: '+15%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-transit':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'urgent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Contract-Related':
        return 'default';
      case 'Internal':
        return 'secondary';
      case 'Maintenance Transfer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Logistics Requests</h1>
          <p className="text-muted-foreground mt-1">
            Track and coordinate all logistics operations and transportation requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsNewRequestSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logistics Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subtype</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(request.type)}>
                      {request.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.subtype}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewLogisticsRequestSheet
        open={isNewRequestSheetOpen}
        onOpenChange={setIsNewRequestSheetOpen}
        onSuccess={(newRequest) => {
          setRequests((prev) => [newRequest, ...prev]);
          toast({
            title: "Success",
            description: "Logistics request created successfully",
          });
        }}
      />
    </div>
  );
};

export default ManageOperationLogisticsRequest;

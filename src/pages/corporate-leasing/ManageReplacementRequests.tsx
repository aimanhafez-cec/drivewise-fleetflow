import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Clock, CheckCircle, Timer, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReplacementRequest {
  id: string;
  agreementId: string;
  agreementRef: string;
  customer: string;
  currentVehicle: string;
  replacementVehicle: string | null;
  requestType: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  requestedDate: string;
  reason: string;
  requestedBy: string;
  tat: number;
}

const MOCK_REQUESTS: ReplacementRequest[] = [
  {
    id: 'RR-2025-1801',
    agreementId: 'CA-2025-1234',
    agreementRef: 'Corporate Agreement - Etisalat Fleet',
    customer: 'Etisalat UAE',
    currentVehicle: 'DXB-AA-1234 (WBADT43452GZ12345)',
    replacementVehicle: 'DXB-BB-5678 (WBADT43452GZ67890)',
    requestType: 'Maintenance',
    priority: 'high',
    status: 'in_progress',
    requestedDate: '2025-10-20',
    reason: 'Scheduled maintenance - Engine service',
    requestedBy: 'Fleet Manager',
    tat: 4,
  },
  {
    id: 'RR-2025-1802',
    agreementId: 'CA-2025-1235',
    agreementRef: 'Corporate Agreement - Emirates NBD',
    customer: 'Emirates NBD',
    currentVehicle: 'DXB-CC-3456 (WBAGG234567891011)',
    replacementVehicle: null,
    requestType: 'Accident',
    priority: 'critical',
    status: 'pending_approval',
    requestedDate: '2025-10-23',
    reason: 'Minor accident - Front bumper damage',
    requestedBy: 'Operations Manager',
    tat: 1,
  },
  {
    id: 'RR-2025-1803',
    agreementId: 'CA-2025-1236',
    agreementRef: 'Corporate Agreement - du Telecom',
    customer: 'du Telecom',
    currentVehicle: 'DXB-DD-7890 (WBADT43452GZ54321)',
    replacementVehicle: 'DXB-EE-2345 (WBADT43452GZ09876)',
    requestType: 'Upgrade',
    priority: 'normal',
    status: 'completed',
    requestedDate: '2025-09-15',
    reason: 'Customer requested vehicle upgrade',
    requestedBy: 'Account Manager',
    tat: 3,
  },
  {
    id: 'RR-2025-1804',
    agreementId: 'CA-2025-1237',
    agreementRef: 'Corporate Agreement - ADNOC',
    customer: 'ADNOC Distribution',
    currentVehicle: 'AUH-FF-4567 (WBADT43452GZ11223)',
    replacementVehicle: 'AUH-GG-8901 (WBADT43452GZ33445)',
    requestType: 'Breakdown',
    priority: 'critical',
    status: 'in_progress',
    requestedDate: '2025-10-22',
    reason: 'Engine failure - Requires immediate replacement',
    requestedBy: 'Fleet Coordinator',
    tat: 2,
  },
  {
    id: 'RR-2025-1805',
    agreementId: 'CA-2025-1238',
    agreementRef: 'Corporate Agreement - Aramex',
    customer: 'Aramex PJSC',
    currentVehicle: 'SHJ-HH-6789 (WBADT43452GZ99887)',
    replacementVehicle: null,
    requestType: 'Customer Request',
    priority: 'normal',
    status: 'approved',
    requestedDate: '2025-10-21',
    reason: 'Customer prefers different vehicle class',
    requestedBy: 'Customer Service',
    tat: 3,
  },
];

const ManageReplacementRequests: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredRequests = MOCK_REQUESTS.filter((request) => {
    const matchesSearch =
      searchTerm === '' ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.currentVehicle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.requestType.toLowerCase() === typeFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending_approval':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Replacement Requests</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage vehicle replacement requests for corporate leasing agreements
          </p>
        </div>
        <Button onClick={() => navigate('/corporate-leasing-operations/replacement-requests/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Replacement Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold mt-1">7</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold mt-1">12</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed (30d)</p>
              <p className="text-2xl font-bold mt-1">45</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average TAT</p>
              <p className="text-2xl font-bold mt-1">2.3 days</p>
            </div>
            <Timer className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Request ID, Customer, or Vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Request Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="breakdown">Breakdown</SelectItem>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="customer request">Customer Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Agreement</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Current Vehicle</TableHead>
              <TableHead>Replacement Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>TAT (Days)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No replacement requests found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first replacement request for a corporate leasing agreement'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && priorityFilter === 'all' && (
                    <Button onClick={() => navigate('/corporate-leasing-operations/replacement-requests/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Replacement Request
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/corporate-leasing-operations/replacement-requests/${request.id}`)}
                >
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{request.agreementRef}</TableCell>
                  <TableCell>{request.customer}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{request.currentVehicle}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {request.replacementVehicle || <span className="text-muted-foreground italic">Not assigned</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.requestType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(request.priority)}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status)}>{formatStatus(request.status)}</Badge>
                  </TableCell>
                  <TableCell>{new Date(request.requestedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={request.tat > 3 ? 'text-orange-600 font-semibold' : ''}>{request.tat}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ManageReplacementRequests;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Filter, Download, Truck, Clock, Navigation, CheckCircle, Eye } from 'lucide-react';
import { NewLogisticsRequestSheet } from '@/components/logistics/NewLogisticsRequestSheet';
import { toast } from '@/hooks/use-toast';

const ManageOperationLogisticsRequest = () => {
  const [isNewRequestSheetOpen, setIsNewRequestSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
  });
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState([
    {
      id: 'LR-2025-1847',
      type: 'Contract-Related',
      subtype: 'Vehicle Delivery',
      status: 'pending',
      location: 'Dubai Marina',
      date: '2025-10-24',
      priority: 'high',
    },
    {
      id: 'LR-2025-1842',
      type: 'Internal',
      subtype: 'Refuel',
      status: 'in-transit',
      location: 'Sheikh Zayed Road',
      date: '2025-10-23',
      priority: 'medium',
    },
    {
      id: 'LR-2025-1835',
      type: 'Contract-Related',
      subtype: 'Vehicle Pick-up',
      status: 'completed',
      location: 'Downtown Dubai',
      date: '2025-10-21',
      priority: 'normal',
    },
  ]);

  const stats = [
    { title: 'Total Requests', value: '3', icon: Truck },
    { title: 'Pending', value: '1', icon: Clock },
    { title: 'In Transit', value: '1', icon: Navigation },
    { title: 'Completed', value: '1', icon: CheckCircle },
  ];

  const filteredRequests = requests.filter(request => {
    if (filters.type !== 'all' && request.type !== filters.type) return false;
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.priority !== 'all' && request.priority !== filters.priority) return false;
    return true;
  });

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

  const getFullRequestData = (requestId: string) => {
    const fullDataMap: Record<string, any> = {
      'LR-2025-1847': {
        requestReference: 'LR-2025-1847',
        type: 'Contract-Related',
        subtype: 'Vehicle Delivery',
        priority: 'high',
        emirate: 'Dubai',
        owningBranch: 'Dubai Marina Branch',
        contractNumber: 'CNT-2025-3421',
        contractLine: 'Line 1',
        customer: 'Ahmed Al Mansoori',
        customerType: 'Individual - Premium',
        contractType: 'Yearly',
        contractStatus: 'Active',
        contractPeriod: '2024-06-01 to 2026-06-01',
        vehicleId: 'VEH-LC-5678',
        deliveryLocationType: 'Customer Site',
        siteName: 'Ocean Heights Tower',
        siteAddress: 'Unit 2304, Ocean Heights Tower, Dubai Marina, Dubai',
        customerSiteEmirate: 'Dubai',
        customerSiteArea: 'Dubai Marina',
        customerSiteBuilding: 'Ocean Heights Tower',
        customerSiteLandmark: 'Near Dubai Marina Mall',
        customerSiteFloor: '23rd Floor',
        customerSiteGPS: '25.0819° N, 55.1400° E',
        customerSiteBestAccessTime: '10:00 AM - 12:00 PM',
        customerSiteParkingNotes: 'Visitor parking available in basement level B2',
        siteContactName: 'Ahmed Al Mansoori',
        siteContactMobile: '+971 50 234 5678',
        siteAccessNotes: 'Call customer upon arrival. Security clearance required.',
        requestedDate: '2025-10-24',
        windowFrom: '10:00',
        windowTo: '12:00',
        internalNotes: 'VIP customer - white glove delivery service. Vehicle should be fully detailed and fueled. Customer requested morning delivery to avoid traffic.',
        requestedBy: 'Mariam Hassan',
        requestorDepartment: 'Customer Service',
        requestorContact: '+971 4 123 4567',
      },
      
      'LR-2025-1842': {
        requestReference: 'LR-2025-1842',
        type: 'Internal',
        subtype: 'Refuel',
        priority: 'medium',
        emirate: 'Dubai',
        owningBranch: 'Dubai Marina Branch',
        associateWithContract: false,
        vehicleId: 'VEH-NP-7893',
        startLocationType: 'Our Office',
        startOffice: 'Dubai Marina Branch',
        endLocationType: 'Address',
        endAddress: 'ENOC Petrol Station, Sheikh Zayed Road (Near Mall of the Emirates), Dubai',
        locationNotes: 'Station 24 - has fleet card reader. Use lane 3 for commercial vehicles.',
        refuelTarget: 'Full Tank',
        fuelType: 'Special 95',
        fuelStation: 'ENOC Sheikh Zayed Road Branch 24',
        paymentMethod: 'Fleet Card',
        refuelNotes: 'Vehicle returning to fleet after refuel. Fill tank completely. Current fuel level: 15%',
        assignmentMode: 'Auto-Assign',
        preferredOriginBranch: 'Dubai Marina Branch',
        internalRunFee: '50',
        partsMaterialsEst: '280',
        requestedDate: '2025-10-23',
        windowFrom: '14:00',
        windowTo: '15:30',
        internalNotes: 'Vehicle has 15% fuel remaining. Driver currently en route to station. ETA: 2:45 PM',
        requestedBy: 'Omar Khalid',
        requestorDepartment: 'Fleet Management',
        requestorContact: '+971 4 234 5678',
      },
      
      'LR-2025-1835': {
        requestReference: 'LR-2025-1835',
        type: 'Contract-Related',
        subtype: 'Vehicle Pick-up',
        priority: 'normal',
        emirate: 'Dubai',
        owningBranch: 'Business Bay Branch',
        contractNumber: 'CNT-2025-3387',
        contractLine: 'Line 2',
        customer: 'Falcon Trading LLC',
        customerType: 'Corporate - Standard',
        contractType: 'Monthly',
        contractStatus: 'Completed',
        contractPeriod: '2024-10-21 to 2025-10-21',
        vehicleId: 'VEH-HA-4521',
        deliveryLocationType: 'Customer Site',
        siteName: 'Burj Plaza',
        siteAddress: 'Tower B, Office 1507, Burj Plaza, Downtown Dubai, Dubai',
        customerSiteEmirate: 'Dubai',
        customerSiteArea: 'Downtown Dubai',
        customerSiteBuilding: 'Burj Plaza - Tower B',
        customerSiteLandmark: 'Behind Dubai Mall, near Burj Khalifa',
        customerSiteFloor: '15th Floor',
        customerSiteGPS: '25.1972° N, 55.2744° E',
        customerSiteBestAccessTime: '2:00 PM - 4:00 PM',
        customerSiteParkingNotes: 'Commercial parking in Tower B basement. Access via service entrance.',
        siteContactName: 'Khalid Bin Saleh',
        siteContactMobile: '+971 4 567 8901',
        siteAccessNotes: 'Contact customer 15 minutes before arrival. Security registration required at lobby.',
        returnDestType: 'Our Office',
        returnOffice: 'Business Bay Branch',
        returnSiteAccessNotes: 'Standard return to fleet. Vehicle condition: Good. All documentation signed.',
        requestedDate: '2025-10-21',
        windowFrom: '14:00',
        windowTo: '16:00',
        internalNotes: 'End of contract period. Customer reported no issues. Vehicle in excellent condition. Completed pick-up at 3:15 PM. Vehicle returned to Business Bay depot at 3:45 PM.',
        requestedBy: 'Sara Abdullah',
        requestorDepartment: 'Operations',
        requestorContact: '+971 4 345 6789',
      }
    };
    
    return fullDataMap[requestId];
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
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
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
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
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
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsViewMode(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Logistics Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Contract-Related">Contract-Related</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setFilters({ type: 'all', status: 'all', priority: 'all' });
              setIsFilterOpen(false);
            }}>
              Clear Filters
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewLogisticsRequestSheet
        open={isViewMode}
        onOpenChange={setIsViewMode}
        mode="view"
        requestData={selectedRequest ? getFullRequestData(selectedRequest.id) : null}
      />

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

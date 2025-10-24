import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Car, Clock, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ReplacementRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data for demonstration
  const request = {
    id: 'RR-2025-1801',
    agreementId: 'CA-2025-1234',
    agreementRef: 'Corporate Agreement - Etisalat Fleet',
    customer: 'Etisalat UAE',
    status: 'in_progress',
    requestType: 'Maintenance',
    priority: 'high',
    requestedDate: '2025-10-20',
    expectedDate: '2025-10-25',
    requestedBy: 'Fleet Manager',
    department: 'Fleet Operations',
    reason: 'Scheduled maintenance - Engine service',
    description: 'Vehicle requires scheduled 50,000 km service including engine oil change, filter replacements, and comprehensive inspection. Estimated duration: 3-5 days.',
    currentVehicle: {
      vin: 'WBADT43452GZ12345',
      plate: 'DXB-AA-1234',
      make: 'BMW',
      model: '5 Series',
      year: 2023,
      class: 'Executive Sedan',
      itemCode: 'BMW-5S-2023',
      odometer: 48500,
      location: 'Corporate Fleet Yard - Dubai',
    },
    replacementVehicle: {
      vin: 'WBADT43452GZ67890',
      plate: 'DXB-BB-5678',
      make: 'BMW',
      model: '5 Series',
      year: 2024,
      class: 'Executive Sedan',
      itemCode: 'BMW-5S-2024',
      odometer: 5200,
      location: 'Available Fleet Pool - Dubai',
      assignmentDate: '2025-10-21',
      handoverLocation: 'Dubai - Main Branch',
    },
    timeline: [
      {
        date: '2025-10-20 09:30',
        user: 'Fleet Manager',
        action: 'Request Created',
        notes: 'Initial replacement request submitted',
      },
      {
        date: '2025-10-20 14:15',
        user: 'Operations Manager',
        action: 'Request Approved',
        notes: 'Approved for maintenance replacement',
      },
      {
        date: '2025-10-21 10:00',
        user: 'Fleet Coordinator',
        action: 'Vehicle Assigned',
        notes: 'Replacement vehicle DXB-BB-5678 assigned',
      },
      {
        date: '2025-10-21 15:30',
        user: 'Service Manager',
        action: 'Status Updated to In Progress',
        notes: 'Current vehicle received at service center',
      },
    ],
    financialImpact: {
      rateAdjustment: 0,
      additionalCharges: 0,
      credits: 0,
      totalImpact: 0,
      notes: 'No rate adjustment - covered under maintenance agreement',
    },
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending_approval':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'normal':
        return 'secondary';
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/corporate-leasing-operations/replacement-requests')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{request.id}</h1>
            <p className="text-muted-foreground mt-1">Replacement Request Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(request.status)} className="text-base px-4 py-1">
            {formatStatus(request.status)}
          </Badge>
          {request.status === 'pending_approval' && (
            <>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {request.status === 'approved' && (
            <>
              <Button variant="outline">Cancel</Button>
              <Button>Assign Vehicle</Button>
            </>
          )}
          {request.status === 'in_progress' && (
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Replacement
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Request ID</p>
                <p className="font-medium">{request.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Request Date</p>
                <p className="font-medium">{new Date(request.requestedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agreement</p>
                <p className="font-medium text-primary cursor-pointer hover:underline">{request.agreementRef}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium text-primary cursor-pointer hover:underline">{request.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Request Type</p>
                <Badge variant="outline">{request.requestType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge variant={getPriorityBadgeVariant(request.priority)}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{request.department}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Expected Completion</p>
                <p className="font-medium">{new Date(request.expectedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Current Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium">{request.currentVehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plate Number</p>
                <p className="font-medium">{request.currentVehicle.plate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Make & Model</p>
                <p className="font-medium">
                  {request.currentVehicle.make} {request.currentVehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{request.currentVehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Class</p>
                <p className="font-medium">{request.currentVehicle.class}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Item Code</p>
                <p className="font-medium">{request.currentVehicle.itemCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Odometer</p>
                <p className="font-medium">{request.currentVehicle.odometer.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{request.currentVehicle.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replacement Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Replacement Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium">{request.replacementVehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plate Number</p>
                <p className="font-medium">{request.replacementVehicle.plate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Make & Model</p>
                <p className="font-medium">
                  {request.replacementVehicle.make} {request.replacementVehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{request.replacementVehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Class</p>
                <p className="font-medium">{request.replacementVehicle.class}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Item Code</p>
                <p className="font-medium">{request.replacementVehicle.itemCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Odometer</p>
                <p className="font-medium">{request.replacementVehicle.odometer.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assignment Date</p>
                <p className="font-medium">{new Date(request.replacementVehicle.assignmentDate).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Handover Location</p>
                <p className="font-medium">{request.replacementVehicle.handoverLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Reason</p>
              <p className="font-medium">{request.reason}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Detailed Description</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.timeline.map((entry, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {index < request.timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {entry.user}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Impact */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rate Adjustment</p>
                <p className="text-2xl font-bold">AED {request.financialImpact.rateAdjustment}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Additional Charges</p>
                <p className="text-2xl font-bold">AED {request.financialImpact.additionalCharges}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Applied</p>
                <p className="text-2xl font-bold text-green-600">AED {request.financialImpact.credits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impact</p>
                <p className="text-2xl font-bold">AED {request.financialImpact.totalImpact}</p>
              </div>
              <div className="col-span-4">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{request.financialImpact.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReplacementRequestDetail;

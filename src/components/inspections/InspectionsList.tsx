import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ClipboardCheck, 
  Eye, 
  Edit, 
  Download, 
  MapPin, 
  Clock,
  Car,
  FileText
} from "lucide-react";

interface UnifiedInspection {
  id: string;
  type: 'OUT' | 'IN' | 'LEGACY';
  status: string;
  performed_at: string;
  inspection_date?: string;
  agreement_id?: string;
  vehicle_id?: string;
  location_id?: string;
  agreements?: {
    agreement_no: string;
    vehicle_id: string;
  };
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  reservations?: {
    ro_number: string;
  };
  checklist?: any;
  metrics?: any;
  damage_marker_ids?: string[];
}

interface InspectionsListProps {
  inspections: UnifiedInspection[];
  isLoading: boolean;
}

export const InspectionsList: React.FC<InspectionsListProps> = ({
  inspections,
  isLoading,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'locked':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'draft':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'passed':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'failed':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'needs_attention':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OUT':
        return <ClipboardCheck className="h-4 w-4 text-blue-600" />;
      case 'IN':
        return <ClipboardCheck className="h-4 w-4 text-green-600" />;
      case 'LEGACY':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <ClipboardCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVehicleInfo = (inspection: UnifiedInspection) => {
    if (inspection.vehicles) {
      return `${inspection.vehicles.make} ${inspection.vehicles.model} (${inspection.vehicles.year})`;
    }
    return inspection.agreements?.vehicle_id?.slice(0, 8) || 'N/A';
  };

  const getAgreementInfo = (inspection: UnifiedInspection) => {
    if (inspection.agreements?.agreement_no) {
      return inspection.agreements.agreement_no;
    }
    if (inspection.reservations?.ro_number) {
      return inspection.reservations.ro_number;
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inspections.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No inspections found</h3>
          <p className="text-muted-foreground mb-4">
            No inspections match your current filters.
          </p>
          <Button onClick={() => navigate("/inspections/new")}>
            Create New Inspection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inspection</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Agreement/Reservation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((inspection) => (
              <TableRow key={inspection.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {getTypeIcon(inspection.type)}
                    <div>
                      <p className="font-medium">
                        {inspection.type} #{inspection.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inspection.type === 'OUT' ? 'Check-Out' : 
                         inspection.type === 'IN' ? 'Check-In' : 'Standard'} Inspection
                      </p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{getVehicleInfo(inspection)}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm">{getAgreementInfo(inspection)}</span>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(inspection.performed_at || inspection.inspection_date || '')}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {inspection.location_id ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{inspection.location_id}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status || 'Unknown'}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/inspections/${inspection.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {inspection.status === 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/inspections/${inspection.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {inspection.status === 'LOCKED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement PDF download
                          console.log('Download PDF for', inspection.id);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
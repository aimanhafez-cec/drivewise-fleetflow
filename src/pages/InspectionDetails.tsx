import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardCheck, Download, Edit, MapPin, User, Clock } from "lucide-react";
import { InspectionWizard } from "@/components/inspection/InspectionWizard";

interface InspectionOutData {
  id: string;
  type: 'OUT';
  status: string;
  performed_at: string;
  agreement_id: string;
  line_id: string;
  location_id?: string;
  checklist?: any;
  metrics?: any;
  damage_marker_ids?: string[];
  notes?: string;
  agreements?: {
    agreement_no: string;
    vehicle_id: string;
  };
}

interface InspectionInData {
  id: string;
  type: 'IN';
  status: string;
  performed_at: string;
  agreement_id: string;
  line_id: string;
  location_id?: string;
  checklist?: any;
  metrics?: any;
  damage_marker_ids?: string[];
  notes?: string;
  agreements?: {
    agreement_no: string;
    vehicle_id: string;
  };
}

interface InspectionLegacyData {
  id: string;
  type: 'LEGACY';
  status: string;
  inspection_date: string;
  vehicle_id: string;
  reservation_id?: string;
  odometer?: number;
  fuel_level?: number;
  notes?: string;
  checklist?: any;
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  reservations?: {
    ro_number: string;
  };
}

type InspectionData = InspectionOutData | InspectionInData | InspectionLegacyData;

const InspectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [inspectionType, setInspectionType] = useState<'OUT' | 'IN'>('OUT');

  useEffect(() => {
    document.title = `Inspection Details | Core Car Rental`;
  }, []);

  // Query both inspection tables to find the inspection
  const { data: inspection, isLoading, error } = useQuery<InspectionData | null>({
    queryKey: ["inspection-details", id],
    queryFn: async () => {
      if (!id) return null;

      // Try inspection_out first
      let { data: outData, error: outError } = await supabase
        .from("inspection_out")
        .select(`
          id, status, performed_at, agreement_id, line_id, location_id, 
          checklist, metrics, damage_marker_ids, created_at, updated_at
        `)
        .eq("id", id)
        .single();

      if (outData && !outError) {
        return { 
          id: outData.id,
          type: 'OUT' as const,
          status: outData.status,
          performed_at: outData.performed_at,
          agreement_id: outData.agreement_id,
          line_id: outData.line_id,
          location_id: outData.location_id,
          checklist: outData.checklist,
          metrics: outData.metrics,
          damage_marker_ids: outData.damage_marker_ids
        };
      }

      // Try inspection_in
      let { data: inData, error: inError } = await supabase
        .from("inspection_in")
        .select(`
          id, status, performed_at, agreement_id, line_id, location_id, 
          checklist, metrics, damage_marker_ids, created_at, updated_at
        `)
        .eq("id", id)
        .single();

      if (inData && !inError) {
        return {
          id: inData.id,
          type: 'IN' as const,
          status: inData.status,
          performed_at: inData.performed_at,
          agreement_id: inData.agreement_id,
          line_id: inData.line_id,
          location_id: inData.location_id,
          checklist: inData.checklist,
          metrics: inData.metrics,
          damage_marker_ids: inData.damage_marker_ids
        };
      }

      // Try legacy inspections table
      let { data: legacyData, error: legacyError } = await supabase
        .from("inspections")
        .select(`
          *,
          vehicles(make, model, year, license_plate),
          reservations(ro_number)
        `)
        .eq("id", id)
        .single();

      if (legacyData && !legacyError) {
        return { ...legacyData, type: 'LEGACY' } as InspectionLegacyData;
      }

      throw new Error("Inspection not found");
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inspection details...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/inspections")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">The requested inspection could not be found.</p>
            <Button onClick={() => navigate("/inspections")} className="mt-4">
              Back to Inspections
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const canEdit = inspection.status === 'DRAFT';
  const isModern = inspection.type !== 'LEGACY';

  const handleEditClick = () => {
    if (inspection.type === 'OUT' || inspection.type === 'IN') {
      setInspectionType(inspection.type);
      setShowWizard(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/inspections")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inspection Details
            </h1>
            <p className="text-muted-foreground">
              {inspection.type} Inspection #{id?.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={handleEditClick} variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Continue Editing
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Status and Basic Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(inspection.status)}>
              {inspection.status || 'Unknown'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{inspection.type} Inspection</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(
                  inspection.type === 'LEGACY' 
                    ? inspection.inspection_date 
                    : inspection.performed_at
                ).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreement/Vehicle Info */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle & Agreement Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isModern && inspection.agreements && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Agreement</Label>
                <p className="text-sm text-muted-foreground">
                  {inspection.agreements.agreement_no}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Vehicle ID</Label>
                <p className="text-sm text-muted-foreground">
                  {inspection.agreements.vehicle_id}
                </p>
              </div>
            </div>
          )}

          {inspection.type === 'LEGACY' && inspection.vehicles && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Vehicle</Label>
                <p className="text-sm text-muted-foreground">
                  {inspection.vehicles.make} {inspection.vehicles.model} ({inspection.vehicles.year})
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">License Plate</Label>
                <p className="text-sm text-muted-foreground">
                  {inspection.vehicles.license_plate}
                </p>
              </div>
            </div>
          )}

          {inspection.type !== 'LEGACY' && inspection.location_id && (
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {inspection.location_id}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      {inspection.type !== 'LEGACY' && inspection.metrics && Object.keys(inspection.metrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inspection Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(inspection.metrics).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <p className="text-sm text-muted-foreground">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy Metrics */}
      {inspection.type === 'LEGACY' && (inspection.odometer || inspection.fuel_level) && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {inspection.odometer && (
                <div>
                  <Label className="text-sm font-medium">Odometer</Label>
                  <p className="text-sm text-muted-foreground">{inspection.odometer}</p>
                </div>
              )}
              {inspection.fuel_level && (
                <div>
                  <Label className="text-sm font-medium">Fuel Level</Label>
                  <p className="text-sm text-muted-foreground">{inspection.fuel_level}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Results */}
      {inspection.checklist && Object.keys(inspection.checklist).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(inspection.checklist).map(([item, result]) => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm capitalize">
                    {item.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant={result === true ? "default" : result === false ? "destructive" : "secondary"}>
                    {result === true ? "Pass" : result === false ? "Fail" : String(result)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {inspection.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {inspection.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Damage Markers */}
      {inspection.type !== 'LEGACY' && inspection.damage_marker_ids && inspection.damage_marker_ids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Damage Markers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {inspection.damage_marker_ids.length} damage marker(s) associated with this inspection
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Wizard Modal */}
      {showWizard && canEdit && inspection.type !== 'LEGACY' && (
        <InspectionWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          agreementId={inspection.agreement_id}
          lineId={inspection.line_id}
          inspectionType={inspectionType}
        />
      )}
    </div>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <div className={className}>{children}</div>
);

export default InspectionDetails;
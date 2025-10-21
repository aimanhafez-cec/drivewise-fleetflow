import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, FileText, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface AgreementInspectionTabProps {
  agreement: any;
}

export const AgreementInspectionTab: React.FC<AgreementInspectionTabProps> = ({ agreement }) => {
  // Fetch check-out inspection
  const { data: checkoutInspection } = useQuery({
    queryKey: ['inspection:out', agreement.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspection_out')
        .select('*')
        .eq('agreement_id', agreement.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch damage markers
  const { data: damageMarkers } = useQuery({
    queryKey: ['damage-markers', agreement.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_markers')
        .select('*')
        .eq('agreement_id', agreement.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const renderInspectionDetails = (inspection: any, type: 'checkout' | 'checkin') => {
    if (!inspection) {
      return (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {type === 'checkout' ? 'No check-out inspection performed yet' : 'No check-in inspection performed yet'}
          </p>
          {type === 'checkout' && agreement.status === 'draft' && (
            <Button className="mt-4">Perform Check-Out Inspection</Button>
          )}
        </div>
      );
    }

    const metrics = inspection.metrics || {};
    const checklist = inspection.checklist || {};

    return (
      <div className="space-y-6">
        {/* Inspection Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inspection Details</CardTitle>
                <CardDescription>
                  Performed on {format(new Date(inspection.performed_at), 'MMM dd, yyyy HH:mm')}
                </CardDescription>
              </div>
              <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
                {inspection.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Fuel Level</p>
                <p className="font-medium">{metrics.fuel_level || 'N/A'}/8</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Odometer Reading</p>
                <p className="font-medium">{metrics.odometer_reading?.toLocaleString() || 'N/A'} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{inspection.location_id || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Condition Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Condition Checklist</CardTitle>
            <CardDescription>23-point inspection results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(checklist).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                  {value === 'good' || value === true ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Damage Markers */}
        {damageMarkers && damageMarkers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Damage Markers ({damageMarkers.length})
              </CardTitle>
              <CardDescription>Documented damages and condition issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {damageMarkers.map((marker) => (
                  <div key={marker.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{marker.side}</Badge>
                          <Badge variant="outline">{marker.damage_type}</Badge>
                          <Badge 
                            variant={
                              marker.severity === 'major' ? 'destructive' : 
                              marker.severity === 'moderate' ? 'default' : 
                              'secondary'
                            }
                          >
                            {marker.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{marker.notes}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Documented: {format(new Date(marker.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      {marker.photos && Array.isArray(marker.photos) && marker.photos.length > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-sm">{marker.photos.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {inspection.media && Array.isArray(inspection.media) && inspection.media.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Inspection Photos ({inspection.media.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {inspection.media.map((photo: any, index: number) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {photo.label || `Photo ${index + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature */}
        {inspection.signature && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Customer acknowledged and signed on {format(new Date(inspection.performed_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Tabs defaultValue="checkout" className="space-y-6">
      <TabsList>
        <TabsTrigger value="checkout">
          <FileText className="mr-2 h-4 w-4" />
          Check-Out Inspection
        </TabsTrigger>
        <TabsTrigger value="checkin">
          <FileText className="mr-2 h-4 w-4" />
          Check-In Inspection
        </TabsTrigger>
        <TabsTrigger value="comparison">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Comparison
        </TabsTrigger>
      </TabsList>

      <TabsContent value="checkout">
        {renderInspectionDetails(checkoutInspection, 'checkout')}
      </TabsContent>

      <TabsContent value="checkin">
        {renderInspectionDetails(null, 'checkin')}
      </TabsContent>

      <TabsContent value="comparison">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Comparison view will be available after check-in inspection is completed
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { damageAPI } from '@/lib/api/operations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { DamageDrawer } from './DamageDrawer';
import { VehicleDiagram } from './VehicleDiagram';
import { toast } from 'sonner';

interface DamageTabProps {
  agreementId: string;
  agreementLines: any[];
}

export const DamageTab: React.FC<DamageTabProps> = ({ agreementId, agreementLines }) => {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [damageDrawerOpen, setDamageDrawerOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: damageMarkers, isLoading } = useQuery({
    queryKey: ['damage-markers', agreementId],
    queryFn: () => damageAPI.getDamageMarkers(agreementId)
  });

  const createMarkerMutation = useMutation({
    mutationFn: (markerData: any) => damageAPI.createDamageMarker(markerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-markers', agreementId] });
      toast.success('Damage marker added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add damage marker: ' + error.message);
    }
  });

  const handleMarkerClick = (x: number, y: number, lineId: string, side: string) => {
    setSelectedMarker({
      x,
      y,
      lineId,
      side,
      event: 'OUT', // Default to OUT
      damageType: 'SCRATCH',
      severity: 'LOW'
    });
    setDamageDrawerOpen(true);
  };

  const handleMarkerSave = async (markerData: any) => {
    await createMarkerMutation.mutateAsync({
      ...markerData,
      agreement_id: agreementId,
      created_by: (await supabase.auth.getUser()).data.user?.id
    });
    setDamageDrawerOpen(false);
    setSelectedMarker(null);
  };

  const getMarkersForLine = (lineId: string, event?: string) => {
    if (!damageMarkers) return [];
    
    return damageMarkers.filter(marker => 
      marker.line_id === lineId &&
      (!event || marker.event === event)
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500';
      case 'MED': return 'bg-yellow-500';
      case 'HIGH': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading damage information...</div>;
  }

  return (
    <div id="tab-damage" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Vehicle Damage Assessment</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showComparison ? 'Hide Comparison' : 'Compare OUT vs IN'}
          </Button>
        </div>
      </div>

      {/* Severity Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-card-foreground">Severity Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-card-foreground">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-card-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-card-foreground">High</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Damage Cards */}
      {agreementLines.map((line, index) => (
        <Card key={line.id} id={`damage-card-line-${index + 1}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-card-foreground">
              <span>Line {index + 1} - Vehicle Damage</span>
              <Badge variant="outline" className="text-card-foreground">{line.vehicle?.make} {line.vehicle?.model}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleDiagram
              lineId={line.id}
              onMarkerClick={handleMarkerClick}
              markers={getMarkersForLine(line.id)}
              comparisonMarkers={showComparison ? getMarkersForLine(line.id, 'IN') : []}
              getSeverityColor={getSeverityColor}
            />
          </CardContent>
        </Card>
      ))}

      {/* Damage Marker Summary */}
      {damageMarkers && damageMarkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Damage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {damageMarkers.map((marker) => (
                <div key={marker.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(marker.severity)}`}></div>
                    <div>
                      <div className="font-medium text-white">{marker.damage_type} - {marker.side}</div>
                      <div className="text-sm text-white">
                        {marker.event} | {new Date(marker.occurred_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={marker.severity === 'HIGH' ? 'destructive' : marker.severity === 'MED' ? 'default' : 'secondary'}>
                    {marker.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DamageDrawer
        open={damageDrawerOpen}
        onOpenChange={setDamageDrawerOpen}
        marker={selectedMarker}
        onSave={handleMarkerSave}
      />
    </div>
  );
};
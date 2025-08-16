import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DamageTab } from '@/components/agreements/DamageTab';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface InspectionDamageProps {
  agreementId: string;
  lineId: string;
  existingMarkerIds: string[];
  onUpdate: (data: { damageMarkerIds: string[] }) => void;
}

export const InspectionDamage: React.FC<InspectionDamageProps> = ({
  agreementId,
  lineId,
  existingMarkerIds,
  onUpdate
}) => {
  const [markerIds, setMarkerIds] = useState<string[]>(existingMarkerIds);

  useEffect(() => {
    setMarkerIds(existingMarkerIds);
  }, [existingMarkerIds]);

  // Mock agreement lines for the damage tab
  const mockAgreementLines = [
    {
      id: lineId,
      vehicle_id: 'mock-vehicle-id',
      check_out_at: new Date().toISOString(),
      check_in_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const handleMarkersUpdate = () => {
    // This will be called when damage markers are updated
    // We need to refetch the marker data and update our parent
    // For now, we'll just trigger an update
    onUpdate({ damageMarkerIds: markerIds });
  };

  return (
    <div id="step-damage" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Damage Marking</h3>
        <p className="text-muted-foreground">
          Mark any existing damage on the vehicle diagram. This will be recorded as pre-existing damage.
        </p>
      </div>

      {/* Status Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{markerIds.length}</span> damage marker{markerIds.length !== 1 ? 's' : ''} recorded
              </div>
              {markerIds.length > 0 ? (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Pre-existing damage found
                </Badge>
              ) : (
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  No damage recorded
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Tab Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Damage Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <DamageTab 
            agreementId={agreementId}
            agreementLines={mockAgreementLines}
          />
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Click on the vehicle diagram to add damage markers</li>
          <li>Select damage type, severity, and add photos as needed</li>
          <li>All markers will be recorded as "OUT" inspection damage</li>
          <li>High severity damage requires photo documentation</li>
        </ul>
      </div>
    </div>
  );
};
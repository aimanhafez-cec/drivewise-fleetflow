import { VehicleDiagramInteractive } from '@/components/agreements/shared/VehicleDiagramInteractive';

interface CorporateDamageMarkingProps {
  vehicleId: string;
  damageMarkerIds: string[];
  onUpdate: (ids: string[]) => void;
}

export function CorporateDamageMarking({
  vehicleId,
  damageMarkerIds,
  onUpdate
}: CorporateDamageMarkingProps) {
  if (!vehicleId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please select a vehicle first
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed p-4 bg-muted/50">
        <p className="text-sm font-medium mb-2">Instructions:</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Click on any part of the vehicle diagram to add a damage marker</li>
          <li>Select damage type and severity for each marker</li>
          <li>View all 5 angles: Front, Rear, Left, Right, Top</li>
          <li>Hover over markers to see damage details</li>
          <li>Click existing markers to edit or remove them</li>
        </ul>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        Damage marking diagram will be integrated here
      </div>
    </div>
  );
}

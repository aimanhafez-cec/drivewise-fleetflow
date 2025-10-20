import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllVehicles } from "@/hooks/useVehicles";
import { CreateMovementData } from "@/lib/api/fleet-operations";

interface VehicleSelectionStepProps {
  data: Partial<CreateMovementData>;
  onUpdate: (data: Partial<CreateMovementData>) => void;
  onNext: () => void;
}

export function VehicleSelectionStep({ data, onUpdate, onNext }: VehicleSelectionStepProps) {
  const { data: vehicles, isLoading } = useAllVehicles();
  const [search, setSearch] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(data.vehicle_ids || []);

  const filteredVehicles = vehicles?.filter(v => 
    v.license_plate.toLowerCase().includes(search.toLowerCase()) ||
    v.make.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVehicle = (id: string) => {
    const newSelection = selectedVehicles.includes(id)
      ? selectedVehicles.filter(vid => vid !== id)
      : [...selectedVehicles, id];
    setSelectedVehicles(newSelection);
    onUpdate({ vehicle_ids: newSelection });
  };

  const handleNext = () => {
    if (selectedVehicles.length > 0) {
      onNext();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select Vehicles</h2>
        <p className="text-sm text-muted-foreground">
          Choose one or more vehicles for this movement. You can select multiple vehicles for batch movements.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by plate, make, model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Count */}
      {selectedVehicles.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedVehicles.length} vehicle(s) selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVehicles([]);
              onUpdate({ vehicle_ids: [] });
            }}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Vehicle List */}
      <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
        {filteredVehicles && filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleVehicle(vehicle.id)}
            >
              <Checkbox
                checked={selectedVehicles.includes(vehicle.id)}
                onCheckedChange={() => toggleVehicle(vehicle.id)}
              />
              <div className="flex-1">
                <div className="font-medium">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </div>
                <div className="text-sm text-muted-foreground">
                  Plate: {vehicle.license_plate} • Status: {vehicle.status}
                </div>
              </div>
              {selectedVehicles.includes(vehicle.id) && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No vehicles found
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={selectedVehicles.length === 0}>
          Continue to Source & Destination
        </Button>
      </div>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar } from "lucide-react";
import { LocationSelect } from "@/components/ui/select-components";

interface QuoteWizardStep2Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep2: React.FC<QuoteWizardStep2Props> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Trip Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pickup Information
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="pickup_at">Pickup Date & Time *</Label>
              <Input
                id="pickup_at"
                type="datetime-local"
                value={data.pickup_at || ""}
                onChange={(e) => onChange({ pickup_at: e.target.value })}
              />
              {errors.pickup_at && (
                <p className="text-sm text-destructive">{errors.pickup_at}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_location">Pickup Location *</Label>
              <LocationSelect
                value={data.pickup_location || ""}
                onChange={(locationId) => onChange({ pickup_location: locationId })}
                placeholder="Select pickup location"
              />
              {errors.pickup_location && (
                <p className="text-sm text-destructive">{errors.pickup_location}</p>
              )}
            </div>
          </div>

          {/* Return */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Return Information
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="return_at">Return Date & Time *</Label>
              <Input
                id="return_at"
                type="datetime-local"
                value={data.return_at || ""}
                onChange={(e) => onChange({ return_at: e.target.value })}
              />
              {errors.return_at && (
                <p className="text-sm text-destructive">{errors.return_at}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_location">Return Location *</Label>
              <LocationSelect
                value={data.return_location || ""}
                onChange={(locationId) => onChange({ return_location: locationId })}
                placeholder="Select return location"
              />
              {errors.return_location && (
                <p className="text-sm text-destructive">{errors.return_location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Flight Information (Optional) */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold">Flight Information (Optional)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrival_flight">Arrival Flight</Label>
              <Input
                id="arrival_flight"
                value={data.arrival_flight || ""}
                onChange={(e) => onChange({ arrival_flight: e.target.value })}
                placeholder="Flight number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure_flight">Departure Flight</Label>
              <Input
                id="departure_flight"
                value={data.departure_flight || ""}
                onChange={(e) => onChange({ departure_flight: e.target.value })}
                placeholder="Flight number"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
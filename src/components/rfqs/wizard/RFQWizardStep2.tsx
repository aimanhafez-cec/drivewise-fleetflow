import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";

interface RFQWizardStep2Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const RFQWizardStep2: React.FC<RFQWizardStep2Props> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Pickup Information</h4>
            <div>
              <label htmlFor="pickup-datetime" className="text-sm font-medium">
                Pickup Date & Time *
              </label>
              <Input
                id="pickup-datetime"
                type="datetime-local"
                value={data.pickup_at || ""}
                onChange={(e) => onChange({ pickup_at: e.target.value })}
                className="mt-1"
              />
              {errors.pickup_at && <FormError message={errors.pickup_at} />}
            </div>
            <div>
              <label htmlFor="pickup-location" className="text-sm font-medium">
                Pickup Location *
              </label>
              <Input
                id="pickup-location"
                placeholder="Enter pickup location"
                value={data.pickup_loc_id || ""}
                onChange={(e) => onChange({ pickup_loc_id: e.target.value })}
                className="mt-1"
              />
              {errors.pickup_loc_id && <FormError message={errors.pickup_loc_id} />}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Return Information</h4>
            <div>
              <label htmlFor="return-datetime" className="text-sm font-medium">
                Return Date & Time *
              </label>
              <Input
                id="return-datetime"
                type="datetime-local"
                value={data.return_at || ""}
                onChange={(e) => onChange({ return_at: e.target.value })}
                className="mt-1"
              />
              {errors.return_at && <FormError message={errors.return_at} />}
            </div>
            <div>
              <label htmlFor="return-location" className="text-sm font-medium">
                Return Location *
              </label>
              <Input
                id="return-location"
                placeholder="Enter return location"
                value={data.return_loc_id || ""}
                onChange={(e) => onChange({ return_loc_id: e.target.value })}
                className="mt-1"
              />
              {errors.return_loc_id && <FormError message={errors.return_loc_id} />}
            </div>
          </div>
        </div>

        {data.pickup_at && data.return_at && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Trip Summary</h4>
            <div className="text-sm space-y-1">
              <div>
                <strong>Duration:</strong>{" "}
                {Math.ceil(
                  (new Date(data.return_at).getTime() - new Date(data.pickup_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </div>
              <div>
                <strong>From:</strong> {data.pickup_loc_id}
              </div>
              <div>
                <strong>To:</strong> {data.return_loc_id}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
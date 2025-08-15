import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RFQWizardStep3Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const RFQWizardStep3: React.FC<RFQWizardStep3Props> = ({
  data,
  onChange,
  errors,
}) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="vehicle-type" className="text-sm font-medium">
            Preferred Vehicle Type
          </label>
          <Select
            value={data.vehicle_type_id || ""}
            onValueChange={(value) => onChange({ vehicle_type_id: value === "any" ? undefined : value })}
          >
            <SelectTrigger id="vehicle-type" className="mt-1">
              <SelectValue placeholder="Select vehicle type or leave blank for any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Vehicle Type</SelectItem>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading vehicle types...
                </SelectItem>
              ) : (
                categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="special-requests" className="text-sm font-medium">
            Special Requests or Notes
          </label>
          <Textarea
            id="special-requests"
            placeholder="Enter any special requests, preferred features, or additional notes..."
            value={data.notes || ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="mt-1"
            rows={4}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Request Summary</h4>
          <div className="text-sm space-y-1">
            <div>
              <strong>Vehicle Type:</strong>{" "}
              {data.vehicle_type_id 
                ? categories?.find(c => c.id === data.vehicle_type_id)?.name 
                : "Any vehicle type"}
            </div>
            {data.notes && (
              <div>
                <strong>Special Requests:</strong>
                <div className="mt-1 whitespace-pre-wrap">{data.notes}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
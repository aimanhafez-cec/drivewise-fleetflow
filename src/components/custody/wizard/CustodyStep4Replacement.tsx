import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep4Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
}

export function CustodyStep4Replacement({ formData, updateFormData }: CustodyStep4Props) {
  const hasReplacement = !!formData.replacement_vehicle_id;

  return (
    <div className="space-y-6">
      {/* Until Original Ready */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="until_original_ready">Provide Replacement Vehicle</Label>
          <p className="text-sm text-muted-foreground">
            Customer keeps replacement until original is ready
          </p>
        </div>
        <Switch
          id="until_original_ready"
          checked={formData.until_original_ready ?? true}
          onCheckedChange={(checked) => updateFormData({ until_original_ready: checked })}
        />
      </div>

      {formData.until_original_ready && (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A replacement vehicle will be provided to the customer while their original
              vehicle is in custody. The replacement will follow the rate policy set in the
              next step.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Replacement Vehicle */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="replacement_vehicle_id">
                Replacement Vehicle <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="replacement_vehicle_id"
                  placeholder="Vehicle ID or Plate - leave blank to assign later"
                  value={formData.replacement_vehicle_id || ""}
                  onChange={(e) =>
                    updateFormData({ replacement_vehicle_id: e.target.value || undefined })
                  }
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Search available vehicles or assign later
              </p>
            </div>

            {hasReplacement && (
              <>
                {/* Vehicle Details Placeholder */}
                <div className="md:col-span-2 rounded-lg border bg-muted/30 p-4">
                  <h4 className="font-medium mb-2">Selected Vehicle</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Make/Model:</span>
                      <span className="font-medium">Toyota Camry 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plate:</span>
                      <span className="font-medium">{formData.replacement_vehicle_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">Standard Sedan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-600 font-medium">Available</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Linked Maintenance Ticket - removed as not in schema */}
          </div>

          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
              Replacement Guidelines
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Same or similar vehicle class preferred</li>
              <li>• Check customer preferences and restrictions</li>
              <li>• Verify vehicle availability for custody period</li>
              <li>• Consider insurance class compatibility</li>
            </ul>
          </div>
        </>
      )}

      {!formData.until_original_ready && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No replacement vehicle will be provided. This is suitable for maintenance
            scenarios where the customer has alternative transportation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

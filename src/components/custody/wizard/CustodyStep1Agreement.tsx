import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep1Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
}

export function CustodyStep1Agreement({ formData, updateFormData }: CustodyStep1Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Agreement ID */}
        <div className="space-y-2">
          <Label htmlFor="agreement_id">
            Agreement No <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="agreement_id"
              placeholder="AGR-000123"
              value={formData.agreement_id || ""}
              onChange={(e) => updateFormData({ agreement_id: e.target.value || undefined })}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Link to existing rental agreement
          </p>
        </div>

        {/* Agreement Line ID */}
        <div className="space-y-2">
          <Label htmlFor="agreement_line_id">
            Agreement Line <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="agreement_line_id"
            placeholder="Line ID"
            value={formData.agreement_line_id || ""}
            onChange={(e) => updateFormData({ agreement_line_id: e.target.value || undefined })}
          />
          <p className="text-xs text-muted-foreground">
            Specific line if multi-vehicle agreement
          </p>
        </div>

        {/* Customer ID */}
        <div className="space-y-2">
          <Label htmlFor="customer_id">
            Customer <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="customer_id"
              placeholder="Select customer"
              value={formData.customer_id || ""}
              onChange={(e) => updateFormData({ customer_id: e.target.value })}
              required
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Customer receiving replacement vehicle
          </p>
        </div>

        {/* Branch ID */}
        <div className="space-y-2">
          <Label htmlFor="branch_id">
            Branch Location <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="branch_id"
            placeholder="Branch ID"
            value={formData.branch_id || ""}
            onChange={(e) => updateFormData({ branch_id: e.target.value || undefined })}
          />
          <p className="text-xs text-muted-foreground">
            Operating branch handling custody
          </p>
        </div>

        {/* Original Vehicle */}
        <div className="space-y-2">
          <Label htmlFor="original_vehicle_id">
            Original Vehicle <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="original_vehicle_id"
              placeholder="Vehicle ID or Plate"
              value={formData.original_vehicle_id || ""}
              onChange={(e) => updateFormData({ original_vehicle_id: e.target.value || undefined })}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Vehicle being sent to custody
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="font-medium mb-2">Quick Start Options</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            From Agreement
          </Button>
          <Button variant="outline" size="sm">
            From Reservation
          </Button>
          <Button variant="outline" size="sm">
            Walk-in Customer
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateMovementData } from "@/lib/api/fleet-operations";

interface FinancialImpactStepProps {
  data: Partial<CreateMovementData>;
  onUpdate: (data: Partial<CreateMovementData>) => void;
  onNext: () => void;
}

export function FinancialImpactStep({ data, onUpdate }: FinancialImpactStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Impact</h2>
      <div className="space-y-2">
        <Label>Transfer Price (AED)</Label>
        <Input type="number" value={data.transfer_price || ""} onChange={(e) => onUpdate({ transfer_price: parseFloat(e.target.value) })} />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked={data.requires_finance_approval || false} onCheckedChange={(checked) => onUpdate({ requires_finance_approval: checked as boolean })} />
        <Label>Requires Finance Approval</Label>
      </div>
    </div>
  );
}

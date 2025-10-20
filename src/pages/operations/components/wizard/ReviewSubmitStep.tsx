import { Badge } from "@/components/ui/badge";
import { CreateMovementData } from "@/lib/api/fleet-operations";

interface ReviewSubmitStepProps {
  data: Partial<CreateMovementData>;
  onUpdate: (data: Partial<CreateMovementData>) => void;
  onNext: () => void;
}

export function ReviewSubmitStep({ data }: ReviewSubmitStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Submit</h2>
      <div className="space-y-4">
        <div><strong>Vehicles:</strong> <Badge>{data.vehicle_ids?.length || 0} selected</Badge></div>
        <div><strong>Type:</strong> {data.movement_type || "—"}</div>
        <div><strong>From:</strong> {data.from_branch_id || data.from_owner || "—"}</div>
        <div><strong>To:</strong> {data.to_branch_id || data.to_owner || "—"}</div>
        <div><strong>Reason:</strong> {data.reason_code || "—"}</div>
      </div>
    </div>
  );
}

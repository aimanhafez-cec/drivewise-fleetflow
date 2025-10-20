import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreateMovementData } from "@/lib/api/fleet-operations";

interface TimingLogisticsStepProps {
  data: Partial<CreateMovementData>;
  onUpdate: (data: Partial<CreateMovementData>) => void;
  onNext: () => void;
}

export function TimingLogisticsStep({ data, onUpdate }: TimingLogisticsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Timing & Logistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Effective From *</Label>
          <Input type="datetime-local" value={data.effective_from || ""} onChange={(e) => onUpdate({ effective_from: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Expected Arrival</Label>
          <Input type="datetime-local" value={data.expected_arrival || ""} onChange={(e) => onUpdate({ expected_arrival: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Transport Job Reference</Label>
        <Input value={data.transport_job_ref || ""} onChange={(e) => onUpdate({ transport_job_ref: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Carrier/Vendor</Label>
        <Input value={data.carrier_vendor || ""} onChange={(e) => onUpdate({ carrier_vendor: e.target.value })} />
      </div>
    </div>
  );
}

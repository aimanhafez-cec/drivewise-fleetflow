import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateMovementData } from "@/lib/api/fleet-operations";

interface SourceDestinationStepProps {
  data: Partial<CreateMovementData>;
  onUpdate: (data: Partial<CreateMovementData>) => void;
  onNext: () => void;
}

export function SourceDestinationStep({ data, onUpdate }: SourceDestinationStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Source & Destination</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">From</h3>
          <div className="space-y-2">
            <Label>Owner/Entity</Label>
            <Input value={data.from_owner || "Autostrad"} onChange={(e) => onUpdate({ from_owner: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Branch/Depot</Label>
            <Input value={data.from_branch_id || ""} onChange={(e) => onUpdate({ from_branch_id: e.target.value })} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">To</h3>
          <div className="space-y-2">
            <Label>Owner/Entity</Label>
            <Input value={data.to_owner || "Autostrad"} onChange={(e) => onUpdate({ to_owner: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Branch/Depot</Label>
            <Input value={data.to_branch_id || ""} onChange={(e) => onUpdate({ to_branch_id: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Movement Type</Label>
        <Select value={data.movement_type || ""} onValueChange={(val: any) => onUpdate({ movement_type: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Select movement type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ownership_transfer">Ownership Transfer</SelectItem>
            <SelectItem value="inter_branch">Inter-Branch</SelectItem>
            <SelectItem value="department_reallocation">Department Reallocation</SelectItem>
            <SelectItem value="third_party">Third Party</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Reason Code *</Label>
        <Input value={data.reason_code || ""} onChange={(e) => onUpdate({ reason_code: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <Label>Reason Description</Label>
        <Textarea value={data.reason_description || ""} onChange={(e) => onUpdate({ reason_description: e.target.value })} />
      </div>
    </div>
  );
}

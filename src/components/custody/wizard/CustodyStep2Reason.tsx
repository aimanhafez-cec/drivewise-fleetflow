import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReasonCodePicker } from "../ReasonCodePicker";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep2Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
}

export function CustodyStep2Reason({ formData, updateFormData }: CustodyStep2Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reason Code */}
        <div className="space-y-2 md:col-span-2">
          <Label>
            Custody Reason <span className="text-destructive">*</span>
          </Label>
          <ReasonCodePicker
            reasonCode={formData.reason_code!}
            reasonSubcode={formData.reason_subcode}
            onReasonCodeChange={(value) => updateFormData({ reason_code: value })}
            onReasonSubcodeChange={(value) => updateFormData({ reason_subcode: value || undefined })}
          />
        </div>

        {/* Reason Subcode - removed as it's in ReasonCodePicker */}

        {/* Incident Date */}
        <div className="space-y-2">
          <Label htmlFor="incident_date">
            Incident Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="incident_date"
            type="datetime-local"
            value={formData.incident_date || ""}
            onChange={(e) => updateFormData({ incident_date: e.target.value })}
            required
          />
        </div>

        {/* Incident Reference */}
        <div className="space-y-2">
          <Label htmlFor="incident_ref">
            Incident Reference <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="incident_ref"
            placeholder="Police report, ticket no, etc."
            value={formData.incident_ref || ""}
            onChange={(e) => updateFormData({ incident_ref: e.target.value || undefined })}
          />
        </div>

        {/* Incident Odometer */}
        <div className="space-y-2">
          <Label htmlFor="incident_odometer">
            Odometer Reading <span className="text-muted-foreground">(km)</span>
          </Label>
          <Input
            id="incident_odometer"
            type="number"
            placeholder="Current km"
            value={formData.incident_odometer || ""}
            onChange={(e) =>
              updateFormData({
                incident_odometer: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* Incident Narrative */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="incident_narrative">
            Incident Details <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Textarea
            id="incident_narrative"
            placeholder="Describe what happened, damage assessment, etc."
            value={formData.incident_narrative || ""}
            onChange={(e) => updateFormData({ incident_narrative: e.target.value || undefined })}
            rows={4}
          />
        </div>

        {/* Effective From */}
        <div className="space-y-2">
          <Label htmlFor="effective_from">
            Custody Effective From <span className="text-destructive">*</span>
          </Label>
          <Input
            id="effective_from"
            type="datetime-local"
            value={formData.effective_from || ""}
            onChange={(e) => updateFormData({ effective_from: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            When vehicle goes into custody
          </p>
        </div>

        {/* Expected Return */}
        <div className="space-y-2">
          <Label htmlFor="expected_return_date">
            Expected Return Date <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="expected_return_date"
            type="datetime-local"
            value={formData.expected_return_date || ""}
            onChange={(e) =>
              updateFormData({ expected_return_date: e.target.value || undefined })
            }
          />
          <p className="text-xs text-muted-foreground">
            Estimated completion date
          </p>
        </div>
      </div>
    </div>
  );
}

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustodianSelector } from "../CustodianSelector";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep3Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
}

export function CustodyStep3Custodian({ formData, updateFormData }: CustodyStep3Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Custodian Type & Details */}
        <div className="space-y-2 md:col-span-2">
          <Label>
            Custodian Information <span className="text-destructive">*</span>
          </Label>
          <CustodianSelector
            custodianType={formData.custodian_type!}
            custodianName={formData.custodian_name || ""}
            custodianContact={formData.custodian_contact || {}}
            onCustodianTypeChange={(value) => updateFormData({ custodian_type: value })}
            onCustodianNameChange={(value) => updateFormData({ custodian_name: value })}
            onCustodianContactChange={(value) => updateFormData({ custodian_contact: value })}
          />
        </div>

        {/* Custodian Party ID - removed as it's in CustodianSelector */}

        {/* Contact fields - removed as they're in CustodianSelector */}

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="custodian_notes">Additional Notes</Label>
          <Textarea
            id="custodian_notes"
            placeholder="Special instructions, directions, etc."
            value={formData.notes || ""}
            onChange={(e) => updateFormData({ notes: e.target.value || undefined })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

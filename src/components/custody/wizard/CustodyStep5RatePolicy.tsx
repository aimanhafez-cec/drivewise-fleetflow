import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

interface CustodyStep5Props {
  formData: Partial<CustodyTransactionCreate>;
  updateFormData: (data: Partial<CustodyTransactionCreate>) => void;
}

export function CustodyStep5RatePolicy({ formData, updateFormData }: CustodyStep5Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Rate Policy */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="rate_policy">
            Rate Policy <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.rate_policy || "inherit"}
            onValueChange={(value: any) => updateFormData({ rate_policy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rate policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit from Agreement</SelectItem>
              <SelectItem value="prorate">Prorate Original Rate</SelectItem>
              <SelectItem value="free">Free of Charge</SelectItem>
              <SelectItem value="special_code">Special Rate Code</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How replacement vehicle charges are calculated
          </p>
        </div>

        {/* Special Rate Code */}
        {formData.rate_policy === "special_code" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="special_rate_code">
              Special Rate Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="special_rate_code"
              placeholder="Enter rate code"
              value={formData.special_rate_code || ""}
              onChange={(e) => updateFormData({ special_rate_code: e.target.value })}
              required
            />
          </div>
        )}

        {/* Deposit Carryover */}
        <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
          <div className="space-y-0.5">
            <Label htmlFor="deposit_carryover">Deposit Carryover</Label>
            <p className="text-sm text-muted-foreground">
              Original deposit covers replacement vehicle
            </p>
          </div>
          <Switch
            id="deposit_carryover"
            checked={formData.deposit_carryover ?? true}
            onCheckedChange={(checked) => updateFormData({ deposit_carryover: checked })}
          />
        </div>

        {/* Damage Pre-authorization */}
        <div className="space-y-2">
          <Label htmlFor="damage_preauth_hold">
            Damage Pre-auth Hold <span className="text-muted-foreground">(AED)</span>
          </Label>
          <Input
            id="damage_preauth_hold"
            type="number"
            placeholder="0.00"
            value={formData.damage_preauth_hold || ""}
            onChange={(e) =>
              updateFormData({
                damage_preauth_hold: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Additional hold for estimated damage
          </p>
        </div>

        {/* Card Reference */}
        {(formData.damage_preauth_hold ?? 0) > 0 && (
          <div className="space-y-2">
            <Label htmlFor="damage_preauth_card_ref">Card Reference</Label>
            <Input
              id="damage_preauth_card_ref"
              placeholder="Last 4 digits or reference"
              value={formData.damage_preauth_card_ref || ""}
              onChange={(e) =>
                updateFormData({ damage_preauth_card_ref: e.target.value || undefined })
              }
            />
          </div>
        )}

        {/* Tax Profile - removed as not in schema */}
      </div>

      {/* Rate Policy Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {formData.rate_policy === "inherit" && (
            <span>
              Charges will be calculated based on the original agreement terms. The
              replacement vehicle will bill at the same rate as the original.
            </span>
          )}
          {formData.rate_policy === "prorate" && (
            <span>
              The original rate will be prorated based on the custody duration. Customer
              pays a proportional amount for the replacement period.
            </span>
          )}
          {formData.rate_policy === "free" && (
            <span>
              No charges will be applied for the replacement vehicle. Use for goodwill or
              when company is at fault.
            </span>
          )}
          {formData.rate_policy === "special_code" && (
            <span>
              A special negotiated rate will apply. Enter the rate code that should be used
              for billing.
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

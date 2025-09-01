import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  GEO_RESTRICTIONS,
  VEHICLE_SWAP_RULES,
  EARLY_CANCELLATION_FEE_TYPES
} from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep8Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep8: React.FC<CarSubscriptionStep8Props> = ({ form }) => {
  const earlyCancellationFee = form.watch('early_cancellation_fee');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Usage & Policy</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="geo_restrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geo Restrictions *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select geographic restrictions" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GEO_RESTRICTIONS.map((restriction) => (
                    <SelectItem key={restriction.id} value={restriction.id}>
                      {restriction.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mileage_rollover"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mileage Rollover *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mileage rollover policy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes (max rollover limit)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_swap_rules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Swap Rules *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select swap rules" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VEHICLE_SWAP_RULES.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="early_cancellation_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Early Cancellation Fee *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cancellation fee type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EARLY_CANCELLATION_FEE_TYPES.map((feeType) => (
                    <SelectItem key={feeType.id} value={feeType.id}>
                      {feeType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(earlyCancellationFee === 'Fixed AED' || earlyCancellationFee === '% of remaining month') && (
          <FormField
            control={form.control}
            name="early_cancellation_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {earlyCancellationFee === 'Fixed AED' ? 'Cancellation Amount (AED)' : 'Cancellation Percentage (%)'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={earlyCancellationFee === 'Fixed AED' ? "0.01" : "1"}
                    placeholder={earlyCancellationFee === 'Fixed AED' ? "300.00" : "50"}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="contract_freeze_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Freeze Fee (AED per freeze)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Fee charged per freeze request"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Usage Policy Guidelines</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>UAE-only:</strong> Vehicle restricted to UAE borders and off-road prohibited</p>
          <p><strong>GCC Allowed:</strong> Cross-border travel to GCC countries permitted</p>
          <p><strong>Mileage Rollover:</strong> Unused monthly KM can be carried forward (with limits)</p>
          <p><strong>Same Class Swaps:</strong> Customer can swap within same vehicle category</p>
          <p><strong>Upgrade Swaps:</strong> Allow upgrades to higher class with additional fee</p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  RENEWAL_CYCLES, 
  MINIMUM_COMMITMENTS, 
  CANCELLATION_NOTICES, 
  SWAP_FREQUENCIES 
} from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep3Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep3: React.FC<CarSubscriptionStep3Props> = ({ form }) => {
  const swapAllowed = form.watch('swap_allowed');
  const pauseFreezeAllowed = form.watch('pause_freeze_allowed');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Terms & Flexibility</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className='text-muted-foreground'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renewal_cycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renewal Cycle *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-muted-foreground">
                    <SelectValue placeholder="Select renewal cycle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RENEWAL_CYCLES.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.label}
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
          name="minimum_commitment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Commitment *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-muted-foreground">
                    <SelectValue placeholder="Select minimum commitment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MINIMUM_COMMITMENTS.map((commitment) => (
                    <SelectItem key={commitment.id} value={commitment.id}>
                      {commitment.label}
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
          name="cancellation_notice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cancellation Notice *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-muted-foreground">
                    <SelectValue placeholder="Select cancellation notice period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CANCELLATION_NOTICES.map((notice) => (
                    <SelectItem key={notice.id} value={notice.id}>
                      {notice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Vehicle Swap Options</h4>
        
        <FormField
          control={form.control}
          name="swap_allowed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Swap Allowed</FormLabel>
                <div className="text-sm text-card-foreground">
                  Allow customer to swap vehicles during subscription
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {swapAllowed && (
          <FormField
            control={form.control}
            name="swap_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Swap Frequency *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='text-muted-foreground'>
                      <SelectValue placeholder="Select swap frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SWAP_FREQUENCIES.map((frequency) => (
                      <SelectItem key={frequency.id} value={frequency.id}>
                        {frequency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Pause/Freeze Options</h4>
        
        <FormField
          control={form.control}
          name="pause_freeze_allowed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Pause/Freeze Allowed</FormLabel>
                <div className="text-sm text-card-foreground">
                  Allow customer to temporarily pause subscription
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {pauseFreezeAllowed && (
          <FormField
            control={form.control}
            name="pause_freeze_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pause/Freeze Limit (days per year)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 30 days"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
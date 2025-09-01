import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LOVSelect } from '@/components/ui/lov-select';
import { RequiredLabel } from '@/components/ui/required-label';
import { 
  FRAMEWORK_MODELS,
  CONTRACT_TERMS,
  RENEWAL_OPTIONS
} from '@/hooks/useCorporateLeasingLOVs';

interface CorporateLeasingStep2Props {
  form: UseFormReturn<any>;
}

export const CorporateLeasingStep2: React.FC<CorporateLeasingStep2Props> = ({ form }) => {
  const earlyTerminationAllowed = form.watch('early_termination_allowed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="framework_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Framework Model</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={FRAMEWORK_MODELS}
                  placeholder="Select framework model..."
                  error={!!form.formState.errors.framework_model}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="committed_fleet_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Committed Fleet Size</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  placeholder="Enter fleet size..." 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="master_term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Master Term</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={CONTRACT_TERMS}
                  placeholder="Select contract term..."
                  error={!!form.formState.errors.master_term}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="off_hire_notice_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Off-hire Notice Period (Days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  placeholder="Enter notice period..." 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="co_terminus_lines"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Co-terminus Lines</FormLabel>
                <p className="text-sm text-foreground/70">
                  If enabled, all line end dates will align to the master agreement end date
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="early_termination_allowed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('early_termination_rule', undefined);
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-foreground">Allow Early Termination</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Enable early termination with penalty rules
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {earlyTerminationAllowed && (
          <FormField
            control={form.control}
            name="early_termination_rule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Early Termination Rule</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., Fixed AED 5000 or 50% of remaining rentals..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="renewal_option"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renewal Option</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={RENEWAL_OPTIONS}
                  placeholder="Select renewal option..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
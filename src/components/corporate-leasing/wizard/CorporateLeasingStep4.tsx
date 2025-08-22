import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LOVSelect } from '@/components/ui/lov-select';
import { RequiredLabel } from '@/components/ui/required-label';
import { 
  INSURANCE_RESPONSIBILITIES,
  MAINTENANCE_POLICIES,
  TYRES_POLICIES,
  WORKSHOP_PREFERENCES,
  REGISTRATION_RESPONSIBILITIES
} from '@/hooks/useCorporateLeasingLOVs';

interface CorporateLeasingStep4Props {
  form: UseFormReturn<any>;
}

export const CorporateLeasingStep4: React.FC<CorporateLeasingStep4Props> = ({ form }) => {
  const insuranceResponsibility = form.watch('insurance_responsibility');
  const replacementVehicleIncluded = form.watch('replacement_vehicle_included');
  const tyresPolicy = form.watch('tyres_policy');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="insurance_responsibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Insurance Responsibility</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={INSURANCE_RESPONSIBILITIES}
                  placeholder="Select insurance responsibility..."
                  error={!!form.formState.errors.insurance_responsibility}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {insuranceResponsibility === 'Included (Lessor)' && (
          <FormField
            control={form.control}
            name="insurance_excess_aed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Excess per Claim (AED)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    placeholder="Enter excess amount..." 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="maintenance_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Maintenance Policy</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={MAINTENANCE_POLICIES}
                  placeholder="Select maintenance policy..."
                  error={!!form.formState.errors.maintenance_policy}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tyres_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tyres Policy</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    // Extract km value from selected policy
                    if (value?.includes('20000')) {
                      form.setValue('tyres_included_after_km', 20000);
                    } else if (value?.includes('30000')) {
                      form.setValue('tyres_included_after_km', 30000);
                    } else {
                      form.setValue('tyres_included_after_km', undefined);
                    }
                  }}
                  items={TYRES_POLICIES}
                  placeholder="Select tyres policy..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workshop_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workshop Preference</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={WORKSHOP_PREFERENCES}
                  placeholder="Select workshop preference..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registration_responsibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration & Renewal</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={REGISTRATION_RESPONSIBILITIES}
                  placeholder="Select registration responsibility..."
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
          name="roadside_assistance_included"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Include Roadside Assistance</FormLabel>
                <p className="text-sm text-muted-foreground">
                  24/7 roadside assistance coverage included in the agreement
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="replacement_vehicle_included"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('replacement_sla_hours', undefined);
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Include Replacement Vehicle</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Provide replacement vehicle during maintenance or repairs
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {replacementVehicleIncluded && (
          <FormField
            control={form.control}
            name="replacement_sla_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replacement Vehicle SLA (Hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 24 hours..."
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
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  SUBSCRIPTION_PLANS,
  BILLING_DAY_TYPES
} from "@/hooks/xxUseCarSubscriptionLOVs";

interface CarSubscriptionStep4Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep4: React.FC<CarSubscriptionStep4Props> = ({ form }) => {
  const plan = form.watch('plan');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Pricing & Billing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select subscription plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.label}
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
          name="monthly_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Fee (AED) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="2500.00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className='text-muted-foreground'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="included_km_month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Included KM / Month *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2500"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className='text-muted-foreground'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excess_km_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excess KM Rate (AED/km) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.50"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className='text-muted-foreground'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="extra_drivers_included"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extra Drivers Included *</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select number of extra drivers" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery_collection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery/Collection *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select delivery option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Included">Included</SelectItem>
                  <SelectItem value="Chargeable">Chargeable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upgrade_downgrade_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upgrade/Downgrade Fee (AED)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Applied when swapping class"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="joining_setup_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Joining/Setup Fee (AED)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="One-off on first bill"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vat_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VAT Code *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select VAT code" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5% (standard)">5% (standard)</SelectItem>
                  <SelectItem value="Exempt">Exempt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billing_day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Day *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select billing day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BILLING_DAY_TYPES.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Plan Details</h4>
        <div className="text-sm text-card-foreground">
          {plan === 'Essential' && (
            <p>Basic subscription with essential services included. Lower monthly fee, basic KM allowance.</p>
          )}
          {plan === 'Standard' && (
            <p>Most popular plan with balanced features. Good KM allowance, comprehensive inclusions.</p>
          )}
          {plan === 'Premium' && (
            <p>Full-service plan with maximum inclusions. Higher KM allowance, premium services.</p>
          )}
          {plan === 'Custom' && (
            <p>Tailored plan with custom pricing and inclusions based on specific requirements.</p>
          )}
        </div>
      </div>
    </div>
  );
};
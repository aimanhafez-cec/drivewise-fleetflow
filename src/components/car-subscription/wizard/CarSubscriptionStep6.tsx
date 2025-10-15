import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SALIK_HANDLING_OPTIONS } from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep6Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep6: React.FC<CarSubscriptionStep6Props> = ({ form }) => {
  const salikHandling = form.watch('salik_darb_handling');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Tolls & Fines</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Salik/Darb Handling</h4>
        
        <FormField
          control={form.control}
          name="salik_darb_handling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salik/Darb Handling *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select Salik/Darb handling method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SALIK_HANDLING_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {salikHandling === 'Included Allowance' && (
          <FormField
            control={form.control}
            name="salik_darb_allowance_cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salik/Darb Allowance Cap (AED/month)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Monthly allowance limit"
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
          name="admin_fee_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Fee Model (Tolls)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select admin fee model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Per-event">Per-event</SelectItem>
                  <SelectItem value="Per-invoice">Per-invoice</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Traffic Fines</h4>
        
        <FormField
          control={form.control}
          name="traffic_fines_handling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Traffic Fines Handling *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='text-muted-foreground'>
                    <SelectValue placeholder="Select fines handling method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Auto Rebill + Admin Fee">Auto Rebill + Admin Fee</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="admin_fee_per_fine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Fee per Fine (AED)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                   className='text-muted-foreground'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">UAE Subscription Reality</h4>
        <div className="text-sm text-card-foreground space-y-2">
          <p><strong>Rebill Actual (Safer):</strong> Customer pays actual Salik/Darb charges plus optional admin fee. No disputes over allowances.</p>
          <p><strong>Included Allowance:</strong> Monthly cap on tolls included in subscription. Excess charges rebilled to customer.</p>
          <p><strong>Traffic Fines:</strong> Auto-rebill with admin fee is recommended. Customer disputes can be handled while keeping AR aging active.</p>
        </div>
      </div>
    </div>
  );
};
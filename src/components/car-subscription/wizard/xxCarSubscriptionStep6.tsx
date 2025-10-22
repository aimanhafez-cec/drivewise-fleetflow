import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { SALIK_HANDLING_OPTIONS } from "@/hooks/xxUseCarSubscriptionLOVs";

interface CarSubscriptionStep6Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep6: React.FC<CarSubscriptionStep6Props> = ({ form }) => {
  const salikHandling = form.watch('salik_darb_handling');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Tolls & Fines</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4" side="right">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">UAE Toll Systems & Handling Options</h4>
                <div className="space-y-2 text-xs">
                  <p><strong>Salik (Dubai):</strong> AED 4-8 per gate crossing | <strong>Darb (Abu Dhabi):</strong> Variable by location</p>
                  <p><strong>Rebill Actuals:</strong> Most common - customer pays exact charges + optional admin fee. No disputes over allowances.</p>
                  <p><strong>Included Allowance:</strong> Corporate leases - include up to cap/month, excess rebilled to customer.</p>
                  <p><strong>Included in Lease Rate:</strong> Estimated toll cost built into monthly rate (long-term only)</p>
                  <p className="pt-2 border-t"><strong>Traffic Fines:</strong> Auto-rebill with admin fee is recommended. Customer disputes can be handled while keeping AR aging active.</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
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

        <FormField
          control={form.control}
          name="admin_fee_per_toll_aed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Fee per Toll (AED)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.00"
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
    </div>
  );
};
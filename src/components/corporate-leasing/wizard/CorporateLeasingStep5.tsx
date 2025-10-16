import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LOVSelect } from '@/components/ui/lov-select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { 
  SALIK_DARB_HANDLING,
  TOLLS_ADMIN_FEE_MODELS,
  TRAFFIC_FINES_HANDLING,
  FUEL_HANDLING
} from '@/hooks/useCorporateLeasingLOVs';

interface CorporateLeasingStep5Props {
  form: UseFormReturn<any>;
}

export const CorporateLeasingStep5: React.FC<CorporateLeasingStep5Props> = ({ form }) => {
  const trafficFinesHandling = form.watch('traffic_fines_handling');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Toll & Fines Handling</h3>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="salik_darb_handling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salik/Darb Handling</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={SALIK_DARB_HANDLING}
                  placeholder="Select handling method..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tolls_admin_fee_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tolls Admin Fee Model</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={TOLLS_ADMIN_FEE_MODELS}
                  placeholder="Select admin fee model..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="traffic_fines_handling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Traffic Fines Handling</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={TRAFFIC_FINES_HANDLING}
                  placeholder="Select fines handling..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="admin_fee_per_fine_aed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Fee per Fine (AED)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  placeholder="Enter admin fee amount..." 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fuel_handling"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Fuel Handling</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={FUEL_HANDLING}
                  placeholder="Select fuel handling method..."
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
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LOVSelect } from '@/components/ui/lov-select';
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

        {trafficFinesHandling === 'Auto Rebill + Admin Fee' && (
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
        )}

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

      <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">UAE Toll System Information</h4>
        <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
          <p><strong>Salik (Dubai):</strong> Electronic toll collection system for Dubai roads</p>
          <p><strong>Darb (Abu Dhabi):</strong> Electronic toll collection system for Abu Dhabi roads</p>
          <p><strong>Recommended:</strong> Rebill Actual (monthly) for corporate accounts to maintain cost transparency</p>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Traffic Fines Management</h4>
        <div className="text-sm text-red-800 dark:text-red-200 space-y-2">
          <p><strong>Auto Rebill:</strong> Lessor pays fines and charges customer with admin fee</p>
          <p><strong>Customer Direct:</strong> Customer receives fines directly and handles payment</p>
          <p><strong>Note:</strong> Auto rebill ensures faster resolution but includes admin processing fee</p>
        </div>
      </div>
    </div>
  );
};
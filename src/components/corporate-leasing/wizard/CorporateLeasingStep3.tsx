import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { LOVSelect } from '@/components/ui/lov-select';
import { RequiredLabel } from '@/components/ui/required-label';
import { 
  BILLING_DAYS,
  INVOICE_FORMATS,
  LINE_ITEM_GRANULARITIES
} from '@/hooks/useCorporateLeasingLOVs';

interface CorporateLeasingStep3Props {
  form: UseFormReturn<any>;
}

export const CorporateLeasingStep3: React.FC<CorporateLeasingStep3Props> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="billing_day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Billing Day</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={BILLING_DAYS}
                  placeholder="Select billing day..."
                  error={!!form.formState.errors.billing_day}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Invoice Format</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={INVOICE_FORMATS}
                  placeholder="Select invoice format..."
                  error={!!form.formState.errors.invoice_format}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="line_item_granularity"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>
                <RequiredLabel>Line Item Granularity</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={LINE_ITEM_GRANULARITIES}
                  placeholder="Select granularity level..."
                  error={!!form.formState.errors.line_item_granularity}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium text-white mb-2">Default Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Billing Cycle:</span> Monthly (Fixed)
          </div>
          <div>
            <span className="font-medium">Currency:</span> AED (Primary)
          </div>
          <div>
            <span className="font-medium">VAT Code:</span> UAE 5%
          </div>
          <div>
            <span className="font-medium">Discount Schema:</span> None (Default)
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Invoice Format Guidelines</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li><strong>Consolidated:</strong> One invoice for all vehicles in the agreement</li>
          <li><strong>Per Vehicle:</strong> Separate invoice for each vehicle</li>
          <li><strong>Per Cost Center:</strong> Invoices grouped by cost center allocation</li>
        </ul>
      </div>
    </div>
  );
};
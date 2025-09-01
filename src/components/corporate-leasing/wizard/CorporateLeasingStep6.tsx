import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LOVSelect } from '@/components/ui/lov-select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SECURITY_INSTRUMENTS } from '@/hooks/useCorporateLeasingLOVs';

interface CorporateLeasingStep6Props {
  form: UseFormReturn<any>;
}

export const CorporateLeasingStep6: React.FC<CorporateLeasingStep6Props> = ({ form }) => {
  const securityInstrument = form.watch('security_instrument');
  const slaCreditsEnabled = form.watch('sla_credits_enabled');
  const contractStartDate = form.watch('contract_start_date');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="security_instrument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security Instrument</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value === 'None') {
                      form.setValue('deposit_amount_aed', undefined);
                    }
                  }}
                  items={SECURITY_INSTRUMENTS}
                  placeholder="Select security instrument..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {securityInstrument && securityInstrument !== 'None' && (
          <FormField
            control={form.control}
            name="deposit_amount_aed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {securityInstrument === 'Deposit per Vehicle' ? 'Deposit per Vehicle (AED)' : 'Bank Guarantee Amount (AED)'}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    placeholder={`Enter ${securityInstrument === 'Deposit per Vehicle' ? 'deposit' : 'guarantee'} amount...`} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="contract_start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contract_end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    disabled={(date) => contractStartDate ? date <= new Date(contractStartDate) : date <= new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="sla_credits_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue('sla_credits_percentage', undefined);
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Enable SLA Credits</FormLabel>
                <p className="text-sm text-card-foreground">
                  Provide credits for service level agreement breaches
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {slaCreditsEnabled && (
          <FormField
            control={form.control}
            name="sla_credits_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SLA Credits Percentage (% of monthly rent)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    placeholder="e.g., 5 for 5% of monthly rent..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="telematics_consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Data Privacy & Telematics Consent</FormLabel>
                <p className="text-sm text-card-foreground">
                  Customer consents to vehicle telematics data collection and processing for fleet management purposes
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter any additional terms, conditions, or notes for this agreement..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Agreement Summary</h4>
        <p className="text-sm text-green-800 dark:text-green-200">
          Once you create this agreement, it will be saved in draft status. You can add vehicles, configure pricing, 
          and finalize terms before activating the agreement. The agreement number will be auto-generated upon creation.
        </p>
      </div>
    </div>
  );
};
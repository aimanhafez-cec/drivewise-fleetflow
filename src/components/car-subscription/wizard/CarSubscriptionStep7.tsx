import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  PAYMENT_METHOD_TYPES,
  SECURITY_DEPOSIT_OPTIONS
} from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep7Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep7: React.FC<CarSubscriptionStep7Props> = ({ form }) => {
  const securityDeposit = form.watch('security_deposit');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payments & Collections</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="security_deposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security Deposit *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select security deposit option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SECURITY_DEPOSIT_OPTIONS.map((option) => (
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

        {securityDeposit === 'Fixed Amount' && (
          <FormField
            control={form.control}
            name="deposit_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deposit Amount (AED)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Security deposit amount"
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
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHOD_TYPES.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.label}
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
          name="auto_charge_retries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auto-charge Retries *</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retry attempts" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="2">2 attempts</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Dunning & Collection Rules</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dunning Rules</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-muted-foreground">
                Email/SMS Day 0/3/7 → Suspend Day X
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Suspension Behavior</label>
            <Select defaultValue="Notice only">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Disallow driving">Disallow driving</SelectItem>
                <SelectItem value="Notice only">Notice only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Payment Processing</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Card Autopay:</strong> Automatic monthly charging. Recommended for subscriptions.</p>
          <p><strong>Direct Debit:</strong> Bank account deduction. Requires customer authorization.</p>
          <p><strong>Invoice (Corporate):</strong> Manual invoice payment. Suitable for corporate customers.</p>
          <p><strong>Suspension:</strong> "Notice only" allows continued driving with payment reminders. "Disallow driving" blocks vehicle access.</p>
        </div>
      </div>
    </div>
  );
};
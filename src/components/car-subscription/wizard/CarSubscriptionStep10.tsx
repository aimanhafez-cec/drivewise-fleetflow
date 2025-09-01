import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  SWAP_REQUEST_FLOWS,
  FINAL_BILLING_TYPES,
  FUEL_LEVELS
} from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep10Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep10: React.FC<CarSubscriptionStep10Props> = ({ form }) => {
  const buyoutOffer = form.watch('buyout_offer');
  const subscriptionModel = form.watch('subscription_model');
  const vehicleId = form.watch('vehicle_id');

  // Show handover section only if specific VIN is assigned
  const showHandover = subscriptionModel === 'By Specific VIN' && vehicleId;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Renewal / Swap / Exit & Handover</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Renewal & Swap Management</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="auto_renew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Auto-Renew</FormLabel>
                  <div className="text-sm text-card-foreground">
                    Automatically renew subscription at end of cycle
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="swap_request_flow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Swap Request Flow *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='text-muted-foreground'>
                      <SelectValue placeholder="Select swap request flow" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SWAP_REQUEST_FLOWS.map((flow) => (
                      <SelectItem key={flow.id} value={flow.id}>
                        {flow.label}
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
            name="exit_inspection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Exit Inspection Required</FormLabel>
                  <div className="text-sm text-card-foreground">
                    Mandatory inspection before subscription termination
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="final_billing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Billing *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='text-muted-foreground'>
                      <SelectValue placeholder="Select final billing method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FINAL_BILLING_TYPES.map((billing) => (
                      <SelectItem key={billing.id} value={billing.id}>
                        {billing.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Buyout Options</h4>
          
          <FormField
            control={form.control}
            name="buyout_offer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Buyout Offer Available</FormLabel>
                  <div className="text-sm text-card-foreground">
                    Allow customer to purchase vehicle at end of subscription
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {buyoutOffer && (
            <FormField
              control={form.control}
              name="buyout_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyout Amount (AED)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Vehicle buyout price"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {showHandover && (
        <div className="space-y-4">
          <h4 className="font-medium">Handover (Vehicle Assignment)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="odometer_out"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer Out (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Current odometer reading"
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
              name="fuel_level_out"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Level Out</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUEL_LEVELS.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition Report Out</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-card-foreground">Front</p>
                <p className="text-xs text-card-foreground">Click to upload</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-card-foreground">Rear</p>
                <p className="text-xs text-card-foreground">Click to upload</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-card-foreground">Left</p>
                <p className="text-xs text-card-foreground">Click to upload</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-card-foreground">Right</p>
                <p className="text-xs text-card-foreground">Click to upload</p>
              </div>
            </div>
            <p className="text-sm text-card-foreground">
              Vehicle condition photos and notes required for handover
            </p>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional comments or special instructions..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Subscription Lifecycle</h4>
        <div className="text-sm text-card-foreground space-y-1">
          <p><strong>Self-service App:</strong> Customers can request swaps through mobile app</p>
          <p><strong>Pro-rata Billing:</strong> Final bill calculated based on actual usage days</p>
          <p><strong>Exit Inspection:</strong> Ensures vehicle condition assessment before return</p>
          <p><strong>Buyout Option:</strong> Provides path to vehicle ownership for long-term subscribers</p>
        </div>
      </div>
    </div>
  );
};
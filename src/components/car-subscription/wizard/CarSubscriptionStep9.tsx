import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  MAINTENANCE_TRIGGERS,
  PREFERRED_WORKSHOPS,
  CONDITION_REPORT_CADENCES
} from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep9Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep9: React.FC<CarSubscriptionStep9Props> = ({ form }) => {
  const maintenanceTrigger = form.watch('maintenance_trigger');
  const telematicsDevice = form.watch('telematics_device');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Operations & Service</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Maintenance Management</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="maintenance_trigger"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Trigger *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance trigger" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MAINTENANCE_TRIGGERS.map((trigger) => (
                      <SelectItem key={trigger.id} value={trigger.id}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(maintenanceTrigger === 'Every X km' || maintenanceTrigger === 'Both (first due)') && (
            <FormField
              control={form.control}
              name="maintenance_km_interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance KM Interval</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(maintenanceTrigger === 'Every Y months' || maintenanceTrigger === 'Both (first due)') && (
            <FormField
              control={form.control}
              name="maintenance_month_interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Month Interval</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="12"
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
            name="preferred_workshop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Workshop *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred workshop" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PREFERRED_WORKSHOPS.map((workshop) => (
                      <SelectItem key={workshop.id} value={workshop.id}>
                        {workshop.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="auto_create_service_jobs"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Auto-Create Service Jobs</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Automatically create maintenance tasks in OFS/Service Logistics
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
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Telematics & Tracking</h4>
        
        <FormField
          control={form.control}
          name="telematics_device"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Telematics Device</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Install GPS tracking device in vehicle
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

        {telematicsDevice && (
          <>
            <FormField
              control={form.control}
              name="telematics_device_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telematics Device ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Device identifier"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tracking_consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tracking Consent</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Customer consent for GPS tracking and data collection
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
          </>
        )}

        <FormField
          control={form.control}
          name="condition_report_cadence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition Report Cadence *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition report frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONDITION_REPORT_CADENCES.map((cadence) => (
                    <SelectItem key={cadence.id} value={cadence.id}>
                      {cadence.label}
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
        <h4 className="font-medium mb-2">Service Operations</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>OEM Workshop:</strong> Authorized dealer service centers</p>
          <p><strong>In-house:</strong> Company-owned service facilities</p>
          <p><strong>Partner:</strong> Approved third-party service providers</p>
          <p><strong>Telematics:</strong> Enables usage tracking, condition monitoring, and automated reporting</p>
          <p><strong>Auto Service Jobs:</strong> Integrates with OFS for automated maintenance scheduling</p>
        </div>
      </div>
    </div>
  );
};
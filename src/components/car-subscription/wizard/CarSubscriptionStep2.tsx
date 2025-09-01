import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { VehicleClassSelect, VehicleSelect } from "@/components/ui/select-components";
import { SUBSCRIPTION_MODELS } from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep2Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep2: React.FC<CarSubscriptionStep2Props> = ({ form }) => {
  const subscriptionModel = form.watch('subscription_model');
  const vehicleId = form.watch('vehicle_id');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Vehicle / Class</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="subscription_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-muted-foreground">
                    <SelectValue placeholder="Select subscription model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUBSCRIPTION_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {subscriptionModel === 'By Class' && (
          <FormField
            control={form.control}
            name="vehicle_class_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Class *</FormLabel>
                <FormControl>
                  <VehicleClassSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select vehicle class"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {subscriptionModel === 'By Specific VIN' && (
          <FormField
            control={form.control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle (VIN) *</FormLabel>
                <FormControl>
                  <VehicleSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select specific vehicle"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {vehicleId && (
          <FormField
            control={form.control}
            name="plate_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plate No.</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Auto-filled from vehicle"
                    {...field}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {vehicleId && (
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
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Subscription Model Information</h4>
        <div className="text-sm text-card-foreground space-y-1">
          <p><strong>By Class:</strong> Customer subscribes to a vehicle class (e.g., Economy, SUV). Actual vehicle assigned based on availability.</p>
          <p><strong>By Specific VIN:</strong> Customer subscribes to a specific vehicle. Plate number and odometer reading are recorded at start.</p>
        </div>
      </div>
    </div>
  );
};
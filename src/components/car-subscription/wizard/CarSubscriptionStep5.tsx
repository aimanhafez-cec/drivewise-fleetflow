import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  INSURANCE_TYPES,
  MAINTENANCE_INCLUSIONS
} from "@/hooks/useCarSubscriptionLOVs";

interface CarSubscriptionStep5Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep5: React.FC<CarSubscriptionStep5Props> = ({ form }) => {
  const replacementVehicle = form.watch('replacement_vehicle');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Inclusions (All-Inclusive Toggles)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="insurance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Insurance *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INSURANCE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
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
          name="maintenance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance inclusion" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MAINTENANCE_INCLUSIONS.map((inclusion) => (
                    <SelectItem key={inclusion.id} value={inclusion.id}>
                      {inclusion.label}
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
          name="tyres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tyres *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tyres inclusion" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MAINTENANCE_INCLUSIONS.map((inclusion) => (
                    <SelectItem key={inclusion.id} value={inclusion.id}>
                      {inclusion.label}
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
          name="roadside_assistance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roadside Assistance *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roadside assistance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Included">Included</SelectItem>
                  <SelectItem value="Optional">Optional</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registration_renewal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration & Renewal *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select registration handling" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Included">Included</SelectItem>
                  <SelectItem value="Customer Pays">Customer Pays</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="replacement_vehicle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Replacement Vehicle *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select replacement vehicle policy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Included">Included</SelectItem>
                  <SelectItem value="Not Included">Not Included</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {replacementVehicle === 'Included' && (
          <FormField
            control={form.control}
            name="replacement_sla"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replacement SLA (Hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 24"
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
        <h4 className="font-medium mb-2">All-Inclusive Benefits</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Comprehensive Insurance:</strong> Full coverage with minimal customer liability</p>
          <p><strong>Maintenance Included:</strong> All scheduled maintenance covered</p>
          <p><strong>Tyres Included:</strong> Tyre replacement and repairs covered</p>
          <p><strong>Roadside Assistance:</strong> 24/7 roadside support</p>
          <p><strong>Registration:</strong> Vehicle registration and renewal handled</p>
          <p><strong>Replacement Vehicle:</strong> Courtesy car during maintenance</p>
        </div>
      </div>
    </div>
  );
};
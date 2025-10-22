import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CustomerSelect } from "@/components/ui/select-components";

interface CarSubscriptionStep1Props {
  form: UseFormReturn<any>;
}

export const CarSubscriptionStep1: React.FC<CarSubscriptionStep1Props> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Agreement & Parties</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="customer_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-muted-foreground">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Person">Person</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer (Account) *</FormLabel>
              <FormControl>
                <CustomerSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select customer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bill_to_contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill-to Contact</FormLabel>
              <FormControl>
                <Input
                  placeholder="Primary contact name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Primary Driver(s)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Driver name" />
          <Input placeholder="Mobile number" />
          <Input placeholder="Email address" />
        </div>
        <p className="text-sm text-card-foreground">
          Primary drivers are optional but recommended for extra driver rule checks
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">KYC Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-card-foreground">Emirates ID</p>
            <p className="text-xs text-card-foreground">Click to upload</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-card-foreground">Passport</p>
            <p className="text-xs text-card-foreground">Click to upload</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-card-foreground">License</p>
            <p className="text-xs text-card-foreground">Click to upload</p>
          </div>
        </div>
        <p className="text-sm text-card-foreground">
          KYC documents are required. Please validate expiry dates.
        </p>
      </div>
    </div>
  );
};
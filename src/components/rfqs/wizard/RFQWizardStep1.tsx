import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";

interface RFQWizardStep1Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const RFQWizardStep1: React.FC<RFQWizardStep1Props> = ({
  data,
  onChange,
  errors,
}) => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="customer-select" className="text-sm font-medium">
            Customer *
          </label>
          <Select
            value={data.customer_id || ""}
            onValueChange={(value) => onChange({ customer_id: value })}
          >
            <SelectTrigger id="customer-select" className="mt-1">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading customers...
                </SelectItem>
              ) : (
                customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div>
                      <div className="font-medium">{customer.full_name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.customer && <FormError message={errors.customer} />}
        </div>

        {data.customer_id && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Selected Customer</h4>
            {customers?.find(c => c.id === data.customer_id) && (
              <div className="text-sm space-y-1">
                <div>
                  <strong>Name:</strong> {customers.find(c => c.id === data.customer_id)?.full_name}
                </div>
                <div>
                  <strong>Email:</strong> {customers.find(c => c.id === data.customer_id)?.email}
                </div>
                {customers.find(c => c.id === data.customer_id)?.phone && (
                  <div>
                    <strong>Phone:</strong> {customers.find(c => c.id === data.customer_id)?.phone}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
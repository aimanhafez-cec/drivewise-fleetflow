import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface QuoteWizardStep1Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep1: React.FC<QuoteWizardStep1Props> = ({
  data,
  onChange,
  errors,
}) => {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .order("full_name");
      if (error) throw error;
      return data as Customer[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Select
            value={data.customer_id || ""}
            onValueChange={(value) => onChange({ customer_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="__loading__" disabled>Loading customers...</SelectItem>
              ) : customers.length === 0 ? (
                <SelectItem value="__no_customers__" disabled>No customers found</SelectItem>
              ) : (
                customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.customer && (
            <p className="text-sm text-destructive">{errors.customer}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>

        {data.customer_id && (
          <Card className="bg-muted">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Selected Customer</h4>
              {customers.find(c => c.id === data.customer_id) && (
                <div className="space-y-1 text-sm">
                  <p>{customers.find(c => c.id === data.customer_id)?.full_name}</p>
                  <p className="text-muted-foreground">
                    {customers.find(c => c.id === data.customer_id)?.email}
                  </p>
                  {customers.find(c => c.id === data.customer_id)?.phone && (
                    <p className="text-muted-foreground">
                      {customers.find(c => c.id === data.customer_id)?.phone}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
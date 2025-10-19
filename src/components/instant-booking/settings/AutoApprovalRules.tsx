import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AutoApprovalRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRules, setEditingRules] = useState<Record<string, any>>({});

  const { data: rules, isLoading } = useQuery({
    queryKey: ['instant-booking-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instant_booking_rules')
        .select('*')
        .order('customer_type');

      if (error) throw error;
      return data;
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('instant_booking_rules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Rule Updated',
        description: 'Auto-approval rule has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['instant-booking-rules'] });
      setEditingRules({});
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Unable to update rule. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveRule = (ruleId: string) => {
    const updates = editingRules[ruleId];
    if (updates) {
      updateRule.mutate({ id: ruleId, updates });
    }
  };

  const handleFieldChange = (ruleId: string, field: string, value: any) => {
    setEditingRules((prev) => ({
      ...prev,
      [ruleId]: {
        ...prev[ruleId],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Approval Rules</CardTitle>
          <CardDescription>
            Configure automatic approval limits based on customer type and booking criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rules?.map((rule) => {
            const editing = editingRules[rule.id] || {};
            const currentValues = { ...rule, ...editing };

            return (
              <Card key={rule.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {rule.customer_type === 'Company' ? 'Corporate' : 'Individual'} Customers
                      </CardTitle>
                      <Badge variant={currentValues.is_active ? 'default' : 'outline'}>
                        {currentValues.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Switch
                      checked={currentValues.is_active}
                      onCheckedChange={(checked) =>
                        handleFieldChange(rule.id, 'is_active', checked)
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Max Auto-Approve Amount */}
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${rule.id}`}>
                        Maximum Auto-Approve Amount (AED)
                      </Label>
                      <Input
                        id={`amount-${rule.id}`}
                        type="number"
                        value={currentValues.max_auto_approve_amount}
                        onChange={(e) =>
                          handleFieldChange(
                            rule.id,
                            'max_auto_approve_amount',
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Max Rental Days */}
                    <div className="space-y-2">
                      <Label htmlFor={`days-${rule.id}`}>Maximum Rental Days</Label>
                      <Input
                        id={`days-${rule.id}`}
                        type="number"
                        value={currentValues.max_rental_days || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            rule.id,
                            'max_rental_days',
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                      />
                    </div>

                    {/* Verification Required */}
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor={`verify-${rule.id}`}>Require Customer Verification</Label>
                      <Switch
                        id={`verify-${rule.id}`}
                        checked={currentValues.require_customer_verification}
                        onCheckedChange={(checked) =>
                          handleFieldChange(rule.id, 'require_customer_verification', checked)
                        }
                      />
                    </div>

                    {/* Vehicle Restriction */}
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor={`vehicle-${rule.id}`}>Restrict Vehicle Assignment</Label>
                      <Switch
                        id={`vehicle-${rule.id}`}
                        checked={currentValues.restrict_vehicle_assignment}
                        onCheckedChange={(checked) =>
                          handleFieldChange(rule.id, 'restrict_vehicle_assignment', checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Grace Period */}
                  <div className="space-y-2">
                    <Label htmlFor={`grace-${rule.id}`}>Grace Period (hours)</Label>
                    <Input
                      id={`grace-${rule.id}`}
                      type="number"
                      value={currentValues.grace_period_hours || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          rule.id,
                          'grace_period_hours',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="Enter grace period in hours"
                    />
                  </div>

                  {/* Save Button */}
                  {Object.keys(editing).length > 0 && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newRules = { ...editingRules };
                          delete newRules[rule.id];
                          setEditingRules(newRules);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveRule(rule.id)}
                        disabled={updateRule.isPending}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Additional Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>
            Configure default values for all instant bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Down Payment Percentage</Label>
              <Input type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label>Minimum Down Payment (AED)</Label>
              <Input type="number" defaultValue="500" />
            </div>
            <div className="space-y-2">
              <Label>Cancellation Window (hours)</Label>
              <Input type="number" defaultValue="24" />
            </div>
            <div className="space-y-2">
              <Label>Auto-Cancellation After (hours)</Label>
              <Input type="number" defaultValue="48" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoApprovalRules;

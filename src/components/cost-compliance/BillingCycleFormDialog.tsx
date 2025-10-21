import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateBillingCycle } from '@/hooks/useCostCompliance';
import { useToast } from '@/hooks/use-toast';

const billingCycleSchema = z.object({
  contract_id: z.string().min(1, 'Contract is required'),
  cycle_name: z.string().min(1, 'Cycle name is required').max(200),
  billing_period_start: z.string().min(1, 'Start date is required'),
  billing_period_end: z.string().min(1, 'End date is required'),
  billing_frequency: z.enum(['monthly', 'quarterly', 'annual', 'custom']),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().max(1000).optional(),
});

type BillingCycleFormData = z.infer<typeof billingCycleSchema>;

interface BillingCycleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BillingCycleFormDialog: React.FC<BillingCycleFormDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateBillingCycle();

  const form = useForm<BillingCycleFormData>({
    resolver: zodResolver(billingCycleSchema),
    defaultValues: {
      contract_id: '',
      cycle_name: '',
      billing_period_start: '',
      billing_period_end: '',
      billing_frequency: 'monthly',
      currency: 'AED',
      notes: '',
    },
  });

  const onSubmit = async (data: BillingCycleFormData) => {
    try {
      await createMutation.mutateAsync(data as any);
      toast({ title: 'Billing cycle created successfully' });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to create billing cycle',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Billing Cycle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contract_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract ID <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="CONTRACT-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the contract identifier to generate billing for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cycle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="January 2025 Billing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Start <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period End <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional billing notes..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Billing Cycle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

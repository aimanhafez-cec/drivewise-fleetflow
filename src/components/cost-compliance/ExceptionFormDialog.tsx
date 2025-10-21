import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerSelect, VehicleSelect } from '@/components/ui/select-components';
import { useCreateException, useUpdateException } from '@/hooks/useComplianceExceptions';
import { useToast } from '@/hooks/use-toast';

const exceptionSchema = z.object({
  vehicle_id: z.string().optional(),
  customer_id: z.string().optional(),
  contract_id: z.string().optional(),
  exception_type: z.enum(['billing', 'pricing', 'contract_terms', 'usage', 'overcharge', 'undercharge', 'missing_charge', 'duplicate_charge', 'rate_error', 'other']),
  exception_reason: z.string().min(1, 'Exception reason is required').max(500),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  amount_involved: z.string().optional().refine((val) => !val || !isNaN(Number(val)), {
    message: 'Must be a valid number',
  }),
  currency: z.string().optional(),
  detection_method: z.enum(['manual', 'automated', 'customer_reported']),
  detection_rule: z.string().max(200).optional(),
  assigned_to: z.string().max(100).optional(),
  resolution_notes: z.string().max(1000).optional(),
});

type ExceptionFormData = z.infer<typeof exceptionSchema>;

interface ExceptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exception?: any;
}

export const ExceptionFormDialog: React.FC<ExceptionFormDialogProps> = ({
  open,
  onOpenChange,
  exception,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateException();
  const updateMutation = useUpdateException();

  const form = useForm<ExceptionFormData>({
    resolver: zodResolver(exceptionSchema),
    defaultValues: {
      vehicle_id: exception?.vehicle_id || '',
      customer_id: exception?.customer_id || '',
      contract_id: exception?.contract_id || '',
      exception_type: exception?.exception_type || 'billing',
      exception_reason: exception?.exception_reason || '',
      severity: exception?.severity || 'medium',
      amount_involved: exception?.amount_involved?.toString() || '',
      currency: exception?.currency || 'AED',
      detection_method: exception?.detection_method || 'manual',
      detection_rule: exception?.detection_rule || '',
      assigned_to: exception?.assigned_to || '',
      resolution_notes: exception?.resolution_notes || '',
    },
  });

  const onSubmit = async (data: ExceptionFormData) => {
    try {
      const payload = {
        source_module: 'other' as const,
        source_record_id: exception?.id || 'manual',
        ...data,
        amount_involved: data.amount_involved ? Number(data.amount_involved) : undefined,
        auto_detected: data.detection_method === 'automated',
      };

      if (exception?.id) {
        await updateMutation.mutateAsync({ id: exception.id, data: payload as any });
        toast({ title: 'Exception updated successfully' });
      } else {
        await createMutation.mutateAsync(payload as any);
        toast({ title: 'Exception created successfully' });
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save exception',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exception ? 'Edit Exception' : 'New Exception'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exception_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exception Type <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="pricing">Pricing</SelectItem>
                        <SelectItem value="contract_terms">Contract Terms</SelectItem>
                        <SelectItem value="usage">Usage</SelectItem>
                        <SelectItem value="overcharge">Overcharge</SelectItem>
                        <SelectItem value="undercharge">Undercharge</SelectItem>
                        <SelectItem value="missing_charge">Missing Charge</SelectItem>
                        <SelectItem value="duplicate_charge">Duplicate Charge</SelectItem>
                        <SelectItem value="rate_error">Rate Error</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <FormControl>
                    <VehicleSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <CustomerSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exception_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exception Reason <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the exception in detail..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount_involved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Involved</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
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

              <FormField
                control={form.control}
                name="detection_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detection Method <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automated">Automated</SelectItem>
                        <SelectItem value="customer_reported">Customer Reported</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="detection_rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detection Rule</FormLabel>
                  <FormControl>
                    <Input placeholder="RULE-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <Input placeholder="User email or name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolution_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes on how this exception was resolved..."
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
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Exception'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

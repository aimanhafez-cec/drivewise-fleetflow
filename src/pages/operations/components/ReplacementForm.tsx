import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateReplacement } from '@/hooks/useReplacements';
import { CreateCustodyData } from '@/lib/api/replacements';

const replacementSchema = z.object({
  agreement_id: z.string().min(1, 'Agreement is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  original_vehicle_id: z.string().min(1, 'Original vehicle is required'),
  replacement_vehicle_id: z.string().optional(),
  custodian_name: z.string().min(1, 'Custodian name is required'),
  custodian_type: z.enum(['customer', 'driver', 'originator']),
  reason_code: z.enum(['accident', 'breakdown', 'maintenance', 'damage', 'other']),
  incident_narrative: z.string().optional(),
  incident_date: z.string().min(1, 'Incident date is required'),
  effective_from: z.string().min(1, 'Effective date is required'),
  expected_return_date: z.string().optional(),
  rate_policy: z.enum(['inherit', 'prorate', 'free', 'special_code']),
  special_rate_code: z.string().optional(),
  branch_id: z.string().optional(),
  notes: z.string().optional(),
});

type ReplacementFormData = z.infer<typeof replacementSchema>;

const ReplacementForm: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateReplacement();

  const form = useForm<ReplacementFormData>({
    resolver: zodResolver(replacementSchema),
    defaultValues: {
      reason_code: 'accident',
      rate_policy: 'inherit',
      custodian_type: 'customer',
      custodian_name: '',
      incident_date: new Date().toISOString().split('T')[0],
      effective_from: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: ReplacementFormData) => {
    createMutation.mutate(data as CreateCustodyData, {
      onSuccess: () => {
        navigate('/operations/replacements');
      },
    });
  };

  const ratePolicy = form.watch('rate_policy');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Agreement & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="agreement_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agreement *</FormLabel>
                <FormControl>
                  <Input placeholder="Select agreement..." {...field} />
                </FormControl>
                <FormDescription>The rental agreement for this replacement</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <FormControl>
                  <Input placeholder="Select customer..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="affected_vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Affected Vehicle *</FormLabel>
                <FormControl>
                  <Input placeholder="Select vehicle..." {...field} />
                </FormControl>
                <FormDescription>Vehicle being replaced</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="replacement_vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replacement Vehicle</FormLabel>
                <FormControl>
                  <Input placeholder="Select replacement vehicle..." {...field} />
                </FormControl>
                <FormDescription>Leave empty to assign later</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reason & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="reason_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                    <SelectItem value="scheduled_maintenance">Scheduled Maintenance</SelectItem>
                    <SelectItem value="recall">Recall</SelectItem>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="upgrade_downgrade">Upgrade/Downgrade</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incident_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Date *</FormLabel>
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
          name="reason_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide additional details about the replacement reason..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="effective_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective From *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>When the replacement starts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected_return_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Return Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Optional estimated return date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rate Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="rate_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Policy *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate policy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="special_code">Special Code</SelectItem>
                    <SelectItem value="waived">Waived</SelectItem>
                    <SelectItem value="customer_pays">Customer Pays</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {ratePolicy === 'special_code' && (
            <FormField
              control={form.control}
              name="special_rate_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Rate Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter special rate code..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {ratePolicy === 'customer_pays' && (
            <FormField
              control={form.control}
              name="daily_rate_override"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate Override (AED)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <FormControl>
                  <Input placeholder="Select branch..." {...field} />
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
                  placeholder="Additional notes or instructions..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/operations/replacements')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Replacement'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReplacementForm;

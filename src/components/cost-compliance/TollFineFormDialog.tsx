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
import { useCreateTollFine, useUpdateTollFine } from '@/hooks/useTollsFines';
import { useToast } from '@/hooks/use-toast';

const tollFineSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  customer_id: z.string().optional(),
  contract_id: z.string().optional(),
  type: z.enum(['toll', 'fine']),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  currency: z.string().min(1, 'Currency is required'),
  penalty_amount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), {
    message: 'Must be a valid number',
  }),
  incident_date: z.string().min(1, 'Date is required'),
  incident_time: z.string().optional(),
  location: z.string().max(200).optional(),
  gate_id: z.string().max(50).optional(),
  plate_number: z.string().max(20).optional(),
  issuing_authority: z.string().min(1, 'Issuing authority is required'),
  violation_code: z.string().max(50).optional(),
  external_reference_no: z.string().max(100).optional(),
  due_date: z.string().optional(),
  responsibility: z.enum(['customer', 'company', 'driver']).optional(),
  billable_to_contract: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

type TollFineFormData = z.infer<typeof tollFineSchema>;

interface TollFineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tollFine?: any;
}

export const TollFineFormDialog: React.FC<TollFineFormDialogProps> = ({
  open,
  onOpenChange,
  tollFine,
}) => {
  const { toast } = useToast();
  const createMutation = useCreateTollFine();
  const updateMutation = useUpdateTollFine();

  const form = useForm<TollFineFormData>({
    resolver: zodResolver(tollFineSchema),
    defaultValues: {
      vehicle_id: tollFine?.vehicle_id || '',
      customer_id: tollFine?.customer_id || '',
      contract_id: tollFine?.contract_id || '',
      type: tollFine?.type || 'toll',
      category: tollFine?.category || 'toll_road',
      amount: tollFine?.amount?.toString() || '',
      currency: tollFine?.currency || 'AED',
      penalty_amount: tollFine?.penalty_amount?.toString() || '',
      incident_date: tollFine?.incident_date || new Date().toISOString().split('T')[0],
      incident_time: tollFine?.incident_time || '',
      location: tollFine?.location || '',
      gate_id: tollFine?.gate_id || '',
      plate_number: tollFine?.plate_number || '',
      issuing_authority: tollFine?.issuing_authority || '',
      violation_code: tollFine?.violation_code || '',
      external_reference_no: tollFine?.external_reference_no || '',
      due_date: tollFine?.due_date || '',
      responsibility: tollFine?.responsibility || 'customer',
      billable_to_contract: tollFine?.billable_to_contract ?? true,
      notes: tollFine?.notes || '',
    },
  });

  const watchType = form.watch('type');

  const onSubmit = async (data: TollFineFormData) => {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        penalty_amount: data.penalty_amount ? Number(data.penalty_amount) : undefined,
        billable_to_contract: data.billable_to_contract ?? true,
      };

      if (tollFine?.id) {
        await updateMutation.mutateAsync({ id: tollFine.id, data: payload as any });
        toast({ title: `${watchType === 'toll' ? 'Toll' : 'Fine'} updated successfully` });
      } else {
        await createMutation.mutateAsync(payload as any);
        toast({ title: `${watchType === 'toll' ? 'Toll' : 'Fine'} created successfully` });
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save record',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tollFine ? `Edit ${watchType === 'toll' ? 'Toll' : 'Fine'}` : `New ${watchType === 'toll' ? 'Toll' : 'Fine'}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="toll">Toll</SelectItem>
                        <SelectItem value="fine">Fine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {watchType === 'toll' ? (
                          <>
                            <SelectItem value="toll_road">Toll Road</SelectItem>
                            <SelectItem value="toll_bridge">Toll Bridge</SelectItem>
                            <SelectItem value="toll_tunnel">Toll Tunnel</SelectItem>
                            <SelectItem value="salik">Salik</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="speeding">Speeding</SelectItem>
                            <SelectItem value="parking">Parking Violation</SelectItem>
                            <SelectItem value="red_light">Red Light</SelectItem>
                            <SelectItem value="illegal_turn">Illegal Turn</SelectItem>
                            <SelectItem value="lane_violation">Lane Violation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </>
                        )}
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
                  <FormLabel>Vehicle <span className="text-destructive">*</span></FormLabel>
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount <span className="text-destructive">*</span></FormLabel>
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
                name="penalty_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty</FormLabel>
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="incident_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incident_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Dubai - Sheikh Zayed Road" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gate_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gate/Point ID</FormLabel>
                    <FormControl>
                      <Input placeholder="GATE-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issuing_authority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Authority <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Dubai Police / RTA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="violation_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Violation Code</FormLabel>
                    <FormControl>
                      <Input placeholder="VL-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="external_reference_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="EXT-REF-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="responsibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsibility</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Who is responsible?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information..."
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
                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

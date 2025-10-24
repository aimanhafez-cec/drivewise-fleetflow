import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const replacementRequestSchema = z.object({
  agreementId: z.string().min(1, 'Agreement is required'),
  requestType: z.string().min(1, 'Request type is required'),
  priority: z.string().min(1, 'Priority is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  expectedDate: z.string().optional(),
  replacementVehicleId: z.string().optional(),
  ratePolicy: z.string().default('inherit'),
  specialInstructions: z.string().optional(),
  internalNotes: z.string().optional(),
});

type ReplacementRequestFormData = z.infer<typeof replacementRequestSchema>;

const NewReplacementRequest: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ReplacementRequestFormData>({
    resolver: zodResolver(replacementRequestSchema),
    defaultValues: {
      agreementId: '',
      requestType: 'maintenance',
      priority: 'normal',
      reason: '',
      description: '',
      expectedDate: '',
      replacementVehicleId: '',
      ratePolicy: 'inherit',
      specialInstructions: '',
      internalNotes: '',
    },
  });

  const onSubmit = (data: ReplacementRequestFormData) => {
    console.log('Form submitted:', data);
    toast({
      title: 'Replacement Request Created',
      description: 'The replacement request has been submitted successfully.',
    });
    navigate('/corporate-leasing-operations/replacement-requests');
  };

  const onSaveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Your replacement request has been saved as a draft.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/corporate-leasing-operations/replacement-requests')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Replacement Request</h1>
            <p className="text-muted-foreground mt-1">Create a new vehicle replacement request for a corporate agreement</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Agreement & Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement & Vehicle Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="agreementId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Corporate Agreement <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a corporate agreement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CA-2025-1234">CA-2025-1234 - Etisalat UAE Fleet</SelectItem>
                        <SelectItem value="CA-2025-1235">CA-2025-1235 - Emirates NBD</SelectItem>
                        <SelectItem value="CA-2025-1236">CA-2025-1236 - du Telecom</SelectItem>
                        <SelectItem value="CA-2025-1237">CA-2025-1237 - ADNOC Distribution</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the corporate agreement for this replacement request</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('agreementId') && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Current Vehicle</p>
                  <p className="text-sm text-muted-foreground">
                    DXB-AA-1234 • BMW 5 Series 2023 • VIN: WBADT43452GZ12345
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Request Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="breakdown">Breakdown</SelectItem>
                          <SelectItem value="upgrade">Upgrade</SelectItem>
                          <SelectItem value="customer_request">Customer Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Priority <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Reason <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Brief reason for replacement" {...field} />
                    </FormControl>
                    <FormDescription>Provide a brief reason (e.g., "Scheduled maintenance required")</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Detailed Description <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information about the replacement request..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Include all relevant details about why this replacement is needed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Completion Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>When do you expect this replacement to be completed?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Replacement Vehicle */}
          <Card>
            <CardHeader>
              <CardTitle>Replacement Vehicle (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="replacementVehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Replacement Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select replacement vehicle (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="V-2025-001">DXB-BB-5678 - BMW 5 Series 2024</SelectItem>
                        <SelectItem value="V-2025-002">DXB-CC-9012 - BMW 5 Series 2024</SelectItem>
                        <SelectItem value="V-2025-003">AUH-DD-3456 - BMW 5 Series 2023</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Leave empty to assign later or for the operations team to select</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ratePolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Policy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate policy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="inherit">Inherit from Agreement</SelectItem>
                        <SelectItem value="adjust">Adjust Rate</SelectItem>
                        <SelectItem value="waive">Waive Charges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How should billing be handled during replacement?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special instructions for this replacement..." className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormDescription>Include any special handling or delivery instructions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Internal notes (not visible to customer)..." className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormDescription>Internal notes for operations team only</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/corporate-leasing-operations/replacement-requests')}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={onSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewReplacementRequest;

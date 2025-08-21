import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ticketsAPI, pricingAPI } from '@/lib/api/operations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatCurrency } from "@/lib/utils";

interface TicketsTabProps {
  agreementId: string;
  customerId: string;
  agreementLines: any[];
}

export const TicketsTab: React.FC<TicketsTabProps> = ({ agreementId, customerId, agreementLines }) => {
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [formData, setFormData] = useState({
    occurredAt: new Date(),
    city: '',
    authority: '',
    typeCode: '',
    amount: '',
    currency: 'AED',
    points: '',
    dueDate: null as Date | null,
    status: 'PENDING',
    billToCustomer: false,
    notes: ''
  });
  const [showOccurredCalendar, setShowOccurredCalendar] = useState(false);
  const [showDueCalendar, setShowDueCalendar] = useState(false);

  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['traffic-tickets', agreementId],
    queryFn: () => ticketsAPI.getTrafficTickets(agreementId)
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticketData: any) => ticketsAPI.createTrafficTicket(ticketData),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-tickets', agreementId] });
      // Recalculate agreement totals if ticket was billed to customer
      if (formData.billToCustomer) {
        await pricingAPI.recalculateAgreementSummary(agreementId);
        queryClient.invalidateQueries({ queryKey: ['agreement', agreementId] });
      }
      toast.success('Traffic ticket added successfully');
      resetForm();
      setTicketModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to add traffic ticket: ' + error.message);
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, status, paidDate }: { id: string; status: string; paidDate?: Date }) => {
      const updateData: any = { status };
      if (paidDate) {
        updateData.court_date = paidDate.toISOString().split('T')[0]; // Using court_date for paid_date
      }
      return ticketsAPI.updateTrafficTicket(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-tickets', agreementId] });
      toast.success('Ticket status updated');
    },
    onError: (error) => {
      toast.error('Failed to update ticket: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      occurredAt: new Date(),
      city: '',
      authority: '',
      typeCode: '',
      amount: '',
      currency: 'AED',
      points: '',
      dueDate: null,
      status: 'PENDING',
      billToCustomer: false,
      notes: ''
    });
    setEditingTicket(null);
  };

  const handleSubmit = async () => {
    const ticketData = {
      agreement_id: agreementId,
      customer_id: customerId,
      line_id: agreementLines[0]?.id, // Default to first line
      vehicle_id: agreementLines[0]?.vehicle_id,
      occurred_at: formData.occurredAt.toISOString(),
      city: formData.city,
      authority: formData.authority,
      type_code: formData.typeCode,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      points: formData.points ? parseInt(formData.points) : null,
      due_date: formData.dueDate?.toISOString().split('T')[0],
      status: formData.status,
      bill_to_customer: formData.billToCustomer,
      notes: formData.notes,
      created_by: (await supabase.auth.getUser()).data.user?.id
    };

    await createTicketMutation.mutateAsync(ticketData);
  };

  const handleMarkPaid = async (ticketId: string) => {
    await updateTicketMutation.mutateAsync({
      id: ticketId,
      status: 'PAID',
      paidDate: new Date()
    });
  };

  const handleDispute = async (ticketId: string) => {
    await updateTicketMutation.mutateAsync({
      id: ticketId,
      status: 'DISPUTED'
    });
  };

  const handleTransfer = async (ticketId: string) => {
    await updateTicketMutation.mutateAsync({
      id: ticketId,
      status: 'TRANSFERRED'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'default';
      case 'PAID': return 'secondary';
      case 'DISPUTED': return 'destructive';
      case 'TRANSFERRED': return 'outline';
      default: return 'default';
    }
  };

  const isFormValid = () => {
    return formData.city && formData.authority && formData.typeCode && formData.amount;
  };

  if (isLoading) {
    return <div className="text-white">Loading traffic tickets...</div>;
  }

  return (
    <div id="tab-tickets" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Traffic Tickets</h3>
        <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
          <DialogTrigger asChild>
            <Button id="btn-ticket-add" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket
            </Button>
          </DialogTrigger>
          <DialogContent id="modal-ticket" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Add Traffic Ticket</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-white">Fields marked * are required.</p>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Violation Date *</Label>
                  <Popover open={showOccurredCalendar} onOpenChange={setShowOccurredCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.occurredAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.occurredAt, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.occurredAt}
                        onSelect={(date) => {
                          if (date) {
                            setFormData(prev => ({ ...prev, occurredAt: date }));
                            setShowOccurredCalendar(false);
                          }
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">City/Location *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city or location"
                  />
                </div>
              </div>

              {/* Authority and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authority">Issuing Authority *</Label>
                  <Input
                    id="authority"
                    value={formData.authority}
                    onChange={(e) => setFormData(prev => ({ ...prev, authority: e.target.value }))}
                    placeholder="e.g., City Police, State Patrol"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeCode">Type/Code *</Label>
                  <Input
                    id="typeCode"
                    value={formData.typeCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, typeCode: e.target.value }))}
                    placeholder="e.g., SPEED, PARK, RED_LIGHT"
                  />
                </div>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="DISPUTED">Disputed</SelectItem>
                      <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover open={showDueCalendar} onOpenChange={setShowDueCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a due date (optional)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate || undefined}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, dueDate: date || null }));
                        setShowDueCalendar(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bill to Customer */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="billToCustomer"
                  checked={formData.billToCustomer}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billToCustomer: !!checked }))}
                />
                <Label htmlFor="billToCustomer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Bill to Customer
                </Label>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setTicketModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!isFormValid()}>
                  Add Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <Table id="tickets-table">
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Authority</TableHead>
                <TableHead className="text-white">Type/Code</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Due Date</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="text-white">{format(new Date(ticket.ticket_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-white">-</TableCell>
                    <TableCell className="text-white">-</TableCell>
                    <TableCell className="text-white">{ticket.violation_type}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-1">
                        {formatCurrency(Number(ticket.fine_amount) || 0)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">
                      {ticket.court_date ? format(new Date(ticket.court_date), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {ticket.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkPaid(ticket.id)}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDispute(ticket.id)}
                            >
                              Dispute
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTransfer(ticket.id)}
                            >
                              Transfer
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-white">
                    No traffic tickets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      {tickets && tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Tickets Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{tickets.length}</div>
                <div className="text-sm text-white">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.status === 'PENDING').length}
                </div>
                <div className="text-sm text-white">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'PAID').length}
                </div>
                <div className="text-sm text-white">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(tickets.reduce((sum, t) => sum + Number(t.fine_amount), 0))}
                </div>
                <div className="text-sm text-white">Total Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
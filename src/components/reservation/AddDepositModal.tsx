import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  customerId: string;
  onDepositAdded: () => void;
}

// B2B payment methods suitable for business customers
const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'corporate_card', label: 'Corporate Credit Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wire_transfer', label: 'Wire Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'eft', label: 'Electronic Funds Transfer' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'corporate_account', label: 'Corporate Account' },
  { value: 'ach', label: 'ACH Transfer' }
];

const PAYMENT_TYPES = [
  { value: 'security_deposit', label: 'Security Deposit' },
  { value: 'advance_payment', label: 'Advance Payment' },
  { value: 'partial_payment', label: 'Partial Payment' },
  { value: 'full_payment', label: 'Full Payment' }
];

export const AddDepositModal: React.FC<AddDepositModalProps> = ({
  open,
  onOpenChange,
  reservationId,
  customerId,
  onDepositAdded
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    paymentType: 'security_deposit',
    reference: '',
    date: new Date()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.paymentMethod) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          reservation_id: reservationId,
          customer_id: customerId,
          amount: parseFloat(formData.amount),
          payment_method: formData.paymentMethod,
          payment_type: formData.paymentType,
          transaction_id: formData.reference || undefined,
          status: 'completed',
          processed_at: formData.date.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deposit has been recorded successfully.",
      });

      // Reset form
      setFormData({
        amount: '',
        paymentMethod: '',
        paymentType: 'security_deposit',
        reference: '',
        date: new Date()
      });

      onDepositAdded();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error adding deposit:', error);
      toast({
        title: "Error",
        description: "Failed to record deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add Customer Deposit
          </DialogTitle>
          <DialogDescription>
            Record a new deposit or payment from the customer for this reservation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select 
                value={formData.paymentType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method *</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              placeholder="Cheque number, transaction ID, etc."
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Deposit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
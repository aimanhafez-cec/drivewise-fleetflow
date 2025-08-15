import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CustomerFormData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  license_number: string;
  license_expiry: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
  credit_rating: number;
  notes: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: any;
  emergency_contact: any;
  license_number: string;
  license_expiry: string;
  date_of_birth: string;
  profile_photo_url: string;
  notes: string;
  credit_rating: number;
  total_spent: number;
  total_rentals: number;
  created_at: string;
  updated_at: string;
}

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>();

  useEffect(() => {
    if (customer) {
      const address = customer.address || {};
      const emergencyContact = customer.emergency_contact || {};
      
      reset({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        date_of_birth: customer.date_of_birth || '',
        license_number: customer.license_number || '',
        license_expiry: customer.license_expiry || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zip: address.zip || '',
        country: address.country || '',
        emergency_name: emergencyContact.name || '',
        emergency_phone: emergencyContact.phone || '',
        emergency_relationship: emergencyContact.relationship || '',
        credit_rating: customer.credit_rating || 0,
        notes: customer.notes || '',
      });
    }
  }, [customer, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const customerData = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        license_number: data.license_number || null,
        license_expiry: data.license_expiry || null,
        address: data.street || data.city || data.state || data.zip || data.country ? {
          street: data.street || null,
          city: data.city || null,
          state: data.state || null,
          zip: data.zip || null,
          country: data.country || null,
        } : null,
        emergency_contact: data.emergency_name || data.emergency_phone || data.emergency_relationship ? {
          name: data.emergency_name || null,
          phone: data.emergency_phone || null,
          relationship: data.emergency_relationship || null,
        } : null,
        credit_rating: data.credit_rating || null,
        notes: data.notes || null,
      };

      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id);
        
        if (error) throw error;
      } else {
        // For new customers, we need to create a user first or handle this differently
        // Since this is a management system, we'll insert directly into profiles
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: `Customer ${customer ? 'updated' : 'created'} successfully`,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            {...register('full_name', { required: 'Full name is required' })}
            placeholder="John Doe"
          />
          {errors.full_name && (
            <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth')}
          />
        </div>

        <div>
          <Label htmlFor="license_number">Driver's License Number</Label>
          <Input
            id="license_number"
            {...register('license_number')}
            placeholder="D123456789"
          />
        </div>

        <div>
          <Label htmlFor="license_expiry">License Expiry</Label>
          <Input
            id="license_expiry"
            type="date"
            {...register('license_expiry')}
          />
        </div>

        <div>
          <Label htmlFor="credit_rating">Credit Rating</Label>
          <Input
            id="credit_rating"
            type="number"
            min="300"
            max="850"
            {...register('credit_rating')}
            placeholder="750"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              {...register('street')}
              placeholder="123 Main St"
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="New York"
            />
          </div>

          <div>
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="NY"
            />
          </div>

          <div>
            <Label htmlFor="zip">ZIP/Postal Code</Label>
            <Input
              id="zip"
              {...register('zip')}
              placeholder="10001"
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergency_name">Name</Label>
            <Input
              id="emergency_name"
              {...register('emergency_name')}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <Label htmlFor="emergency_phone">Phone</Label>
            <Input
              id="emergency_phone"
              {...register('emergency_phone')}
              placeholder="(555) 987-6543"
            />
          </div>

          <div>
            <Label htmlFor="emergency_relationship">Relationship</Label>
            <Input
              id="emergency_relationship"
              {...register('emergency_relationship')}
              placeholder="Spouse, Parent, etc."
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes about the customer..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
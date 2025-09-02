import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Users, Phone, Mail, CreditCard, Calendar } from 'lucide-react';
import CustomerForm from '@/components/customers/CustomerForm';

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

const getCreditRatingBadge = (rating: number) => {
  if (rating >= 750) return { label: 'Excellent', color: 'bg-green-500' };
  if (rating >= 700) return { label: 'Good', color: 'bg-blue-500' };
  if (rating >= 650) return { label: 'Fair', color: 'bg-yellow-500' };
  if (rating >= 600) return { label: 'Poor', color: 'bg-orange-500' };
  return { label: 'Very Poor', color: 'bg-red-500' };
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Customer[];
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter(customer => 
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your customer database</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="min-h-[44px] px-4">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={selectedCustomer}
              onSuccess={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-start sm:items-center sm:space-x-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredCustomers.map((customer) => {
          const creditBadge = getCreditRatingBadge(customer.credit_rating || 0);
          
          return (
            <Card 
              key={customer.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <CardTitle className="text-base sm:text-lg truncate">
                      {customer.full_name}
                    </CardTitle>
                  </div>
                  {customer.credit_rating && (
                    <Badge 
                      variant="secondary" 
                      className={`${creditBadge.color} text-white text-xs shrink-0`}
                    >
                      {creditBadge.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-card-foreground">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-card-foreground">{customer.phone}</span>
                    </div>
                  )}
                  {customer.license_number && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-card-foreground">License: {customer.license_number}</span>
                    </div>
                  )}
                  {customer.license_expiry && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-card-foreground">Expires: {formatDate(customer.license_expiry)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Total Rentals</div>
                    <div className="font-semibold text-card-foreground">{customer.total_rentals || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Total Spent</div>
                    <div className="font-semibold text-card-foreground">AED {(customer.total_spent || 0).toLocaleString()}</div>
                  </div>
                </div>

                {customer.address && (
                  <div className="text-sm">
                    <div className="text-muted-foreground text-xs mb-1">Address</div>
                    <div className="text-xs text-card-foreground">
                      {typeof customer.address === 'object' ? (
                        <>
                          {customer.address.street && <div>{customer.address.street}</div>}
                          {(customer.address.city || customer.address.state || customer.address.zip) && (
                            <div>
                              {customer.address.city}{customer.address.city && customer.address.state ? ', ' : ''}{customer.address.state} {customer.address.zip}
                            </div>
                          )}
                        </>
                      ) : (
                        customer.address
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customers/${customer.id}`);
                    }}
                    className="flex-1 min-h-[44px] text-xs sm:text-sm"
                  >
                    <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomerMutation.mutate(customer.id);
                    }}
                    className="text-destructive hover:text-destructive min-h-[44px] px-3 text-xs sm:text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Customers;
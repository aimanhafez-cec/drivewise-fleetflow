import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Plus, Building2, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  customer_type: 'B2B' | 'B2C' | 'CORPORATE';
  credit_limit?: number;
  total_rentals?: number;
}

interface CustomerDetectorProps {
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomerId?: string;
}

const CustomerDetector: React.FC<CustomerDetectorProps> = ({
  onCustomerSelect,
  selectedCustomerId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState<{
    full_name: string;
    email: string;
    phone: string;
    customer_type: 'B2B' | 'B2C' | 'CORPORATE';
  }>({
    full_name: '',
    email: '',
    phone: '',
    customer_type: 'B2C' as const
  });

  // Search existing customers
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['customer-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data as Customer[];
    },
    enabled: searchTerm.length >= 2
  });

  // Get selected customer details
  const { data: selectedCustomer } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', selectedCustomerId)
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!selectedCustomerId
  });

  const handleCreateCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();
      
      if (error) throw error;
      
      onCustomerSelect(data as Customer);
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'B2B': return 'bg-blue-100 text-blue-800';
      case 'CORPORATE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'B2B':
      case 'CORPORATE':
        return <Building2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>

      <CardContent>
        {selectedCustomer ? (
          // Selected Customer Display
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{selectedCustomer.full_name}</h3>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  )}
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={getCustomerTypeColor(selectedCustomer.customer_type)}>
                  {getCustomerTypeIcon(selectedCustomer.customer_type)}
                  <span className="ml-1">{selectedCustomer.customer_type}</span>
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {selectedCustomer.total_rentals || 0} previous rentals
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onCustomerSelect(null)}
              className="w-full"
            >
              Change Customer
            </Button>
          </div>
        ) : (
          // Customer Selection/Creation
          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Customer</TabsTrigger>
              <TabsTrigger value="new">New Customer</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {isSearching ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onCustomerSelect(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{customer.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getCustomerTypeColor(customer.customer_type)} variant="outline">
                            {customer.customer_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {customer.total_rentals || 0} rentals
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found matching "{searchTerm}"
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Start typing to search for customers
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Full Name *</Label>
                  <Input
                    id="new-name"
                    value={newCustomer.full_name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, full_name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone">Phone</Label>
                  <Input
                    id="new-phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-type">Customer Type</Label>
                  <select
                    id="customer-type"
                    value={newCustomer.customer_type}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      customer_type: e.target.value as 'B2B' | 'B2C' | 'CORPORATE'
                    }))}
                    className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="B2C">B2C - Individual</option>
                    <option value="B2B">B2B - Business</option>
                    <option value="CORPORATE">Corporate Account</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.full_name || !newCustomer.email}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Customer & Continue
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerDetector;
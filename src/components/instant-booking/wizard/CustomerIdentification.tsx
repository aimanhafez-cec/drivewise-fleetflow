import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building2, Phone, Mail, CreditCard, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerIdentificationProps {
  selectedCustomerId: string;
  onCustomerSelect: (customer: any) => void;
}

const CustomerIdentification = ({ selectedCustomerId, onCustomerSelect }: CustomerIdentificationProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customer-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,national_id.ilike.%${searchTerm}%,passport_number.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const { data: selectedCustomer } = useQuery({
    queryKey: ['customer-detail', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', selectedCustomerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomerId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Customer Identification</h2>
        <p className="text-muted-foreground">
          Search for an existing customer or create a new one
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, email, Emirates ID, or passport..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-base h-12"
        />
      </div>

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCustomer.customer_type === 'Company' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedCustomer.customer_type === 'Company' ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {selectedCustomer.full_name}
                    </h3>
                    <Badge variant={selectedCustomer.customer_type === 'Company' ? 'default' : 'secondary'}>
                      {selectedCustomer.customer_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.credit_limit && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit Limit: AED {selectedCustomer.credit_limit.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchTerm.length >= 2 && (
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : customers && customers.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </p>
              {customers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCustomerId === customer.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onCustomerSelect(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        customer.customer_type === 'Company' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {customer.customer_type === 'Company' ? (
                          <Building2 className="h-6 w-6" />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {customer.full_name}
                          </h3>
                          <Badge 
                            variant={customer.customer_type === 'Company' ? 'default' : 'secondary'}
                            className="flex-shrink-0"
                          >
                            {customer.customer_type}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                        
                        {customer.credit_limit && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Credit Limit: AED {customer.credit_limit.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      {selectedCustomerId === customer.id && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : searchTerm.length >= 2 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No customers found matching "{searchTerm}"</p>
                <Button>Create New Customer</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!searchTerm && !selectedCustomerId && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Start typing to search for a customer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerIdentification;

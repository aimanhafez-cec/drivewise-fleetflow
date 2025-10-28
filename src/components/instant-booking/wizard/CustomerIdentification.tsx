import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building2, Phone, Mail, CreditCard, CheckCircle, Lightbulb, History, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface CustomerIdentificationProps {
  selectedCustomerId: string;
  onCustomerSelect: (customer: any) => void;
  onBookAgain?: () => void;
  hasLastBooking?: boolean;
}
const CustomerIdentification = ({
  selectedCustomerId,
  onCustomerSelect,
  onBookAgain,
  hasLastBooking
}: CustomerIdentificationProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: customers,
    isLoading
  } = useQuery({
    queryKey: ['customer-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const {
        data,
        error
      } = await supabase.from('customers').select('*').or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,national_id.ilike.%${searchTerm}%,passport_number.ilike.%${searchTerm}%`).limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2
  });

  // Smart suggestions - similar names when no exact match
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 3 || !customers || customers.length > 0) return [];

    // Get all customers to find similar names
    return [];
  }, [searchTerm, customers]);
  const {
    data: allCustomers
  } = useQuery({
    queryKey: ['all-customers-for-suggestions'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('customers').select('full_name').limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 3 && (!customers || customers.length === 0)
  });

  // Calculate suggestions based on partial matches
  const smartSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 3 || customers && customers.length > 0 || !allCustomers) return [];
    const searchLower = searchTerm.toLowerCase();
    const similar = allCustomers.filter(c => {
      const nameLower = c.full_name?.toLowerCase() || '';
      // Check if parts of the name match
      const nameWords = nameLower.split(' ');
      return nameWords.some(word => word.startsWith(searchLower.substring(0, 2)));
    }).slice(0, 3);
    return similar.length > 0 ? similar : [];
  }, [searchTerm, customers, allCustomers]);
  const {
    data: selectedCustomer
  } = useQuery({
    queryKey: ['customer-detail', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const {
        data,
        error
      } = await supabase.from('customers').select('*').eq('id', selectedCustomerId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomerId
  });
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Customer Identification</h2>
          <p className="text-muted-foreground">
            Search for an existing customer or create a new one
          </p>
        </div>
        <Button variant="outline" className="gap-2 mx-[2px] px-px">
          <User className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search by name, phone, email, Emirates ID, or passport..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 text-base h-12" />
      </div>

      {/* Selected Customer Display */}
      {selectedCustomer && <div className="space-y-3">
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCustomer.customer_type === 'Company' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedCustomer.customer_type === 'Company' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
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
                    {selectedCustomer.phone && <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedCustomer.phone}</span>
                      </div>}
                    {selectedCustomer.email && <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{selectedCustomer.email}</span>
                      </div>}
                    {selectedCustomer.credit_limit && <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Limit: AED {selectedCustomer.credit_limit.toLocaleString()}</span>
                      </div>}
                  </div>
                </div>
                
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Book Again Quick Action */}
          {hasLastBooking && onBookAgain && <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                      <History className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-1">Repeat Customer</h4>
                      <p className="text-sm text-muted-foreground">
                        Pre-fill booking with last reservation preferences
                      </p>
                    </div>
                  </div>
                  <Button onClick={onBookAgain} className="gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700">
                    <Zap className="h-4 w-4" />
                    Book Again
                  </Button>
                </div>
              </CardContent>
            </Card>}
        </div>}

      {/* Search Results */}
      {searchTerm.length >= 2 && <div className="space-y-3">
          {isLoading ? [...Array(3)].map((_, i) => <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>) : smartSuggestions.length > 0 ? <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 mb-2">
                      Did you mean...?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {smartSuggestions.map((suggestion, idx) => <Button key={idx} variant="outline" size="sm" className="bg-white hover:bg-amber-100" onClick={() => setSearchTerm(suggestion.full_name || '')}>
                          {suggestion.full_name}
                        </Button>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> : customers && customers.length > 0 ? <>
              <p className="text-sm text-muted-foreground">
                Found {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </p>
              {customers.map(customer => <Card key={customer.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedCustomerId === customer.id ? 'ring-2 ring-primary' : ''}`} onClick={() => onCustomerSelect(customer)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${customer.customer_type === 'Company' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {customer.customer_type === 'Company' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {customer.full_name}
                          </h3>
                          <Badge variant={customer.customer_type === 'Company' ? 'default' : 'secondary'} className="flex-shrink-0">
                            {customer.customer_type}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {customer.phone && <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>}
                          {customer.email && <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>}
                        </div>
                        
                        {customer.credit_limit && <div className="mt-2 text-xs text-muted-foreground">
                            Credit Limit: AED {customer.credit_limit.toLocaleString()}
                          </div>}
                      </div>
                      
                      {selectedCustomerId === customer.id && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                    </div>
                  </CardContent>
                </Card>)}
            </> : searchTerm.length >= 2 && <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No customers found matching "{searchTerm}"</p>
                <Button>Create New Customer</Button>
              </CardContent>
            </Card>}
        </div>}

      {!searchTerm && !selectedCustomerId && <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Start typing to search for a customer
            </p>
          </CardContent>
        </Card>}
    </div>;
};
export default CustomerIdentification;
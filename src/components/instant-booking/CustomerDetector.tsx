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
    national_id?: string;
    license_number?: string;
    license_expiry?: string;
    passport_number?: string;
    date_of_birth?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  }>({
    full_name: '',
    email: '',
    phone: '',
    customer_type: 'B2C' as const,
    national_id: '',
    license_number: '',
    license_expiry: '',
    passport_number: '',
    date_of_birth: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  // Search existing customers
  const {
    data: searchResults = [],
    isLoading: isSearching
  } = useQuery({
    queryKey: ['customer-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const {
        data,
        error
      } = await supabase.from('customers').select('*').or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`).limit(10);
      if (error) throw error;
      return data as Customer[];
    },
    enabled: searchTerm.length >= 2
  });

  // Get selected customer details
  const {
    data: selectedCustomer
  } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const {
        data,
        error
      } = await supabase.from('customers').select('*').eq('id', selectedCustomerId).single();
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!selectedCustomerId
  });
  const handleCreateCustomer = async () => {
    try {
      // Prepare the customer data with proper formatting for jsonb fields
      const customerData = {
        full_name: newCustomer.full_name,
        email: newCustomer.email,
        phone: newCustomer.phone || null,
        customer_type: newCustomer.customer_type,
        national_id: newCustomer.national_id || null,
        passport_number: newCustomer.passport_number || null,
        license_number: newCustomer.license_number || null,
        license_expiry: newCustomer.license_expiry || null,
        date_of_birth: newCustomer.date_of_birth || null,
        // Format address as jsonb if provided
        address: newCustomer.address ? {
          full_address: newCustomer.address
        } : null,
        // Format emergency contact as jsonb if provided
        emergency_contact: (newCustomer.emergency_contact_name || newCustomer.emergency_contact_phone) ? {
          name: newCustomer.emergency_contact_name || null,
          phone: newCustomer.emergency_contact_phone || null
        } : null
      };

      const {
        data,
        error
      } = await supabase.from('customers').insert([customerData]).select().single();
      
      if (error) throw error;
      onCustomerSelect(data as Customer);
      
      // Reset form after successful creation
      setNewCustomer({
        full_name: '',
        email: '',
        phone: '',
        customer_type: 'B2C' as const,
        national_id: '',
        license_number: '',
        license_expiry: '',
        passport_number: '',
        date_of_birth: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };
  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'B2B':
        return 'bg-blue-100 text-blue-800';
      case 'CORPORATE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getCustomerTypeDisplay = (type: string) => {
    switch (type) {
      case 'B2C':
        return 'Individual';
      case 'B2B':
        return 'B2B';
      case 'CORPORATE':
        return 'Corporate';
      default:
        return 'Individual';
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
  return <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Users className="h-5 w-5 text-card-foreground" />
          Customer Information
        </CardTitle>
      </CardHeader>

      <CardContent>
        {selectedCustomer ?
      // Selected Customer Display
      <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">{selectedCustomer.full_name}</h3>
                  <p className="text-card-foreground/70">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-sm text-card-foreground/70">{selectedCustomer.phone}</p>}
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={getCustomerTypeColor(selectedCustomer.customer_type)}>
                  {getCustomerTypeIcon(selectedCustomer.customer_type)}
                  <span className="ml-1">{getCustomerTypeDisplay(selectedCustomer.customer_type)}</span>
                </Badge>
                <div className="text-sm text-card-foreground/70">
                  {selectedCustomer.total_rentals || 0} previous rentals
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => onCustomerSelect(null)} className="w-full text-muted-foreground">
              Change Customer
            </Button>
          </div> :
      // Customer Selection/Creation
      <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger value="existing" className="text-card-foreground data-[state=active]:text-muted-foreground">Existing Customer</TabsTrigger>
              <TabsTrigger value="new" className="text-card-foreground data-[state=active]:text-muted-foreground">New Customer</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-card-foreground/50" />
                <Input 
                  placeholder="Search by name, email, or phone..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10 text-card-foreground placeholder:text-card-foreground/50 bg-card/50 border-card-foreground/20" 
                />
              </div>

              {/* Search Results */}
              {isSearching ? <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-muted h-16 rounded-lg"></div>)}
                </div> : searchResults.length > 0 ? <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map(customer => <div key={customer.id} className="p-3 border border-card-foreground/20 rounded-lg hover:bg-card-foreground/10 cursor-pointer transition-colors" onClick={() => onCustomerSelect(customer)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-card-foreground">{customer.full_name}</h4>
                          <p className="text-sm text-card-foreground/70">{customer.email}</p>
                          {customer.phone && <p className="text-xs text-card-foreground/70">{customer.phone}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getCustomerTypeColor(customer.customer_type)} variant="outline">
                            {getCustomerTypeDisplay(customer.customer_type)}
                          </Badge>
                          <span className="text-xs text-card-foreground/70">
                            {customer.total_rentals || 0} rentals
                          </span>
                        </div>
                      </div>
                    </div>)}
                </div> : searchTerm.length >= 2 ? <div className="text-center py-8 text-card-foreground/70">
                  No customers found matching "{searchTerm}"
                </div> : <div className="text-center py-8 text-card-foreground/70">
                  Start typing to search for customers
                </div>}
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-card-foreground mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-name" className="text-card-foreground">Full Name *</Label>
                    <Input 
                      id="new-name" 
                      value={newCustomer.full_name} 
                      onChange={e => setNewCustomer(prev => ({
                        ...prev,
                        full_name: e.target.value
                      }))} 
                      className="mt-1 text-card-foreground border-card-foreground/20 text-muted-foreground" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-email">Email *</Label>
                    <Input id="new-email" type="email" value={newCustomer.email} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      email: e.target.value
                    }))} className="mt-1 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="new-phone">Phone</Label>
                    <Input id="new-phone" value={newCustomer.phone} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))} className="mt-1 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="customer-type">Customer Type</Label>
                    <select id="customer-type" value={newCustomer.customer_type} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      customer_type: e.target.value as 'B2B' | 'B2C' | 'CORPORATE'
                    }))} className="mt-1 text-muted-foreground w-full px-3 py-2 border rounded-md bg-background">
                      <option value="B2C">Individual</option>
                      <option value="B2B">B2B - Business</option>
                      <option value="CORPORATE">Corporate Account</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="date-of-birth">Date of Birth</Label>
                    <Input id="date-of-birth" type="date" value={newCustomer.date_of_birth} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      date_of_birth: e.target.value
                    }))} className="mt-1 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Identification Documents */}
              <div>
                <h4 className="text-sm font-medium text-card-foreground mb-3">Identification Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="national-id">National ID / Social Security</Label>
                    <Input id="national-id" value={newCustomer.national_id} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      national_id: e.target.value
                    }))} className="mt-1 text-muted-foreground" placeholder="For local customers" />
                  </div>
                  <div>
                    <Label htmlFor="passport-number">Passport Number</Label>
                    <Input id="passport-number" value={newCustomer.passport_number} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      passport_number: e.target.value
                    }))} className="mt-1 text-muted-foreground" placeholder="For tourists/international customers" />
                  </div>
                  <div>
                    <Label htmlFor="license-number">Driver's License Number</Label>
                    <Input id="license-number" value={newCustomer.license_number} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      license_number: e.target.value
                    }))} className="mt-1 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="license-expiry">License Expiry Date</Label>
                    <Input id="license-expiry" type="date" value={newCustomer.license_expiry} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      license_expiry: e.target.value
                    }))} className="mt-1 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4 className="text-sm font-medium text-card-foreground mb-3">Additional Details</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={newCustomer.address} onChange={e => setNewCustomer(prev => ({
                      ...prev,
                      address: e.target.value
                    }))} className="mt-1 text-muted-foreground" placeholder="Full address including city and postal code" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergency-contact-name">Emergency Contact Name</Label>
                      <Input id="emergency-contact-name" value={newCustomer.emergency_contact_name} onChange={e => setNewCustomer(prev => ({
                        ...prev,
                        emergency_contact_name: e.target.value
                      }))} className="mt-1 text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="emergency-contact-phone">Emergency Contact Phone</Label>
                      <Input id="emergency-contact-phone" value={newCustomer.emergency_contact_phone} onChange={e => setNewCustomer(prev => ({
                        ...prev,
                        emergency_contact_phone: e.target.value
                      }))} className="mt-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleCreateCustomer} disabled={!newCustomer.full_name || !newCustomer.email} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Customer & Continue
              </Button>
            </TabsContent>
          </Tabs>}
      </CardContent>
    </Card>;
};
export default CustomerDetector;
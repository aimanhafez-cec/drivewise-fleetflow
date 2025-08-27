import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Save, Calendar, FileText, MoreHorizontal, Info, Shield, CreditCard, DollarSign, User, Phone, Mail } from 'lucide-react';
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
const CustomerDetails = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});

  // Fetch customer data
  const {
    data: customer,
    isLoading,
    error
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required');
      const {
        data,
        error
      } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Customer not found');
      return data as Customer;
    },
    enabled: !!id
  });

  // Fetch customer statistics
  const {
    data: stats
  } = useQuery({
    queryKey: ['customer-stats', id],
    queryFn: async () => {
      if (!id) return null;
      const [reservationsResult, agreementsResult, paymentsResult, ticketsResult] = await Promise.all([supabase.from('reservations').select('status, total_amount').eq('customer_id', id), supabase.from('agreements').select('status, total_amount').eq('customer_id', id), supabase.from('payments').select('status, amount').eq('customer_id', id), supabase.from('traffic_tickets').select('status').eq('customer_id', id)]);
      const reservations = reservationsResult.data || [];
      const agreements = agreementsResult.data || [];
      const payments = paymentsResult.data || [];
      const tickets = ticketsResult.data || [];
      return {
        totalRevenue: reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0) + agreements.reduce((sum, a) => sum + (a.total_amount || 0), 0),
        openedReservations: reservations.length,
        confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
        noShowReservations: 0,
        // Note: no_show status not available in current schema
        cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
        openedAgreements: agreements.filter(a => a.status === 'active').length,
        closedAgreements: agreements.filter(a => a.status === 'completed').length,
        totalTickets: tickets.length,
        pendingPayments: payments.filter(p => p.status === 'pending').length
      };
    },
    enabled: !!id
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (updates: Partial<Customer>) => {
      if (!id) throw new Error('Customer ID is required');
      const {
        error
      } = await supabase.from('customers').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer', id]
      });
      setIsEditing(false);
      setEditData({});
      toast({
        title: "Success",
        description: "Customer updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  const handleSave = () => {
    updateCustomerMutation.mutate(editData);
  };
  const handleInputChange = (field: keyof Customer, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };
  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    if (typeof address === 'string') return address;
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip) parts.push(address.zip);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };
  const getCreditRatingBadge = (rating: number) => {
    if (rating >= 750) return {
      label: 'Excellent',
      color: 'bg-green-500'
    };
    if (rating >= 700) return {
      label: 'Good',
      color: 'bg-blue-500'
    };
    if (rating >= 650) return {
      label: 'Fair',
      color: 'bg-yellow-500'
    };
    if (rating >= 600) return {
      label: 'Poor',
      color: 'bg-orange-500'
    };
    return {
      label: 'Very Poor',
      color: 'bg-red-500'
    };
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customer details...</div>
      </div>;
  }
  if (error || !customer) {
    return <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-destructive">Customer not found</div>
        <Button onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>;
  }
  const summaryStats = [{
    label: 'Total Revenue',
    value: `AED ${(stats?.totalRevenue || 0).toLocaleString()}`,
    color: 'text-emerald-500'
  }, {
    label: 'Opened Reservations',
    value: stats?.openedReservations || 0,
    color: 'text-blue-500'
  }, {
    label: 'Confirmed Reservations',
    value: stats?.confirmedReservations || 0,
    color: 'text-blue-500'
  }, {
    label: 'No Show Reservations',
    value: stats?.noShowReservations || 0,
    color: 'text-gray-500'
  }, {
    label: 'Cancelled Reservations',
    value: stats?.cancelledReservations || 0,
    color: 'text-red-500'
  }, {
    label: 'Opened Agreements',
    value: stats?.openedAgreements || 0,
    color: 'text-purple-500'
  }, {
    label: 'Closed Agreements',
    value: stats?.closedAgreements || 0,
    color: 'text-green-500'
  }, {
    label: 'Total Traffic Tickets',
    value: stats?.totalTickets || 0,
    color: 'text-gray-500'
  }, {
    label: 'Pending Payments',
    value: stats?.pendingPayments || 0,
    color: 'text-orange-500'
  }, {
    label: 'Total Rentals',
    value: customer.total_rentals || 0,
    color: 'text-blue-500'
  }];
  return <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/customers')} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.profile_photo_url} alt={customer.full_name} />
              <AvatarFallback>{customer.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{customer.full_name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
                {customer.credit_rating && <Badge variant="secondary" className={`${getCreditRatingBadge(customer.credit_rating).color} text-white`}>
                    {getCreditRatingBadge(customer.credit_rating).label}
                  </Badge>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? <>
              <Button variant="outline" onClick={() => {
            setIsEditing(false);
            setEditData({});
          }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateCustomerMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Save className="mr-2 h-4 w-4" />
                {updateCustomerMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </> : <Button variant="outline" onClick={() => setIsEditing(true)} className="bg-blue-900 text-white hover:bg-blue-800">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>}
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Reservation
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Agreement
          </Button>
        </div>
      </div>

      {/* Customer Information Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-card-foreground">Full Name</Label>
              <Input id="fullName" value={isEditing ? editData.full_name ?? customer.full_name : customer.full_name} onChange={e => handleInputChange('full_name', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="phoneNo" className="text-sm font-medium text-card-foreground">Phone No.</Label>
              <Input id="phoneNo" value={isEditing ? editData.phone ?? customer.phone ?? '' : customer.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email</Label>
              <Input id="email" value={isEditing ? editData.email ?? customer.email : customer.email} onChange={e => handleInputChange('email', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="licenseNo" className="text-sm font-medium text-card-foreground">License No.</Label>
              <Input id="licenseNo" value={isEditing ? editData.license_number ?? customer.license_number ?? '' : customer.license_number || ''} onChange={e => handleInputChange('license_number', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="licenseExpiry" className="text-sm font-medium text-card-foreground">License Expiry Date</Label>
              <Input id="licenseExpiry" type={isEditing ? "date" : "text"} value={isEditing ? editData.license_expiry ?? customer.license_expiry ?? '' : formatDate(customer.license_expiry)} onChange={e => handleInputChange('license_expiry', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-card-foreground">Date of Birth</Label>
              <Input id="dateOfBirth" type={isEditing ? "date" : "text"} value={isEditing ? editData.date_of_birth ?? customer.date_of_birth ?? '' : formatDate(customer.date_of_birth)} onChange={e => handleInputChange('date_of_birth', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" />
            </div>
          </div>
          
          {/* Address field */}
          <div className="mt-4">
            <Label htmlFor="address" className="text-sm font-medium text-card-foreground">Address</Label>
            {isEditing ? <Textarea id="address" value={editData.address ? JSON.stringify(editData.address) : formatAddress(customer.address)} onChange={e => handleInputChange('address', e.target.value)} className="mt-1 text-muted-foreground" /> : <Input id="address" value={formatAddress(customer.address)} readOnly className="mt-1 text-muted-foreground" />}
          </div>

          {/* Notes field */}
          <div className="mt-4">
            <Label htmlFor="notes" className="text-sm font-medium text-card-foreground">Notes</Label>
            <Textarea id="notes" value={isEditing ? editData.notes ?? customer.notes ?? '' : customer.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} readOnly={!isEditing} className="mt-1 text-muted-foreground" rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
            Summary
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Notes
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Documents
          </TabsTrigger>
          <TabsTrigger value="deposit" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Deposit Summary
          </TabsTrigger>
          <TabsTrigger value="claims" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Claims
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-5 w-5 text-emerald-500" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Full Name</Label>
                        <Input value={customer.full_name} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Email</Label>
                        <Input value={customer.email} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Phone</Label>
                        <Input value={customer.phone || 'Not provided'} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">License Number</Label>
                        <Input value={customer.license_number || 'Not provided'} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">License Expiry</Label>
                        <Input value={formatDate(customer.license_expiry)} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Date of Birth</Label>
                        <Input value={formatDate(customer.date_of_birth)} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Address</Label>
                        <Textarea value={formatAddress(customer.address)} readOnly className="mt-1 text-muted-foreground" rows={2} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-card-foreground">Credit Rating</Label>
                        <Input value={customer.credit_rating ? `${customer.credit_rating} (${getCreditRatingBadge(customer.credit_rating).label})` : 'Not rated'} readOnly className="mt-1 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div>
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summaryStats.map((stat, index) => <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm text-card-foreground">{stat.label}</span>
                        <span className={`text-sm font-medium ${stat.color}`}>
                          {stat.value}
                        </span>
                      </div>)}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer Notes</h3>
                  <Textarea value={customer.notes || 'No notes available'} readOnly rows={10} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-950">Documents functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-950">Deposit Summary functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Claims functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>;
};
export default CustomerDetails;
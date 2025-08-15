import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Calendar,
  FileText,
  MoreHorizontal,
  Info,
  Shield,
  CreditCard,
  DollarSign
} from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  // Mock customer data - in real app this would come from API
  const customer = {
    id: id || '1',
    fullName: 'John Coffman',
    phone: '',
    email: '',
    status: 'Active',
    licenseNo: '',
    licenseExpiryDate: '',
    address: '',
    avatar: '/lovable-uploads/2b73ff6a-321f-4f42-8e12-e8b171d53e4b.png',
    companyName: '',
    companyRegNo: '',
    licenseCategory: '',
    licenseIssueDate: '',
    passportNo: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    accountNo: '',
    bankName: '',
    bankSwiftCode: '',
    emergencyContactNo: '',
    dateOfBirth: '10/11/1989',
    drivingExperience: '',
    insuranceCompany: '',
    policyNo: '',
    insuranceExpiryDate: '8/17/2039',
    creditCardType: '',
    nameOnCard: '',
    cardNumber: ''
  };

  const summaryStats = [
    { label: 'Total Revenue', value: '$10,761.00', color: 'text-emerald-500' },
    { label: 'Opened Reservations', value: '8', color: 'text-blue-500' },
    { label: 'Confirmed Reservations', value: '4', color: 'text-blue-500' },
    { label: 'No Show Reservations', value: '0', color: 'text-gray-500' },
    { label: 'Cancelled Reservations', value: '1', color: 'text-red-500' },
    { label: 'Opened Agreements', value: '7', color: 'text-purple-500' },
    { label: 'Closed Agreements', value: '5', color: 'text-green-500' },
    { label: 'Total Traffic Tickets', value: '0', color: 'text-gray-500' },
    { label: 'Pending Payments', value: '0', color: 'text-orange-500' },
    { label: 'Pending Deposits', value: '', color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/customers')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar} alt={customer.fullName} />
              <AvatarFallback>{customer.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{customer.fullName}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Phone</span>
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {customer.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-blue-900 text-white hover:bg-blue-800">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Reservation
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Agreement
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customer Information Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-600">Full Name</Label>
              <Input id="fullName" value={customer.fullName} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phoneNo" className="text-sm font-medium text-gray-600">Phone No.</Label>
              <Input id="phoneNo" value={customer.phone} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-600">Email</Label>
              <Input id="email" value={customer.email} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="licenseNo" className="text-sm font-medium text-gray-600">License No.</Label>
              <Input id="licenseNo" value={customer.licenseNo} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="licenseExpiry" className="text-sm font-medium text-gray-600">License Expiry Date</Label>
              <Input id="licenseExpiry" value={customer.licenseExpiryDate} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-600">Address</Label>
              <Input id="address" value={customer.address} readOnly className="mt-1" />
            </div>
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
                        <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                        <Input value={customer.companyName} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Company Reg No.</Label>
                        <Input value={customer.companyRegNo} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License Category</Label>
                        <Input value={customer.licenseCategory} readOnly className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License No.</Label>
                        <Input value={customer.licenseNo} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License Issue Date</Label>
                        <Input value={customer.licenseIssueDate} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License Expiry Date</Label>
                        <Input value={customer.licenseExpiryDate} readOnly className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Passport No.</Label>
                        <Input value={customer.passportNo} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Passport Issue Date</Label>
                        <Input value={customer.passportIssueDate} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Passport Expiry Date</Label>
                        <Input value={customer.passportExpiryDate} readOnly className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Account No.</Label>
                        <Input value={customer.accountNo} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
                        <Input value={customer.bankName} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Bank Swift Code</Label>
                        <Input value={customer.bankSwiftCode} readOnly className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Emergency Contact No.</Label>
                        <Input value={customer.emergencyContactNo} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Date Of Birth</Label>
                        <Input value={customer.dateOfBirth} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Driving Experience</Label>
                        <Input value={customer.drivingExperience} readOnly className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Company</Label>
                        <Input value={customer.insuranceCompany} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Policy No.</Label>
                        <Input value={customer.policyNo} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Insurance Expiry Date</Label>
                        <Input value={customer.insuranceExpiryDate} readOnly className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-emerald-500" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Credit Card Type</Label>
                        <Input value={customer.creditCardType} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Name On Card</Label>
                        <Input value={customer.nameOnCard} readOnly className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Card Number</Label>
                        <Input value={customer.cardNumber} readOnly className="mt-1" />
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
                    {summaryStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={`text-sm font-medium ${stat.color}`}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Notes content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Documents content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Deposit Summary content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Claims content will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
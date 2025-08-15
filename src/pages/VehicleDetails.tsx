import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Calendar, User, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const statusColors = {
  available: "default",
  rented: "destructive", 
  maintenance: "secondary",
  out_of_service: "outline"
} as const;

const statusLabels = {
  available: "Activate",
  rented: "Check Out",
  maintenance: "Maintenance", 
  out_of_service: "Out of Service"
} as const;

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          categories (
            id,
            name,
            icon
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Summary data mock for now
  const summaryData = {
    totalRevenue: 50.00,
    totalExpense: 10.00,
    totalProfit: 40.00,
    balanceOwing: 0.00,
    monthlyRevenue: 52.00,
    monthlyExpense: 0.00,
    monthlyProfit: 52.00,
    currentReservation: 0,
    totalAgreements: 2,
    futureAgreements: 0,
    totalReservations: 5,
    currentAgreement: 1,
    futureReservations: 0,
    pendingPayments: 0
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicles
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Vehicle not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Vehicle Card</h1>
          <Button variant="default" className="ml-auto">
            Edit
          </Button>
        </div>

        {/* Vehicle Info Header */}
        <div className="grid grid-cols-3 gap-8 mb-6">
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-medium">{vehicle.location || 'Middletown'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Odometer</div>
            <div className="font-medium">{vehicle.odometer || 125}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge variant="secondary" className="text-emerald-500">
              {statusLabels[vehicle.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </div>

        {/* Vehicle Details Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <div className="w-12 h-8 bg-gray-400 rounded"></div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Available
          </Badge>
          
          <div className="grid grid-cols-5 gap-8 flex-1">
            <div>
              <div className="text-sm text-muted-foreground">Vehicle No.</div>
              <div className="font-medium">1</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">License No.</div>
              <div className="font-medium">{vehicle.license_plate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Color</div>
              <div className="font-medium">{vehicle.color || 'Grey'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Vehicle</div>
              <div className="font-medium">{vehicle.make}, {vehicle.model} - {vehicle.year}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium">{vehicle.subtype || 'Compact'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">VIN No.</div>
              <div className="font-medium text-xs">{vehicle.vin || '5N1AR2MM0EC779145'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full grid grid-cols-10 h-12 bg-transparent border-b rounded-none p-0">
          <TabsTrigger value="summary" className="bg-cyan-400 text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-white rounded-none">Summary</TabsTrigger>
          <TabsTrigger value="reservations" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Reservations</TabsTrigger>
          <TabsTrigger value="damages" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Damages</TabsTrigger>
          <TabsTrigger value="maintenance" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Maintenance</TabsTrigger>
          <TabsTrigger value="expenses" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Expenses</TabsTrigger>
          <TabsTrigger value="track" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Track</TabsTrigger>
          <TabsTrigger value="documents" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Documents</TabsTrigger>
          <TabsTrigger value="agreement-track" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">Agreement Track</TabsTrigger>
          <TabsTrigger value="history" className="bg-cyan-400 text-white data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-none">To Do History</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Current Customer */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-cyan-500" />
                    Current Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Full Name</div>
                      <div className="font-medium">-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">License No.</div>
                      <div className="font-medium">-</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Check-Out Date</div>
                      <div className="font-medium">3/3/2022</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Check-In Date</div>
                      <div className="font-medium">3/4/2022</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-cyan-500" />
                    Vehicle Images
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Right Column - Summary Stats */}
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-cyan-500" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Revenue</span>
                        <span className="font-medium text-cyan-500">${summaryData.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Expense</span>
                        <span className="font-medium text-cyan-500">${summaryData.totalExpense.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Profit</span>
                        <span className="font-medium text-cyan-500">${summaryData.totalProfit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance Owing</span>
                        <span className="font-medium text-muted-foreground">${summaryData.balanceOwing.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Revenue</span>
                        <span className="font-medium text-cyan-500">${summaryData.monthlyRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Expense</span>
                        <span className="font-medium text-muted-foreground">${summaryData.monthlyExpense.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Profit</span>
                        <span className="font-medium text-cyan-500">${summaryData.monthlyProfit.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Reservation</span>
                        <span className="font-medium">{summaryData.currentReservation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total No of Agreements</span>
                        <span className="font-medium text-cyan-500">{summaryData.totalAgreements}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Future No Of Agreements</span>
                        <span className="font-medium">{summaryData.futureAgreements}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total No of Reservations</span>
                        <span className="font-medium text-cyan-500">{summaryData.totalReservations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Agreement</span>
                        <span className="font-medium text-cyan-500">{summaryData.currentAgreement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Future No Of Reservations</span>
                        <span className="font-medium">{summaryData.futureReservations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending Payments</span>
                        <span className="font-medium">{summaryData.pendingPayments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Track Tab */}
        <TabsContent value="track" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="default" className="bg-cyan-400 hover:bg-cyan-500">
                Vehicle Track
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-900">
                  <TableRow>
                    <TableHead className="text-white">Employee ↕</TableHead>
                    <TableHead className="text-white">Note ↕</TableHead>
                    <TableHead className="text-white">Pick Up Date & Time ↕</TableHead>
                    <TableHead className="text-white">Drop Off Date & Time ↕</TableHead>
                    <TableHead className="text-white">Odometer-Out ↕</TableHead>
                    <TableHead className="text-white">Fuel-Out ↕</TableHead>
                    <TableHead className="text-white">Odometer-In ↕</TableHead>
                    <TableHead className="text-white">Fuel-In ↕</TableHead>
                    <TableHead className="text-white">Status ↕</TableHead>
                    <TableHead className="text-white">Actions ↕</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Sean</TableCell>
                    <TableCell>Personal</TableCell>
                    <TableCell>3/1/2022<br/>16:46</TableCell>
                    <TableCell>3/4/2022<br/>16:46</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>Full</TableCell>
                    <TableCell>125</TableCell>
                    <TableCell>Full</TableCell>
                    <TableCell>Personal Use</TableCell>
                    <TableCell>...</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Rows per Page: 5 ↕</span>
              <div className="flex items-center gap-2">
                <span>Current Page: 1</span>
                <Button variant="ghost" size="sm">{"<"}</Button>
                <Button variant="ghost" size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="ghost" size="sm">{">"}</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="default" className="bg-cyan-400 hover:bg-cyan-500">
                History
              </Button>
              <Button variant="default" className="bg-blue-900 hover:bg-blue-800">
                Manual Service
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-900">
                  <TableRow>
                    <TableHead className="text-white">Maintenance ↕</TableHead>
                    <TableHead className="text-white">Last Service Date ↕</TableHead>
                    <TableHead className="text-white">Interval Months ↕</TableHead>
                    <TableHead className="text-white">Next Service Date ↕</TableHead>
                    <TableHead className="text-white">Last Service Mileage ↕</TableHead>
                    <TableHead className="text-white">Interval Mileage ↕</TableHead>
                    <TableHead className="text-white">Actions ↕</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Tire Replacement</TableCell>
                    <TableCell>12/22/2020</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>4/1/2021</TableCell>
                    <TableCell>1051</TableCell>
                    <TableCell>1000</TableCell>
                    <TableCell>...</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Damages Tab */}
        <TabsContent value="damages" className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="text-cyan-500">📊</div>
                <div>
                  <div className="text-sm text-muted-foreground">Odometer</div>
                  <div className="font-medium">125</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-cyan-500">⛽</div>
                <div>
                  <div className="text-sm text-muted-foreground">Fuel Level</div>
                  <div className="font-medium">Full</div>
                </div>
                <Button variant="default" className="ml-auto bg-blue-900 hover:bg-blue-800">
                  Edit
                </Button>
              </div>
            </div>

            {/* Vehicle Diagram */}
            <div className="flex justify-center py-8">
              <div className="relative">
                <svg width="400" height="200" viewBox="0 0 400 200" className="border rounded">
                  <text x="120" y="30" className="text-sm fill-muted-foreground">back</text>
                  <text x="280" y="30" className="text-sm fill-muted-foreground">front</text>
                  
                  {/* Car outline */}
                  <rect x="100" y="50" width="200" height="100" fill="none" stroke="currentColor" strokeWidth="2" rx="20"/>
                  
                  {/* Wheels */}
                  <circle cx="130" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="270" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="130" cy="160" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="270" cy="160" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                  
                  {/* Damage marker */}
                  <circle cx="200" cy="80" r="3" fill="red"/>
                </svg>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-900">
                  <TableRow>
                    <TableHead className="text-white"># ↕</TableHead>
                    <TableHead className="text-white">Type ↕</TableHead>
                    <TableHead className="text-white">Damaged Date ↕</TableHead>
                    <TableHead className="text-white">Description ↕</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Dent</TableCell>
                    <TableCell>4/5/2022</TableCell>
                    <TableCell>Dent</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reservations</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <select className="border rounded px-3 py-1">
                    <option>Reservation No.</option>
                  </select>
                  <input type="text" placeholder="Reservation No" className="border rounded px-3 py-1" />
                </div>
                <Button className="bg-cyan-400 hover:bg-cyan-500">
                  <Plus className="h-4 w-4 mr-2" />
                  New Reservation
                </Button>
                <Button variant="outline" className="bg-blue-900 text-white hover:bg-blue-800">
                  🔍 Filter ↓
                </Button>
                <Button variant="outline">☰</Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-900">
                  <TableRow>
                    <TableHead className="text-white">Reservation No.</TableHead>
                    <TableHead className="text-white">Vehicle No</TableHead>
                    <TableHead className="text-white">Vehicle Type</TableHead>
                    <TableHead className="text-white">First Name</TableHead>
                    <TableHead className="text-white">Last Name</TableHead>
                    <TableHead className="text-white">Phone No.</TableHead>
                    <TableHead className="text-white">Checkout Date</TableHead>
                    <TableHead className="text-white">Checkin Date</TableHead>
                    <TableHead className="text-white">Checkout Location</TableHead>
                    <TableHead className="text-white">Checkin Location</TableHead>
                    <TableHead className="text-white">Created Date</TableHead>
                    <TableHead className="text-white">Created By</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Note</TableHead>
                    <TableHead className="text-white">Reservation Type</TableHead>
                    <TableHead className="text-white">License No.</TableHead>
                    <TableHead className="text-white">Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 46, customer: "John Coffman", dates: "4/11/2022 - 4/15/2022", status: "Check Out", type: "Phone" },
                    { id: 41, customer: "Jamie Foxx", dates: "3/25/2022 - 3/26/2022", status: "Open", type: "Online" },
                    { id: 31, customer: "John Coffman", dates: "2/23/2022 - 2/23/2022", status: "Open", type: "Online" },
                    { id: 30, customer: "Ravi Cassiere", dates: "2/20/2022 - 2/21/2022", status: "Open", type: "Online" },
                    { id: 5, customer: "John Coffman", dates: "12/9/2020 - 12/16/2020", status: "Open", type: "Online" }
                  ].map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.id}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>Compact</TableCell>
                      <TableCell>{reservation.customer.split(' ')[0]}</TableCell>
                      <TableCell>{reservation.customer.split(' ')[1]}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{reservation.dates.split(' - ')[0]} 9:00 AM</TableCell>
                      <TableCell>{reservation.dates.split(' - ')[1]} 9:00 AM</TableCell>
                      <TableCell>Middletown</TableCell>
                      <TableCell>Middletown</TableCell>
                      <TableCell>{reservation.dates.split(' - ')[0]} 8:55 AM</TableCell>
                      <TableCell>Navatar Rental</TableCell>
                      <TableCell>
                        <Badge variant={reservation.status === "Check Out" ? "destructive" : "secondary"}>
                          {reservation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{reservation.type}</TableCell>
                      <TableCell>undefined</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Rows per Page: 10 ↓</span>
              <span>Current Page: 1</span>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs with placeholder content */}
        <TabsContent value="expenses" className="p-6">
          <div>Expenses content coming soon...</div>
        </TabsContent>
        
        <TabsContent value="documents" className="p-6">
          <div>Documents content coming soon...</div>
        </TabsContent>
        
        <TabsContent value="agreement-track" className="p-6">
          <div>Agreement Track content coming soon...</div>
        </TabsContent>
        
        <TabsContent value="history" className="p-6">
          <div>To Do History content coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
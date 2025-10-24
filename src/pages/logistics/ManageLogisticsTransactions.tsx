import { Package, ArrowLeft, Clock, CheckCircle, XCircle, DollarSign, FileText, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ManageLogisticsTransactions = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Manage Logistics Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track shipping costs, delivery fees, carrier payments, and transportation-related financial transactions
          </p>
        </div>
        <Button onClick={() => navigate('/logistics')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Logistics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">In pending transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Costs</TabsTrigger>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>
                Logistics transactions awaiting processing or approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Transactions</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  There are currently no logistics transactions waiting to be processed. New transactions will appear here automatically.
                </p>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Record New Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Transactions</CardTitle>
              <CardDescription>
                Successfully processed logistics transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Transactions</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Completed logistics transactions will be listed here with full payment details and documentation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Transactions</CardTitle>
              <CardDescription>
                Transactions that encountered errors and require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Failed Transactions</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Any transactions that fail during processing will be listed here for review and retry.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Costs</CardTitle>
              <CardDescription>
                Detailed breakdown of shipping and delivery expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Shipping Cost Records</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Track third-party shipping costs, courier charges, and delivery fees. Records will be displayed here with carrier details and cost analysis.
                </p>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Record Shipping Cost
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete history of all logistics transactions with filtering and search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transaction History</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your complete logistics transaction history will be displayed here with advanced filtering, search, and export capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Logistics Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What are Logistics Transactions?</h4>
              <p className="text-sm text-muted-foreground">
                Logistics transactions are financial records related to transportation, shipping, and delivery operations. 
                This includes payments to carriers, shipping costs, fuel expenses, toll fees, and other logistics-related charges.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Transaction Types:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Shipping & Courier Costs - Third-party delivery services</li>
                <li>Carrier Payments - Payments to logistics providers</li>
                <li>Fuel Expenses - Vehicle fuel costs and fleet operations</li>
                <li>Toll & Road Fees - Highway and bridge tolls</li>
                <li>Handling Charges - Loading, unloading, and warehouse fees</li>
                <li>Storage Costs - Temporary storage and warehousing</li>
                <li>Insurance Premiums - Cargo and liability insurance</li>
                <li>Delivery Fees - Last-mile delivery charges</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Real-time transaction tracking and status updates</li>
                <li>Automated cost allocation to vehicles or contracts</li>
                <li>Integration with accounting and financial systems</li>
                <li>Comprehensive audit trails for compliance</li>
                <li>Cost analysis and reporting by carrier, route, or vehicle</li>
                <li>Reconciliation with carrier invoices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLogisticsTransactions;

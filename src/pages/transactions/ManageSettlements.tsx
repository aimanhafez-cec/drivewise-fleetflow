import { Banknote, ArrowLeft, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ManageSettlements = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Banknote className="h-8 w-8" />
            Manage Settlements
          </h1>
          <p className="text-muted-foreground mt-1">
            Process and reconcile financial settlements, manage payment batches and settlement reports
          </p>
        </div>
        <Button onClick={() => navigate('/transactions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
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
            <p className="text-xs text-muted-foreground">Successfully settled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Settlements</CardTitle>
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
            <Banknote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">In pending settlements</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="batches">Settlement Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Settlements</CardTitle>
              <CardDescription>
                Settlements awaiting processing and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Settlements</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  There are currently no settlements waiting to be processed. New settlements will appear here automatically.
                </p>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Settlement Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Settlements</CardTitle>
              <CardDescription>
                Successfully processed settlements and payment reconciliations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Settlements</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Completed settlements will be listed here with full transaction details and settlement reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Settlements</CardTitle>
              <CardDescription>
                Settlements that encountered errors and require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Failed Settlements</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Any settlements that fail during processing will be listed here for review and retry.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settlement Batches</CardTitle>
              <CardDescription>
                Grouped settlements processed together for efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Banknote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Settlement Batches</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Create settlement batches to process multiple payments together for improved efficiency and tracking.
                </p>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Settlements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What are Settlements?</h4>
              <p className="text-sm text-muted-foreground">
                Settlements are financial transactions that reconcile payments between parties. This includes processing payment batches, 
                reconciling accounts, and managing the flow of funds between customers, suppliers, and internal accounts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Batch processing for multiple payments</li>
                <li>Automated payment reconciliation</li>
                <li>Settlement status tracking and reporting</li>
                <li>Failed payment retry mechanisms</li>
                <li>Comprehensive audit trails</li>
                <li>Integration with payment processors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageSettlements;

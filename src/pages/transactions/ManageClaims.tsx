import React from 'react';
import { ShieldAlert, ArrowLeft, AlertCircle, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ManageClaims: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8" />
            Manage Claims
          </h1>
          <p className="text-muted-foreground mt-1">
            Process insurance claims, vehicle damage reports, customer disputes, and claim settlements
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
            <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Closed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claim Value</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">In active claims</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">Open Claims</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Claims</CardTitle>
              <CardDescription>
                Claims currently being processed and investigated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Open Claims</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  There are currently no claims being processed. New claims will appear here for tracking and resolution.
                </p>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Claims awaiting investigation and approval decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Claims Pending Review</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Claims requiring management review and approval will be listed here with all supporting documentation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Claims</CardTitle>
              <CardDescription>
                Claims approved for payment and settlement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Claims</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Approved claims will be listed here with payment details and settlement information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Claims</CardTitle>
              <CardDescription>
                Claims denied with detailed reasons and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rejected Claims</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Denied claims will be listed here with rejection reasons and supporting documentation for audit purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Claims</CardTitle>
              <CardDescription>
                Complete history of all claims across all statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Claims History</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Your complete claims history will be displayed here with advanced filtering and search capabilities.
                </p>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create First Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Claims Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What are Claims?</h4>
              <p className="text-sm text-muted-foreground">
                Claims are formal requests for compensation or resolution of issues related to vehicle rentals, damages, 
                accidents, insurance matters, or customer disputes. The claims management system helps track, investigate, 
                and resolve these matters efficiently.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Types of Claims:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Vehicle Damage Claims:</strong> Damage to rental vehicles during rental period</li>
                <li><strong>Insurance Claims:</strong> Claims filed with insurance companies for covered incidents</li>
                <li><strong>Customer Disputes:</strong> Billing disputes, service issues, or overcharges</li>
                <li><strong>Accident Claims:</strong> Traffic accidents involving rental vehicles</li>
                <li><strong>Third-Party Claims:</strong> Claims from external parties for damages or liability</li>
                <li><strong>Liability Claims:</strong> General liability issues and damage claims</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Claims Process:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Claim submission with supporting documentation and photos</li>
                <li>Initial review and validation of claim details</li>
                <li>Investigation and evidence gathering</li>
                <li>Management review and approval decision</li>
                <li>Settlement processing and payment (if approved)</li>
                <li>Complete audit trail and documentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageClaims;

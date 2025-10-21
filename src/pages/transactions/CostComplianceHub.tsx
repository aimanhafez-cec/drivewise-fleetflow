import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpensesTab } from '@/components/cost-compliance/ExpensesTab';

const CostComplianceHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Manage tolls, fines, compliance exceptions, and billing cycles
        </p>
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="tolls">Tolls & Fines</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="billing">Billing Cycles</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab />
        </TabsContent>

        <TabsContent value="tolls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tolls & Fines</CardTitle>
              <CardDescription>Manage toll charges and traffic violations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tolls & Fines tab - Coming in Phase 4</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Exceptions</CardTitle>
              <CardDescription>Review and resolve billing exceptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Exceptions tab - Coming in Phase 5</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Cycles</CardTitle>
              <CardDescription>Manage contract billing and invoicing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing Cycles tab - Coming in Phase 6</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostComplianceHub;

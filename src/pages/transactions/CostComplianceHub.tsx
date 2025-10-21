import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpensesTab } from '@/components/cost-compliance/ExpensesTab';
import { TollsFinesTab } from '@/components/cost-compliance/TollsFinesTab';
import { ExceptionsTab } from '@/components/cost-compliance/ExceptionsTab';
import { BillingCyclesTab } from '@/components/cost-compliance/BillingCyclesTab';

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
          <TollsFinesTab />
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <ExceptionsTab />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <BillingCyclesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostComplianceHub;

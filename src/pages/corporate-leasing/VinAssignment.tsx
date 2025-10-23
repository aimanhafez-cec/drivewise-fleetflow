import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const VinAssignment: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agreement/Contract VIN Assignment</h1>
        <p className="text-muted-foreground mt-2">
          Assign specific vehicles (VINs) to corporate leasing agreements
        </p>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
          <CardDescription className="text-base">
            This feature is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>We're working on building the VIN assignment functionality.</p>
          <p className="mt-2">Check back soon for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VinAssignment;

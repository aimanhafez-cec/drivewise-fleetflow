import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WorkOrderForm from './components/WorkOrderForm';

const NewWorkOrder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/operations/maintenance')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Work Order</h1>
          <p className="text-muted-foreground mt-1">
            Create a new maintenance work order
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
          <CardDescription>
            Fill in the details for the maintenance work order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkOrderForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewWorkOrder;

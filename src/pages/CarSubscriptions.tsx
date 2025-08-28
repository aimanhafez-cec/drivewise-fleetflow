import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const CarSubscriptions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Subscriptions</h1>
        <Button onClick={() => navigate('/car-subscriptions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground">Car subscription list will be implemented here</p>
      </div>
    </div>
  );
};
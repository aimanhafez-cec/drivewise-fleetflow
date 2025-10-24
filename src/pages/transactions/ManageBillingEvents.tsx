import React from 'react';
import { Plus, Calendar, DollarSign, Clock, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ManageBillingEvents: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Billing Events</h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage recurring billing events, automated charges, and billing cycles
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Billing Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Events</p>
              <p className="text-2xl font-bold mt-1">24</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Due This Week</p>
              <p className="text-2xl font-bold mt-1">8</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1">AED 45.2K</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold mt-1 text-destructive">3</p>
            </div>
            <Calendar className="h-8 w-8 text-destructive" />
          </div>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="p-6">
        <div className="text-center py-12">
          <CalendarClock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Billing Events Management</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create and manage recurring billing events for your contracts. Set up automated charges, 
            billing cycles, and scheduled payments.
          </p>
          <Button className="mt-6">
            <Plus className="h-4 w-4 mr-2" />
            Create First Billing Event
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ManageBillingEvents;

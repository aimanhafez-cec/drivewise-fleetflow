import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, FileText, DollarSign, Car, User, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface AgreementActivityLogTabProps {
  agreement: any;
}

export const AgreementActivityLogTab: React.FC<AgreementActivityLogTabProps> = ({ agreement }) => {
  // Mock activity log data
  const activities = [
    {
      id: '1',
      type: 'created',
      user: 'System',
      action: 'Agreement created',
      details: 'Agreement created from reservation',
      timestamp: agreement.created_at,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      id: '2',
      type: 'status_change',
      user: 'Admin User',
      action: 'Status changed',
      details: `Status changed to ${agreement.status}`,
      timestamp: agreement.updated_at,
      icon: Edit,
      color: 'text-yellow-600',
    },
  ];

  if (agreement.checkout_datetime) {
    activities.push({
      id: '3',
      type: 'checkout',
      user: 'Admin User',
      action: 'Vehicle checked out',
      details: 'Customer took possession of vehicle',
      timestamp: agreement.checkout_datetime,
      icon: Car,
      color: 'text-green-600',
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Complete Activity Log
          </CardTitle>
          <CardDescription>
            All actions and changes made to this agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {/* Activity Items */}
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex items-start gap-4 pl-10">
                    <div className={`absolute left-0 w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{activity.action}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user}
                        </span>
                        <span>{format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Summary</CardTitle>
          <CardDescription>Who accessed and modified this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">Created and modified</p>
                </div>
              </div>
              <Badge variant="outline">2 actions</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Events */}
      <Card>
        <CardHeader>
          <CardTitle>System Events</CardTitle>
          <CardDescription>Automated system actions and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No system events recorded</p>
            <p className="text-sm mt-2">API calls, webhooks, and automated actions will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

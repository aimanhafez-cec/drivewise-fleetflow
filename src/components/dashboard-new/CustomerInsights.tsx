import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus,
  Repeat,
  Trophy,
  ArrowRight,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CustomerKPIs } from '@/lib/api/admin-dashboard';

interface CustomerInsightsProps {
  customerData: CustomerKPIs | undefined;
  isLoading: boolean;
}

export function CustomerInsights({ customerData, isLoading }: CustomerInsightsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  if (!customerData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load customer data</p>
        </div>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return `AED ${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Customer Insights</h3>
            <p className="text-sm text-muted-foreground">Growth & engagement</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/customers')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Total Customers</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {customerData.totalCustomers}
          </p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">New This Month</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            +{customerData.newCustomersThisMonth}
          </p>
        </div>
      </div>

      {/* Customer Satisfaction */}
      {customerData.customerSatisfactionScore > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-foreground">
                Customer Satisfaction
              </span>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {customerData.customerSatisfactionScore.toFixed(1)}/5.0
            </Badge>
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(customerData.customerSatisfactionScore)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Repeat Customer Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-foreground">
              Repeat Customer Rate
            </span>
          </div>
          <span className="text-sm font-bold text-purple-600">
            {customerData.repeatCustomerRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${customerData.repeatCustomerRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Percentage of returning customers
        </p>
      </div>

      {/* Top 5 Customers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-foreground">
            Top Customers by Revenue
          </h4>
        </div>

        {customerData.topCustomersByRevenue.length > 0 ? (
          <div className="space-y-3">
            {customerData.topCustomersByRevenue.map((customer, index) => (
              <div 
                key={customer.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(customer.revenue)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No customer revenue data yet</p>
          </div>
        )}
      </div>

      {/* Quick Action */}
      <div className="mt-6 pt-4 border-t">
        <Button 
          className="w-full"
          onClick={() => navigate('/customers/new')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Customer
        </Button>
      </div>
    </Card>
  );
}

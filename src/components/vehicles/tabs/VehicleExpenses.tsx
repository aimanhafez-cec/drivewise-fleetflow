import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface VehicleExpensesProps {
  vehicleId: string;
}

export function VehicleExpenses({ vehicleId }: VehicleExpensesProps) {
  const { data: reservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['vehicle-revenue', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('total_amount, start_datetime, end_datetime')
        .eq('vehicle_id', vehicleId)
        .eq('status', 'completed');

      if (error) throw error;
      return data;
    }
  });

  const { data: damages, isLoading: damagesLoading } = useQuery({
    queryKey: ['vehicle-damage-costs', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_records')
        .select('repair_cost, recorded_at')
        .eq('vehicle_id', vehicleId);

      if (error) throw error;
      return data;
    }
  });

  if (reservationsLoading || damagesLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const totalRevenue = reservations?.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0) || 0;
  const totalExpenses = damages?.reduce((sum, d) => sum + (Number(d.repair_cost) || 0), 0) || 0;
  const netProfit = totalRevenue - totalExpenses;
  const totalRentals = reservations?.length || 0;

  // Calculate current year metrics
  const currentYear = new Date().getFullYear();
  const currentYearRevenue = reservations?.filter(r => 
    new Date(r.start_datetime).getFullYear() === currentYear
  ).reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0) || 0;

  const currentYearExpenses = damages?.filter(d => 
    new Date(d.recorded_at).getFullYear() === currentYear
  ).reduce((sum, d) => sum + (Number(d.repair_cost) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`h-5 w-5 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-2xl font-bold">${netProfit.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Net Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalRentals}</p>
                <p className="text-sm text-muted-foreground">Total Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Year Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{currentYear} Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Revenue This Year</p>
              <p className="text-2xl font-bold text-green-600">${currentYearRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses This Year</p>
              <p className="text-2xl font-bold text-red-600">${currentYearExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit This Year</p>
              <p className={`text-2xl font-bold ${(currentYearRevenue - currentYearExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(currentYearRevenue - currentYearExpenses).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profitability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Average Revenue per Rental</span>
                <span className="font-medium">
                  ${totalRentals > 0 ? (totalRevenue / totalRentals).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Completed Rentals</span>
                <span className="font-medium">{totalRentals}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue per Day</span>
                <span className="font-medium">
                  ${totalRentals > 0 ? (totalRevenue / (totalRentals * 1)).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Average Repair Cost</span>
                <span className="font-medium">
                  ${(damages?.length || 0) > 0 ? (totalExpenses / (damages?.length || 1)).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin</span>
                <span className="font-medium">
                  {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cost per Revenue Dollar</span>
                <span className="font-medium">
                  ${totalRevenue > 0 ? (totalExpenses / totalRevenue).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
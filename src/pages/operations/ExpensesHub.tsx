import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpenseStatistics } from "@/hooks/useExpenses";
import { ExpensesList } from "./components/ExpensesList";

export default function ExpensesHub() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useExpenseStatistics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage all vehicle-related expenses
          </p>
        </div>
        <Button onClick={() => navigate('/operations/expenses/new')} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Expense
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : formatCurrency(stats?.total_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.total_expenses || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : formatCurrency(stats?.pending_approval_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.pending_approval_count || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "..." : stats?.by_status.approved || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Approved expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Category
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {statsLoading ? "..." : Object.entries(stats?.by_category || {})
                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest spending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesList />
        </CardContent>
      </Card>
    </div>
  );
}

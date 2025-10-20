import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovementsList } from "./components/MovementsList";
import { useMovementStats } from "@/hooks/useVehicleMovements";

export default function FleetOperationsHub() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useMovementStats();
  const [activeTab, setActiveTab] = useState("all");

  const kpis = [
    {
      title: "Total Movements",
      value: stats?.total || 0,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Pending Approval",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Operations</h1>
          <p className="text-muted-foreground mt-1">
            Manage vehicle ownership transfers and inter-branch movements
          </p>
        </div>
        <Button onClick={() => navigate("/operations/movements/new")} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Movement
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Movement Types Breakdown */}
      {stats?.byType && (
        <Card>
          <CardHeader>
            <CardTitle>Movement Types (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Ownership Transfer</p>
                <p className="text-2xl font-bold">{stats.byType.ownership_transfer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inter-Branch</p>
                <p className="text-2xl font-bold">{stats.byType.inter_branch}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department Reallocation</p>
                <p className="text-2xl font-bold">{stats.byType.department_reallocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Third Party</p>
                <p className="text-2xl font-bold">{stats.byType.third_party}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movements List with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Movements</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <MovementsList />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <MovementsList filters={{ status: ['pending'] }} />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <MovementsList filters={{ status: ['approved'] }} />
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <MovementsList filters={{ status: ['rejected'] }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

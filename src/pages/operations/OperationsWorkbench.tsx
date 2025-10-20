import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Car,
  Wrench,
  RefreshCw,
  ClipboardList,
  ArrowRight,
  Calendar,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReplacementStats } from "@/hooks/useReplacements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OperationsWorkbench = () => {
  const navigate = useNavigate();
  const { data: replacementStats } = useReplacementStats();

  const kpiCards = [
    {
      title: "Active Operations",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pending Actions",
      value: replacementStats?.pending_approvals || "0",
      change: "Needs Review",
      trend: "neutral",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Active Replacements",
      value: replacementStats?.active_custodies || "0",
      change: `${replacementStats?.sla_breaches || 0} SLA Breach`,
      trend: replacementStats?.sla_breaches ? "down" : "up",
      icon: RefreshCw,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Maintenance Items",
      value: "8",
      change: "2 Overdue",
      trend: "down",
      icon: Wrench,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const quickActions = [
    {
      title: "Vehicle Status Board",
      description: "Monitor vehicle status and history",
      icon: Car,
      route: "/operations/status-board",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Maintenance Hub",
      description: "Schedule and track maintenance",
      icon: Wrench,
      route: "/operations/maintenance",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      title: "Vehicle Replacements",
      description: "Manage replacement requests",
      icon: RefreshCw,
      route: "/operations/replacement",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Fleet Operations",
      description: "Overview of fleet operations",
      icon: ClipboardList,
      route: "/operations/fleet",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    }
  ];

  const alerts = [
    {
      type: "warning",
      title: "SLA Breach Alert",
      message: `${replacementStats?.sla_breaches || 0} replacement requests exceeding SLA`,
      time: "10 min ago",
      action: () => navigate("/operations/replacement")
    },
    {
      type: "info",
      title: "Pending Approvals",
      message: `${replacementStats?.pending_approvals || 0} replacement requests awaiting approval`,
      time: "25 min ago",
      action: () => navigate("/operations/replacement")
    },
    {
      type: "error",
      title: "Overdue Maintenance",
      message: "2 vehicles have overdue maintenance tasks",
      time: "1 hour ago",
      action: () => navigate("/operations/maintenance")
    }
  ];

  const recentActivities = [
    {
      type: "replacement",
      title: "Replacement Request Approved",
      description: "REP-2024-001 approved by John Smith",
      time: "15 min ago",
      icon: CheckCircle2,
      color: "text-green-500"
    },
    {
      type: "maintenance",
      title: "Maintenance Scheduled",
      description: "Oil change scheduled for ABC-123",
      time: "30 min ago",
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      type: "status",
      title: "Vehicle Status Changed",
      description: "XYZ-789 moved to Maintenance",
      time: "1 hour ago",
      icon: Car,
      color: "text-orange-500"
    },
    {
      type: "replacement",
      title: "Replacement Activated",
      description: "REP-2024-002 handover completed",
      time: "2 hours ago",
      icon: RefreshCw,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Operations Workbench</h1>
        <p className="text-muted-foreground mt-1">
          Your command center for fleet operations management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {kpi.trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
                  {kpi.trend === "down" && <AlertCircle className="h-3 w-3 mr-1 text-red-500" />}
                  <span>{kpi.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access key operational functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.route)}
                  className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-lg transition-all"
                >
                  <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-lg ${action.color} mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                    <ArrowRight className="absolute top-4 right-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={alert.action}
                >
                  <div className={`p-2 rounded-lg ${
                    alert.type === "error" ? "bg-red-500/10" :
                    alert.type === "warning" ? "bg-amber-500/10" :
                    "bg-blue-500/10"
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      alert.type === "error" ? "text-red-500" :
                      alert.type === "warning" ? "text-amber-500" :
                      "text-blue-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <Badge variant={
                        alert.type === "error" ? "destructive" :
                        alert.type === "warning" ? "default" :
                        "secondary"
                      } className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest operational updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-3 mt-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
              <TabsContent value="today" className="space-y-3 mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No activities today</p>
                </div>
              </TabsContent>
              <TabsContent value="week" className="space-y-3 mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Loading weekly activities...</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OperationsWorkbench;

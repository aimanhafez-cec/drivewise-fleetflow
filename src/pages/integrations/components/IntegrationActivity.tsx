import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CheckCircle2, 
  XCircle,
  Clock,
  Zap,
  Webhook,
  Mail
} from "lucide-react";

const IntegrationActivity = () => {
  const activities = [
    {
      type: "webhook",
      title: "Webhook Triggered",
      description: "reservation.created sent to Customer Service",
      status: "success",
      timestamp: new Date().toISOString(),
      icon: Webhook,
      color: "text-blue-500"
    },
    {
      type: "zapier",
      title: "Zapier Workflow Executed",
      description: "Send Slack notification for SLA breach",
      status: "success",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      icon: Zap,
      color: "text-orange-500"
    },
    {
      type: "email",
      title: "Email Sent",
      description: "Maintenance reminder to john@example.com",
      status: "success",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: Mail,
      color: "text-purple-500"
    },
    {
      type: "webhook",
      title: "Webhook Failed",
      description: "vehicle.status_changed - endpoint timeout",
      status: "error",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      icon: Webhook,
      color: "text-red-500"
    },
    {
      type: "automation",
      title: "Automation Rule Executed",
      description: "Auto-approved replacement request REP-2024-045",
      status: "success",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      icon: Activity,
      color: "text-green-500"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest integration events and executions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg bg-muted flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationActivity;

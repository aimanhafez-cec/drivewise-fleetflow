import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Database, Server, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const uptimeData = [
  { time: "00:00", uptime: 100 },
  { time: "04:00", uptime: 100 },
  { time: "08:00", uptime: 99.8 },
  { time: "12:00", uptime: 100 },
  { time: "16:00", uptime: 100 },
  { time: "20:00", uptime: 100 },
  { time: "24:00", uptime: 100 },
];

const responseTimeData = [
  { time: "00:00", response: 145 },
  { time: "04:00", response: 132 },
  { time: "08:00", response: 189 },
  { time: "12:00", response: 256 },
  { time: "16:00", response: 234 },
  { time: "20:00", response: 178 },
  { time: "24:00", response: 156 },
];

const healthChecks = [
  { service: "API Server", status: "healthy", latency: 45, uptime: 99.99 },
  { service: "Database", status: "healthy", latency: 12, uptime: 99.98 },
  { service: "Cache Layer", status: "healthy", latency: 8, uptime: 99.95 },
  { service: "File Storage", status: "healthy", latency: 23, uptime: 99.97 },
  { service: "Email Service", status: "degraded", latency: 234, uptime: 98.5 },
  { service: "Payment Gateway", status: "healthy", latency: 156, uptime: 99.92 },
];

const recentIncidents = [
  {
    title: "Increased API Response Time",
    severity: "medium",
    status: "resolved",
    timestamp: "2 hours ago",
    duration: "15 minutes"
  },
  {
    title: "Database Connection Pool Exhaustion",
    severity: "high",
    status: "resolved",
    timestamp: "1 day ago",
    duration: "8 minutes"
  },
  {
    title: "Scheduled Maintenance",
    severity: "low",
    status: "completed",
    timestamp: "3 days ago",
    duration: "2 hours"
  },
];

const HealthMonitoring = () => {
  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">All Systems Operational</div>
            <p className="text-xs text-muted-foreground mt-1">5 of 6 services healthy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.98%</div>
            <Progress value={99.98} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">178ms</div>
            <p className="text-xs text-success mt-1">↓ 12% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Uptime Percentage</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={uptimeData}>
                <defs>
                  <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[99, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uptime"
                  stroke="hsl(var(--success))"
                  fill="url(#colorUptime)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average API response time (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="response"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Checks</CardTitle>
          <CardDescription>Current status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthChecks.map((check, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {check.status === "healthy" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : check.status === "degraded" ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : (
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{check.service}</p>
                    <p className="text-sm text-muted-foreground">
                      {check.latency}ms latency • {check.uptime}% uptime
                    </p>
                  </div>
                </div>
                <Badge variant={
                  check.status === "healthy" ? "default" :
                  check.status === "degraded" ? "secondary" :
                  "destructive"
                }>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIncidents.map((incident, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {incident.timestamp} • Duration: {incident.duration}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={
                      incident.severity === "high" ? "destructive" :
                      incident.severity === "medium" ? "secondary" :
                      "outline"
                    }>
                      {incident.severity}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthMonitoring;

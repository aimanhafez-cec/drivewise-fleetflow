import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Rocket, GitBranch, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Activity } from "lucide-react";

const recentDeployments = [
  {
    version: "v2.4.1",
    environment: "production",
    status: "success",
    deployedBy: "John Doe",
    timestamp: "2 hours ago",
    duration: "3m 24s",
    changes: 12
  },
  {
    version: "v2.4.2-rc.1",
    environment: "staging",
    status: "success",
    deployedBy: "Jane Smith",
    timestamp: "5 hours ago",
    duration: "2m 58s",
    changes: 8
  },
  {
    version: "v2.4.0",
    environment: "production",
    status: "success",
    deployedBy: "John Doe",
    timestamp: "2 days ago",
    duration: "3m 45s",
    changes: 24
  },
];

const pendingChanges = [
  { type: "feature", title: "Add customer loyalty program", branch: "feature/loyalty-program" },
  { type: "bugfix", title: "Fix payment processing timeout", branch: "bugfix/payment-timeout" },
  { type: "enhancement", title: "Improve analytics dashboard", branch: "feature/analytics-v2" },
];

const DeploymentOverview = () => {
  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Production Environment</CardTitle>
            <CardDescription>Currently deployed version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">v2.4.1</p>
                <p className="text-sm text-muted-foreground">Build #234</p>
              </div>
              <Badge className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Live
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deployed</span>
                <span>2 hours ago</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>3m 24s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deployed by</span>
                <span>John Doe</span>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Production
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staging Environment</CardTitle>
            <CardDescription>Pre-production testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">v2.4.2-rc.1</p>
                <p className="text-sm text-muted-foreground">Build #235</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                Testing
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deployed</span>
                <span>5 hours ago</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>2m 58s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deployed by</span>
                <span>Jane Smith</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button size="sm" className="w-full">
                <Rocket className="h-4 w-4 mr-2" />
                Promote to Production
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Staging
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
          <CardDescription>Latest deployment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDeployments.map((deployment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {deployment.status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{deployment.version}</p>
                      <Badge variant="outline">{deployment.environment}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {deployment.deployedBy} • {deployment.timestamp} • {deployment.duration}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{deployment.changes} changes</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Pending Changes
          </CardTitle>
          <CardDescription>Ready for deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingChanges.map((change, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    change.type === "feature" ? "default" :
                    change.type === "bugfix" ? "destructive" :
                    "secondary"
                  }>
                    {change.type}
                  </Badge>
                  <div>
                    <p className="font-medium">{change.title}</p>
                    <p className="text-sm text-muted-foreground font-mono">{change.branch}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Deploy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Metrics</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold">98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average Duration</span>
                <span className="font-semibold">3m 12s</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mean Time to Deploy</span>
                <span className="font-semibold">24m</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-muted-foreground">Total Deployments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Rollbacks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentOverview;

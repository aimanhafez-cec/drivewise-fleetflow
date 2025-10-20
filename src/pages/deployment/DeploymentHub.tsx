import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Settings, Activity, History, RefreshCw, AlertTriangle } from "lucide-react";
import DeploymentOverview from "./components/DeploymentOverview";
import EnvironmentManager from "./components/EnvironmentManager";
import ReleaseHistory from "./components/ReleaseHistory";
import HealthMonitoring from "./components/HealthMonitoring";
import DeploymentGuide from "./components/DeploymentGuide";

const DeploymentHub = () => {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 3000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deployment Hub</h1>
          <p className="text-muted-foreground mt-2">
            Manage deployments, environments, and releases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm" onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy to Production
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Status</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Healthy</div>
            <p className="text-xs text-muted-foreground">Last deployed 2h ago</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Version</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v2.4.1</div>
            <p className="text-xs text-muted-foreground">Build #234</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.98%</div>
            <p className="text-xs text-muted-foreground">30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-success" />
              <div>
                <p className="font-semibold">All Systems Operational</p>
                <p className="text-sm text-muted-foreground">
                  Production: v2.4.1 • Staging: v2.4.2-rc.1 • No active incidents
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3 text-success" />
                Production
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3 text-success" />
                Staging
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3 text-warning" />
                Development
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="history">Release History</TabsTrigger>
          <TabsTrigger value="health">Health & Monitoring</TabsTrigger>
          <TabsTrigger value="guide">Deployment Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DeploymentOverview />
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <EnvironmentManager />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReleaseHistory />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <HealthMonitoring />
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <DeploymentGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentHub;

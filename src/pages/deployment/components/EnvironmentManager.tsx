import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Database, Globe, Lock, Settings, Trash2 } from "lucide-react";

const environments = [
  {
    name: "Production",
    url: "https://app.yourcompany.com",
    status: "active",
    version: "v2.4.1",
    database: "prod-db",
    lastDeployed: "2 hours ago",
    autoDeployEnabled: false,
    healthCheck: "passing",
    color: "success"
  },
  {
    name: "Staging",
    url: "https://staging.yourcompany.com",
    status: "active",
    version: "v2.4.2-rc.1",
    database: "staging-db",
    lastDeployed: "5 hours ago",
    autoDeployEnabled: true,
    healthCheck: "passing",
    color: "default"
  },
  {
    name: "Development",
    url: "https://dev.yourcompany.com",
    status: "active",
    version: "v2.5.0-dev",
    database: "dev-db",
    lastDeployed: "30 minutes ago",
    autoDeployEnabled: true,
    healthCheck: "warning",
    color: "warning"
  },
  {
    name: "Preview",
    url: "https://preview-pr-123.yourcompany.com",
    status: "active",
    version: "v2.4.2-preview",
    database: "preview-db",
    lastDeployed: "1 hour ago",
    autoDeployEnabled: false,
    healthCheck: "passing",
    color: "secondary"
  },
];

const environmentVariables = [
  { key: "DATABASE_URL", production: "***hidden***", staging: "***hidden***", development: "***hidden***" },
  { key: "API_KEY", production: "***hidden***", staging: "***hidden***", development: "***hidden***" },
  { key: "STRIPE_KEY", production: "***hidden***", staging: "test_***", development: "test_***" },
  { key: "NODE_ENV", production: "production", staging: "staging", development: "development" },
  { key: "LOG_LEVEL", production: "error", staging: "warn", development: "debug" },
];

const EnvironmentManager = () => {
  return (
    <div className="space-y-6">
      {/* Environments List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Environments</CardTitle>
          <CardDescription>Manage deployment environments and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {environments.map((env) => (
              <div key={env.name} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{env.name}</h4>
                      <Badge variant={env.color as any} className="gap-1">
                        <Activity className="h-3 w-3" />
                        {env.healthCheck}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <a href={env.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {env.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    {env.name !== "Production" && (
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-mono">{env.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Database</p>
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <p className="font-mono">{env.database}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Deployed</p>
                    <p>{env.lastDeployed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Auto-Deploy</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Switch checked={env.autoDeployEnabled} />
                      <span className="text-xs">{env.autoDeployEnabled ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    Configuration
                  </Button>
                  <Button variant="outline" size="sm">
                    Health Check
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Environment Variables
          </CardTitle>
          <CardDescription>Manage environment-specific configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 p-3 bg-muted rounded-lg font-semibold text-sm">
              <div>Variable</div>
              <div>Production</div>
              <div>Staging</div>
              <div>Development</div>
            </div>

            {environmentVariables.map((variable, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 p-3 border rounded-lg text-sm">
                <div className="font-mono font-medium">{variable.key}</div>
                <div className="font-mono text-muted-foreground">{variable.production}</div>
                <div className="font-mono text-muted-foreground">{variable.staging}</div>
                <div className="font-mono text-muted-foreground">{variable.development}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note:</strong> Environment variables are managed through your deployment platform. 
              Sensitive values are encrypted and never displayed in plain text.
            </p>
            <Button variant="outline" size="sm">
              Manage Variables
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Rules</CardTitle>
          <CardDescription>Configure automated deployment policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto-deploy to staging on merge to main</p>
              <p className="text-sm text-muted-foreground">Automatically deploy when PR is merged</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require approval for production</p>
              <p className="text-sm text-muted-foreground">Manual approval required before production deployment</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Run tests before deployment</p>
              <p className="text-sm text-muted-foreground">Block deployment if tests fail</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable preview deployments</p>
              <p className="text-sm text-muted-foreground">Create preview environment for each PR</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentManager;

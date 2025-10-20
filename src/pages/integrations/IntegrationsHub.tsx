import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Webhook, 
  Mail, 
  Bell,
  Code,
  ArrowRight,
  Plus,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ZapierIntegration from "./components/ZapierIntegration";
import WebhookManagement from "./components/WebhookManagement";
import AutomationRules from "./components/AutomationRules";
import APIDocumentation from "./components/APIDocumentation";
import IntegrationActivity from "./components/IntegrationActivity";

const IntegrationsHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const integrations = [
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5000+ apps with Zapier automation",
      icon: Zap,
      status: "available",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Send real-time event data to external systems",
      icon: Webhook,
      status: "configured",
      configured: 3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      id: "email",
      name: "Email Notifications",
      description: "Automated email alerts for critical events",
      icon: Mail,
      status: "active",
      configured: 5,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      id: "notifications",
      name: "Push Notifications",
      description: "Real-time alerts and notifications",
      icon: Bell,
      status: "available",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      id: "api",
      name: "REST API",
      description: "Programmatic access to fleet data",
      icon: Code,
      status: "active",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    {
      title: "Active Integrations",
      value: "8",
      change: "+2 this month",
      icon: CheckCircle2,
      color: "text-green-500"
    },
    {
      title: "Automation Rules",
      value: "12",
      change: "3 running now",
      icon: Activity,
      color: "text-blue-500"
    },
    {
      title: "Events Today",
      value: "247",
      change: "+18% vs yesterday",
      icon: Clock,
      color: "text-purple-500"
    },
    {
      title: "Failed Webhooks",
      value: "0",
      change: "All healthy",
      icon: XCircle,
      color: "text-gray-500"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
      case "configured":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Configured</Badge>;
      case "available":
        return <Badge variant="outline">Available</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations & Automations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your fleet management system with external tools and automate workflows
          </p>
        </div>
        <Button onClick={() => setActiveTab("automations")}>
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>
                Connect with external services to extend functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <div
                      key={integration.id}
                      className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setActiveTab(integration.id)}
                    >
                      <div className={`absolute inset-0 ${integration.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative space-y-3">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                            <Icon className={`h-6 w-6 ${integration.color}`} />
                          </div>
                          {getStatusBadge(integration.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                          {integration.configured && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {integration.configured} configured
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full group-hover:bg-background">
                          Configure
                          <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <IntegrationActivity />
        </TabsContent>

        {/* Zapier Tab */}
        <TabsContent value="zapier">
          <ZapierIntegration />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <WebhookManagement />
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations">
          <AutomationRules />
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <APIDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsHub;

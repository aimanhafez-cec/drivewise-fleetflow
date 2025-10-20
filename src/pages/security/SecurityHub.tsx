import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Key, 
  Activity,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings
} from "lucide-react";
import { useState } from "react";
import RoleManagement from "./components/RoleManagement";
import UserPermissions from "./components/UserPermissions";
import AuditLogs from "./components/AuditLogs";
import SecuritySettings from "./components/SecuritySettings";

const SecurityHub = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Active Users",
      value: "24",
      change: "+3 this month",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Active Roles",
      value: "4",
      change: "Admin, Manager, Operator, Viewer",
      icon: Key,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Security Events",
      value: "156",
      change: "Last 24 hours",
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Failed Logins",
      value: "2",
      change: "No concerns",
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  const recentActivity = [
    {
      type: "role_assigned",
      title: "Role Assigned",
      description: "John Smith assigned Manager role",
      timestamp: new Date(),
      icon: Users,
      status: "success"
    },
    {
      type: "permission_changed",
      title: "Permission Updated",
      description: "Operator role permissions modified",
      timestamp: new Date(Date.now() - 3600000),
      icon: Key,
      status: "info"
    },
    {
      type: "login",
      title: "User Login",
      description: "jane@example.com logged in",
      timestamp: new Date(Date.now() - 7200000),
      icon: CheckCircle2,
      status: "success"
    },
    {
      type: "failed_auth",
      title: "Failed Authentication",
      description: "Multiple failed login attempts from unknown IP",
      timestamp: new Date(Date.now() - 10800000),
      icon: AlertTriangle,
      status: "warning"
    }
  ];

  const rolesSummary = [
    {
      role: "Admin",
      users: 2,
      permissions: "Full Access",
      color: "text-red-500"
    },
    {
      role: "Manager",
      users: 5,
      permissions: "Most Operations",
      color: "text-purple-500"
    },
    {
      role: "Operator",
      users: 12,
      permissions: "Daily Operations",
      color: "text-blue-500"
    },
    {
      role: "Viewer",
      users: 5,
      permissions: "Read Only",
      color: "text-gray-500"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-500/10">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Security & Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage user access, roles, and audit system activity
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setActiveTab("settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
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
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
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
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Roles Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>
                  Users by role and permission level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rolesSummary.map((role) => (
                  <div
                    key={role.role}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Key className={`h-5 w-5 ${role.color}`} />
                      <div>
                        <div className="font-medium">{role.role}</div>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{role.users}</div>
                      <div className="text-xs text-muted-foreground">users</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Activity</CardTitle>
                <CardDescription>
                  Latest security and access events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <div className={`p-2 rounded-lg bg-muted`}>
                          <Icon className={`h-4 w-4 ${
                            activity.status === 'success' ? 'text-green-500' :
                            activity.status === 'warning' ? 'text-amber-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {activity.description}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {activity.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
              <CardDescription>
                Recommendations for maintaining secure access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Principle of Least Privilege</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Grant users only the permissions they need for their role
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Regular Access Reviews</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Periodically review and update user permissions
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Monitor Audit Logs</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Review security events and suspicious activities
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Role-Based Access Control</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Use roles instead of assigning individual permissions
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <UserPermissions />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityHub;

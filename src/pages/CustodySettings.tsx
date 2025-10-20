import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationSettings, NotificationPreferences } from "@/components/custody";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Bell } from "lucide-react";

export default function CustodySettings() {
  // In a real app, get the current user ID from auth context
  const currentUserId = "current-user-id";

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custody Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage integrations and notification preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations">
            <Settings className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External System Integrations</CardTitle>
              <CardDescription>
                Configure connections to fleet management, billing, and claims systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationPreferences userId={currentUserId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

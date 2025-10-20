import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Copy, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ZapierIntegration = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const handleTriggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering Zapier webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          event_type: "test_trigger",
          data: {
            message: "Test event from Fleet Management System",
            source: "integrations_hub"
          }
        }),
      });

      setLastTriggered(new Date().toISOString());
      toast({
        title: "Request Sent",
        description: "The request was sent to Zapier. Check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const zapTriggers = [
    {
      name: "New Reservation Created",
      description: "Triggers when a new reservation is added",
      status: "available"
    },
    {
      name: "Vehicle Status Changed",
      description: "Triggers when a vehicle status is updated",
      status: "available"
    },
    {
      name: "Maintenance Due",
      description: "Triggers when vehicle maintenance is due",
      status: "available"
    },
    {
      name: "SLA Breach",
      description: "Triggers when a replacement request breaches SLA",
      status: "available"
    },
    {
      name: "Agreement Expiring",
      description: "Triggers when an agreement is about to expire",
      status: "available"
    }
  ];

  const zapActions = [
    {
      name: "Create Reservation",
      description: "Create a new reservation from external data",
      status: "available"
    },
    {
      name: "Update Vehicle",
      description: "Update vehicle information",
      status: "available"
    },
    {
      name: "Add Customer",
      description: "Add a new customer to the system",
      status: "available"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Setup Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <CardTitle>Zapier Integration</CardTitle>
              <CardDescription>
                Connect your fleet management system to 5000+ apps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Start */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Quick Start</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a new Zap in your Zapier account</li>
                <li>Choose "Webhooks by Zapier" as the trigger</li>
                <li>Select "Catch Hook" and copy the webhook URL</li>
                <li>Paste the URL below and test the connection</li>
              </ol>
            </div>

            {/* Webhook URL Input */}
            <form onSubmit={handleTriggerWebhook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Test"}
                  </Button>
                </div>
                {lastTriggered && (
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Last triggered: {new Date(lastTriggered).toLocaleString()}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Documentation Link */}
          <Button variant="outline" className="w-full" asChild>
            <a href="https://zapier.com/apps/webhooks/integrations" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Zapier Documentation
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Available Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Triggers</CardTitle>
          <CardDescription>
            Events that can start a Zap workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zapTriggers.map((trigger) => (
              <div
                key={trigger.name}
                className="flex items-start justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{trigger.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {trigger.description}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {trigger.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
          <CardDescription>
            Operations that can be performed from Zapier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zapActions.map((action) => (
              <div
                key={action.name}
                className="flex items-start justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{action.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {action.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Use Cases</CardTitle>
          <CardDescription>
            Ideas for automating your fleet operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Send Slack notification when SLA is breached
              </h4>
              <p className="text-xs text-muted-foreground pl-6">
                Stay informed about critical replacement delays in real-time
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Create Google Calendar events for maintenance
              </h4>
              <p className="text-xs text-muted-foreground pl-6">
                Automatically schedule maintenance appointments
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Add new customers to CRM automatically
              </h4>
              <p className="text-xs text-muted-foreground pl-6">
                Sync customer data with Salesforce, HubSpot, or other CRMs
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Send email alerts for expiring agreements
              </h4>
              <p className="text-xs text-muted-foreground pl-6">
                Automate customer notifications via Gmail or SendGrid
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZapierIntegration;

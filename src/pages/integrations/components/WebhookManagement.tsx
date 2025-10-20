import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Copy,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "error";
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

const WebhookManagement = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Customer Service Integration",
      url: "https://api.example.com/webhooks/reservations",
      events: ["reservation.created", "reservation.updated"],
      status: "active",
      lastTriggered: new Date().toISOString(),
      successCount: 247,
      failureCount: 0
    },
    {
      id: "2",
      name: "Analytics Platform",
      url: "https://analytics.example.com/events",
      events: ["vehicle.status_changed", "maintenance.completed"],
      status: "active",
      lastTriggered: new Date(Date.now() - 3600000).toISOString(),
      successCount: 1523,
      failureCount: 3
    },
    {
      id: "3",
      name: "CRM Sync",
      url: "https://crm.example.com/api/sync",
      events: ["customer.created", "customer.updated"],
      status: "inactive",
      successCount: 89,
      failureCount: 0
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[]
  });

  const availableEvents = [
    { value: "reservation.created", label: "Reservation Created" },
    { value: "reservation.updated", label: "Reservation Updated" },
    { value: "reservation.cancelled", label: "Reservation Cancelled" },
    { value: "vehicle.status_changed", label: "Vehicle Status Changed" },
    { value: "maintenance.scheduled", label: "Maintenance Scheduled" },
    { value: "maintenance.completed", label: "Maintenance Completed" },
    { value: "customer.created", label: "Customer Created" },
    { value: "customer.updated", label: "Customer Updated" },
    { value: "agreement.created", label: "Agreement Created" },
    { value: "agreement.expiring", label: "Agreement Expiring" },
    { value: "replacement.requested", label: "Replacement Requested" },
    { value: "replacement.approved", label: "Replacement Approved" },
    { value: "sla.breached", label: "SLA Breached" }
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: "active",
      successCount: 0,
      failureCount: 0
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
    setShowAddForm(false);

    toast({
      title: "Success",
      description: "Webhook added successfully"
    });
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast({
      title: "Success",
      description: "Webhook deleted"
    });
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    toast({
      title: "Testing webhook",
      description: "Sending test payload..."
    });

    // Simulate webhook test
    setTimeout(() => {
      toast({
        title: "Test successful",
        description: "Webhook responded with 200 OK"
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Webhook className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Webhook Management</CardTitle>
                <CardDescription>
                  Configure webhooks to send real-time event data
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Webhook Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Name *</Label>
              <Input
                id="webhook-name"
                placeholder="My Webhook"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL *</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://api.example.com/webhooks"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Events to Subscribe *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {availableEvents.map((event) => (
                  <label key={event.value} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhook({
                            ...newWebhook,
                            events: [...newWebhook.events, event.value]
                          });
                        } else {
                          setNewWebhook({
                            ...newWebhook,
                            events: newWebhook.events.filter(ev => ev !== event.value)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    {event.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddWebhook}>Create Webhook</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Webhooks */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    <Badge variant={
                      webhook.status === "active" ? "default" :
                      webhook.status === "error" ? "destructive" :
                      "secondary"
                    }>
                      {webhook.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {webhook.url}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(webhook.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Events */}
                <div>
                  <Label className="text-xs text-muted-foreground">Subscribed Events</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground">Success</div>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">{webhook.successCount}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                    <div className="flex items-center gap-1 mt-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{webhook.failureCount}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Last Triggered</div>
                    <div className="text-sm font-medium mt-1">
                      {webhook.lastTriggered 
                        ? new Date(webhook.lastTriggered).toLocaleString()
                        : "Never"
                      }
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {webhooks.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No webhooks configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first webhook to start receiving event notifications
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebhookManagement;

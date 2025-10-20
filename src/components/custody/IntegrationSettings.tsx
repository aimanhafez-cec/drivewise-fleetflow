import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { integrationsApi, IntegrationSettings as IntegrationSettingsType } from "@/lib/api/integrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, ExternalLink, Save } from "lucide-react";

export function IntegrationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["integration-settings"],
    queryFn: () => integrationsApi.getIntegrationSettings(),
  });

  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const updateMutation = useMutation({
    mutationFn: ({ type, data }: { type: 'fleet' | 'billing' | 'claims'; data: Partial<IntegrationSettingsType> }) =>
      integrationsApi.updateIntegrationSettings(type, data),
    onSuccess: () => {
      toast({ title: "Integration settings updated" });
      queryClient.invalidateQueries({ queryKey: ["integration-settings"] });
      setEditingType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (integration: IntegrationSettingsType) => {
    setEditingType(integration.integration_type);
    setFormData({
      is_enabled: integration.is_enabled,
      endpoint_url: integration.endpoint_url || '',
      config: integration.config,
    });
  };

  const handleSave = (type: 'fleet' | 'billing' | 'claims') => {
    updateMutation.mutate({ type, data: formData });
  };

  const handleToggle = (type: 'fleet' | 'billing' | 'claims', enabled: boolean) => {
    updateMutation.mutate({ type, data: { is_enabled: enabled } });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const integrationInfo = {
    fleet: {
      title: "Fleet Management",
      description: "Sync vehicle status and availability with fleet system",
      icon: "🚗",
    },
    billing: {
      title: "Billing System",
      description: "Automatically create invoices for custody charges",
      icon: "💰",
    },
    claims: {
      title: "Claims Processing",
      description: "Submit accident reports to insurance claims system",
      icon: "📋",
    },
  };

  return (
    <div className="space-y-4">
      {settings?.map((integration) => {
        const info = integrationInfo[integration.integration_type];
        const isEditing = editingType === integration.integration_type;

        return (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    {info.title}
                  </CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </div>
                <Switch
                  checked={integration.is_enabled}
                  onCheckedChange={(checked) =>
                    handleToggle(integration.integration_type, checked)
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.is_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Webhook Endpoint URL</Label>
                    <Input
                      placeholder="https://api.example.com/webhook"
                      value={
                        isEditing
                          ? formData.endpoint_url
                          : integration.endpoint_url || ''
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, endpoint_url: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Configuration</Label>
                    <div className="rounded-md border p-3 bg-muted/50 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(integration.config, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setEditingType(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSave(integration.integration_type)}
                          disabled={updateMutation.isPending}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(integration)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

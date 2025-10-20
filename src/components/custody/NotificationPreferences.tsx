import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { integrationsApi } from "@/lib/api/integrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, Phone, Save } from "lucide-react";

interface NotificationPreferencesProps {
  userId: string;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: () => integrationsApi.getNotificationPreferences(userId),
  });

  const [formData, setFormData] = useState({
    email_enabled: true,
    sms_enabled: false,
    notify_on_submission: true,
    notify_on_approval: true,
    notify_on_rejection: true,
    notify_on_handover: true,
    notify_on_closure: true,
    notify_on_sla_breach: true,
    email_address: '' as string | undefined,
    phone_number: '' as string | undefined,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        email_enabled: preferences.email_enabled,
        sms_enabled: preferences.sms_enabled,
        notify_on_submission: preferences.notify_on_submission,
        notify_on_approval: preferences.notify_on_approval,
        notify_on_rejection: preferences.notify_on_rejection,
        notify_on_handover: preferences.notify_on_handover,
        notify_on_closure: preferences.notify_on_closure,
        notify_on_sla_breach: preferences.notify_on_sla_breach,
        email_address: preferences.email_address || '',
        phone_number: preferences.phone_number || '',
      });
    }
  }, [preferences]);

  const updateMutation = useMutation({
    mutationFn: () => integrationsApi.updateNotificationPreferences(userId, formData),
    onSuccess: () => {
      toast({ title: "Notification preferences updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", userId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Configure how you want to be notified about custody transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email_enabled">Email Notifications</Label>
            </div>
            <Switch
              id="email_enabled"
              checked={formData.email_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, email_enabled: checked })
              }
            />
          </div>

          {formData.email_enabled && (
            <Input
              placeholder="Email address (optional)"
              value={formData.email_address || ''}
              onChange={(e) =>
                setFormData({ ...formData, email_address: e.target.value })
              }
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sms_enabled">SMS Notifications</Label>
            </div>
            <Switch
              id="sms_enabled"
              checked={formData.sms_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, sms_enabled: checked })
              }
            />
          </div>

          {formData.sms_enabled && (
            <Input
              placeholder="Phone number (optional)"
              value={formData.phone_number || ''}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />
          )}
        </div>

        <Separator />

        {/* Event Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notify me when</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notify_submission">Custody is submitted for approval</Label>
              <Switch
                id="notify_submission"
                checked={formData.notify_on_submission}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notify_on_submission: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify_approval">Custody is approved</Label>
              <Switch
                id="notify_approval"
                checked={formData.notify_on_approval}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notify_on_approval: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify_rejection">Custody is rejected</Label>
              <Switch
                id="notify_rejection"
                checked={formData.notify_on_rejection}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notify_on_rejection: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify_handover">Vehicle handover occurs</Label>
              <Switch
                id="notify_handover"
                checked={formData.notify_on_handover}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notify_on_handover: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify_closure">Custody is closed</Label>
              <Switch
                id="notify_closure"
                checked={formData.notify_on_closure}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notify_on_closure: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify_sla">SLA is breached</Label>
              <Switch
                id="notify_sla"
                checked={formData.notify_on_sla_breach}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notify_on_sla_breach: checked })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

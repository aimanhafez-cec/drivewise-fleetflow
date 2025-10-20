import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Plus, 
  Play,
  Pause,
  Trash2,
  Clock,
  Mail,
  Bell,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  runCount: number;
  lastRun?: string;
  icon: any;
}

const AutomationRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "1",
      name: "Maintenance Reminder",
      description: "Send email when vehicle maintenance is due in 7 days",
      trigger: "Maintenance Due Date - 7 days",
      action: "Send Email Notification",
      enabled: true,
      runCount: 23,
      lastRun: new Date().toISOString(),
      icon: Mail
    },
    {
      id: "2",
      name: "SLA Breach Alert",
      description: "Notify team when replacement request exceeds SLA",
      trigger: "Replacement SLA > Threshold",
      action: "Send Push Notification",
      enabled: true,
      runCount: 5,
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      icon: Bell
    },
    {
      id: "3",
      name: "Agreement Expiry Warning",
      description: "Alert customer 30 days before agreement expiration",
      trigger: "Agreement End Date - 30 days",
      action: "Send Email to Customer",
      enabled: true,
      runCount: 41,
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      icon: Clock
    },
    {
      id: "4",
      name: "Auto-Approve Standard Replacements",
      description: "Automatically approve replacement requests under 7 days",
      trigger: "Replacement Request Created",
      action: "Auto-Approve if Duration less than 7 days",
      enabled: false,
      runCount: 0,
      icon: RefreshCw
    }
  ]);

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));

    const rule = rules.find(r => r.id === id);
    toast({
      title: rule?.enabled ? "Rule Disabled" : "Rule Enabled",
      description: `${rule?.name} has been ${rule?.enabled ? "disabled" : "enabled"}`
    });
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast({
      title: "Rule Deleted",
      description: "Automation rule has been removed"
    });
  };

  const automationTemplates = [
    {
      name: "Vehicle Return Reminder",
      description: "Remind customer 1 day before scheduled return",
      category: "Customer Service"
    },
    {
      name: "Overdue Payment Alert",
      description: "Send notification for overdue invoices",
      category: "Finance"
    },
    {
      name: "Insurance Expiry Warning",
      description: "Alert when vehicle insurance is expiring",
      category: "Compliance"
    },
    {
      name: "Daily Operations Report",
      description: "Send daily summary of fleet operations",
      category: "Reporting"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>
                  Create automated workflows based on triggers and actions
                </CardDescription>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Active Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Rules</h3>
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-purple-500/10' : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${rule.enabled ? 'text-purple-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        {rule.enabled && (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Trigger</div>
                    <div className="font-medium">{rule.trigger}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Action</div>
                    <div className="font-medium">{rule.action}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Execution Stats</div>
                    <div>
                      <span className="font-semibold">{rule.runCount}</span> runs
                      {rule.lastRun && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {new Date(rule.lastRun).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Templates</CardTitle>
          <CardDescription>
            Pre-built automation rules you can customize
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {automationTemplates.map((template, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm group-hover:text-primary">
                      {template.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  <Plus className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Automations Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-500 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Choose a Trigger</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Select an event that starts the automation (e.g., "Reservation Created")
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-500 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Add Conditions (Optional)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Set rules for when the automation should run (e.g., &quot;Only if Duration greater than 7 days&quot;)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-500 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Define Actions</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Specify what should happen (e.g., "Send Email", "Update Status", "Create Task")
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationRules;

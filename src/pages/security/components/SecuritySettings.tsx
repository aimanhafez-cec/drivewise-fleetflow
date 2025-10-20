import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, Shield, Lock, Bell, Clock } from "lucide-react";

const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Settings className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure system security and access policies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Authentication Settings</CardTitle>
          </div>
          <CardDescription>
            Configure login requirements and session management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin users
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Complexity</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce strong password requirements
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Select defaultValue="30">
                <SelectTrigger id="session-timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="never">Never expire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="failed-attempts">Max Failed Login Attempts</Label>
              <Input
                id="failed-attempts"
                type="number"
                defaultValue="5"
                min="1"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Access Control</CardTitle>
          </div>
          <CardDescription>
            Manage IP restrictions and access policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Geo-blocking</Label>
                <p className="text-sm text-muted-foreground">
                  Block access from specific countries
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Concurrent Session Limit</Label>
                <p className="text-sm text-muted-foreground">
                  Maximum simultaneous logins per user
                </p>
              </div>
              <Select defaultValue="3">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Monitoring */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Audit & Monitoring</CardTitle>
          </div>
          <CardDescription>
            Configure logging and monitoring settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Detailed Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all user actions and system events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Failed Login Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify admins of suspicious login attempts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-retention">Log Retention Period</Label>
              <Select defaultValue="90">
                <SelectTrigger id="log-retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Security Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure alerts for security events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when a new user is created
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Role Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when user roles are modified
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permission Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when permissions are updated
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Suspicious Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Alert on potential security threats
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;

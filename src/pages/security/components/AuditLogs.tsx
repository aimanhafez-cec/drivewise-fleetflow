import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity, 
  Search, 
  Download,
  Filter,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useState } from "react";

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const logs = [
    {
      id: "1",
      action: "user.login",
      user: "john@example.com",
      userAgent: "Chrome on macOS",
      ipAddress: "192.168.1.100",
      resource: "Authentication",
      resourceId: null,
      details: "Successful login",
      status: "success",
      timestamp: new Date()
    },
    {
      id: "2",
      action: "vehicle.update",
      user: "sarah@example.com",
      userAgent: "Firefox on Windows",
      ipAddress: "192.168.1.101",
      resource: "Vehicle",
      resourceId: "ABC-123",
      details: "Updated vehicle status to 'Available'",
      status: "success",
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: "3",
      action: "reservation.create",
      user: "mike@example.com",
      userAgent: "Safari on iOS",
      ipAddress: "192.168.1.102",
      resource: "Reservation",
      resourceId: "RES-000123",
      details: "Created new reservation for customer CUS-000456",
      status: "success",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: "4",
      action: "user.login",
      user: "unknown@example.com",
      userAgent: "Chrome on Linux",
      ipAddress: "203.0.113.45",
      resource: "Authentication",
      resourceId: null,
      details: "Failed login attempt - invalid credentials",
      status: "failure",
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: "5",
      action: "role.assign",
      user: "john@example.com",
      userAgent: "Chrome on macOS",
      ipAddress: "192.168.1.100",
      resource: "User Role",
      resourceId: "emily@example.com",
      details: "Assigned 'Operator' role to emily@example.com",
      status: "success",
      timestamp: new Date(Date.now() - 10800000)
    },
    {
      id: "6",
      action: "settings.update",
      user: "john@example.com",
      userAgent: "Chrome on macOS",
      ipAddress: "192.168.1.100",
      resource: "System Settings",
      resourceId: "security-config",
      details: "Updated session timeout to 30 minutes",
      status: "success",
      timestamp: new Date(Date.now() - 14400000)
    },
    {
      id: "7",
      action: "agreement.approve",
      user: "sarah@example.com",
      userAgent: "Firefox on Windows",
      ipAddress: "192.168.1.101",
      resource: "Agreement",
      resourceId: "AGR-000789",
      details: "Approved rental agreement",
      status: "success",
      timestamp: new Date(Date.now() - 18000000)
    },
    {
      id: "8",
      action: "data.export",
      user: "sarah@example.com",
      userAgent: "Firefox on Windows",
      ipAddress: "192.168.1.101",
      resource: "Reports",
      resourceId: "monthly-revenue",
      details: "Exported monthly revenue report",
      status: "success",
      timestamp: new Date(Date.now() - 21600000)
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failure":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/10 text-green-500">Success</Badge>;
      case "failure":
        return <Badge variant="destructive">Failed</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-500">Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  Track all system activities and security events
                </CardDescription>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, user, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({logs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{log.action}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {log.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {log.details}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.user}
                    </div>
                    {log.resourceId && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {log.resource}: {log.resourceId}
                      </div>
                    )}
                    <div>
                      IP: {log.ipAddress}
                    </div>
                    <div>
                      {log.userAgent}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Events Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground mt-1">
              +18% vs yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Failed Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              No security concerns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all users
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;

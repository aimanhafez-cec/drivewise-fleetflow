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
import { Users, Search, UserPlus, Mail, Calendar } from "lucide-react";
import { useState } from "react";

const UserPermissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const users = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      lastActive: new Date(),
      assignedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Manager",
      status: "active",
      lastActive: new Date(Date.now() - 3600000),
      assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike@example.com",
      role: "Operator",
      status: "active",
      lastActive: new Date(Date.now() - 7200000),
      assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: "4",
      name: "Emily Brown",
      email: "emily@example.com",
      role: "Operator",
      status: "active",
      lastActive: new Date(Date.now() - 10800000),
      assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    },
    {
      id: "5",
      name: "David Lee",
      email: "david@example.com",
      role: "Viewer",
      status: "active",
      lastActive: new Date(Date.now() - 86400000),
      assignedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-500/10 text-red-500";
      case "Manager":
        return "bg-purple-500/10 text-purple-500";
      case "Operator":
        return "bg-blue-500/10 text-blue-500";
      case "Viewer":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>User Permissions</CardTitle>
                <CardDescription>
                  Assign roles and manage user access
                </CardDescription>
              </div>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Role
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{user.name}</div>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.status === "active" && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last active: {user.lastActive.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue={user.role.toLowerCase()}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Users who have been invited but haven't accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pending invitations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissions;

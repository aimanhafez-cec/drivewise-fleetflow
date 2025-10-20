import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Edit, Trash2, Plus, Users } from "lucide-react";

const RoleManagement = () => {
  const roles = [
    {
      name: "Admin",
      description: "Full system access with all permissions",
      users: 2,
      permissions: [
        "vehicles.all", "reservations.all", "customers.all", 
        "agreements.all", "operations.all", "reports.all", 
        "settings.all", "users.all", "audit.read"
      ],
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      name: "Manager",
      description: "Manage operations and view reports",
      users: 5,
      permissions: [
        "vehicles.all", "reservations.all", "customers.all",
        "agreements.approve", "operations.all", "reports.read"
      ],
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      name: "Operator",
      description: "Daily operations and customer service",
      users: 12,
      permissions: [
        "vehicles.read", "reservations.all", "customers.all",
        "operations.create", "operations.update"
      ],
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      name: "Viewer",
      description: "Read-only access to most data",
      users: 5,
      permissions: [
        "vehicles.read", "reservations.read", "customers.read",
        "reports.read"
      ],
      color: "text-gray-500",
      bgColor: "bg-gray-500/10"
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
                <Key className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Define and manage user roles and their permissions
                </CardDescription>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Roles List */}
      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.name} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${role.bgColor}`}>
                    <Key className={`h-5 w-5 ${role.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {role.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{role.users} users</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-sm font-medium mb-2">Permissions ({role.permissions.length})</div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 6).map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {role.permissions.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Overview of permissions across all roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Resource</th>
                  <th className="text-center py-3 px-4">Admin</th>
                  <th className="text-center py-3 px-4">Manager</th>
                  <th className="text-center py-3 px-4">Operator</th>
                  <th className="text-center py-3 px-4">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Vehicles", admin: "Full", manager: "Full", operator: "Read", viewer: "Read" },
                  { name: "Reservations", admin: "Full", manager: "Full", operator: "Full", viewer: "Read" },
                  { name: "Customers", admin: "Full", manager: "Full", operator: "Full", viewer: "Read" },
                  { name: "Agreements", admin: "Full", manager: "Approve", operator: "View", viewer: "View" },
                  { name: "Operations", admin: "Full", manager: "Full", operator: "Manage", viewer: "None" },
                  { name: "Reports", admin: "Full", manager: "Read", operator: "None", viewer: "Read" },
                  { name: "Settings", admin: "Full", manager: "None", operator: "None", viewer: "None" },
                  { name: "Users", admin: "Full", manager: "None", operator: "None", viewer: "None" },
                  { name: "Audit Logs", admin: "Full", manager: "Read", operator: "None", viewer: "None" }
                ].map((row) => (
                  <tr key={row.name} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{row.name}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={row.admin === "Full" ? "bg-green-500/10 text-green-500" : ""}>
                        {row.admin}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={row.manager === "Full" ? "default" : "outline"}>
                        {row.manager}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{row.operator}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{row.viewer}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;

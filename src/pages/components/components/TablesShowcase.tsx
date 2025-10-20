import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, MoreVertical, Search } from "lucide-react";

const TablesShowcase = () => {
  const sampleData = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", status: "active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Manager", status: "active" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "User", status: "inactive" },
    { id: "4", name: "Alice Brown", email: "alice@example.com", role: "User", status: "active" },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Table */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Table</CardTitle>
          <CardDescription>
            Simple table with headers and rows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">{row.name}</td>
                    <td className="p-4 align-middle">{row.email}</td>
                    <td className="p-4 align-middle">{row.role}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Table with Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Table with Actions</CardTitle>
          <CardDescription>
            Table with action buttons for each row
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{row.name}</td>
                    <td className="p-4 align-middle">{row.email}</td>
                    <td className="p-4 align-middle">{row.role}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Table with Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Table with Row Selection</CardTitle>
          <CardDescription>
            Table with checkboxes for multi-select
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-medium">
                    <Checkbox />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <Checkbox />
                    </td>
                    <td className="p-4 align-middle font-medium">{row.name}</td>
                    <td className="p-4 align-middle">{row.email}</td>
                    <td className="p-4 align-middle">{row.role}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Table with Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table with Search</CardTitle>
              <CardDescription>
                Table with search and filter capabilities
              </CardDescription>
            </div>
            <Button size="sm">Add User</Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{row.name}</td>
                    <td className="p-4 align-middle">{row.email}</td>
                    <td className="p-4 align-middle">{row.role}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 4 of 4 results
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Striped Table */}
      <Card>
        <CardHeader>
          <CardTitle>Striped Table</CardTitle>
          <CardDescription>
            Table with alternating row colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    <td className="p-4 align-middle font-medium">{row.name}</td>
                    <td className="p-4 align-middle">{row.email}</td>
                    <td className="p-4 align-middle">{row.role}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status}
                      </Badge>
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

export default TablesShowcase;

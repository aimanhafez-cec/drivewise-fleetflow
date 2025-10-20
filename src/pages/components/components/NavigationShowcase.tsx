import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, Settings, Bell, Search, Menu } from "lucide-react";

const NavigationShowcase = () => {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs Navigation</CardTitle>
          <CardDescription>
            Navigate between different sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Account settings content
              </p>
            </TabsContent>
            <TabsContent value="password" className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Password settings content
              </p>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Notifications settings content
              </p>
            </TabsContent>
          </Tabs>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Tabs><TabsList>...</TabsList><TabsContent>...</TabsContent></Tabs>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumbs */}
      <Card>
        <CardHeader>
          <CardTitle>Breadcrumbs</CardTitle>
          <CardDescription>
            Show current location in hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Home
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">/</span>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Components
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">/</span>
              </li>
              <li>
                <span className="text-sm font-medium">Navigation</span>
              </li>
            </ol>
          </nav>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<nav><ol>...breadcrumb items...</ol></nav>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Vertical Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Vertical Navigation</CardTitle>
          <CardDescription>
            Sidebar-style navigation menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-primary text-primary-foreground"
            >
              <Home className="h-4 w-4" />
              Home
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Profile
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              Notifications
              <Badge className="ml-auto">3</Badge>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </nav>
        </CardContent>
      </Card>

      {/* Horizontal Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Horizontal Navigation</CardTitle>
          <CardDescription>
            Top navigation bar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-medium border-b-2 border-primary pb-1"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-1"
            >
              Projects
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-1"
            >
              Team
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-1"
            >
              Reports
            </a>
          </nav>
        </CardContent>
      </Card>

      {/* Icon Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Navigation</CardTitle>
          <CardDescription>
            Navigation with icons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </nav>
        </CardContent>
      </Card>

      {/* Mobile Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Navigation</CardTitle>
          <CardDescription>
            Responsive mobile menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Menu</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Pagination</CardTitle>
          <CardDescription>
            Navigate through pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <div className="flex gap-1">
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                4
              </Button>
              <Button variant="outline" size="sm">
                5
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationShowcase;

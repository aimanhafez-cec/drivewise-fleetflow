import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, User, Mail, Phone } from "lucide-react";

const DataDisplayShowcase = () => {
  return (
    <div className="space-y-6">
      {/* Avatars */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
          <CardDescription>
            Display user profile pictures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="h-10 w-10">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">AB</AvatarFallback>
            </Avatar>
            <div className="flex -space-x-2">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>U2</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>U3</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">+5</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Avatar><AvatarFallback>CN</AvatarFallback></Avatar>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Separators */}
      <Card>
        <CardHeader>
          <CardTitle>Separators</CardTitle>
          <CardDescription>
            Divide content sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm">Content above separator</p>
            <Separator className="my-4" />
            <p className="text-sm">Content below separator</p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm">Left content</p>
            <Separator orientation="vertical" className="h-8" />
            <p className="text-sm">Right content</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Data Lists</CardTitle>
          <CardDescription>
            Display key-value pairs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm font-medium">John Doe</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm">john.doe@example.com</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Role</dt>
              <dd>
                <Badge>Admin</Badge>
              </dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd>
                <Badge className="bg-green-500">Active</Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Icon Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Lists</CardTitle>
          <CardDescription>
            Lists with icons for visual clarity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">John Doe</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">john.doe@example.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined January 2024</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>
            Show chronological events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "2 hours ago", title: "Project created", description: "New project initialized" },
              { time: "5 hours ago", title: "Team member added", description: "John Doe joined the team" },
              { time: "1 day ago", title: "Milestone completed", description: "Version 1.0 released" },
              { time: "3 days ago", title: "Meeting scheduled", description: "Team sync on Friday" }
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {index !== 3 && <div className="w-0.5 h-full bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Stats Grid</CardTitle>
          <CardDescription>
            Display metrics and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">2,543</p>
              <p className="text-xs text-green-500">+12.5% from last month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">$45,231</p>
              <p className="text-xs text-green-500">+8.2% from last month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-red-500">-3.1% from last month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold">573</p>
              <p className="text-xs text-muted-foreground">Real-time data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Block */}
      <Card>
        <CardHeader>
          <CardTitle>Code Display</CardTitle>
          <CardDescription>
            Show code snippets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm">
              <code>{`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDisplayShowcase;

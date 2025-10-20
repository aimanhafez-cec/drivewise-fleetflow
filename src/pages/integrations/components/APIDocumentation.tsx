import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Eye, EyeOff, RefreshCw, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const APIDocumentation = () => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState("sk_live_" + Math.random().toString(36).substring(2, 15));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/vehicles",
      description: "List all vehicles",
      auth: true
    },
    {
      method: "GET",
      path: "/api/v1/vehicles/:id",
      description: "Get vehicle details",
      auth: true
    },
    {
      method: "POST",
      path: "/api/v1/reservations",
      description: "Create a new reservation",
      auth: true
    },
    {
      method: "GET",
      path: "/api/v1/reservations",
      description: "List reservations",
      auth: true
    },
    {
      method: "PUT",
      path: "/api/v1/reservations/:id",
      description: "Update reservation",
      auth: true
    },
    {
      method: "GET",
      path: "/api/v1/customers",
      description: "List customers",
      auth: true
    },
    {
      method: "POST",
      path: "/api/v1/customers",
      description: "Create customer",
      auth: true
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/10 text-blue-500";
      case "POST":
        return "bg-green-500/10 text-green-500";
      case "PUT":
        return "bg-amber-500/10 text-amber-500";
      case "DELETE":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const exampleCode = {
    curl: `curl -X GET https://api.fleet.example.com/v1/vehicles \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`,
    
    javascript: `const response = await fetch('https://api.fleet.example.com/v1/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,

    python: `import requests

headers = {
    'Authorization': f'Bearer ${apiKey}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.fleet.example.com/v1/vehicles',
    headers=headers
)

data = response.json()
print(data)`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Code className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle>REST API Documentation</CardTitle>
              <CardDescription>
                Programmatic access to your fleet management data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Authentication</CardTitle>
          <CardDescription>
            Use your API key to authenticate requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your API Key</label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep your API key secure. Do not share it in publicly accessible areas.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Base URL</h4>
            <code className="text-sm">https://api.fleet.example.com/v1</code>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Available Endpoints</CardTitle>
          <CardDescription>
            RESTful API endpoints for accessing your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Badge className={`${getMethodColor(endpoint.method)} font-mono text-xs w-16 justify-center`}>
                    {endpoint.method}
                  </Badge>
                  <div className="flex-1">
                    <code className="text-sm font-mono">{endpoint.path}</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      {endpoint.description}
                    </p>
                  </div>
                </div>
                {endpoint.auth && (
                  <Badge variant="outline" className="text-xs">
                    Auth Required
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            Sample code to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>

            {Object.entries(exampleCode).map(([lang, code]) => (
              <TabsContent key={lang} value={lang} className="mt-4">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    <code>{code}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Example */}
      <Card>
        <CardHeader>
          <CardTitle>Response Format</CardTitle>
          <CardDescription>
            All API responses follow this structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "success": true,
  "data": {
    "id": "veh_1234567890",
    "registration_number": "ABC-123",
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "status": "available",
    "mileage": 15000
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}`}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(JSON.stringify({ success: true }, null, 2))}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium text-sm">Standard Plan</div>
                <div className="text-xs text-muted-foreground">Current plan</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">1,000 requests/hour</div>
                <div className="text-xs text-muted-foreground">Per API key</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Documentation */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full API Documentation
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;

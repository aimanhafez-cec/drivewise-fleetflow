import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Code, 
  Layout,
  Sparkles,
  Copy,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import ButtonsShowcase from "./components/ButtonsShowcase";
import FormsShowcase from "./components/FormsShowcase";
import CardsShowcase from "./components/CardsShowcase";
import TablesShowcase from "./components/TablesShowcase";
import ModalsShowcase from "./components/ModalsShowcase";
import NavigationShowcase from "./components/NavigationShowcase";
import FeedbackShowcase from "./components/FeedbackShowcase";
import DataDisplayShowcase from "./components/DataDisplayShowcase";
import DesignTokens from "./components/DesignTokens";

const ComponentsLibrary = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const categories = [
    {
      name: "Buttons & Actions",
      count: 12,
      icon: Sparkles,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      name: "Forms & Inputs",
      count: 15,
      icon: Code,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      name: "Cards & Layouts",
      count: 8,
      icon: Layout,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      name: "Tables & Data",
      count: 6,
      icon: Code,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      name: "Modals & Overlays",
      count: 5,
      icon: Sparkles,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      name: "Navigation",
      count: 7,
      icon: Layout,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      name: "Feedback",
      count: 9,
      icon: CheckCircle2,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      name: "Data Display",
      count: 10,
      icon: Code,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    }
  ];

  const stats = [
    {
      title: "Total Components",
      value: "72",
      description: "Ready to use",
      color: "text-blue-500"
    },
    {
      title: "Design Tokens",
      value: "156",
      description: "Colors, spacing, typography",
      color: "text-purple-500"
    },
    {
      title: "Patterns",
      value: "24",
      description: "Common UI patterns",
      color: "text-green-500"
    },
    {
      title: "Examples",
      value: "89",
      description: "Code examples",
      color: "text-amber-500"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">UI/UX Components Library</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive collection of reusable components and design patterns
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Code className="h-4 w-4 mr-2" />
            View Code
          </Button>
          <Button>
            <Copy className="h-4 w-4 mr-2" />
            Copy Examples
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="modals">Modals</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Categories</CardTitle>
              <CardDescription>
                Browse components by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.name}
                      className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setActiveTab(category.name.toLowerCase().split(' ')[0])}
                    >
                      <div className={`absolute inset-0 ${category.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative space-y-3">
                        <div className={`p-3 rounded-lg ${category.bgColor} w-fit`}>
                          <Icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.count} components
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Design Principles */}
          <Card>
            <CardHeader>
              <CardTitle>Design Principles</CardTitle>
              <CardDescription>
                Core principles guiding our UI/UX design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-semibold">1</span>
                    </div>
                    <h4 className="font-semibold">Consistency</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Maintain visual and functional consistency across all components
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <span className="text-purple-500 font-semibold">2</span>
                    </div>
                    <h4 className="font-semibold">Accessibility</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Design for all users with proper contrast, keyboard navigation, and screen readers
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-green-500 font-semibold">3</span>
                    </div>
                    <h4 className="font-semibold">Simplicity</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Keep interfaces clean and intuitive with minimal cognitive load
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-amber-500 font-semibold">4</span>
                    </div>
                    <h4 className="font-semibold">Responsiveness</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Adapt seamlessly to different screen sizes and devices
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="text-red-500 font-semibold">5</span>
                    </div>
                    <h4 className="font-semibold">Feedback</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Provide clear visual feedback for all user interactions
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <span className="text-indigo-500 font-semibold">6</span>
                    </div>
                    <h4 className="font-semibold">Performance</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Optimize components for fast rendering and smooth animations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                How to use components in your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Import the Component</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">
                    import {'{ Button }'} from "@/components/ui/button";
                  </code>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Use in Your Code</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">
                    {'<Button variant="default">Click Me</Button>'}
                  </code>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Customize with Props</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">
                    {'<Button size="lg" variant="outline">Large Outline</Button>'}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Showcases */}
        <TabsContent value="buttons">
          <ButtonsShowcase />
        </TabsContent>

        <TabsContent value="forms">
          <FormsShowcase />
        </TabsContent>

        <TabsContent value="cards">
          <CardsShowcase />
        </TabsContent>

        <TabsContent value="tables">
          <TablesShowcase />
        </TabsContent>

        <TabsContent value="modals">
          <ModalsShowcase />
        </TabsContent>

        <TabsContent value="navigation">
          <NavigationShowcase />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackShowcase />
        </TabsContent>

        <TabsContent value="data">
          <DataDisplayShowcase />
        </TabsContent>

        <TabsContent value="tokens">
          <DesignTokens />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentsLibrary;

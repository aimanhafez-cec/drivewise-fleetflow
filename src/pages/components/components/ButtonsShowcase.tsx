import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash2, Edit, Check, X, Loader2, ArrowRight } from "lucide-react";

const ButtonsShowcase = () => {
  return (
    <div className="space-y-6">
      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Different button styles for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Button variant="default">Default</Button>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Button Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Button Sizes</CardTitle>
          <CardDescription>
            Different button sizes for different contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Button size="lg">Large</Button>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Buttons with Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons with Icons</CardTitle>
          <CardDescription>
            Enhance buttons with icons for better UX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="secondary">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="default">
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Button><Plus className="h-4 w-4 mr-2" />Add New</Button>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Button States */}
      <Card>
        <CardHeader>
          <CardTitle>Button States</CardTitle>
          <CardDescription>
            Loading and disabled states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading
            </Button>
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Button disabled>Disabled</Button>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Icon-Only Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Icon-Only Buttons</CardTitle>
          <CardDescription>
            Compact buttons with only icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="icon" variant="default">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <X className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Button size="icon"><Plus className="h-4 w-4" /></Button>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Button Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Button Groups</CardTitle>
          <CardDescription>
            Group related buttons together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-0">
            <Button variant="outline" className="rounded-r-none">
              Previous
            </Button>
            <Button variant="outline" className="rounded-none border-x-0">
              Current
            </Button>
            <Button variant="outline" className="rounded-l-none">
              Next
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<div className="flex gap-0">...buttons...</div>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Full Width Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Full Width Buttons</CardTitle>
          <CardDescription>
            Buttons that span the full container width
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button className="w-full">Full Width Default</Button>
            <Button variant="outline" className="w-full">Full Width Outline</Button>
            <Button variant="secondary" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Full Width with Icon
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Button className="w-full">Full Width</Button>'}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ButtonsShowcase;

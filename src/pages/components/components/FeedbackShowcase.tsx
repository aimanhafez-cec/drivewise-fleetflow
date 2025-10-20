import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

const FeedbackShowcase = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>
            Show temporary feedback messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                toast({
                  title: "Success",
                  description: "Your changes have been saved successfully.",
                })
              }
            >
              Show Success
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                toast({
                  title: "Error",
                  description: "Something went wrong. Please try again.",
                  variant: "destructive",
                })
              }
            >
              Show Error
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  title: "Info",
                  description: "Here's some information for you.",
                })
              }
            >
              Show Info
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'toast({ title: "Success", description: "..." })'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Messages</CardTitle>
          <CardDescription>
            Display important messages inline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-500 mb-1">Success</h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your operation completed successfully!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-500 mb-1">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                There was an error processing your request.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-500 mb-1">Warning</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Please review your information before continuing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-500 mb-1">Information</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Here's some helpful information for you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Status Badges</CardTitle>
          <CardDescription>
            Show status and labels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-green-500">Success</Badge>
            <Badge className="bg-amber-500">Warning</Badge>
            <Badge className="bg-blue-500">Info</Badge>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Badge variant="default">Badge</Badge>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>
            Show progress of operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress 25%</span>
              <span className="text-muted-foreground">25/100</span>
            </div>
            <Progress value={25} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress 50%</span>
              <span className="text-muted-foreground">50/100</span>
            </div>
            <Progress value={50} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress 75%</span>
              <span className="text-muted-foreground">75/100</span>
            </div>
            <Progress value={75} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Complete</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <Progress value={100} />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Progress value={50} />'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>
            Indicate ongoing processes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing
            </Button>
            <Button variant="ghost" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Please wait
            </Button>
          </div>

          <div className="flex items-center gap-2 p-4 border rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading content...</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 p-8 border rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Please wait while we process your request</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty States */}
      <Card>
        <CardHeader>
          <CardTitle>Empty States</CardTitle>
          <CardDescription>
            Show when no content is available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">No items found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first item
            </p>
            <Button>Create Item</Button>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loaders</CardTitle>
          <CardDescription>
            Show placeholder content while loading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackShowcase;

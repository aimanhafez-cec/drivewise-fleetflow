import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Github, Settings, CheckCircle2 } from "lucide-react";

const DeploymentGuide = () => {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployment Guide
          </CardTitle>
          <CardDescription>Step-by-step instructions for deploying your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <strong>Lovable Deployment:</strong> Your application is automatically deployed to Lovable's infrastructure. 
              Click the "Publish" button in the top right to deploy changes to production.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>Connect your project to GitHub for version control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Click GitHub → Connect to GitHub</p>
                <p className="text-sm text-muted-foreground">
                  Found in the top right of the Lovable editor
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Authorize Lovable GitHub App</p>
                <p className="text-sm text-muted-foreground">
                  Grant permissions to create and sync repositories
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Create Repository</p>
                <p className="text-sm text-muted-foreground">
                  Lovable will automatically create a new repo with your code
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Changes in Lovable automatically push to GitHub, and changes pushed to GitHub automatically sync to Lovable.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain Setup</CardTitle>
          <CardDescription>Connect your own domain name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Navigate to Project Settings → Domains</p>
                <p className="text-sm text-muted-foreground">
                  Access domain configuration in your project settings
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Add your custom domain</p>
                <p className="text-sm text-muted-foreground">
                  Enter your domain name (e.g., yourdomain.com)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Update DNS records</p>
                <p className="text-sm text-muted-foreground">
                  Configure your domain's DNS settings with the provided values
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Verify domain ownership</p>
                <p className="text-sm text-muted-foreground">
                  Wait for DNS propagation (usually 24-48 hours)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm">
              <strong>⚠️ Note:</strong> A paid Lovable plan is required to connect a custom domain.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Variables & Secrets
          </CardTitle>
          <CardDescription>Manage sensitive configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For applications connected to Supabase or Lovable Cloud, use the secrets management feature to securely store API keys and sensitive data.
          </p>

          <div className="p-4 border rounded-lg space-y-2">
            <p className="font-medium">To add a secret:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Use the secrets management tool in your project</li>
              <li>Enter the secret name (e.g., STRIPE_API_KEY)</li>
              <li>Provide the secret value securely</li>
              <li>Access the secret in edge functions using process.env</li>
            </ol>
          </div>

          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-semibold mb-1">⚠️ Security Warning</p>
            <p className="text-sm text-muted-foreground">
              Never commit API keys or secrets directly in your codebase. Always use environment variables or the secrets management system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Test before deploying</p>
                <p className="text-sm text-muted-foreground">
                  Always test changes in development or staging before production
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Deploy during low-traffic periods</p>
                <p className="text-sm text-muted-foreground">
                  Schedule deployments when user activity is minimal
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Monitor after deployment</p>
                <p className="text-sm text-muted-foreground">
                  Watch logs and metrics for the first 30 minutes after deploying
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Have a rollback plan</p>
                <p className="text-sm text-muted-foreground">
                  Know how to quickly revert changes if issues arise
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Document changes</p>
                <p className="text-sm text-muted-foreground">
                  Keep clear release notes for each deployment
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentGuide;

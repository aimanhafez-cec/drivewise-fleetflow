import React from 'react';
import { HelpCircle, Book, Video, MessageSquare, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const HelpDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cost & Compliance Help Center</DialogTitle>
          <DialogDescription>
            Get help, watch tutorials, and access documentation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guides" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  User Manual
                </CardTitle>
                <CardDescription>
                  Complete guide to using the Cost & Compliance module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Quick Links:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Getting Started</li>
                    <li>• Managing Tolls & Fines</li>
                    <li>• Handling Exceptions</li>
                    <li>• Billing Cycles</li>
                    <li>• UAE-Specific Features</li>
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/docs/USER-MANUAL.md" target="_blank" rel="noopener">
                    Open User Manual
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Admin Setup Guide
                </CardTitle>
                <CardDescription>
                  For administrators setting up the module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Topics Covered:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Database Setup</li>
                    <li>• User Permissions</li>
                    <li>• Integration Configuration</li>
                    <li>• Data Migration</li>
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/docs/ADMIN-SETUP-GUIDE.md" target="_blank" rel="noopener">
                    Open Admin Guide
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Troubleshooting Guide
                </CardTitle>
                <CardDescription>
                  Solutions to common issues and problems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Common Issues:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Data not loading</li>
                    <li>• Unable to create records</li>
                    <li>• Sync issues</li>
                    <li>• Billing cycle errors</li>
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/docs/TROUBLESHOOTING.md" target="_blank" rel="noopener">
                    Open Troubleshooting Guide
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Step-by-step video guides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Available Tutorials:</h4>
                  <div className="space-y-2">
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Getting Started (5 min)</h5>
                      <p className="text-xs text-muted-foreground">
                        Introduction to the module and basic navigation
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Recording Tolls & Fines (8 min)</h5>
                      <p className="text-xs text-muted-foreground">
                        How to create and manage toll and fine records
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Managing Exceptions (6 min)</h5>
                      <p className="text-xs text-muted-foreground">
                        Working with compliance exceptions
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">Billing Cycles (10 min)</h5>
                      <p className="text-xs text-muted-foreground">
                        Creating and managing billing cycles
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium text-sm">UAE Features (7 min)</h5>
                      <p className="text-xs text-muted-foreground">
                        Using UAE-specific tools and features
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Access Video Library
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How do I create a new toll record?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Click the "New Toll/Fine" button, select "Toll" as the type, fill in the
                  vehicle, date, amount, and issuing authority, then click Save.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Can I edit a finalized billing cycle?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No, finalized billing cycles are locked and cannot be edited. Contact your
                  administrator if corrections are needed.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    How do I link a fine to a customer contract?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Select the fine record, click "Actions" → "Link to Contract", choose the
                  contract from the dropdown, and confirm.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    What is the difference between Acknowledge and Mark Paid?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  "Acknowledge" means you've received and reviewed the fine. "Mark Paid"
                  indicates the fine has been paid and should include a payment reference.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    How often does exception detection run?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Exception detection runs automatically daily at 2 AM. You can also trigger it
                  manually by clicking "Run Exception Detection" on the Exceptions tab.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Where can I find RTA violation codes?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Click "New Toll/Fine", select "Fine" type, then click "Lookup Violation
                  Code". You can search by code, description, or in Arabic.
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Email Support</h4>
                    <p className="text-sm text-muted-foreground">support@yourcompany.com</p>
                    <p className="text-xs text-muted-foreground">Response time: 24 hours</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Phone Support</h4>
                    <p className="text-sm text-muted-foreground">+971-XX-XXX-XXXX</p>
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri, 9 AM - 6 PM GST
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Internal Help Desk</h4>
                    <p className="text-sm text-muted-foreground">Extension: 1234</p>
                    <p className="text-xs text-muted-foreground">For internal staff only</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">
                    When contacting support, please include:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Your username</li>
                    <li>• What you were trying to do</li>
                    <li>• Error message (if any)</li>
                    <li>• Screenshot of the issue</li>
                    <li>• Browser and version</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Check service availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href="https://status.lovable.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lovable Status
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href="https://status.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Supabase Status
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

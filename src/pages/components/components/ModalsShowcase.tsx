import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ModalsShowcase = () => {
  return (
    <div className="space-y-6">
      {/* Basic Dialog */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Dialog</CardTitle>
          <CardDescription>
            Simple modal dialog with content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a description of the dialog content.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Dialog content goes here. You can add any components or information.
                </p>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Dialog><DialogTrigger>...</DialogTrigger><DialogContent>...</DialogContent></Dialog>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Card>
        <CardHeader>
          <CardTitle>Form Dialog</CardTitle>
          <CardDescription>
            Dialog containing a form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue="John Doe"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    defaultValue="@johndoe"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Alert Dialog */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Dialog</CardTitle>
          <CardDescription>
            Confirmation dialog with cancel option
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<AlertDialog><AlertDialogTrigger>...</AlertDialogTrigger></AlertDialog>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Dialog Types</CardTitle>
          <CardDescription>
            Different dialog configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">Success Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <DialogTitle className="text-center">Success!</DialogTitle>
                  <DialogDescription className="text-center">
                    Your changes have been saved successfully.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button className="w-full">Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Warning Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <DialogTitle className="text-center">Warning</DialogTitle>
                  <DialogDescription className="text-center">
                    Please review the information before proceeding.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                  <Button variant="outline">Cancel</Button>
                  <Button>Proceed</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">Info Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <DialogTitle className="text-center">Information</DialogTitle>
                  <DialogDescription className="text-center">
                    Here's some important information you should know.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button className="w-full">Got it</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Guidelines for using dialogs effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-500 text-xs">✓</span>
              </div>
              <p>Use dialogs for important actions that require user attention</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-500 text-xs">✓</span>
              </div>
              <p>Keep dialog content concise and focused</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-500 text-xs">✓</span>
              </div>
              <p>Provide clear action buttons with descriptive labels</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-xs">✗</span>
              </div>
              <p>Don't overuse dialogs - they interrupt the user experience</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-xs">✗</span>
              </div>
              <p>Avoid nesting dialogs within dialogs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModalsShowcase;

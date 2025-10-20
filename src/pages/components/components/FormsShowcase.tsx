import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormsShowcase = () => {
  return (
    <div className="space-y-6">
      {/* Text Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Text Inputs</CardTitle>
          <CardDescription>
            Standard text input fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" placeholder="Disabled" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="readonly">Read-only Input</Label>
              <Input id="readonly" value="Read-only value" readOnly />
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Input type="email" placeholder="user@example.com" />'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Textarea */}
      <Card>
        <CardHeader>
          <CardTitle>Textarea</CardTitle>
          <CardDescription>
            Multi-line text input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              placeholder="Type your message here..." 
              rows={4}
            />
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Textarea placeholder="Type your message here..." />'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Select */}
      <Card>
        <CardHeader>
          <CardTitle>Select Dropdown</CardTitle>
          <CardDescription>
            Dropdown selection input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Select><SelectTrigger>...</SelectTrigger></Select>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle>Checkboxes</CardTitle>
          <CardDescription>
            Multiple choice selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                Accept terms and conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing" defaultChecked />
              <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                Receive marketing emails
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="disabled" disabled />
              <Label htmlFor="disabled" className="text-sm font-normal text-muted-foreground">
                Disabled checkbox
              </Label>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Checkbox id="terms" /><Label htmlFor="terms">...</Label>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Radio Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Radio Groups</CardTitle>
          <CardDescription>
            Single choice selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="option-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-1" id="option-1" />
              <Label htmlFor="option-1" className="font-normal cursor-pointer">
                Option 1
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-2" id="option-2" />
              <Label htmlFor="option-2" className="font-normal cursor-pointer">
                Option 2
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-3" id="option-3" />
              <Label htmlFor="option-3" className="font-normal cursor-pointer">
                Option 3
              </Label>
            </div>
          </RadioGroup>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<RadioGroup><RadioGroupItem value="..." /></RadioGroup>'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Switches */}
      <Card>
        <CardHeader>
          <CardTitle>Switches</CardTitle>
          <CardDescription>
            Toggle switches for on/off states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="airplane-mode" className="font-normal">
                Airplane Mode
              </Label>
              <Switch id="airplane-mode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="font-normal">
                Enable Notifications
              </Label>
              <Switch id="notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="disabled-switch" className="font-normal text-muted-foreground">
                Disabled Switch
              </Label>
              <Switch id="disabled-switch" disabled />
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-sm">
              {'<Switch id="notifications" />'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Complete Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Form Example</CardTitle>
          <CardDescription>
            A fully styled form with validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name *</Label>
                <Input id="first-name" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name *</Label>
                <Input id="last-name" placeholder="Doe" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-complete">Email *</Label>
              <Input id="email-complete" type="email" placeholder="john.doe@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-complete">Message</Label>
              <Textarea id="message-complete" placeholder="Your message..." rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="subscribe" />
              <Label htmlFor="subscribe" className="text-sm font-normal cursor-pointer">
                Subscribe to newsletter
              </Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormsShowcase;

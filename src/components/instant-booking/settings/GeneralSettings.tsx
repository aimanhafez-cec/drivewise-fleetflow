import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Workflow</CardTitle>
          <CardDescription>Configure the instant booking workflow behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Instant Booking</p>
              <p className="text-sm text-muted-foreground">
                Allow customers to make instant bookings
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Customer Login</p>
              <p className="text-sm text-muted-foreground">
                Force authentication before booking
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Create Agreement</p>
              <p className="text-sm text-muted-foreground">
                Automatically create rental agreement after payment
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Confirmation</p>
              <p className="text-sm text-muted-foreground">
                Send confirmation email to customer
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Restrictions</CardTitle>
          <CardDescription>Set booking time and availability restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-advance">Minimum Advance Booking (hours)</Label>
              <Input id="min-advance" type="number" defaultValue="2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-advance">Maximum Advance Booking (days)</Label>
              <Input id="max-advance" type="number" defaultValue="90" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-duration">Minimum Rental Duration (days)</Label>
              <Input id="min-duration" type="number" defaultValue="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-duration">Maximum Rental Duration (days)</Label>
              <Input id="max-duration" type="number" defaultValue="30" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Verification</CardTitle>
          <CardDescription>Configure document verification requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Emirates ID Required</p>
              <p className="text-sm text-muted-foreground">
                Require Emirates ID for all bookings
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Driving License Required</p>
              <p className="text-sm text-muted-foreground">
                Require valid driving license
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Credit Check</p>
              <p className="text-sm text-muted-foreground">
                Perform credit check for high-value bookings
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure booking notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notify-email">Admin Notification Email</Label>
            <Input
              id="notify-email"
              type="email"
              placeholder="admin@example.com"
              defaultValue="bookings@autostrad.com"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Send SMS confirmations to customers
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Admin Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notify admin for new bookings
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>Set booking terms and policy text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Instant Booking Terms</Label>
            <Textarea
              id="terms"
              rows={6}
              placeholder="Enter terms and conditions..."
              defaultValue="By making an instant booking, you agree to our rental terms and conditions. Payment is required upfront. Cancellations must be made at least 24 hours before pickup time for a full refund."
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Terms Acceptance</p>
              <p className="text-sm text-muted-foreground">
                Customer must accept terms before booking
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" size="lg">
          Reset to Defaults
        </Button>
        <Button size="lg">Save General Settings</Button>
      </div>
    </div>
  );
};

export default GeneralSettings;

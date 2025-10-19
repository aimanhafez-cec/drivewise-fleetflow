import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, Wallet, CheckCircle } from 'lucide-react';

const PaymentSettings = () => {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      enabled: true,
      provider: 'Stripe',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building2,
      enabled: true,
      provider: 'Manual',
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: Wallet,
      enabled: true,
      provider: 'Manual',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Configure available payment methods for instant bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <Card key={method.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{method.name}</h4>
                          {method.enabled && (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Provider: {method.provider}</p>
                      </div>
                    </div>
                    <Switch checked={method.enabled} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Configuration</CardTitle>
          <CardDescription>Configure Stripe payment gateway settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
            <Input
              id="stripe-key"
              type="text"
              placeholder="pk_test_..."
              defaultValue="pk_test_XXXXXXXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
            <Input
              id="stripe-secret"
              type="password"
              placeholder="sk_test_..."
              defaultValue="••••••••••••••••"
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="font-medium">Test Mode</p>
              <p className="text-sm text-muted-foreground">
                Enable to use Stripe test environment
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Down Payment Settings</CardTitle>
          <CardDescription>Configure down payment requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="person-percentage">Individual Customers (%)</Label>
              <Input id="person-percentage" type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-percentage">Corporate Customers (%)</Label>
              <Input id="company-percentage" type="number" defaultValue="25" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-payment">Minimum Down Payment (AED)</Label>
            <Input id="min-payment" type="number" defaultValue="500" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="font-medium">Flexible Down Payment</p>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay more than minimum
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Policy</CardTitle>
          <CardDescription>Configure automatic refund settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automatic Refunds</p>
              <p className="text-sm text-muted-foreground">
                Process refunds automatically on cancellation
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-window">Refund Window (hours before pickup)</Label>
            <Input id="refund-window" type="number" defaultValue="24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancellation-fee">Cancellation Fee (%)</Label>
            <Input id="cancellation-fee" type="number" defaultValue="10" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          Save Payment Settings
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettings;

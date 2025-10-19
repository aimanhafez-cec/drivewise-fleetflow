import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import AutoApprovalRules from '@/components/instant-booking/settings/AutoApprovalRules';
import LocationSettings from '@/components/instant-booking/settings/LocationSettings';
import PaymentSettings from '@/components/instant-booking/settings/PaymentSettings';
import GeneralSettings from '@/components/instant-booking/settings/GeneralSettings';

const InstantBookingSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/instant-booking')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Instant Booking Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure auto-approval rules, locations, and payment settings
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rules">Auto-Approval Rules</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
            <TabsTrigger value="general">General Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <AutoApprovalRules />
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <LocationSettings />
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <PaymentSettings />
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <GeneralSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstantBookingSettings;

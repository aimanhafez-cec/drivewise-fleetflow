import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Globe, Languages, Calendar, MessageCircle } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { useToast } from '@/hooks/use-toast';

interface LeadCustomerInfoProps {
  lead: Lead;
}

const languageLabels: Record<string, string> = {
  en: 'English',
  ar: 'Arabic',
  ru: 'Russian',
  fr: 'French',
  zh: 'Chinese',
};

export const LeadCustomerInfo = ({ lead }: LeadCustomerInfoProps) => {
  const { toast } = useToast();

  const handleEmailClick = () => {
    if (lead.customer_email) {
      window.location.href = `mailto:${lead.customer_email}`;
      toast({
        title: 'Opening email client',
        description: `Composing email to ${lead.customer_email}`,
      });
    }
  };

  const handlePhoneClick = () => {
    if (lead.customer_phone) {
      window.location.href = `tel:${lead.customer_phone}`;
      toast({
        title: 'Initiating call',
        description: `Calling ${lead.customer_phone}`,
      });
    }
  };

  const handleWhatsAppClick = () => {
    if (lead.customer_phone) {
      const phoneNumber = lead.customer_phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
      toast({
        title: 'Opening WhatsApp',
        description: `Starting conversation with ${lead.customer_name}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Name & Quick Actions */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-xl font-bold">{lead.customer_name}</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
              Individual
            </Badge>
          </div>

          {/* Quick Contact Actions */}
          <div className="flex flex-wrap gap-2">
            {lead.customer_email && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailClick}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            )}
            {lead.customer_phone && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePhoneClick}
                  className="gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
                {lead.customer_phone.includes('+971') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsAppClick}
                    className="gap-2 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lead.customer_email && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email Address
              </p>
              <p className="text-sm font-mono break-all">{lead.customer_email}</p>
            </div>
          )}
          
          {lead.customer_phone && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone Number
              </p>
              <p className="text-sm font-mono">{lead.customer_phone}</p>
            </div>
          )}
          
          {lead.customer_nationality && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Nationality
              </p>
              <p className="text-sm">{lead.customer_nationality}</p>
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Languages className="h-4 w-4" />
              Language Preference
            </p>
            <Badge variant="secondary">{languageLabels[lead.language_preference] || lead.language_preference}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Globe, Languages, Calendar } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';

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
  const previousBookings = Math.floor(Math.random() * 5); // Mock previous bookings

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
            <p className="text-lg font-semibold">{lead.customer_name}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Customer Type</p>
            <Badge variant="outline">Individual</Badge>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </p>
            <p className="text-sm">{lead.customer_email}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Phone
            </p>
            <p className="text-sm font-mono">{lead.customer_phone}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Nationality
            </p>
            <p className="text-sm">{lead.customer_nationality}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Languages className="h-4 w-4" />
              Language Preference
            </p>
            <p className="text-sm">{languageLabels[lead.language_preference]}</p>
          </div>
          
          {previousBookings > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Previous Bookings
              </p>
              <Badge variant="secondary">{previousBookings} completed rentals</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

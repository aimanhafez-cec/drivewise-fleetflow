import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, CheckCircle2 } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';

interface LeadVehicleCardProps {
  lead: Lead;
}

export const LeadVehicleCard = ({ lead }: LeadVehicleCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Vehicle Choice */}
        <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Primary Choice
              </p>
              <p className="text-lg font-bold">{lead.vehicle_category}</p>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Preferred
            </Badge>
          </div>
        </div>

        {/* Alternative Categories */}
        {lead.alternative_categories && lead.alternative_categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Alternative Options
            </p>
            <div className="flex flex-wrap gap-2">
              {lead.alternative_categories.map((category, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline"
                  className="bg-muted hover:bg-muted"
                >
                  {category}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Customer is open to these alternatives if preferred vehicle is unavailable
            </p>
          </div>
        )}

        {/* Vehicle Type Info */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Category Type</p>
            <Badge variant="secondary">Standard</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Availability</p>
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              In Stock
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

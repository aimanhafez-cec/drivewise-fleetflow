import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Percent, Hash, Star, FileText } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { leadSources } from '@/data/leadSources';

interface LeadSourceDataProps {
  lead: Lead;
}

export const LeadSourceData = ({ lead }: LeadSourceDataProps) => {
  const source = leadSources[lead.source_name];
  
  if (!source) return null;

  // Mock source-specific data based on source type
  const getSourceSpecificData = () => {
    if (source.type === 'aggregator') {
      return {
        title: 'Aggregator Details',
        items: [
          { icon: Percent, label: 'Commission Rate', value: '15%' },
          { icon: Hash, label: 'Booking Reference', value: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
          { icon: Star, label: 'Customer Rating', value: '4.8/5.0' },
          { icon: FileText, label: 'Partner Notes', value: 'Premium partner - priority handling' },
        ]
      };
    }

    if (source.type === 'broker') {
      return {
        title: 'Broker Details',
        items: [
          { icon: FileText, label: 'Broker Account', value: source.name },
          { icon: Percent, label: 'Credit Terms', value: 'Net 30 days' },
          { icon: Hash, label: 'Contract Reference', value: `CTR-${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
          { icon: FileText, label: 'Voucher Number', value: lead.status === 'confirmed' ? `VCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : 'N/A' },
        ]
      };
    }

    if (source.type === 'tourism') {
      return {
        title: 'Tourism Partner Details',
        items: [
          { icon: FileText, label: 'Partner Program', value: source.name },
          { icon: Percent, label: 'Discount Applied', value: '10% Tourism Discount' },
          { icon: Hash, label: 'Partner Code', value: `TP-${source.id.substring(0, 4).toUpperCase()}` },
          { icon: FileText, label: 'Special Terms', value: 'Tourist package - flexible cancellation' },
        ]
      };
    }

    return null;
  };

  const sourceData = getSourceSpecificData();

  if (!sourceData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          {sourceData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sourceData.items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

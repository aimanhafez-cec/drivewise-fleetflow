import { Badge } from '@/components/ui/badge';
import { leadSources } from '@/data/leadSources';

interface LeadSourceBadgeProps {
  sourceId: string;
  showIcon?: boolean;
}

export const LeadSourceBadge = ({ sourceId, showIcon = true }: LeadSourceBadgeProps) => {
  const source = leadSources[sourceId];
  
  if (!source) {
    return <Badge variant="outline">Unknown Source</Badge>;
  }

  return (
    <Badge 
      className={`${source.bgColor} ${source.textColor} border-0 font-medium whitespace-nowrap`}
    >
      {showIcon && <span className="mr-1.5">{source.icon}</span>}
      {source.name}
    </Badge>
  );
};

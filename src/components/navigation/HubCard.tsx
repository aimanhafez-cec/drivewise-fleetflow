import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface HubCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  gradient?: string;
}

const HubCard: React.FC<HubCardProps> = ({ title, description, icon: Icon, onClick, gradient }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group border-2 hover:border-primary/50"
    >
      <CardHeader className="space-y-4">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient || 'from-primary/10 to-primary/5'} group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300`}>
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-2 text-sm">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default HubCard;

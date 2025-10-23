import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface InspectionSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function InspectionSection({
  title,
  children,
  icon,
  collapsible = false,
  defaultOpen = true,
}: InspectionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                {icon}
                {title}
              </span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

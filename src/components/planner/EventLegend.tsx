import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  CreditCard,
  Wrench 
} from "lucide-react";

export const EventLegend: React.FC = () => {
  const legendItems = [
    {
      category: "Reservations",
      items: [
        { label: "Open", icon: Circle, color: "bg-green-500", variant: "default" as const },
        { label: "Online", icon: Circle, color: "bg-yellow-500", variant: "secondary" as const },
        { label: "Walk-in", icon: Circle, color: "bg-gray-500", variant: "outline" as const },
      ]
    },
    {
      category: "Agreements", 
      items: [
        { label: "Open", icon: Circle, color: "bg-blue-500", variant: "default" as const },
        { label: "Overdue", icon: AlertTriangle, color: "bg-red-500", variant: "destructive" as const },
        { label: "Closed", icon: CheckCircle, color: "bg-gray-600", variant: "secondary" as const },
        { label: "Pending Payment", icon: DollarSign, color: "bg-purple-500", variant: "default" as const },
        { label: "Pending Deposit", icon: CreditCard, color: "bg-orange-500", variant: "default" as const },
      ]
    },
    {
      category: "Maintenance",
      items: [
        { label: "Hold/Service", icon: Wrench, color: "bg-yellow-600", variant: "outline" as const },
      ]
    }
  ];

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex flex-wrap gap-6">
        {legendItems.map((category) => (
          <div key={category.category} className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {category.category}:
            </span>
            <div className="flex gap-2">
              {category.items.map((item) => {
                const colorMap: Record<string, string> = {
                  'bg-green-500': '#10b981',
                  'bg-yellow-500': '#eab308', 
                  'bg-gray-500': '#6b7280',
                  'bg-blue-500': '#3b82f6',
                  'bg-red-500': '#ef4444',
                  'bg-gray-600': '#4b5563',
                  'bg-purple-500': '#a855f7',
                  'bg-orange-500': '#f97316',
                  'bg-yellow-600': '#ca8a04'
                };
                
                return (
                  <Badge 
                    key={item.label} 
                    variant="outline" 
                    className="text-xs text-white border-white/20 hover:bg-white/20"
                    style={{ backgroundColor: colorMap[item.color] || '#6b7280' }}
                  >
                    <item.icon className="mr-1 h-3 w-3" />
                    {item.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
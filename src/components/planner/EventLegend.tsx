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
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex flex-wrap gap-6">
        {legendItems.map((category) => (
          <div key={category.category} className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {category.category}:
            </span>
            <div className="flex gap-2">
              {category.items.map((item) => (
                <Badge 
                  key={item.label} 
                  variant="outline" 
                  className={`text-xs ${item.color} text-white border-transparent`}
                >
                  <item.icon className="mr-1 h-3 w-3" />
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Car,
  CalendarClock,
  Users
} from "lucide-react";

interface PlannerEvent {
  id: string;
  kind: "RESERVATION" | "AGREEMENT" | "HOLD" | "MAINTENANCE";
  status: string;
  start: string;
  end: string;
}

interface PlannerKPIsProps {
  events: PlannerEvent[];
}

export const PlannerKPIs: React.FC<PlannerKPIsProps> = ({ events }) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Calculate KPIs
  const todayEvents = events.filter(e => e.start.startsWith(todayStr));
  const utilization = Math.round((todayEvents.length / Math.max(events.length, 1)) * 100);
  
  const dueOut = events.filter(e => 
    e.start.startsWith(todayStr) && 
    (e.kind === "RESERVATION" || e.kind === "AGREEMENT")
  ).length;
  
  const dueIn = events.filter(e => 
    e.end.startsWith(todayStr) && 
    e.kind === "AGREEMENT"
  ).length;
  
  const overdue = events.filter(e => 
    new Date(e.end) < today && 
    e.status === "open"
  ).length;
  
  const idle = events.filter(e => 
    e.kind === "RESERVATION" && 
    e.status === "open"
  ).length;

  const kpis = [
    {
      id: "utilization",
      title: "Utilization Today",
      value: `${utilization}%`,
      subtitle: `${todayEvents.length} active`,
      icon: TrendingUp,
      variant: utilization > 80 ? "success" : utilization > 60 ? "warning" : "default",
      testId: "kpi-utilization"
    },
    {
      id: "dueout",
      title: "Due Out",
      value: dueOut,
      subtitle: "today",
      icon: CalendarClock,
      variant: dueOut > 0 ? "info" : "default",
      testId: "kpi-dueout"
    },
    {
      id: "duein", 
      title: "Due In",
      value: dueIn,
      subtitle: "today",
      icon: Clock,
      variant: dueIn > 0 ? "info" : "default",
      testId: "kpi-duein"
    },
    {
      id: "overdue",
      title: "Overdue",
      value: overdue,
      subtitle: "returns",
      icon: AlertTriangle,
      variant: overdue > 0 ? "destructive" : "default",
      testId: "kpi-overdue"
    },
    {
      id: "idle",
      title: "Idle Vehicles",
      value: idle,
      subtitle: "available",
      icon: Car,
      variant: "default",
      testId: "kpi-idle"
    }
  ];

  const getVariantColor = (variant: string) => {
    switch (variant) {
      case "success": return "text-available-foreground bg-available/10 border-available/20";
      case "warning": return "text-maintenance-foreground bg-maintenance/10 border-maintenance/20";
      case "info": return "text-primary-foreground bg-primary/10 border-primary/20";
      case "destructive": return "text-destructive-foreground bg-destructive/10 border-destructive/20";
      default: return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card 
          key={kpi.id}
          className={`cursor-pointer transition-colors hover:bg-muted/50 ${getVariantColor(kpi.variant)}`}
          data-testid={kpi.testId}
        >
          <CardContent className="p-4 bg-background">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {kpi.value}
                </div>
                <div className="text-sm font-medium">
                  {kpi.title}
                </div>
                <div className="text-xs opacity-75">
                  {kpi.subtitle}
                </div>
              </div>
              <kpi.icon className="h-8 w-8 opacity-75" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
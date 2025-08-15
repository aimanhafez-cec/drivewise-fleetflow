import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { Clock, User, MapPin } from "lucide-react";

interface PlannerEvent {
  id: string;
  kind: "RESERVATION" | "AGREEMENT" | "HOLD" | "MAINTENANCE";
  status: string;
  vehicleId?: string;
  vehicleLabel?: string;
  start: string;
  end: string;
  customer?: string;
  origin?: string;
  destination?: string;
  shortNo?: string;
  actions: string[];
}

interface CalendarViewProps {
  events: PlannerEvent[];
  dateRange: { start: Date; end: Date };
  view: "month" | "week" | "day";
  currentDate: Date;
  isLoading: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  dateRange,
  view,
  currentDate,
  isLoading
}) => {
  const getEventColor = (event: PlannerEvent) => {
    if (event.kind === "RESERVATION") {
      switch (event.status.toLowerCase()) {
        case "open": return "bg-green-100 border-green-300 text-green-800";
        case "online": return "bg-yellow-100 border-yellow-300 text-yellow-800";
        case "walk-in": return "bg-gray-100 border-gray-300 text-gray-800";
        default: return "bg-blue-100 border-blue-300 text-blue-800";
      }
    } else if (event.kind === "AGREEMENT") {
      switch (event.status.toLowerCase()) {
        case "open": return "bg-blue-100 border-blue-300 text-blue-800";
        case "overdue": return "bg-red-100 border-red-300 text-red-800";
        case "closed": return "bg-gray-100 border-gray-300 text-gray-800";
        case "pending_payment": return "bg-purple-100 border-purple-300 text-purple-800";
        case "pending_deposit": return "bg-orange-100 border-orange-300 text-orange-800";
        default: return "bg-blue-100 border-blue-300 text-blue-800";
      }
    } else {
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    }
  };

  const formatEventTime = (start: string, end: string) => {
    return `${format(new Date(start), "HH:mm")} - ${format(new Date(end), "HH:mm")}`;
  };

  const renderEventPill = (event: PlannerEvent) => (
    <div
      key={event.id}
      className={`p-2 mb-1 rounded border text-xs cursor-pointer transition-all hover:shadow-sm ${getEventColor(event)}`}
      data-testid={`evt-${event.kind.toLowerCase()}-${event.id}`}
    >
      <div className="font-medium">
        #{event.shortNo} • {event.customer}
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
        <Clock className="h-3 w-3" />
        {formatEventTime(event.start, event.end)}
      </div>
      {event.origin && event.destination && (
        <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
          <MapPin className="h-3 w-3" />
          {event.origin} → {event.destination}
        </div>
      )}
      <div className="mt-1">
        <Badge variant="outline" className="text-xs">
          {event.kind}
        </Badge>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: view === "day" ? 1 : view === "week" ? 7 : 35 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (view === "day") {
    const dayEvents = events.filter(e => isSameDay(new Date(e.start), currentDate));
    
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="min-h-[400px] bg-muted/20 rounded-lg p-4">
          {dayEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No events scheduled for this day
            </div>
          ) : (
            <div className="space-y-2">
              {dayEvents.map(renderEventPill)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "week") {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(currentDate),
      end: endOfWeek(currentDate)
    });

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
          
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {format(day, "EEE")}
                </div>
                <div className="text-lg font-bold">
                  {format(day, "d")}
                </div>
              </div>
              <div className="min-h-[200px] bg-muted/20 rounded-lg p-2">
                {dayEvents.map(renderEventPill)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Month view would be more complex - for now, show a simple grid
  return (
    <div className="grid grid-cols-7 gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
        <div key={day} className="p-2 text-center font-medium bg-muted/50 rounded">
          {day}
        </div>
      ))}
      {Array.from({ length: 35 }).map((_, i) => {
        const date = new Date(dateRange.start);
        date.setDate(date.getDate() + i);
        const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
        
        return (
          <div key={i} className="min-h-[100px] p-1 border rounded bg-background">
            <div className="text-sm font-medium mb-1">
              {format(date, "d")}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate ${getEventColor(event)}`}
                >
                  {event.shortNo}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
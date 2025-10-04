import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { Clock, User, MapPin, Plus } from "lucide-react";
import { EventContextMenu } from "./EventContextMenu";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

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
  onEventAction: (action: string, eventId: string) => void;
  onCreateEvent: (date: Date) => void;
  onEventMove: (eventId: string, newStart: Date, newEnd: Date) => Promise<void>;
  onConflictDetected: (conflicts: any) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  dateRange,
  view,
  currentDate,
  isLoading,
  onEventAction,
  onCreateEvent,
  onEventMove,
  onConflictDetected
}) => {
  const { handleDragStart, handleDragOver, handleDrop, handleDragEnd, isDragging } = useDragAndDrop({
    onEventMove,
    onConflictDetected
  });
  
  const getEventColor = (event: PlannerEvent) => {
    if (event.kind === "RESERVATION") {
      switch (event.status.toLowerCase()) {
        case "open": return "bg-green-500 text-white border-transparent";
        case "online": return "bg-yellow-500 text-white border-transparent";
        case "walk-in": return "bg-gray-500 text-white border-transparent";
        default: return "bg-green-500 text-white border-transparent";
      }
    } else if (event.kind === "AGREEMENT") {
      switch (event.status.toLowerCase()) {
        case "open": return "bg-blue-500 text-white border-transparent";
        case "overdue": return "bg-red-500 text-white border-transparent";
        case "closed": return "bg-gray-600 text-white border-transparent";
        case "pending_payment": case "pending payment": return "bg-purple-500 text-white border-transparent";
        case "pending_deposit": case "pending deposit": return "bg-orange-500 text-white border-transparent";
        default: return "bg-blue-500 text-white border-transparent";
      }
    } else if (event.kind === "MAINTENANCE" || event.kind === "HOLD") {
      return "bg-yellow-600 text-white border-transparent";
    } else {
      return "bg-gray-500 text-white border-transparent";
    }
  };

  const formatEventTime = (start: string, end: string) => {
    return `${format(new Date(start), "HH:mm")} - ${format(new Date(end), "HH:mm")}`;
  };

  const renderEventPill = (event: PlannerEvent, isCompact = false) => (
    <EventContextMenu 
      key={event.id}
      event={event} 
      onAction={onEventAction}
    >
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, {
          eventId: event.id,
          originalStart: event.start,
          originalEnd: event.end,
          originalVehicleId: event.vehicleId
        })}
        onDragEnd={handleDragEnd}
        className={`p-1 sm:p-2 mb-1 rounded border text-xs cursor-move transition-all hover:shadow-sm ${getEventColor(event)} ${isDragging ? 'opacity-50' : ''} ${isCompact ? 'min-h-[32px]' : ''}`}
        data-testid={`evt-${event.kind.toLowerCase()}-${event.id}`}
      >
        <div className="font-medium truncate text-xs sm:text-sm">
          #{event.shortNo} • {isCompact ? event.customer?.split(' ')[0] : event.customer}
        </div>
        {!isCompact && (
          <>
            <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatEventTime(event.start, event.end)}</span>
            </div>
            {event.origin && event.destination && (
              <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{event.origin} → {event.destination}</span>
              </div>
            )}
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {event.kind}
              </Badge>
            </div>
          </>
        )}
      </div>
    </EventContextMenu>
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
      <div className="space-y-4 max-w-full overflow-hidden">
        <div className="text-lg font-semibold">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div 
          className="min-h-[400px] bg-muted/20 rounded-lg p-2 sm:p-4 relative"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, {
            newStart: currentDate,
            newEnd: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
          })}
        >
          {dayEvents.length === 0 ? (
            <div 
              className="flex items-center justify-center h-full text-foreground cursor-pointer hover:bg-muted/30 rounded"
              onClick={() => onCreateEvent(currentDate)}
            >
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>No events scheduled</div>
                <div className="text-sm">Click to create reservation</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {dayEvents.map(event => renderEventPill(event, false))}
              <div 
                className="p-2 border-2 border-dashed border-muted-foreground/30 rounded cursor-pointer hover:border-muted-foreground/50 text-center text-muted-foreground text-sm"
                onClick={() => onCreateEvent(currentDate)}
              >
                <Plus className="h-4 w-4 mx-auto mb-1" />
                Add Event
              </div>
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
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-4 min-w-full">
          {weekDays.map(day => {
            const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
            
            return (
              <div key={day.toISOString()} className="space-y-2 min-w-0">
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, "d")}
                  </div>
                </div>
                <div 
                  className="min-h-[150px] sm:min-h-[200px] bg-muted/20 rounded-lg p-1 sm:p-2"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, {
                    newStart: day,
                    newEnd: new Date(day.getTime() + 24 * 60 * 60 * 1000)
                  })}
                >
                  {dayEvents.length === 0 ? (
                    <div 
                      className="h-full flex items-center justify-center cursor-pointer hover:bg-muted/30 rounded text-foreground"
                      onClick={() => onCreateEvent(day)}
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  ) : (
                    <>
                      {dayEvents.map(event => renderEventPill(event, true))}
                      <div 
                        className="mt-2 p-1 border border-dashed border-muted-foreground/30 rounded cursor-pointer hover:border-muted-foreground/50 text-center text-foreground text-xs"
                        onClick={() => onCreateEvent(day)}
                      >
                        <Plus className="h-3 w-3 mx-auto" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Responsive Month view
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-1 sm:p-2 text-center font-medium bg-muted/50 rounded text-xs sm:text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 35 }).map((_, i) => {
            const date = new Date(dateRange.start);
            date.setDate(date.getDate() + i);
            const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));
            
            return (
              <div 
                key={i} 
                className="min-h-[60px] sm:min-h-[100px] p-1 border rounded bg-muted/50 cursor-pointer hover:bg-muted"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, {
                  newStart: date,
                  newEnd: new Date(date.getTime() + 24 * 60 * 60 * 1000)
                })}
                onClick={() => onCreateEvent(date)}
              >
                <div className="text-xs sm:text-sm font-medium mb-1">
                  {format(date, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <EventContextMenu key={event.id} event={event} onAction={onEventAction}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, {
                          eventId: event.id,
                          originalStart: event.start,
                          originalEnd: event.end,
                          originalVehicleId: event.vehicleId
                        })}
                        onDragEnd={handleDragEnd}
                        className={`text-xs p-1 rounded truncate cursor-move ${getEventColor(event)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {event.shortNo}
                      </div>
                    </EventContextMenu>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-foreground">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                  {dayEvents.length === 0 && (
                    <div className="flex items-center justify-center h-8 sm:h-16 text-foreground">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, eachHourOfInterval, startOfDay, endOfDay } from "date-fns";
import { Car, Plus } from "lucide-react";
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
  shortNo?: string;
  actions: string[];
}

interface ResourceViewProps {
  events: PlannerEvent[];
  dateRange: { start: Date; end: Date };
  view: "week" | "day";
  isLoading: boolean;
  onEventAction: (action: string, eventId: string) => void;
  onCreateEvent: (date: Date, vehicleId?: string) => void;
  onEventMove: (eventId: string, newStart: Date, newEnd: Date, newVehicleId?: string) => Promise<void>;
  onConflictDetected: (conflicts: any) => void;
}

export const ResourceView: React.FC<ResourceViewProps> = ({
  events,
  dateRange,
  view,
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
  // Mock vehicles for demo - in real app, this would come from API
  const vehicles = [
    { id: "veh_1", label: "Toyota Camry • ABC123", status: "available" },
    { id: "veh_2", label: "Honda Accord • DEF456", status: "rented" },
    { id: "veh_3", label: "Ford F-150 • GHI789", status: "maintenance" },
    { id: "veh_4", label: "BMW 320i • JKL012", status: "available" },
    { id: "veh_5", label: "Mercedes C-Class • MNO345", status: "available" }
  ];

  const getEventColor = (event: PlannerEvent) => {
    if (event.kind === "RESERVATION") {
      switch (event.status.toLowerCase()) {
        case "open": return "bg-green-500";
        case "online": return "bg-yellow-500";
        default: return "bg-blue-500";
      }
    } else if (event.kind === "AGREEMENT") {
      switch (event.status.toLowerCase()) {
        case "open": return "bg-blue-600";
        case "overdue": return "bg-red-500";
        default: return "bg-gray-500";
      }
    } else {
      return "bg-yellow-600";
    }
  };

  const getEventPosition = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayStart = startOfDay(dateRange.start);
    const dayEnd = endOfDay(dateRange.start);
    
    const totalMinutes = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60);
    const startMinutes = (startDate.getTime() - dayStart.getTime()) / (1000 * 60);
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    
    const left = Math.max(0, (startMinutes / totalMinutes) * 100);
    const width = Math.min(100 - left, (duration / totalMinutes) * 100);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  const timeSlots = view === "day" 
    ? eachHourOfInterval({ start: startOfDay(dateRange.start), end: endOfDay(dateRange.start) })
    : [];

  return (
    <div className="space-y-4">
      {/* Time header for day view */}
      {view === "day" && (
        <div className="flex">
          <div className="w-40 flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-24 border-l">
            {timeSlots.map((hour, i) => (
              <div key={i} className="text-xs text-center py-2 border-r bg-muted/50 text-foreground">
                {format(hour, "HH:mm")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle rows */}
      <div className="space-y-2">
        {vehicles.map(vehicle => {
          const vehicleEvents = events.filter(e => e.vehicleId === vehicle.id);
          
          return (
            <div key={vehicle.id} className="flex items-center">
              {/* Vehicle info */}
              <div className="w-40 flex-shrink-0 p-3 border rounded-l bg-muted/50">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium truncate">
                      {vehicle.label}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 relative h-16 border rounded-r bg-background">
                {view === "day" && (
                  <div className="absolute inset-0 grid grid-cols-24">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border-r border-muted/30"></div>
                    ))}
                  </div>
                )}

                {/* Events */}
                {vehicleEvents.map(event => {
                  const position = getEventPosition(event.start, event.end);
                  
                  return (
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
                        className={`absolute top-1 bottom-1 rounded px-2 py-1 text-white text-xs font-medium cursor-move transition-all hover:shadow-lg ${getEventColor(event)} ${isDragging ? 'opacity-50' : ''}`}
                        style={position}
                        data-testid={`evt-${event.kind.toLowerCase()}-${event.id}`}
                        title={`${event.shortNo} • ${event.customer} • ${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}`}
                      >
                        <div className="truncate">
                          #{event.shortNo} • {event.customer}
                        </div>
                        <div className="text-xs opacity-75">
                          {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                        </div>
                      </div>
                    </EventContextMenu>
                  );
                })}

                {/* Drop zone for vehicle assignment */}
                <div
                  className="absolute inset-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, {
                    newStart: dateRange.start,
                    newEnd: dateRange.end,
                    vehicleId: vehicle.id
                  })}
                  onClick={() => onCreateEvent(dateRange.start, vehicle.id)}
                >
                  {vehicleEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground text-sm cursor-pointer hover:bg-muted/20 rounded">
                      <div className="text-center">
                        <Plus className="h-4 w-4 mx-auto mb-1" />
                        <div>Click to assign</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
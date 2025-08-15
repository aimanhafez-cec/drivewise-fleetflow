import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Car, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ConflictEvent {
  id: string;
  kind: "RESERVATION" | "AGREEMENT" | "HOLD" | "MAINTENANCE";
  status: string;
  customer?: string;
  shortNo?: string;
  start: string;
  end: string;
  vehicleLabel?: string;
}

interface VehicleSuggestion {
  vehicleId: string;
  vehicleLabel: string;
  available: boolean;
}

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictDetails: {
    cause: string;
    overlappingEvents: ConflictEvent[];
    suggestions: VehicleSuggestion[];
  } | null;
  onKeep: () => void;
  onUndo: () => void;
  onSuggestionSelect: (vehicleId: string) => void;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  open,
  onOpenChange,
  conflictDetails,
  onKeep,
  onUndo,
  onSuggestionSelect
}) => {
  if (!conflictDetails) return null;

  const getEventColor = (event: ConflictEvent) => {
    if (event.kind === "RESERVATION") {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (event.kind === "AGREEMENT") {
      return "bg-blue-100 text-blue-800 border-blue-300";
    } else {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Schedule Conflict Detected
          </DialogTitle>
          <DialogDescription>
            {conflictDetails.cause}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overlapping Events */}
          {conflictDetails.overlappingEvents.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Conflicting Events
              </h4>
              <div className="space-y-2">
                {conflictDetails.overlappingEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded border ${getEventColor(event)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          #{event.shortNo} • {event.customer}
                        </div>
                        <div className="text-sm opacity-75">
                          {format(new Date(event.start), "MMM d, HH:mm")} - 
                          {format(new Date(event.end), "HH:mm")}
                        </div>
                        {event.vehicleLabel && (
                          <div className="text-sm opacity-75 flex items-center gap-1 mt-1">
                            <Car className="h-3 w-3" />
                            {event.vehicleLabel}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">
                        {event.kind}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Vehicle Suggestions */}
          {conflictDetails.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Available Vehicle Alternatives
              </h4>
              <div className="grid gap-2">
                {conflictDetails.suggestions.map(suggestion => (
                  <Button
                    key={suggestion.vehicleId}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => onSuggestionSelect(suggestion.vehicleId)}
                    disabled={!suggestion.available}
                  >
                    <div className="flex items-center gap-3">
                      <Car className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{suggestion.vehicleLabel}</div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.available ? "Available for this period" : "Not available"}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onUndo}>
            Undo Changes
          </Button>
          <Button variant="destructive" onClick={onKeep}>
            Keep Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
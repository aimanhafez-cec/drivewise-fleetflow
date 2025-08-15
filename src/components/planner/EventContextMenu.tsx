import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Eye, 
  RefreshCw, 
  LogOut, 
  LogIn, 
  Car, 
  X 
} from "lucide-react";

interface PlannerEvent {
  id: string;
  kind: "RESERVATION" | "AGREEMENT" | "HOLD" | "MAINTENANCE";
  status: string;
  actions: string[];
}

interface EventContextMenuProps {
  event: PlannerEvent;
  children: React.ReactNode;
  onAction: (action: string, eventId: string) => void;
}

export const EventContextMenu: React.FC<EventContextMenuProps> = ({
  event,
  children,
  onAction
}) => {
  const getMenuItems = () => {
    const items = [];

    // Open action - always available
    items.push(
      <ContextMenuItem 
        key="open"
        data-testid="menu-open"
        onClick={() => onAction("OPEN", event.id)}
      >
        <Eye className="mr-2 h-4 w-4" />
        Open Details
      </ContextMenuItem>
    );

    // Convert to Agreement - only for reservations
    if (event.kind === "RESERVATION" && event.actions.includes("CONVERT")) {
      items.push(
        <ContextMenuItem 
          key="convert"
          data-testid="menu-convert"
          onClick={() => onAction("CONVERT", event.id)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Convert to Agreement
        </ContextMenuItem>
      );
    }

    // Check-out/Check-in for agreements
    if (event.kind === "AGREEMENT") {
      if (event.actions.includes("CHECK_OUT")) {
        items.push(
          <ContextMenuItem 
            key="checkout"
            data-testid="menu-checkout"
            onClick={() => onAction("CHECK_OUT", event.id)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Check Out
          </ContextMenuItem>
        );
      }
      
      if (event.actions.includes("CHECK_IN")) {
        items.push(
          <ContextMenuItem 
            key="checkin"
            data-testid="menu-checkin"
            onClick={() => onAction("CHECK_IN", event.id)}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Check In
          </ContextMenuItem>
        );
      }
    }

    // Assign vehicle - for unassigned items
    if (event.actions.includes("ASSIGN")) {
      items.push(
        <ContextMenuItem 
          key="assign"
          data-testid="menu-assign"
          onClick={() => onAction("ASSIGN", event.id)}
        >
          <Car className="mr-2 h-4 w-4" />
          Assign Vehicle
        </ContextMenuItem>
      );
    }

    // Separator before destructive actions
    if (event.actions.includes("CANCEL") && items.length > 0) {
      items.push(<ContextMenuSeparator key="separator" />);
    }

    // Cancel action
    if (event.actions.includes("CANCEL")) {
      items.push(
        <ContextMenuItem 
          key="cancel"
          data-testid="menu-cancel"
          onClick={() => onAction("CANCEL", event.id)}
          className="text-destructive focus:text-destructive"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel {event.kind === "RESERVATION" ? "Reservation" : "Agreement"}
        </ContextMenuItem>
      );
    }

    return items;
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {getMenuItems()}
      </ContextMenuContent>
    </ContextMenu>
  );
};
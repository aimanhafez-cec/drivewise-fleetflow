import { useState, useCallback } from "react";

interface DragData {
  eventId: string;
  originalStart: string;
  originalEnd: string;
  originalVehicleId?: string;
}

interface DropResult {
  newStart: Date;
  newEnd: Date;
  newVehicleId?: string;
}

interface UseDragAndDropProps {
  onEventMove: (eventId: string, newStart: Date, newEnd: Date, newVehicleId?: string) => Promise<void>;
  onConflictDetected: (conflicts: any) => void;
}

export const useDragAndDrop = ({ onEventMove, onConflictDetected }: UseDragAndDropProps) => {
  const [draggedEvent, setDraggedEvent] = useState<DragData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((event: React.DragEvent, eventData: DragData) => {
    setDraggedEvent(eventData);
    setIsDragging(true);
    
    // Set drag data
    event.dataTransfer.setData("text/plain", JSON.stringify(eventData));
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(async (
    event: React.DragEvent, 
    dropTarget: { 
      newStart: Date; 
      newEnd: Date; 
      vehicleId?: string; 
    }
  ) => {
    event.preventDefault();
    
    if (!draggedEvent) return;

    try {
      await onEventMove(
        draggedEvent.eventId,
        dropTarget.newStart,
        dropTarget.newEnd,
        dropTarget.vehicleId
      );
    } catch (error: any) {
      // Handle conflict
      if (error.status === 409) {
        onConflictDetected(error.data);
      } else {
        console.error("Error moving event:", error);
      }
    } finally {
      setDraggedEvent(null);
      setIsDragging(false);
    }
  }, [draggedEvent, onEventMove, onConflictDetected]);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
    setIsDragging(false);
  }, []);

  return {
    draggedEvent,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVehicleActivityTimeline } from '@/hooks/useVehicleStatus';
import { VehicleWithStatus } from '@/lib/api/vehicle-status';
import { format, parseISO } from 'date-fns';
import { 
  RefreshCw, 
  Wrench, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface VehicleHistoryDialogProps {
  vehicle: VehicleWithStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const activityIcons = {
  status_change: TrendingUp,
  movement: RefreshCw,
  work_order: Wrench,
  agreement: FileText,
  inspection: CheckCircle,
};

const activityColors = {
  status_change: 'text-blue-600',
  movement: 'text-purple-600',
  work_order: 'text-orange-600',
  agreement: 'text-green-600',
  inspection: 'text-indigo-600',
};

const VehicleHistoryDialog: React.FC<VehicleHistoryDialogProps> = ({
  vehicle,
  open,
  onOpenChange,
}) => {
  const { data: timeline, isLoading } = useVehicleActivityTimeline(vehicle.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Vehicle History - {vehicle.license_plate}
          </DialogTitle>
          <DialogDescription>
            {vehicle.make} {vehicle.model} {vehicle.year} • Complete activity timeline
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading history...
            </div>
          ) : !timeline || timeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity history found
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Clock;
                const colorClass = activityColors[activity.type] || 'text-gray-600';

                return (
                  <div key={`${activity.type}-${activity.id}-${index}`} className="relative pl-8 pb-4">
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-border" />
                    )}

                    {/* Activity icon */}
                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>

                    {/* Activity content */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.description}
                          </div>
                        </div>
                        {activity.status && (
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {format(parseISO(activity.date), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {activity.reference_no && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{activity.reference_no}</span>
                          </>
                        )}
                      </div>

                      {/* Additional metadata */}
                      {activity.metadata && activity.type === 'status_change' && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <div className="font-medium">Reason:</div>
                          <div>{activity.metadata.reason_code}</div>
                          {activity.metadata.reason_description && (
                            <div className="mt-1 text-muted-foreground">
                              {activity.metadata.reason_description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleHistoryDialog;

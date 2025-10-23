import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ScheduleIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleIntegrationModal({
  isOpen,
  onClose,
}: ScheduleIntegrationModalProps) {
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("00:00");

  const handleSchedule = () => {
    toast.success(`Integration scheduled to run ${frequency} at ${time}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Schedule Integration
          </DialogTitle>
          <DialogDescription>
            Configure automatic toll transaction data synchronization from Salik and Darb systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-600" />
              Frequency
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              Time
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Integration will run at this time (GST timezone)
            </p>
          </div>

          <div className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-900">
            <p className="font-medium mb-1">Preview:</p>
            <p>
              Toll transactions will be synced{" "}
              <span className="font-semibold">{frequency}</span> at{" "}
              <span className="font-semibold">{time}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

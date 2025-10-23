import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TollFilterPanelProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClose: () => void;
}

export function TollFilterPanel({ filters, onFilterChange, onClose }: TollFilterPanelProps) {
  const updateFilter = (key: string, value: any) => {
    if (!value) {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFilterChange(newFilters);
    } else {
      onFilterChange({ ...filters, [key]: value });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="p-4 mb-4 border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-cyan-900">Advanced Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.payment_status || ""}
            onValueChange={(value) => updateFilter("payment_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="charged">Charged</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="exempt">Exempt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Emirate</Label>
          <Select
            value={filters.emirate || ""}
            onValueChange={(value) => updateFilter("emirate", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All emirates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All emirates</SelectItem>
              <SelectItem value="Dubai">Dubai</SelectItem>
              <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Authority</Label>
          <Select
            value={filters.toll_authority || ""}
            onValueChange={(value) => updateFilter("toll_authority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All authorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All authorities</SelectItem>
              <SelectItem value="Salik">Salik</SelectItem>
              <SelectItem value="Darb">Darb</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Plate Number</Label>
          <Input
            placeholder="Search plate..."
            value={filters.plate_number || ""}
            onChange={(e) => updateFilter("plate_number", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => updateFilter("date_from", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.date_to || ""}
            onChange={(e) => updateFilter("date_to", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
    </Card>
  );
}

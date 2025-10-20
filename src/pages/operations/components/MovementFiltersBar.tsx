import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MovementFilters, MovementType, ApprovalStatus } from "@/lib/api/fleet-operations";

interface MovementFiltersBarProps {
  filters: MovementFilters;
  onFiltersChange: (filters: MovementFilters) => void;
}

export function MovementFiltersBar({ filters, onFiltersChange }: MovementFiltersBarProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleTypeChange = (type: string) => {
    if (type === "all") {
      const { movement_type, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, movement_type: [type as MovementType] });
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === "all") {
      const { status: _, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: [status as ApprovalStatus] });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by movement ID or reason..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Select
        value={filters.movement_type?.[0] || "all"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Movement Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="ownership_transfer">Ownership Transfer</SelectItem>
          <SelectItem value="inter_branch">Inter-Branch</SelectItem>
          <SelectItem value="department_reallocation">Dept. Reallocation</SelectItem>
          <SelectItem value="third_party">Third Party</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status?.[0] || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {Object.keys(filters).length > 0 && (
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import type { CustodyFilters as CustodyFiltersType } from "@/lib/api/custody";

interface CustodyFiltersProps {
  onFilterChange: (filters: CustodyFiltersType) => void;
}

export function CustodyFilters({ onFilterChange }: CustodyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<CustodyFiltersType>({});

  const handleFilterUpdate = (key: keyof CustodyFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleClear = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof CustodyFiltersType] !== undefined
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Primary Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by custody no, vehicle, customer, or agreement..."
                value={filters.search || ""}
                onChange={(e) => handleFilterUpdate("search", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? "Hide" : "Show"} Filters
            </Button>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status?.[0] || "all"}
                  onValueChange={(value) =>
                    handleFilterUpdate("status", value === "all" ? undefined : [value as any])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="voided">Voided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reason Code */}
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select
                  value={filters.reasonCode?.[0] || "all"}
                  onValueChange={(value) =>
                    handleFilterUpdate("reasonCode", value === "all" ? undefined : [value as any])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="recall">Recall</SelectItem>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custodian Type */}
              <div className="space-y-2">
                <Label>Custodian Type</Label>
                <Select
                  value={filters.custodianType || "all"}
                  onValueChange={(value) =>
                    handleFilterUpdate("custodianType", value === "all" ? undefined : value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="bodyshop">Body Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input
                  placeholder="Branch location"
                  value={filters.branchId || ""}
                  onChange={(e) => handleFilterUpdate("branchId", e.target.value || undefined)}
                />
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleFilterUpdate("dateFrom", e.target.value || undefined)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterUpdate("dateTo", e.target.value || undefined)}
                />
              </div>

              {/* SLA Breached */}
              <div className="space-y-2">
                <Label>SLA Breached</Label>
                <Select
                  value={filters.slaBreached ? "yes" : "no"}
                  onValueChange={(value) =>
                    handleFilterUpdate("slaBreached", value === "yes")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

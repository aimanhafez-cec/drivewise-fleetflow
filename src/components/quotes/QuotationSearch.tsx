import React, { useState } from "react";
import { Card } from "@/components/ui/card";
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

interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  validFrom?: string;
  validTo?: string;
  amountMin?: string;
  amountMax?: string;
  customer?: string;
  rfq?: string;
  vehicle?: string;
}

interface QuotationSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export const QuotationSearch: React.FC<QuotationSearchProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onSearch({});
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Primary Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by quote number or customer name..."
              value={filters.query || ""}
              onChange={(e) => updateFilter("query", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {Object.keys(filters).length > 0 && (
            <Button variant="ghost" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Created Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Created From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>

            {/* Created Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Created To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>

            {/* Valid Until From */}
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={filters.validFrom || ""}
                onChange={(e) => updateFilter("validFrom", e.target.value)}
              />
            </div>

            {/* Valid Until To */}
            <div className="space-y-2">
              <Label htmlFor="validTo">Valid To</Label>
              <Input
                id="validTo"
                type="date"
                value={filters.validTo || ""}
                onChange={(e) => updateFilter("validTo", e.target.value)}
              />
            </div>

            {/* Amount Min */}
            <div className="space-y-2">
              <Label htmlFor="amountMin">Min Amount (AED)</Label>
              <Input
                id="amountMin"
                type="number"
                placeholder="0.00"
                value={filters.amountMin || ""}
                onChange={(e) => updateFilter("amountMin", e.target.value)}
              />
            </div>

            {/* Amount Max */}
            <div className="space-y-2">
              <Label htmlFor="amountMax">Max Amount (AED)</Label>
              <Input
                id="amountMax"
                type="number"
                placeholder="0.00"
                value={filters.amountMax || ""}
                onChange={(e) => updateFilter("amountMax", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

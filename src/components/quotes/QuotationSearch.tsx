import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  quoteNumber?: string;
  customerName?: string;
  quoteType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  validFrom?: string;
  validTo?: string;
  amountMin?: string;
  amountMax?: string;
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

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.quoteNumber) count++;
    if (filters.customerName) count++;
    if (filters.quoteType) count++;
    if (filters.status) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.validFrom) count++;
    if (filters.validTo) count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Primary Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Quick search by customer name or quote number..."
              value={filters.query || ""}
              onChange={(e) => updateFilter("query", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${showFilters ? "bg-muted" : ""}`}
          >
            <Filter className="h-4 w-4" />
            Advanced Search
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {(filters.query || activeFilterCount > 0) && (
            <Button variant="ghost" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-6 pt-4 border-t">
            {/* Search Criteria Group */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Search Criteria</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="quoteNumber">Quote Number</Label>
                  <Input
                    id="quoteNumber"
                    placeholder="Enter quote number"
                    value={filters.quoteNumber || ""}
                    onChange={(e) => updateFilter("quoteNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={filters.customerName || ""}
                    onChange={(e) => updateFilter("customerName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteType">Quote Type</Label>
                  <Select
                    value={filters.quoteType || "all"}
                    onValueChange={(value) => updateFilter("quoteType", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger id="quoteType">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="corporate-leasing">Corporate Leasing</SelectItem>
                      <SelectItem value="car-subscription">Car Subscription</SelectItem>
                      <SelectItem value="rfq">RFQ</SelectItem>
                      <SelectItem value="master-agreement">Master Agreement</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status and Dates Group */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Status & Creation Date</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Created From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Created To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Validity Period Group */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Validity Period</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={filters.validFrom || ""}
                    onChange={(e) => updateFilter("validFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={filters.validTo || ""}
                    onChange={(e) => updateFilter("validTo", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Amount Range Group */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Amount Range</h4>
              <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';

interface SearchFilters {
  quickSearch: string;
  agreementNo: string;
  customerName: string;
  status: string;
  legalEntity: string;
  billToSite: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface MasterAgreementSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export const MasterAgreementSearch: React.FC<MasterAgreementSearchProps> = ({
  onSearch,
  onReset,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    quickSearch: '',
    agreementNo: '',
    customerName: '',
    status: '',
    legalEntity: '',
    billToSite: '',
    dateFrom: undefined,
    dateTo: undefined,
  });

  const handleQuickSearch = (value: string) => {
    setFilters(prev => ({ ...prev, quickSearch: value }));
    onSearch({ ...filters, quickSearch: value });
  };

  const handleAdvancedSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      quickSearch: '',
      agreementNo: '',
      customerName: '',
      status: '',
      legalEntity: '',
      billToSite: '',
      dateFrom: undefined,
      dateTo: undefined,
    };
    setFilters(resetFilters);
    onReset();
    setIsAdvancedOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by agreement number, customer name, or PO number..."
            value={filters.quickSearch}
            onChange={(e) => handleQuickSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Search
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Advanced Search */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Agreement Number</Label>
                  <Input
                    placeholder="CLA-000001"
                    value={filters.agreementNo}
                    onChange={(e) => setFilters(prev => ({ ...prev, agreementNo: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    placeholder="Customer name..."
                    value={filters.customerName}
                    onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Legal Entity</Label>
                  <Input
                    placeholder="Legal entity..."
                    value={filters.legalEntity}
                    onChange={(e) => setFilters(prev => ({ ...prev, legalEntity: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bill To Site</Label>
                  <Input
                    placeholder="Bill to site..."
                    value={filters.billToSite}
                    onChange={(e) => setFilters(prev => ({ ...prev, billToSite: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date From</Label>
                  <DatePicker
                    value={filters.dateFrom}
                    onChange={(date) => setFilters(prev => ({ ...prev, dateFrom: date || undefined }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <DatePicker
                    value={filters.dateTo}
                    onChange={(date) => setFilters(prev => ({ ...prev, dateTo: date || undefined }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleAdvancedSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  onApply?: () => void;
  searchPlaceholder?: string;
  defaultOpen?: boolean;
}

export function FilterPanel({
  fields,
  filters,
  onFilterChange,
  onReset,
  onApply,
  searchPlaceholder = "Search...",
  defaultOpen = false,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '' && value !== null
  ).length;

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Select
              value={filters[field.key] || ''}
              onValueChange={(value) => onFilterChange(field.key, value)}
            >
              <SelectTrigger id={field.key} className="bg-background">
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="">All</SelectItem>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'date':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type="date"
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="bg-background"
            />
          </div>
        );

      case 'daterange':
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="From"
                value={filters[`${field.key}_from`] || ''}
                onChange={(e) => onFilterChange(`${field.key}_from`, e.target.value)}
                className="bg-background"
              />
              <Input
                type="date"
                placeholder="To"
                value={filters[`${field.key}_to`] || ''}
                onChange={(e) => onFilterChange(`${field.key}_to`, e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type="text"
              placeholder={field.placeholder || field.label}
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="bg-background"
            />
          </div>
        );
    }
  };

  return (
    <div className="border-b bg-muted/50">
      <div className="px-4 py-3">
        {/* Search Bar - Always Visible */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9 pr-9 bg-background"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsible Advanced Filters */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </CollapsibleTrigger>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <CollapsibleContent className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {fields.map(renderField)}
            </div>

            {onApply && (
              <div className="mt-4 flex justify-end">
                <Button onClick={onApply} size="sm">
                  Apply Filters
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

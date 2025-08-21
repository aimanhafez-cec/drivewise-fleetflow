import React, { forwardRef, useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
interface LOVItem {
  id: string;
  label: string;
  [key: string]: any;
}
interface LOVSelectProps {
  value?: string | string[];
  onChange: (value: string | string[] | undefined) => void;
  items: LOVItem[];
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  error?: boolean;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  allowClear?: boolean;
  className?: string;
  'data-testid'?: string;
}
export const LOVSelect = forwardRef<HTMLButtonElement, LOVSelectProps>(({
  value,
  onChange,
  items,
  isLoading = false,
  placeholder = "Select...",
  disabled = false,
  multiple = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  error = false,
  onSearch,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  allowClear = true,
  className,
  'data-testid': testId,
  ...props
}, ref) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search with debounce
  useEffect(() => {
    if (onSearch) {
      const timeout = setTimeout(() => {
        onSearch(searchQuery);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, onSearch]);

  // Get selected items for display
  const selectedItems = multiple ? items.filter(item => Array.isArray(value) && value.includes(item.id)) : value ? items.find(item => item.id === value) ? [items.find(item => item.id === value)!] : [] : [];
  const handleSelect = (selectedId: string) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(selectedId) ? currentValue.filter(id => id !== selectedId) : [...currentValue, selectedId];
      onChange(newValue.length > 0 ? newValue : undefined);
    } else {
      onChange(value === selectedId ? undefined : selectedId);
      setOpen(false);
    }
  };
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };
  const handleRemoveItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter(id => id !== itemId);
      onChange(newValue.length > 0 ? newValue : undefined);
    } else {
      onChange(undefined);
    }
  };

  // Display value for trigger
  const displayValue = () => {
    if (selectedItems.length === 0) {
      return <span className="text-slate-50">{placeholder}</span>;
    }
    if (multiple) {
      if (selectedItems.length === 1) {
        return selectedItems[0].label;
      }
      return `${selectedItems.length} selected`;
    }
    return selectedItems[0].label;
  };
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={ref} variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", error && "border-destructive", className)} disabled={disabled} data-testid={testId} {...props}>
          <div className="flex-1 text-left truncate bg-transparent">
            {displayValue()}
          </div>
          <div className="flex items-center gap-1">
            {allowClear && value !== undefined && value !== null && <X className="h-4 w-4 opacity-50 hover:opacity-100" onClick={handleClear} />}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          {onSearch && <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput placeholder={searchPlaceholder} value={searchQuery} onValueChange={setSearchQuery} className="border-0 focus:ring-0" />
            </div>}
          <CommandList>
            <ScrollArea className="max-h-64">
              {isLoading ? <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div> : <CommandGroup>
                  {items.length === 0 ? <CommandEmpty>{emptyMessage}</CommandEmpty> : items.map(item => <CommandItem key={item.id} value={item.id} onSelect={() => handleSelect(item.id)} className="flex items-center gap-2">
                        <Check className={cn("h-4 w-4", (multiple ? Array.isArray(value) && value.includes(item.id) : value === item.id) ? "opacity-100" : "opacity-0")} />
                        <span className="flex-1 truncate">{item.label}</span>
                      </CommandItem>)}
                  {hasMore && <div className="border-t">
                      <Button variant="ghost" size="sm" className="w-full justify-center" onClick={onLoadMore} disabled={isLoadingMore}>
                        {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Load more
                      </Button>
                    </div>}
                </CommandGroup>}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
      
      {/* Show selected items as badges for multiple selection */}
      {multiple && selectedItems.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
          {selectedItems.map(item => <Badge key={item.id} variant="secondary" className="text-xs">
              {item.label}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={e => handleRemoveItem(item.id, e)} />
            </Badge>)}
        </div>}
    </Popover>;
});
LOVSelect.displayName = "LOVSelect";
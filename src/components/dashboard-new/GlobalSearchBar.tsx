import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Car, Users, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  id: string;
  type: 'vehicle' | 'customer' | 'agreement';
  title: string;
  subtitle: string;
  url: string;
}

export function GlobalSearchBar() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search across vehicles, customers, and agreements
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      const searchResults: SearchResult[] = [];

      try {
        // Search vehicles
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('id, make, model, year')
          .limit(5);

        // Filter on client side since OR query has issues
        const filteredVehicles = vehicles?.filter(v => 
          v.make?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          v.model?.toLowerCase().includes(debouncedSearch.toLowerCase())
        ) || [];

        filteredVehicles.forEach(v => {
          searchResults.push({
            id: v.id,
            type: 'vehicle',
            title: `${v.make || 'Unknown'} ${v.model || ''}`,
            subtitle: v.year ? `Year: ${v.year}` : 'Vehicle',
            url: `/vehicles/${v.id}`
          });
        });

        // Search customers
        const { data: customers } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
          .limit(5);

        customers?.forEach(c => {
          searchResults.push({
            id: c.id,
            type: 'customer',
            title: c.full_name || 'Unknown',
            subtitle: c.email || 'No email',
            url: `/customers/${c.id}`
          });
        });

        // Search agreements
        const { data: agreements } = await supabase
          .from('agreements')
          .select('id, agreement_no')
          .ilike('agreement_no', `%${debouncedSearch}%`)
          .limit(5);

        agreements?.forEach(a => {
          searchResults.push({
            id: a.id,
            type: 'agreement',
            title: a.agreement_no || 'Unknown',
            subtitle: 'Agreement',
            url: `/agreements/${a.id}`
          });
        });

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
    setSearchQuery('');
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'vehicle':
        return <Car className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'agreement':
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="text-muted-foreground">Search vehicles, customers...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isSearching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {!isSearching && results.length === 0 && searchQuery.length >= 2 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

            {!isSearching && results.length > 0 && (
              <>
                {['vehicle', 'customer', 'agreement'].map((type) => {
                  const typeResults = results.filter(r => r.type === type);
                  if (typeResults.length === 0) return null;

                  return (
                    <CommandGroup
                      key={type}
                      heading={type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                    >
                      {typeResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result.url)}
                          className="cursor-pointer"
                        >
                          {getIcon(result.type)}
                          <div className="ml-2">
                            <p className="font-medium">{result.title}</p>
                            <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

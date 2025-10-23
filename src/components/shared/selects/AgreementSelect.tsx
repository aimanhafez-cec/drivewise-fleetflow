import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AgreementOption {
  id: string;
  agreement_no: string;
  customer_id: string;
  status: string;
}

interface AgreementSelectProps {
  value: string | null;
  onChange: (agreementId: string, agreementNo: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function AgreementSelect({ value, onChange, disabled, required }: AgreementSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ['agreements', search],
    queryFn: async () => {
      let query = supabase
        .from('corporate_leasing_agreements')
        .select('id, agreement_no, customer_id, status')
        .eq('status', 'customer_accepted')
        .order('agreement_no', { ascending: false })
        .range(0, 24);

      if (search) {
        query = query.ilike('agreement_no', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AgreementOption[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Hydrate by ID when editing
  const { data: selectedAgreement } = useQuery({
    queryKey: ['agreement', value],
    queryFn: async () => {
      if (!value) return null;
      const { data, error } = await supabase
        .from('corporate_leasing_agreements')
        .select('id, agreement_no')
        .eq('id', value)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!value,
  });

  const displayValue = selectedAgreement
    ? `${selectedAgreement.agreement_no}`
    : 'Select agreement...';

  return (
    <div className="space-y-2">
      <Label>
        Agreement {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search by agreement no..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading...' : 'No agreements found.'}
              </CommandEmpty>
              <CommandGroup>
                {agreements.map((agreement) => (
                  <CommandItem
                    key={agreement.id}
                    value={agreement.id}
                    onSelect={() => {
                      onChange(agreement.id, agreement.agreement_no);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === agreement.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="font-medium">{agreement.agreement_no}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

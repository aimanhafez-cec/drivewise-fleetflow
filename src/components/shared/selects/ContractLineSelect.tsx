import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVehicleLines } from '@/hooks/useCorporateVinAssignment';

interface ContractLineSelectProps {
  agreementId: string | null;
  value: number | null;
  inspectionType: string;
  onChange: (line: any) => void;
  disabled?: boolean;
  required?: boolean;
}

export function ContractLineSelect({
  agreementId,
  value,
  inspectionType,
  onChange,
  disabled,
  required,
}: ContractLineSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const status = 'all'; // Show all lines regardless of assignment status

  const { data: linesData, isLoading } = useVehicleLines({
    agreementId: agreementId || undefined,
    search: search || undefined,
    status,
    page: 1,
    pageSize: 25,
  });

  const lines = linesData?.lines || [];
  const selectedLine = lines.find((l) => l.lineNo === value);

  const displayValue = selectedLine
    ? `Line ${selectedLine.lineNo} - ${selectedLine.itemCode} - ${selectedLine.itemDescription}`
    : 'Select contract line...';

  return (
    <div className="space-y-2">
      <Label>
        Contract Line {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || !agreementId}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0">
          <Command>
            <CommandInput
              placeholder="Search by contract no., item code..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading...' : 'No contract lines found.'}
              </CommandEmpty>
              <CommandGroup>
                {lines.map((line) => (
                  <CommandItem
                    key={`${line.agreementId}-${line.lineNo}`}
                    value={String(line.lineNo)}
                    onSelect={() => {
                      onChange(line);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === line.lineNo ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Line {line.lineNo} - {line.contractNo}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {line.itemCode} - {line.itemDescription}
                      </span>
                    </div>
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

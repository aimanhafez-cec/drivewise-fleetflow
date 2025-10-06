import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseManualDateInput, formatDateForDisplay } from "@/lib/utils/dateUtils";

interface DatePickerProps {
  value?: Date | string | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  id?: string;
  required?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  error,
  disabled = false,
  minDate,
  maxDate,
  id,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  // Convert value to Date if it's a string
  const dateValue = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;
    try {
      return new Date(value);
    } catch {
      return null;
    }
  }, [value]);

  // Update input value when date changes
  React.useEffect(() => {
    if (dateValue) {
      setInputValue(format(dateValue, "MM/dd/yyyy"));
    } else {
      setInputValue("");
    }
  }, [dateValue]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setOpen(false); // Auto-close on selection
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Try to parse the input
    const parsed = parseManualDateInput(newValue);
    if (parsed) {
      onChange(parsed);
    }
  };

  const handleInputBlur = () => {
    // If input is invalid, revert to current value
    if (inputValue && !parseManualDateInput(inputValue)) {
      if (dateValue) {
        setInputValue(format(dateValue, "MM/dd/yyyy"));
      } else {
        setInputValue("");
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal h-10 pr-20",
                !dateValue && "text-muted-foreground",
                error && "border-destructive"
              )}
              aria-label={label || "Select date"}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? formatDateForDisplay(dateValue) : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[280px] p-0 rounded-lg border-[#e0e0e0] bg-white shadow-lg" 
            align="start"
          >
            <Calendar
              mode="single"
              selected={dateValue || undefined}
              onSelect={handleSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              defaultMonth={dateValue || new Date()}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={2100}
              className="p-2"
            />
          </PopoverContent>
        </Popover>
        
        {/* Manual Input - Positioned absolutely */}
        <div className="absolute right-10 top-0 bottom-0 flex items-center pointer-events-none">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            placeholder="MM/DD/YYYY"
            className="w-28 h-8 text-xs pointer-events-auto border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Manual date input"
          />
        </div>
        
        {/* Clear Button */}
        {dateValue && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
            onClick={handleClear}
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select location',
}) => {
  // Common locations - in production, fetch from database
  const locations = [
    'Main Office',
    'Downtown Branch',
    'Airport Terminal',
    'North Branch',
    'South Branch',
    'East Branch',
    'West Branch',
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location} value={location}>
            {location}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

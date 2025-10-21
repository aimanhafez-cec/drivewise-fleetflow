import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RTA_VIOLATION_CODES,
  getViolationByCode,
  formatAED,
} from '@/lib/constants/uae-compliance';

interface UAEViolationLookupProps {
  onSelectViolation?: (violation: {
    code: string;
    description: string;
    fine_aed: number;
    black_points: number;
  }) => void;
}

export const UAEViolationLookup: React.FC<UAEViolationLookupProps> = ({
  onSelectViolation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredViolations = RTA_VIOLATION_CODES.filter((violation) => {
    const matchesSearch =
      searchTerm === '' ||
      violation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.description_ar.includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'all' || violation.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'speeding', label: 'Speeding' },
    { value: 'traffic_signal', label: 'Traffic Signals' },
    { value: 'parking', label: 'Parking' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'license', label: 'License' },
    { value: 'dangerous_driving', label: 'Dangerous Driving' },
    { value: 'mobile', label: 'Mobile Phone' },
    { value: 'seatbelt', label: 'Seatbelt' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>UAE Violation Code Lookup</CardTitle>
        <CardDescription>
          Search for RTA and traffic violation codes, fines, and black points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, description, or Arabic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredViolations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No violations found matching your search
            </div>
          ) : (
            filteredViolations.map((violation) => (
              <div
                key={violation.code}
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onSelectViolation?.(violation)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{violation.code}</Badge>
                      <Badge variant="secondary">{violation.category}</Badge>
                    </div>
                    <p className="text-sm font-medium">{violation.description}</p>
                    <p className="text-sm text-muted-foreground" dir="rtl">
                      {violation.description_ar}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold text-destructive">
                      {formatAED(violation.fine_aed)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {violation.black_points} Black Points
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredViolations.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredViolations.length} of {RTA_VIOLATION_CODES.length}{' '}
            violations
          </div>
        )}
      </CardContent>
    </Card>
  );
};

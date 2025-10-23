import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle } from 'lucide-react';
import { useTrafficFinesCorporateStatistics } from '@/hooks/useTrafficFinesCorporate';
import type { TrafficFineFilters } from '@/lib/api/trafficFinesCorporate';

interface TrafficFineFilterPanelProps {
  filters: TrafficFineFilters;
  onFiltersChange: (filters: TrafficFineFilters) => void;
}

const EMIRATES = ['DXB', 'AUH', 'SHJ', 'AJM', 'RAK', 'UAQ', 'FUJ'];
const STATUSES = ['unpaid', 'paid', 'disputed', 'cancelled'];
const AUTHORITIES = [
  'Dubai Police',
  'RTA Dubai',
  'Abu Dhabi Police (TAMM)',
  'Sharjah Police (EVG)',
  'Ministry of Interior - Ajman',
  'Ministry of Interior - RAK',
];

export function TrafficFineFilterPanel({ filters, onFiltersChange }: TrafficFineFilterPanelProps) {
  const { data: stats } = useTrafficFinesCorporateStatistics();

  const handleEmirateToggle = (emirate: string) => {
    const current = filters.emirate || [];
    const updated = current.includes(emirate)
      ? current.filter(e => e !== emirate)
      : [...current, emirate];
    onFiltersChange({ ...filters, emirate: updated });
  };

  const handleStatusToggle = (status: string) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated });
  };

  const handleAuthorityToggle = (authority: string) => {
    const current = filters.authority || [];
    const updated = current.includes(authority)
      ? current.filter(a => a !== authority)
      : [...current, authority];
    onFiltersChange({ ...filters, authority: updated });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Status Filter - Priority Section */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Status</Label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(status => {
              const isSelected = filters.status?.includes(status);
              const isUnpaid = status === 'unpaid';
              const statusCount = stats?.by_status.find(s => s.status === status)?.count || 0;
              
              return (
                <Button
                  key={status}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusToggle(status)}
                  className={`capitalize ${
                    isUnpaid && !isSelected 
                      ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' 
                      : ''
                  }`}
                >
                  {isUnpaid && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {status}
                  {statusCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {statusCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Emirate Filter */}
          <div className="space-y-2">
            <Label>Emirate</Label>
            <div className="flex flex-wrap gap-2">
              {EMIRATES.map(emirate => (
                <Button
                  key={emirate}
                  variant={filters.emirate?.includes(emirate) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleEmirateToggle(emirate)}
                >
                  {emirate}
                </Button>
              ))}
            </div>
          </div>

          {/* Authority Filter */}
          <div className="space-y-2">
            <Label>Authority</Label>
            <div className="flex flex-wrap gap-2">
              {AUTHORITIES.map(authority => (
                <Button
                  key={authority}
                  variant={filters.authority?.includes(authority) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAuthorityToggle(authority)}
                >
                  {authority.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
              />
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <Label>Amount Range (AED)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.amount_min || ''}
                onChange={(e) => onFiltersChange({ ...filters, amount_min: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.amount_max || ''}
                onChange={(e) => onFiltersChange({ ...filters, amount_max: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Plate Number Search */}
          <div className="space-y-2">
            <Label>Plate Number</Label>
            <Input
              placeholder="Search plate..."
              value={filters.plate_number || ''}
              onChange={(e) => onFiltersChange({ ...filters, plate_number: e.target.value })}
            />
          </div>

          {/* VIN Search */}
          <div className="space-y-2">
            <Label>VIN</Label>
            <Input
              placeholder="Search VIN..."
              value={filters.vin || ''}
              onChange={(e) => onFiltersChange({ ...filters, vin: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

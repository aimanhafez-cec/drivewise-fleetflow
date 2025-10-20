import { useState, useEffect } from 'react';
import { User, Users, Building } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CustodianType } from '@/lib/api/custody';

interface CustodianSelectorProps {
  custodianType: CustodianType;
  custodianName: string;
  custodianContact: {
    phone?: string;
    email?: string;
    emirates_id?: string;
  };
  onCustodianTypeChange: (type: CustodianType) => void;
  onCustodianNameChange: (name: string) => void;
  onCustodianContactChange: (contact: any) => void;
  disabled?: boolean;
}

export function CustodianSelector({
  custodianType,
  custodianName,
  custodianContact = {},
  onCustodianTypeChange,
  onCustodianNameChange,
  onCustodianContactChange,
  disabled = false,
}: CustodianSelectorProps) {
  const custodianTypes = [
    {
      value: 'customer' as CustodianType,
      label: 'Customer',
      icon: User,
      description: 'The rental customer',
    },
    {
      value: 'driver' as CustodianType,
      label: 'Driver',
      icon: Users,
      description: 'An additional driver',
    },
    {
      value: 'originator' as CustodianType,
      label: 'Originator',
      icon: Building,
      description: 'Internal staff member',
    },
  ];

  const selectedType = custodianTypes.find((t) => t.value === custodianType);
  const Icon = selectedType?.icon || User;

  return (
    <div className="space-y-4">
      {/* Custodian Type */}
      <div className="space-y-2">
        <Label htmlFor="custodian-type">
          Custodian Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={custodianType}
          onValueChange={onCustodianTypeChange}
          disabled={disabled}
        >
          <SelectTrigger id="custodian-type">
            <SelectValue placeholder="Select custodian type" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {custodianTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Custodian Name */}
      <div className="space-y-2">
        <Label htmlFor="custodian-name">
          <Icon className="mr-2 inline h-4 w-4" />
          Custodian Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="custodian-name"
          value={custodianName}
          onChange={(e) => onCustodianNameChange(e.target.value)}
          placeholder={`Enter ${selectedType?.label.toLowerCase()} name`}
          disabled={disabled}
          required
        />
      </div>

      {/* Contact Details */}
      <div className="space-y-3 rounded-md border p-4">
        <h4 className="text-sm font-semibold">Contact Information</h4>

        <div className="space-y-2">
          <Label htmlFor="custodian-phone">Phone Number</Label>
          <Input
            id="custodian-phone"
            type="tel"
            value={custodianContact.phone || ''}
            onChange={(e) =>
              onCustodianContactChange({
                ...custodianContact,
                phone: e.target.value,
              })
            }
            placeholder="+971 50 123 4567"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custodian-email">Email Address</Label>
          <Input
            id="custodian-email"
            type="email"
            value={custodianContact.email || ''}
            onChange={(e) =>
              onCustodianContactChange({
                ...custodianContact,
                email: e.target.value,
              })
            }
            placeholder="email@example.com"
            disabled={disabled}
          />
        </div>

        {custodianType !== 'originator' && (
          <div className="space-y-2">
            <Label htmlFor="custodian-emirates-id">Emirates ID</Label>
            <Input
              id="custodian-emirates-id"
              value={custodianContact.emirates_id || ''}
              onChange={(e) =>
                onCustodianContactChange({
                  ...custodianContact,
                  emirates_id: e.target.value,
                })
              }
              placeholder="784-XXXX-XXXXXXX-X"
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}

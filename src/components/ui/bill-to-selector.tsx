import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { RequiredLabel } from '@/components/ui/required-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CustomerSelect, PaymentTermsSelect } from '@/components/ui/select-components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { ChevronDown, Building2, Shield, Plane, Building, Truck, Calendar, FileText, User, Users, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
export type BillToType = 'CUSTOMER' | 'CORPORATE' | 'INSURANCE' | 'AGENCY' | 'GOV' | 'FLEET' | 'EVENT' | 'LEASE' | 'THIRD_PARTY' | 'PARTNER';
export interface BillToMeta {
  po_ref?: string;
  claim_no?: string;
  policy_no?: string;
  voucher_ref?: string;
  tender_ref?: string;
  project_code?: string;
  lease_no?: string;
  relation?: string;
  commission_pct?: number;
  tax_reg?: string;
  notes_ar?: string;
  attachments?: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  adjuster_name?: string;
  adjuster_phone?: string;
  adjuster_email?: string;
  employee_ref?: string;
  auth_ref?: string;
  iata_code?: string;
}
export interface BillToData {
  bill_to_type: BillToType;
  bill_to_id: string | null;
  bill_to_display: string;
  payment_terms_id: string;
  billing_address_id?: string | null;
  bill_to_meta?: BillToMeta;
}
interface BillToSelectorProps {
  value: BillToData;
  onChange: (data: BillToData) => void;
  errors?: Record<string, string>;
  currentCustomerId?: string;
  currentCustomerName?: string;
}
interface SnapshotCardProps {
  title: string;
  subtitle?: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  onEdit?: () => void;
}
const SnapshotCard: React.FC<SnapshotCardProps> = ({
  title,
  subtitle,
  details,
  onEdit
}) => <Card className="mt-4 border-muted">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div>
            <h4 className="font-medium">{title}</h4>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {details.map((detail, index) => <div key={index}>
                <span className="text-muted-foreground">{detail.label}:</span>
                <span className="ml-1">{detail.value}</span>
              </div>)}
          </div>
        </div>
        {onEdit && <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>}
      </div>
    </CardContent>
  </Card>;
export const BillToSelector: React.FC<BillToSelectorProps> = ({
  value,
  onChange,
  errors = {},
  currentCustomerId,
  currentCustomerName
}) => {
  const [openPanels, setOpenPanels] = useState<BillToType[]>(['CUSTOMER']);
  const handleTypeChange = (newType: BillToType) => {
    setOpenPanels([newType]);
    onChange({
      ...value,
      bill_to_type: newType,
      bill_to_id: newType === 'CUSTOMER' ? currentCustomerId || null : null,
      bill_to_display: newType === 'CUSTOMER' ? currentCustomerName || '' : '',
      bill_to_meta: {}
    });
  };
  const updateMeta = (key: keyof BillToMeta, metaValue: any) => {
    onChange({
      ...value,
      bill_to_meta: {
        ...value.bill_to_meta,
        [key]: metaValue
      }
    });
  };
  const handleSelectChange = (id: string | string[]) => {
    const selectedId = Array.isArray(id) ? id[0] || '' : id;
    onChange({
      ...value,
      bill_to_id: selectedId
    });
  };
  const handlePaymentTermsChange = (id: string | string[]) => {
    const selectedId = Array.isArray(id) ? id[0] || '' : id;
    onChange({
      ...value,
      payment_terms_id: selectedId
    });
  };
  const renderPanel = (type: BillToType) => {
    const isOpen = openPanels.includes(type);
    if (!isOpen) return null;
    switch (type) {
      case 'CUSTOMER':
        return <div className="space-y-4">
            {currentCustomerName && <SnapshotCard title={currentCustomerName} subtitle="Primary Customer" details={[{
            label: "Type",
            value: "Individual Customer"
          }, {
            label: "Status",
            value: "Active"
          }]} />}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
              <div className="space-y-2">
                <Label>Billing Address Override</Label>
                <Input placeholder="Optional billing address override" />
              </div>
            </div>
          </div>;
      case 'CORPORATE':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Corporate Account</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search corporate accounts" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <Label>Employee / Reference</Label>
                <Input value={value.bill_to_meta?.employee_ref || ''} onChange={e => updateMeta('employee_ref', e.target.value)} placeholder="Employee name or reference" />
              </div>
              <div className="space-y-2">
                <RequiredLabel>PO / RO Number</RequiredLabel>
                <Input value={value.bill_to_meta?.po_ref || ''} onChange={e => updateMeta('po_ref', e.target.value)} placeholder="Purchase order number" />
                <FormError message={errors['po_ref']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'INSURANCE':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Insurance Company</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search insurance companies" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Policy No.</RequiredLabel>
                <Input value={value.bill_to_meta?.policy_no || ''} onChange={e => updateMeta('policy_no', e.target.value)} placeholder="Policy number" />
                <FormError message={errors['policy_no']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Claim No.</RequiredLabel>
                <Input value={value.bill_to_meta?.claim_no || ''} onChange={e => updateMeta('claim_no', e.target.value)} placeholder="Claim number" />
                <FormError message={errors['claim_no']} />
              </div>
              <div className="space-y-2">
                <Label>Adjuster Name</Label>
                <Input value={value.bill_to_meta?.adjuster_name || ''} onChange={e => updateMeta('adjuster_name', e.target.value)} placeholder="Adjuster name" />
              </div>
              <div className="space-y-2">
                <Label>Adjuster Phone</Label>
                <Input value={value.bill_to_meta?.adjuster_phone || ''} onChange={e => updateMeta('adjuster_phone', e.target.value)} placeholder="Adjuster phone" />
              </div>
              <div className="space-y-2">
                <Label>Adjuster Email</Label>
                <Input type="email" value={value.bill_to_meta?.adjuster_email || ''} onChange={e => updateMeta('adjuster_email', e.target.value)} placeholder="adjuster@insurance.com" />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'AGENCY':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Travel Agency</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search travel agencies" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Voucher / Booking Ref</RequiredLabel>
                <Input value={value.bill_to_meta?.voucher_ref || ''} onChange={e => updateMeta('voucher_ref', e.target.value)} placeholder="Booking reference" />
                <FormError message={errors['voucher_ref']} />
              </div>
              <div className="space-y-2">
                <Label>IATA/ARC Code</Label>
                <Input value={value.bill_to_meta?.iata_code || ''} onChange={e => updateMeta('iata_code', e.target.value)} placeholder="IATA code" />
              </div>
              <div className="space-y-2">
                <Label>Commission %</Label>
                <Input type="number" value={value.bill_to_meta?.commission_pct || ''} onChange={e => updateMeta('commission_pct', parseFloat(e.target.value) || 0)} placeholder="0" min="0" max="100" step="0.1" />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'GOV':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Government Department</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search government departments" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>GRN / Tender / Contract Ref</RequiredLabel>
                <Input value={value.bill_to_meta?.tender_ref || ''} onChange={e => updateMeta('tender_ref', e.target.value)} placeholder="Government reference number" />
                <FormError message={errors['tender_ref']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'FLEET':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Fleet Management Company</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search fleet companies" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Authorization Reference</RequiredLabel>
                <Input value={value.bill_to_meta?.auth_ref || ''} onChange={e => updateMeta('auth_ref', e.target.value)} placeholder="Authorization reference" />
                <FormError message={errors['auth_ref']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'EVENT':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Event/Production Company</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search event companies" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Project / Event Code</RequiredLabel>
                <Input value={value.bill_to_meta?.project_code || ''} onChange={e => updateMeta('project_code', e.target.value)} placeholder="Project code" />
                <FormError message={errors['project_code']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'LEASE':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Lease Holder</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search lease holders" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Lease Agreement No.</RequiredLabel>
                <Input value={value.bill_to_meta?.lease_no || ''} onChange={e => updateMeta('lease_no', e.target.value)} placeholder="Lease agreement number" />
                <FormError message={errors['lease_no']} />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'THIRD_PARTY':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Payer (Person)</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search contacts" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <Label>Relation to Customer</Label>
                <Input value={value.bill_to_meta?.relation || ''} onChange={e => updateMeta('relation', e.target.value)} placeholder="Relationship" />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      case 'PARTNER':
        return <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel>Partner Organization</RequiredLabel>
                <CustomerSelect value={value.bill_to_id || ''} onChange={handleSelectChange} placeholder="Search partner organizations" />
                <FormError message={errors['bill_to_id']} />
              </div>
              <div className="space-y-2">
                <Label>Reference / Channel Code</Label>
                <Input value={value.bill_to_meta?.po_ref || ''} onChange={e => updateMeta('po_ref', e.target.value)} placeholder="Channel code" />
              </div>
              <div className="space-y-2">
                <RequiredLabel>Payment Terms</RequiredLabel>
                <PaymentTermsSelect value={value.payment_terms_id} onChange={handlePaymentTermsChange} placeholder="Select payment terms" />
                <FormError message={errors['payment_terms_id']} />
              </div>
            </div>
          </div>;
      default:
        return null;
    }
  };
  const billToOptions = [{
    value: 'CUSTOMER',
    label: 'Same as Customer',
    icon: User,
    id: 'billto-customer'
  }, {
    value: 'CORPORATE',
    label: 'Corporate Account / Employer',
    icon: Building2,
    id: 'billto-corporate'
  }, {
    value: 'INSURANCE',
    label: 'Insurance Company',
    icon: Shield,
    id: 'billto-insurance'
  }, {
    value: 'AGENCY',
    label: 'Travel Agency / Tour Operator',
    icon: Plane,
    id: 'billto-agency'
  }, {
    value: 'GOV',
    label: 'Government Department / Public Sector',
    icon: Building,
    id: 'billto-government'
  }, {
    value: 'FLEET',
    label: 'Fleet Management Company',
    icon: Truck,
    id: 'billto-fleet'
  }, {
    value: 'EVENT',
    label: 'Event Organizer / Production Company',
    icon: Calendar,
    id: 'billto-event'
  }, {
    value: 'LEASE',
    label: 'Long-Term Lease Agreement Holder',
    icon: FileText,
    id: 'billto-leaseholder'
  }, {
    value: 'THIRD_PARTY',
    label: 'Third-Party Individual (not the driver)',
    icon: User,
    id: 'billto-thirdparty'
  }, {
    value: 'PARTNER',
    label: 'Partner Organization / Franchise',
    icon: Users,
    id: 'billto-partner'
  }] as const;
  return <div className="space-y-6">
      <div className="space-y-2">
        <RequiredLabel>Bill To</RequiredLabel>
        <RadioGroup id="billto-group" value={value.bill_to_type} onValueChange={handleTypeChange} className="space-y-3">
          {billToOptions.map(option => {
          const Icon = option.icon;
          const isSelected = value.bill_to_type === option.value;
          return <div key={option.value} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.id} className={cn(isSelected && "border-primary text-primary")} />
                  <Label htmlFor={option.id} className={cn("flex items-center gap-2 cursor-pointer font-medium", isSelected && "text-primary")}>
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Label>
                </div>
                
                <Collapsible open={isSelected}>
                  
                </Collapsible>
              </div>;
        })}
        </RadioGroup>
      </div>
    </div>;
};
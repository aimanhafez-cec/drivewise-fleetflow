import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LOVSelect } from '@/components/ui/lov-select';
import { RequiredLabel } from '@/components/ui/required-label';
import { 
  useLegalEntities, 
  useCustomerSites,
  CUSTOMER_SEGMENTS,
  CREDIT_TERMS,
  COST_ALLOCATION_MODES
} from '@/hooks/useCorporateLeasingLOVs';
import { useCustomers } from '@/hooks/useBusinessLOVs';

interface CorporateLeasingStep1Props {
  form: UseFormReturn<any>;
}

export const CorporateLeasingStep1: React.FC<CorporateLeasingStep1Props> = ({ form }) => {
  const selectedCustomerId = form.watch('customer_id');
  
  const { items: legalEntities, isLoading: loadingEntities } = useLegalEntities();
  const { items: customers, isLoading: loadingCustomers } = useCustomers();
  const { items: customerSites, isLoading: loadingSites } = useCustomerSites(selectedCustomerId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="legal_entity_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Legal Entity</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={legalEntities}
                  isLoading={loadingEntities}
                  placeholder="Select legal entity..."
                  error={!!form.formState.errors.legal_entity_id}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Customer (Account)</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    // Clear bill_to_site when customer changes
                    form.setValue('bill_to_site_id', undefined);
                  }}
                  items={customers}
                  isLoading={loadingCustomers}
                  placeholder="Select customer..."
                  error={!!form.formState.errors.customer_id}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_segment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Segment</FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={CUSTOMER_SEGMENTS}
                  placeholder="Select segment..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bill_to_site_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Bill-to Site</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={customerSites}
                  isLoading={loadingSites}
                  placeholder={selectedCustomerId ? "Select bill-to site..." : "Select customer first"}
                  disabled={!selectedCustomerId}
                  error={!!form.formState.errors.bill_to_site_id}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_po_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer PO / BPA No.</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter PO or BPA number..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credit_terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Credit Terms</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={CREDIT_TERMS}
                  placeholder="Select credit terms..."
                  error={!!form.formState.errors.credit_terms}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credit_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Limit (AED)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  placeholder="Enter credit limit..." 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost_allocation_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabel>Cost Allocation Mode</RequiredLabel>
              </FormLabel>
              <FormControl>
                <LOVSelect
                  value={field.value}
                  onChange={field.onChange}
                  items={COST_ALLOCATION_MODES}
                  placeholder="Select allocation mode..."
                  error={!!form.formState.errors.cost_allocation_mode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="approver_customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Approver Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter approver name..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="approver_customer_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Approver Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="Enter approver email..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
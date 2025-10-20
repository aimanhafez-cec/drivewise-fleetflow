import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExpense, useSubmitExpense } from "@/hooks/useExpenses";
import { CreateExpenseData, ExpenseCategory } from "@/lib/api/expenses";
import { VehicleSelect } from "@/components/shared/VehicleSelect";

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateExpenseData & { submit_for_approval?: boolean }>({
    defaultValues: {
      expense_date: new Date().toISOString().split('T')[0],
      currency: 'AED',
      category: 'fuel',
    },
  });

  const createMutation = useCreateExpense();
  const submitMutation = useSubmitExpense();

  const onSubmit = async (data: CreateExpenseData & { submit_for_approval?: boolean }) => {
    try {
      const { submit_for_approval, ...expenseData } = data;
      const result = await createMutation.mutateAsync(expenseData);
      
      if (submit_for_approval && result.id) {
        await submitMutation.mutateAsync(result.id);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const vehicleId = watch('vehicle_id');
  const category = watch('category');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle */}
        <div className="space-y-2">
          <Label>
            Vehicle <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <VehicleSelect
            value={vehicleId}
            onValueChange={(value) => setValue('vehicle_id', value)}
            placeholder="Select vehicle (leave empty for general expense)"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty if this is a general fleet expense
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(value) => setValue('category', value as ExpenseCategory)}
          >
            <SelectTrigger id="category" aria-required="true">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fuel">Fuel</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="tolls">Tolls</SelectItem>
              <SelectItem value="parking">Parking</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="repairs">Repairs</SelectItem>
              <SelectItem value="tires">Tires</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="depreciation">Depreciation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Expense Date */}
        <div className="space-y-2">
          <Label htmlFor="expense_date">
            Expense Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="expense_date"
            type="date"
            aria-required="true"
            {...register('expense_date', { required: 'Expense date is required' })}
          />
          {errors.expense_date && (
            <p className="text-sm text-destructive">{errors.expense_date.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              aria-required="true"
              {...register('amount', {
                required: 'Amount is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Amount must be greater than 0' },
              })}
              className="flex-1"
            />
            <Input
              type="text"
              value="AED"
              disabled
              className="w-20"
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        {/* Vendor Name */}
        <div className="space-y-2">
          <Label htmlFor="vendor_name">
            Vendor Name
          </Label>
          <Input
            id="vendor_name"
            placeholder="Enter vendor name"
            {...register('vendor_name')}
          />
        </div>

        {/* Vendor Invoice No */}
        <div className="space-y-2">
          <Label htmlFor="vendor_invoice_no">
            Invoice Number
          </Label>
          <Input
            id="vendor_invoice_no"
            placeholder="Enter invoice number"
            {...register('vendor_invoice_no')}
          />
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Enter expense description"
            rows={3}
            aria-required="true"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Additional notes (optional)"
            rows={3}
            {...register('notes')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="submit"
          variant="outline"
          disabled={createMutation.isPending}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={handleSubmit((data) => onSubmit({ ...data, submit_for_approval: true }))}
          disabled={createMutation.isPending || submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </div>
    </form>
  );
}

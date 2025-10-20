import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpensesAPI, ExpenseFilters, CreateExpenseData } from '@/lib/api/expenses';
import { toast } from 'sonner';

export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => ExpensesAPI.listExpenses(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExpense = (id?: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => ExpensesAPI.getExpense(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseData) => ExpensesAPI.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create expense: ${error.message}`);
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData> }) =>
      ExpensesAPI.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update expense: ${error.message}`);
    },
  });
};

export const useSubmitExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExpensesAPI.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit expense: ${error.message}`);
    },
  });
};

export const useApproveExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExpensesAPI.approveExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve expense: ${error.message}`);
    },
  });
};

export const useRejectExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ExpensesAPI.rejectExpense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject expense: ${error.message}`);
    },
  });
};

export const useMarkExpenseAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExpensesAPI.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense marked as paid');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark expense as paid: ${error.message}`);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExpensesAPI.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
      toast.success('Expense deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete expense: ${error.message}`);
    },
  });
};

export const useExpenseStatistics = (filters?: { date_from?: string; date_to?: string }) => {
  return useQuery({
    queryKey: ['expense-statistics', filters],
    queryFn: () => ExpensesAPI.getStatistics(filters),
    staleTime: 5 * 60 * 1000,
  });
};

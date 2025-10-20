import { supabase } from '@/integrations/supabase/client';

export type ExpenseCategory = 
  | 'fuel'
  | 'maintenance'
  | 'insurance'
  | 'registration'
  | 'tolls'
  | 'parking'
  | 'cleaning'
  | 'repairs'
  | 'tires'
  | 'accessories'
  | 'depreciation'
  | 'other';

export type ExpenseStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid';

export interface Expense {
  id: string;
  expense_no?: string;
  vehicle_id?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  vendor_name?: string;
  vendor_invoice_no?: string;
  status: ExpenseStatus;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
  attachment_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  vehicles?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export interface ExpenseFilters {
  vehicle_id?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CreateExpenseData {
  vehicle_id?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency?: string;
  expense_date: string;
  vendor_name?: string;
  vendor_invoice_no?: string;
  notes?: string;
  attachment_url?: string;
}

export interface ExpenseStatistics {
  total_expenses: number;
  total_amount: number;
  by_category: Record<ExpenseCategory, number>;
  by_status: Record<ExpenseStatus, number>;
  pending_approval_count: number;
  pending_approval_amount: number;
  monthly_trend: {
    month: string;
    amount: number;
  }[];
}

export class ExpensesAPI {
  static async listExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    let query = supabase
      .from('vehicle_expenses')
      .select(`
        id,
        expense_no,
        vehicle_id,
        category,
        description,
        amount,
        currency,
        expense_date,
        vendor_name,
        vendor_invoice_no,
        status,
        approved_by,
        approved_at,
        paid_at,
        notes,
        attachment_url,
        created_by,
        created_at,
        updated_at,
        vehicles (
          id,
          make,
          model,
          year,
          license_plate
        )
      `)
      .order('expense_date', { ascending: false });

    if (filters?.vehicle_id) {
      query = query.eq('vehicle_id', filters.vehicle_id);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.date_from) {
      query = query.gte('expense_date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('expense_date', filters.date_to);
    }

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or(`description.ilike.${searchPattern},vendor_name.ilike.${searchPattern},expense_no.ilike.${searchPattern}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Expense[];
  }

  static async getExpense(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('vehicle_expenses')
      .select(`
        id,
        expense_no,
        vehicle_id,
        category,
        description,
        amount,
        currency,
        expense_date,
        vendor_name,
        vendor_invoice_no,
        status,
        approved_by,
        approved_at,
        paid_at,
        notes,
        attachment_url,
        created_by,
        created_at,
        updated_at,
        vehicles (
          id,
          make,
          model,
          year,
          license_plate
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Expense;
  }

  static async createExpense(data: CreateExpenseData): Promise<Expense> {
    const expenseData = {
      ...data,
      currency: data.currency || 'AED',
      status: 'draft' as ExpenseStatus,
    };

    const { data: result, error } = await supabase
      .from('vehicle_expenses')
      .insert(expenseData)
      .select(`
        id,
        expense_no,
        vehicle_id,
        category,
        description,
        amount,
        currency,
        expense_date,
        vendor_name,
        vendor_invoice_no,
        status,
        approved_by,
        approved_at,
        paid_at,
        notes,
        attachment_url,
        created_by,
        created_at,
        updated_at,
        vehicles (
          id,
          make,
          model,
          year,
          license_plate
        )
      `)
      .single();

    if (error) throw error;
    return result as Expense;
  }

  static async updateExpense(
    id: string,
    data: Partial<CreateExpenseData>
  ): Promise<Expense> {
    const { data: result, error } = await supabase
      .from('vehicle_expenses')
      .update(data)
      .eq('id', id)
      .select(`
        id,
        expense_no,
        vehicle_id,
        category,
        description,
        amount,
        currency,
        expense_date,
        vendor_name,
        vendor_invoice_no,
        status,
        approved_by,
        approved_at,
        paid_at,
        notes,
        attachment_url,
        created_by,
        created_at,
        updated_at,
        vehicles (
          id,
          make,
          model,
          year,
          license_plate
        )
      `)
      .single();

    if (error) throw error;
    return result as Expense;
  }

  static async submitForApproval(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('vehicle_expenses')
      .update({ status: 'pending_approval' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  }

  static async approveExpense(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('vehicle_expenses')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  }

  static async rejectExpense(id: string, reason: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('vehicle_expenses')
      .update({ 
        status: 'rejected',
        notes: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  }

  static async markAsPaid(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('vehicle_expenses')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  }

  static async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getStatistics(filters?: { date_from?: string; date_to?: string }): Promise<ExpenseStatistics> {
    let query = supabase
      .from('vehicle_expenses')
      .select('category, status, amount, expense_date');

    if (filters?.date_from) {
      query = query.gte('expense_date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('expense_date', filters.date_to);
    }

    const { data: expenses, error } = await query;

    if (error) throw error;

    const stats: ExpenseStatistics = {
      total_expenses: expenses.length,
      total_amount: 0,
      by_category: {
        fuel: 0,
        maintenance: 0,
        insurance: 0,
        registration: 0,
        tolls: 0,
        parking: 0,
        cleaning: 0,
        repairs: 0,
        tires: 0,
        accessories: 0,
        depreciation: 0,
        other: 0,
      },
      by_status: {
        draft: 0,
        pending_approval: 0,
        approved: 0,
        rejected: 0,
        paid: 0,
      },
      pending_approval_count: 0,
      pending_approval_amount: 0,
      monthly_trend: [],
    };

    expenses.forEach((expense) => {
      stats.total_amount += expense.amount;

      if (expense.category in stats.by_category) {
        stats.by_category[expense.category as ExpenseCategory] += expense.amount;
      }

      if (expense.status in stats.by_status) {
        stats.by_status[expense.status as ExpenseStatus]++;
      }

      if (expense.status === 'pending_approval') {
        stats.pending_approval_count++;
        stats.pending_approval_amount += expense.amount;
      }
    });

    return stats;
  }
}

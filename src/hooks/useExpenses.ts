import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

// Templates
export const useExpenseTemplates = () => {
  return useQuery({
    queryKey: ['expense-templates'],
    queryFn: () => api.get('/expense-templates').then((r) => r.data),
  });
};

export const useCreateExpenseTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      accountId: string;
      supplierId?: string;
      estimatedAmount?: number;
      applyIsv?: boolean
    }) =>
      api.post('/expense-templates', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-templates'] }),
  });
};

export const useDeleteExpenseTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/expense-templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-templates'] }),
  });
};

// Expenses
export const useExpenses = (filters: { page?: number; startDate?: string; endDate?: string; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.status) params.set('status', filters.status);

  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => api.get(`/expenses?${params}`).then((r) => r.data),
  });
};

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      templateId?: string; accountId: string; supplierId?: string; bankAccountId?: string;
      date: string; description: string; amount: number; isvRate?: number;
      paymentMethod?: string; reference?: string; notes?: string;
    }) => api.post('/expenses', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

export const useConfirmExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/expenses/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['journal-entries'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useVoidExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/expenses/${id}/void`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
};

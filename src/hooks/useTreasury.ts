import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api.get('/bank-accounts').then((r) => r.data),
  });
};

export const useCreateBankAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; bankName?: string; accountNumber?: string; accountType?: string; initialBalance?: number }) =>
      api.post('/bank-accounts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bank-accounts'] }),
  });
};

export const useDeleteBankAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bank-accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bank-accounts'] }),
  });
};

export const useTransactions = (accountId: string, filters: { page?: number; startDate?: string; endDate?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  return useQuery({
    queryKey: ['transactions', accountId, filters],
    queryFn: () => api.get(`/bank-accounts/${accountId}/transactions?${params}`).then((r) => r.data),
    enabled: !!accountId,
  });
};

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bankAccountId: string; date: string; type: string; amount: number; description: string; reference?: string; category?: string }) =>
      api.post('/cash-transactions', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      qc.invalidateQueries({ queryKey: ['cash-flow'] });
    },
  });
};

export const useCreateTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fromAccountId: string; toAccountId: string; date: string; amount: number; description?: string }) =>
      api.post('/cash-transactions/transfer', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['bank-accounts'] });
      qc.invalidateQueries({ queryKey: ['cash-flow'] });
    },
  });
};

export const useToggleReconciled = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/cash-transactions/${id}/reconcile`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
};

export const useCashFlow = (filters: { startDate?: string; endDate?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  return useQuery({
    queryKey: ['cash-flow', filters],
    queryFn: () => api.get(`/cash-flow?${params}`).then((r) => r.data),
  });
};

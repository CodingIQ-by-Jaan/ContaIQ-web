import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

interface JournalFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const useJournalEntries = (filters: JournalFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.status) params.set('status', filters.status);

  return useQuery({
    queryKey: ['journal-entries', filters],
    queryFn: () => api.get(`/journal-entries?${params}`).then((r) => r.data),
  });
};

export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: ['journal-entries', id],
    queryFn: () => api.get(`/journal-entries/${id}`).then((r) => r.data),
    enabled: !!id,
  });
};

interface CreateEntryData {
  date: string;
  description: string;
  reference?: string;
  lines: { accountId: string; description?: string; debit: number; credit: number }[];
}

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntryData) => api.post('/journal-entries', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
};

export const useConfirmJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/journal-entries/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['trial-balance'] });
    },
  });
};

export const useVoidJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/journal-entries/${id}/void`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['trial-balance'] });
    },
  });
};

export const useLedger = (accountId: string, filters: { startDate?: string; endDate?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  return useQuery({
    queryKey: ['ledger', accountId, filters],
    queryFn: () => api.get(`/ledger/${accountId}?${params}`).then((r) => r.data),
    enabled: !!accountId,
  });
};

export const useTrialBalance = (endDate?: string) => {
  const params = new URLSearchParams();
  if (endDate) params.set('endDate', endDate);

  return useQuery({
    queryKey: ['trial-balance', endDate],
    queryFn: () => api.get(`/trial-balance?${params}`).then((r) => r.data),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useIsvSummary = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));

  return useQuery({
    queryKey: ['isv-summary', year, month],
    queryFn: () => api.get(`/taxes/isv-summary?${params}`).then((r) => r.data),
  });
};

export const useIsvHistory = (year?: number) => {
  return useQuery({
    queryKey: ['isv-history', year],
    queryFn: () => api.get(`/taxes/isv-history?year=${year ?? new Date().getFullYear()}`).then((r) => r.data),
  });
};

export const useWithholdings = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));

  return useQuery({
    queryKey: ['withholdings', year, month],
    queryFn: () => api.get(`/taxes/withholdings?${params}`).then((r) => r.data),
  });
};

export const useCreateWithholding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; date: string; amount: number; withheldBy?: string; documentRef?: string }) =>
      api.post('/taxes/withholdings', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['withholdings'] }),
  });
};

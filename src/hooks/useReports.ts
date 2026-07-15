import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useBalanceSheet = (endDate?: string) => {
  const params = endDate ? `?endDate=${endDate}` : '';
  return useQuery({
    queryKey: ['balance-sheet', endDate],
    queryFn: () => api.get(`/reports/balance-sheet${params}`).then((r) => r.data),
  });
};

export const useIncomeStatement = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString() ? `?${params}` : '';

  return useQuery({
    queryKey: ['income-statement', startDate, endDate],
    queryFn: () => api.get(`/reports/income-statement${query}`).then((r) => r.data),
  });
};

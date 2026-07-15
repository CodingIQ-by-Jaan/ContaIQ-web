import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useKpis = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => api.get('/dashboard/kpis').then((r) => r.data),
  });
};

export const useRevenueVsExpenses = () => {
  return useQuery({
    queryKey: ['dashboard', 'revenue-vs-expenses'],
    queryFn: () => api.get('/dashboard/revenue-vs-expenses').then((r) => r.data),
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: () => api.get('/dashboard/top-products').then((r) => r.data),
  });
};

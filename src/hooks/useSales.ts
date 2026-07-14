import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useSales = (filters: { page?: number; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.status) params.set('status', filters.status);

  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => api.get(`/sales?${params}`).then((r) => r.data),
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.get(`/sales/${id}`).then((r) => r.data),
    enabled: !!id,
  });
};

interface SaleItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  applyIsv?: boolean;
}

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { customerId?: string; date: string; withholdingAmount?: number; notes?: string; items: SaleItem[] }) =>
      api.post('/sales', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
};

export const useConfirmSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/sales/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
};

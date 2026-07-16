import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const usePurchases = (filters: { page?: number; status?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.status) params.set('status', filters.status);

  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: () => api.get(`/purchases?${params}`).then((r) => r.data),
  });
};

export const usePurchase = (id: string) => {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => api.get(`/purchases/${id}`).then((r) => r.data),
    enabled: !!id,
  });
};

interface PurchaseItem {
  productId?: string;
  description: string;
  quantity: number;
  unitCost: number;
  applyIsv?: boolean;
}

export const useCreatePurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      supplierId: string;
      date: string;
      supplierInvoice?: string; notes?: string; items: PurchaseItem[] }) =>
      api.post('/purchases', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
};

export const useConfirmPurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/purchases/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
};

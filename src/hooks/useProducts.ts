import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useProducts = (search?: string) => {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return useQuery({
    queryKey: ['products', search],
    queryFn: () => api.get(`/products${params}`).then((r) => r.data),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      description?: string;
      unit?: string;
      costMethod?: string;
      salePrice: number;
      minStock?: number;
      isvRate?: number;
      isService?: boolean
    }) =>
      api.post('/products', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, ...data }: { id: string; name?: string; salePrice?: number; minStock?: number; isActive?: boolean }) =>
      api.patch(`/products/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useKardex = (productId: string, filters: { startDate?: string; endDate?: string } = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  return useQuery({
    queryKey: ['kardex', productId, filters],
    queryFn: () => api.get(`/products/${productId}/kardex?${params}`).then((r) => r.data),
    enabled: !!productId,
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => api.get('/products/low-stock').then((r) => r.data),
  });
};

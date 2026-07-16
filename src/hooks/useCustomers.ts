import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then((r) => r.data),
  });
};

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      data: {
        name: string;
        rtn?: string;
        type?: string;
        email?: string;
        phone?: string;
        address?: string
      },
    ) =>
      api.post('/customers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

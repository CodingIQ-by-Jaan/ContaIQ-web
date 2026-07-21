import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useCaiConfigs = () => {
  return useQuery({
    queryKey: ['cai-configs'],
    queryFn: () => api.get('/cai-configs').then((r) => r.data),
  });
};

export const useCaiStatus = () => {
  return useQuery({
    queryKey: ['cai-configs', 'status'],
    queryFn: () => api.get('/cai-configs/status').then((r) => r.data),
  });
};

export const useCreateCaiConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      caiNumber: string; rangeStart: string; rangeEnd: string;
      expirationDate: string; establishmentCode: string; pointOfSale: string;
      documentType?: string; startingNumber?: number;
    }) => api.post('/cai-configs', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cai-configs'] }),
  });
};

export const useDeactivateCaiConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cai-configs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cai-configs'] }),
  });
};

export const useInvoiceData = (saleId: string) => {
  return useQuery({
    queryKey: ['invoice', saleId],
    queryFn: () => api.get(`/invoices/${saleId}`).then((r) => r.data),
    enabled: !!saleId,
  });
};

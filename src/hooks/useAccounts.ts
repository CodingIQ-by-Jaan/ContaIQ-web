import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then((r) => r.data),
  });
};

export const useAccountsTree = () => {
  return useQuery({
    queryKey: ['accounts', 'tree'],
    queryFn: () => api.get('/accounts/tree').then((r) => r.data),
  });
};

export const useSeedAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/accounts/seed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      type: string;
      nature: string;
      parentId?: string;
      isDetail?: boolean;
    }) => api.post('/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

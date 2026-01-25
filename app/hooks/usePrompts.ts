'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
  updatedAt: number;
}

export function usePrompts() {
  const queryClient = useQueryClient();

  // 获取所有提示词
  const { data, isLoading, error } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await fetch('/api/prompts');
      if (!res.ok) throw new Error('获取提示词失败');
      const json = await res.json();
      return json.prompts as Prompt[];
    },
  });

  // 创建提示词
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; tags: string[] }) => {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('创建失败');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  // 更新提示词
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prompt> }) => {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('更新失败');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  // 删除提示词
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  return {
    prompts: data || [],
    isLoading,
    error,
    createPrompt: createMutation.mutateAsync,
    updatePrompt: updateMutation.mutateAsync,
    deletePrompt: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

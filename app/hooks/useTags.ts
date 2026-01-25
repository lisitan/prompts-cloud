'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Tag {
  name: string;
  count: number;
  pinned: boolean;
}

export function useTags() {
  const queryClient = useQueryClient();

  // 获取所有标签
  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('获取标签失败');
      const json = await res.json();
      return json.tags as Tag[];
    },
  });

  // 切换标签置顶
  const togglePinMutation = useMutation({
    mutationFn: async (tagName: string) => {
      const res = await fetch('/api/tags/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagName }),
      });
      if (!res.ok) throw new Error('操作失败');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  return {
    tags: data || [],
    isLoading,
    togglePin: togglePinMutation.mutateAsync,
  };
}

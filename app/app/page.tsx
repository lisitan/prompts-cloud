'use client';

import { useState, useMemo } from 'react';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { TagFilter } from '@/components/TagFilter';
import { PromptCard } from '@/components/PromptCard';
import { PromptModal } from '@/components/PromptModal';
import { usePrompts, Prompt } from '@/hooks/usePrompts';
import { useTags } from '@/hooks/useTags';

export default function AppPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const { prompts, isLoading, createPrompt, updatePrompt, deletePrompt } = usePrompts();
  const { tags, togglePin } = useTags();

  // 过滤提示词
  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // 按标签筛选
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    // 按搜索词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 按时间倒序排序
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [prompts, selectedTag, searchQuery]);

  // 处理新建
  const handleNew = () => {
    setEditingPrompt(null);
    setModalOpen(true);
  };

  // 处理编辑
  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setModalOpen(true);
  };

  // 处理保存
  const handleSave = async (data: { title: string; content: string; tags: string[] }) => {
    if (editingPrompt) {
      await updatePrompt({ id: editingPrompt.id, data });
    } else {
      await createPrompt(data);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    await deletePrompt(id);
  };

  // 处理导入
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });

        if (!res.ok) throw new Error('导入失败');

        const result = await res.json();
        alert(`导入成功！\n新增: ${result.imported}\n跳过: ${result.skipped}`);
        window.location.reload();
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请检查文件格式');
      }
    };
    input.click();
  };

  // 处理导出
  const handleExport = async () => {
    try {
      const res = await fetch('/api/export/json');
      if (!res.ok) throw new Error('导出失败');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompts-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* 头部 */}
      <Header
        userEmail="用户"
        onNewPrompt={handleNew}
        onImport={handleImport}
        onExport={handleExport}
      />

      {/* 主内容 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* 使用引导 */}
        {prompts.length === 0 && !isLoading && (
          <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              💡 快速开始
            </h2>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• 点击右上角 <strong>新建</strong> 按钮创建提示词</li>
              <li>• 点击卡片的 <strong>标题或内容</strong> 即可快速复制</li>
              <li>• 悬停卡片可显示 <strong>编辑/删除</strong> 按钮</li>
              <li>• 右键点击标签可 <strong>置顶</strong> 常用标签</li>
              <li>• 使用顶部菜单可 <strong>导入/导出</strong> 数据</li>
            </ul>
          </div>
        )}

        {/* 搜索和标签 */}
        {prompts.length > 0 && (
          <div className="mb-8 space-y-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              onTogglePin={togglePin}
            />
          </div>
        )}

        {/* 提示词列表 */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100"></div>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400">加载中...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6">
              <svg className="w-10 h-10 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {searchQuery || selectedTag ? '没有找到匹配的提示词' : '还没有提示词'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              {searchQuery || selectedTag ? '试试其他搜索条件' : '点击右上角"新建"按钮创建第一个提示词'}
            </p>
            {!searchQuery && !selectedTag && (
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-[1rem] font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建提示词
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* 底部作者信息 - 固定在页面底部 */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-center text-zinc-400 dark:text-zinc-600">
            Copyright © 2025-2026 思潭有话说. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* 模态框 */}
      <PromptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingPrompt={editingPrompt}
      />
    </div>
  );
}

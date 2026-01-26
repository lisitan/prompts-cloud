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
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col">
      {/* 头部 */}
      <Header
        userEmail="用户"
        onNewPrompt={handleNew}
        onImport={handleImport}
        onExport={handleExport}
      />

      {/* 主内容 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 w-full">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            汇聚智慧，一触即发
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">收集整理你的AI提示词</p>
        </div>

        {/* 使用引导 */}
        {prompts.length === 0 && !isLoading && (
          <div className="mb-8 p-8 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              快速开始
            </h2>
            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <span>点击右上角 <strong className="text-neutral-900 dark:text-white">新建</strong> 按钮创建提示词</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <span>点击卡片的 <strong className="text-neutral-900 dark:text-white">标题或内容</strong> 即可快速复制</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <span>移动端长按卡片，桌面端悬停卡片可显示 <strong className="text-neutral-900 dark:text-white">编辑/删除</strong> 按钮</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <span>移动端长按标签，桌面端右键点击标签可 <strong className="text-neutral-900 dark:text-white">置顶</strong> 常用标签</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <span>使用顶部菜单可 <strong className="text-neutral-900 dark:text-white">导入/导出</strong> 数据</span>
              </li>
            </ul>
          </div>
        )}

        {/* 搜索和标签 */}
        {prompts.length > 0 && (
          <div className="mb-8 space-y-6">
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-300 dark:border-neutral-700 border-t-primary-600 dark:border-t-primary-500"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">加载中...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
              <svg className="w-10 h-10 text-neutral-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {searchQuery || selectedTag ? '没有找到匹配的提示词' : '还没有提示词'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchQuery || selectedTag ? '试试其他搜索条件' : '点击右上角"新建"按钮创建第一个提示词'}
            </p>
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

      {/* 底部版权信息 - 固定在页面底部 */}
      <footer className="border-t border-neutral-200 dark:border-neutral-700 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-6">
          <p className="text-xs text-center text-neutral-600 dark:text-neutral-400">
            Copyright © 2026 思潭有话说. All Rights Reserved.
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

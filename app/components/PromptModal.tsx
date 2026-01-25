'use client';

import { useState, useEffect } from 'react';
import { Prompt } from '@/hooks/usePrompts';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  editingPrompt?: Prompt | null;
}

export function PromptModal({ isOpen, onClose, onSave, editingPrompt }: PromptModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setContent(editingPrompt.content);
      setTagsInput(editingPrompt.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
    }
  }, [editingPrompt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const tags = tagsInput
        .split(/[,，、]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSave({ title, content, tags });
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold">
            {editingPrompt ? '编辑提示词' : '新建提示词'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              标题 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="输入提示词标题..."
              className="w-full px-4 py-3 rounded-[1rem] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            />
          </div>

          {/* 内容 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              内容 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              placeholder="输入提示词内容..."
              className="w-full px-4 py-3 rounded-[1rem] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* 标签 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：工作, 编程, AI"
              className="w-full px-4 py-3 rounded-[1rem] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            />
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-[1rem] font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !content.trim()}
            className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[1rem] font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

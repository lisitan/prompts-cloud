'use client';

import { useState } from 'react';
import { Prompt } from '@/hooks/usePrompts';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div
      className="liquid-card group bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 break-inside-avoid mb-4 cursor-pointer transition-all hover:shadow-lg"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleCopy}
    >
      {/* 操作按钮 */}
      <div
        className={`absolute top-4 right-4 flex gap-2 transition-opacity ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(prompt)}
          className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="编辑"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (confirm('确定要删除这个提示词吗？')) {
              onDelete(prompt.id);
            }
          }}
          className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          title="删除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* 复制成功提示 */}
      {copied && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          ✓ 已复制
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 pr-20">
        {prompt.title}
      </h3>

      {/* 内容 */}
      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap line-clamp-[15] mb-4">
        {prompt.content}
      </p>

      {/* 标签 */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 时间戳 */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-600">
        {new Date(prompt.timestamp).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}

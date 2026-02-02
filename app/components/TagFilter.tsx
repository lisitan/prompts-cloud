'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag } from '@/hooks/useTags';

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onTogglePin: (tagName: string) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag, onTogglePin }: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    // 从 localStorage 读取展开状态
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tagsExpanded') === 'true';
    }
    return false;
  });
  const [shouldShowExpand, setShouldShowExpand] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  // 检测是否需要显示展开按钮
  useEffect(() => {
    const checkOverflow = () => {
      if (tagsContainerRef.current && !isExpanded) {
        const container = tagsContainerRef.current;
        setShouldShowExpand(container.scrollHeight > container.clientHeight);
      } else if (tags.length > 10) {
        setShouldShowExpand(true);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [tags, isExpanded]);

  // 保存展开状态到 localStorage
  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem('tagsExpanded', String(newExpanded));
  };

  if (tags.length === 0) return null;

  // 计算要显示的标签
  const visibleTags = isExpanded ? tags : tags.slice(0, 10);

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={tagsContainerRef}
        className={`flex flex-wrap gap-2 transition-all duration-300 ${!isExpanded ? 'max-h-12 overflow-hidden' : ''
          }`}
      >
        {/* 全部按钮 */}
        <button
          onClick={() => onSelectTag(null)}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedTag === null
              ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
            }`}
        >
          全部 ({tags.reduce((sum, tag) => sum + tag.count, 0)})
        </button>

        {/* 标签列表 */}
        {visibleTags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => onSelectTag(tag.name)}
            onContextMenu={(e) => {
              e.preventDefault();
              onTogglePin(tag.name);
            }}
            className={`group relative px-4 py-2 rounded-xl font-medium transition-all ${selectedTag === tag.name
                ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
              }`}
            title="右键点击可置顶/取消置顶"
          >
            <span className="flex items-center gap-1">
              {tag.pinned && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.012 1.632.65 2.15.989.795 2.647.794 3.635-.001a1.958 1.958 0 00.65-2.15l-.818-2.552a1 1 0 00-1.184-.626l-1.653.548a1 1 0 00-.462.279zm-.184 6.947l-2.083-.695A1 1 0 012 16.382v-.702a1 1 0 011.195-.98l2.083.695a1 1 0 01.722 1.244l-.383 1.146a1 1 0 01-1.897-.564l.096-.288z" />
                </svg>
              )}
              {tag.name}
              <span className="ml-1 text-xs opacity-70">({tag.count})</span>
            </span>
          </button>
        ))}
      </div>

      {/* 展开/收起按钮 */}
      {(shouldShowExpand || tags.length > 10) && (
        <div className="flex justify-center mt-3">
          <button
            onClick={toggleExpand}
            className="flex items-center gap-1 px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                收起
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                展开全部 ({tags.length} 个标签)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

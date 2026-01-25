'use client';

import { Tag } from '@/hooks/useTags';

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onTogglePin: (tagName: string) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag, onTogglePin }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/* 全部按钮 */}
      <button
        onClick={() => onSelectTag(null)}
        className={`px-4 py-2 rounded-[1rem] font-medium transition-all ${
          selectedTag === null
            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        全部 ({tags.reduce((sum, tag) => sum + tag.count, 0)})
      </button>

      {/* 标签列表 */}
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => onSelectTag(tag.name)}
          onContextMenu={(e) => {
            e.preventDefault();
            onTogglePin(tag.name);
          }}
          className={`group relative px-4 py-2 rounded-[1rem] font-medium transition-all ${
            selectedTag === tag.name
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
  );
}

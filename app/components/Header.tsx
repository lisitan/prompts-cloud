'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface HeaderProps {
  userEmail?: string;
  onNewPrompt: () => void;
  onImport: () => void;
  onExport: () => void;
}

export function Header({ userEmail, onNewPrompt, onImport, onExport }: HeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            思潭的提示词集
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Liquid Air</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          {/* 新建按钮 */}
          <button
            onClick={onNewPrompt}
            className="hidden sm:flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-[1rem] font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建
          </button>

          {/* 移动端新建按钮 */}
          <button
            onClick={onNewPrompt}
            className="sm:hidden p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[1rem] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 菜单按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[1rem] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 下拉菜单 */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-[1rem] shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-20">
                  <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 px-3 py-1 truncate">
                      {userEmail}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onImport();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-sm"
                    >
                      📥 导入数据
                    </button>
                    <button
                      onClick={() => {
                        onExport();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-sm"
                    >
                      📤 导出数据
                    </button>
                  </div>
                  <div className="p-2 border-t border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
                    >
                      🚪 登出
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast, useToast } from '@/components/Toast';

interface HeaderProps {
  userEmail?: string;
  onNewPrompt: () => void;
  onImport: () => void;
  onExport: () => void;
}

export function Header({ userEmail, onNewPrompt, onImport, onExport }: HeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // 初始化主题
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      showToast('已退出登录', 'success');
      // 等待 Toast 显示一小段时间后再跳转
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 800);
    } catch (error) {
      console.error('退出失败:', error);
      showToast('退出失败，请重试', 'error');
      setLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              词匣子
            </h1>
          </Link>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            {/* 新建按钮 */}
            <button
              onClick={onNewPrompt}
              className="hidden sm:flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建
            </button>

            {/* 移动端新建按钮 */}
            <button
              onClick={onNewPrompt}
              className="sm:hidden p-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* 主题切换按钮 */}
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            >
              {isDark ? (
                <svg className="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* 菜单按钮 */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden z-20">
                    <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 px-3 py-1 truncate">
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
                    <div className="p-2 border-t border-neutral-200 dark:border-neutral-700">
                      <Link
                        href="/settings"
                        onClick={() => setShowMenu(false)}
                        className="block w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-sm"
                      >
                        ⚙️ 账户设置
                      </Link>
                      <Link
                        href="/privacy"
                        onClick={() => setShowMenu(false)}
                        className="block w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-sm"
                      >
                        🔒 隐私政策
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium"
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

      {/* 退出确认弹窗 */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="确认退出"
        message="确定要退出登录吗？"
        confirmText="确认退出"
        cancelText="取消"
        confirmVariant="danger"
        loading={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Toast 提示 */}
      {ToastComponent}
    </>
  );
}

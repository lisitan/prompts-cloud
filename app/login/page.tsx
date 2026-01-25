import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export default async function LoginPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 如果已登录，重定向到主应用
  if (session) {
    redirect('/app');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              思潭的提示词集
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Liquid Air</p>
          </div>

          {/* 提示信息 */}
          <div className="text-center mb-6">
            <p className="text-zinc-600 dark:text-zinc-400">
              使用 GitHub 账号登录以访问您的提示词库
            </p>
          </div>

          {/* GitHub 登录按钮 */}
          <form action="/auth/login" method="POST">
            <button
              type="submit"
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                使用 GitHub 登录
              </div>
            </button>
          </form>

          {/* 底部提示 */}
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500 mt-6">
            首次登录将自动创建账户
          </p>
        </div>

        {/* 版本信息 */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-4">
          Powered by Vercel & Supabase
        </p>
      </div>
    </div>
  );
}

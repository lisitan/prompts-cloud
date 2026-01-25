import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export default async function AppPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 如果未登录，重定向到登录页
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* 顶部导航 */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">思潭的提示词集</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              欢迎，{session.user.user_metadata.name || session.user.email}
            </p>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                登出
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            🎉 配置成功！
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            恭喜！Vercel 和 Supabase 配置已完成，认证系统正常工作。
            <br />
            接下来将实现完整的提示词管理功能。
          </p>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-semibold mb-4">✅ 已完成的配置</h3>
            <ul className="text-left space-y-2 text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Vercel KV (Redis) 数据库
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Supabase 认证服务
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                GitHub OAuth 登录
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                环境变量配置
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                部署到 Vercel
              </li>
            </ul>
          </div>

          <div className="mt-8 text-sm text-zinc-500 dark:text-zinc-600">
            <p>用户 ID: {session.user.id}</p>
            <p>登录邮箱: {session.user.email}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

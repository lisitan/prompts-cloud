'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PrivacyConsentModal } from '@/components/PrivacyConsentModal';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullscreenLoading, setFullscreenLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  // 初始化主题
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // 注册时验证密码是否一致
    if (!isLogin && password !== confirmPassword) {
      setError('两次输入的密码不一致，请重新输入');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (isLogin) {
        // 登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          // 显示全屏 loading
          setLoading(false);
          setFullscreenLoading(true);
          setTimeout(() => {
            router.push('/app');
            router.refresh();
          }, 300);
        }
      } else {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user) {
          if (data.session) {
            // 如果邮箱验证被禁用，直接登录
            setLoading(false);
            setFullscreenLoading(true);
            setTimeout(() => {
              router.push('/app');
              router.refresh();
            }, 300);
          } else {
            // 需要邮箱验证
            setMessage('注册成功！请检查您的邮箱以验证账户。');
          }
        }
      }
    } catch (error: any) {
      console.error('认证错误:', error);
      setError(error.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 全屏 loading 状态
  if (fullscreenLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-300 dark:border-neutral-700 border-t-primary-600 dark:border-t-primary-500 mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">正在进入应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      {/* 隐私政策同意弹窗 */}
      <PrivacyConsentModal onAccept={() => { }} />

      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-center">
        {/* 左侧介绍区域 - 仅桌面端显示 */}
        <div className="hidden lg:block flex-1 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              词匣子
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
              收集整理你的 AI 提示词
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">简单易用</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">一键保存、快速复制，让你的提示词管理井井有条</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">智能标签</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">用标签分类整理，快速找到你需要的提示词</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">云端同步</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">数据安全存储在云端，随时随地访问你的提示词库</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">导入导出</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">支持 JSON 和 Excel 格式，轻松迁移和备份数据</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="w-full lg:w-auto lg:min-w-[480px]">
          {/* 移动端 Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              词匣子
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              收集整理你的 AI 提示词
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
            {/* 标题和主题切换 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {isLogin ? '欢迎回来' : '创建账户'}
              </h2>
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                title={isDark ? '切换到浅色模式' : '切换到深色模式'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* 提示信息 */}
            {message && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[1rem] text-green-700 dark:text-green-300 text-sm">
                {message}
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[1rem] text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* 登录/注册表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 邮箱输入 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  邮箱地址
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-[1rem] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                />
              </div>

              {/* 密码输入 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={isLogin ? '请输入密码' : '至少 6 位字符'}
                  className="w-full px-4 py-3 rounded-[1rem] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                />
              </div>

              {/* 忘记密码链接 - 仅登录时显示 */}
              {isLogin && (
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    忘记密码？
                  </Link>
                </div>
              )}

              {/* 确认密码输入 - 仅注册时显示 */}
              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >
                    确认密码
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="请再次输入密码"
                    className="w-full px-4 py-3 rounded-[1rem] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                  />
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    处理中...
                  </span>
                ) : isLogin ? (
                  '登录'
                ) : (
                  '注册账户'
                )}
              </button>
            </form>

            {/* 底部提示（保留切换链接） */}
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                  setConfirmPassword('');
                }}
                className="ml-1 text-neutral-900 dark:text-neutral-100 font-medium hover:underline"
              >
                {isLogin ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>

          {/* 底部链接 */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              隐私政策
            </Link>
            <span>•</span>
            <span>Copyright © 2026 思潭有话说</span>
          </div>
        </div>
      </div>
    </div>
  );
}

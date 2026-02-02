'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isDark, setIsDark] = useState(false);
    const [isValidSession, setIsValidSession] = useState(true);

    // 初始化主题和验证会话
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

        // 检查是否有有效的恢复会话
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            // 如果没有 session 且 URL 中没有 token，说明链接无效
            if (!session) {
                const hash = window.location.hash;
                if (!hash.includes('access_token') && !hash.includes('type=recovery')) {
                    setIsValidSession(false);
                }
            }
        };

        checkSession();
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
        setError('');

        // 验证密码
        if (password.length < 6) {
            setError('密码长度至少为6位');
            return;
        }
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;
            setSuccess(true);

            // 3秒后跳转到登录页
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error: any) {
            console.error('重置密码失败:', error);
            setError(error.message || '重置密码失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    // 无效会话状态
    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 border border-neutral-200 dark:border-neutral-800 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            链接已失效
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            此密码重置链接已过期或无效，请重新申请。
                        </p>
                        <Link
                            href="/forgot-password"
                            className="inline-block bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                        >
                            重新申请
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                        词匣子
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        设置新密码
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
                    {/* 标题和主题切换 */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            重置密码
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

                    {success ? (
                        // 成功状态
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                密码重置成功
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                您的密码已更新，正在跳转到登录页面...
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                            >
                                立即登录
                            </Link>
                        </div>
                    ) : (
                        // 设置新密码表单
                        <>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                请输入您的新密码，密码长度至少为6位。
                            </p>

                            {/* 错误信息 */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[1rem] text-red-700 dark:text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                                    >
                                        新密码
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="至少 6 位字符"
                                        className="w-full px-4 py-3 rounded-[1rem] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                                    >
                                        确认新密码
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="请再次输入新密码"
                                        className="w-full px-4 py-3 rounded-[1rem] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? '设置中...' : '设置新密码'}
                                </button>
                            </form>
                        </>
                    )}
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
    );
}

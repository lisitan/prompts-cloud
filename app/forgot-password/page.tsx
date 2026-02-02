'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [isDark, setIsDark] = useState(false);

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
        setError('');

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setSent(true);
        } catch (error: any) {
            console.error('发送重置邮件失败:', error);
            setError(error.message || '发送失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                        词匣子
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        找回您的账户密码
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
                    {/* 标题和主题切换 */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            忘记密码
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

                    {sent ? (
                        // 发送成功状态
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                邮件已发送
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                我们已向 <span className="font-medium text-neutral-900 dark:text-white">{email}</span> 发送了密码重置链接，请检查您的邮箱。
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                            >
                                返回登录
                            </Link>
                        </div>
                    ) : (
                        // 输入邮箱表单
                        <>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                请输入您注册时使用的邮箱地址，我们将发送密码重置链接到您的邮箱。
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? '发送中...' : '发送重置链接'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
                                想起密码了？
                                <Link
                                    href="/login"
                                    className="ml-1 text-neutral-900 dark:text-neutral-100 font-medium hover:underline"
                                >
                                    返回登录
                                </Link>
                            </p>
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

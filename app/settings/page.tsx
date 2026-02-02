'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';

interface UserInfo {
    email: string;
    createdAt: string;
    lastSignIn: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    // 修改密码相关状态
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        // 初始化主题
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);

        // 获取用户信息
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUserInfo({
                email: user.email || '未知',
                createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }) : '未知',
                lastSignIn: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) : '未知',
            });
            setLoading(false);
        };

        fetchUser();
    }, [router]);

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

    const handleClearLocalData = () => {
        localStorage.removeItem('tagsExpanded');
        localStorage.removeItem('privacyConsent');
        localStorage.removeItem('privacyConsentDate');
        showToast('本地数据已清除', 'success');
    };

    const handleChangePassword = async () => {
        // 验证输入
        if (!currentPassword) {
            setPasswordError('请输入当前密码');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('新密码长度至少为6位');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('两次输入的新密码不一致');
            return;
        }

        setPasswordError('');
        setChangingPassword(true);

        try {
            const supabase = createClient();

            // 1. 先验证旧密码（通过重新登录）
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userInfo?.email || '',
                password: currentPassword,
            });

            if (signInError) {
                setPasswordError('当前密码不正确');
                setChangingPassword(false);
                return;
            }

            // 2. 旧密码验证通过，更新新密码
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                setPasswordError(updateError.message || '修改密码失败');
                setChangingPassword(false);
                return;
            }

            showToast('密码修改成功', 'success');
            closePasswordModal();
        } catch (error: any) {
            setPasswordError(error.message || '修改密码失败');
        } finally {
            setChangingPassword(false);
        }
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-300 dark:border-neutral-700 border-t-primary-600 dark:border-t-primary-500 mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900">
            {/* 顶部导航 */}
            <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/app"
                            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            返回
                        </Link>
                    </div>
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
            </header>

            {/* 主内容 */}
            <main className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                    账户设置
                </h1>

                {/* 用户信息卡片 */}
                <section className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        账户信息
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-neutral-200 dark:border-neutral-700">
                            <span className="text-neutral-600 dark:text-neutral-400">邮箱</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{userInfo?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-neutral-200 dark:border-neutral-700">
                            <span className="text-neutral-600 dark:text-neutral-400">注册时间</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{userInfo?.createdAt}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-neutral-600 dark:text-neutral-400">上次登录</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{userInfo?.lastSignIn}</span>
                        </div>
                    </div>
                </section>

                {/* 安全设置 */}
                <section className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        安全设置
                    </h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
                        >
                            <div className="text-left">
                                <span className="text-neutral-900 dark:text-white font-medium">修改密码</span>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">需要验证当前密码</p>
                            </div>
                            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </section>

                {/* 偏好设置 */}
                <section className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        偏好设置
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3">
                            <div>
                                <span className="text-neutral-900 dark:text-white font-medium">深色模式</span>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">切换界面主题颜色</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                            >
                                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 数据管理 */}
                <section className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        数据管理
                    </h2>
                    <div className="space-y-4">
                        <button
                            onClick={handleClearLocalData}
                            className="w-full text-left px-4 py-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
                        >
                            <span className="text-neutral-900 dark:text-white font-medium">清除本地缓存</span>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">清除浏览器中保存的偏好设置</p>
                        </button>
                    </div>
                </section>

                {/* 关于与帮助 */}
                <section className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        关于
                    </h2>
                    <div className="space-y-3">
                        <Link
                            href="/privacy"
                            className="flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
                        >
                            <span className="text-neutral-900 dark:text-white">隐私政策</span>
                            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <p>词匣子 v1.0.0</p>
                            <p className="mt-1">© 2026 思潭有话说. All Rights Reserved.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* 修改密码弹窗 */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* 遮罩层 */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closePasswordModal}
                    />

                    {/* 弹窗内容 */}
                    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4 p-6">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                            修改密码
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    当前密码
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="请输入当前密码"
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    新密码
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="请输入新密码（至少6位）"
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    确认新密码
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="请再次输入新密码"
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {passwordError && (
                                <p className="text-red-500 text-sm">{passwordError}</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closePasswordModal}
                                className="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white rounded-xl font-bold transition-colors disabled:cursor-not-allowed"
                            >
                                {changingPassword ? '修改中...' : '确认修改'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast 提示 */}
            {ToastComponent}
        </div>
    );
}

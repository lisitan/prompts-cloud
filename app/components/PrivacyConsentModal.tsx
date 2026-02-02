'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PrivacyConsentModalProps {
    onAccept: () => void;
}

export function PrivacyConsentModal({ onAccept }: PrivacyConsentModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 检查用户是否已同意隐私政策
        const hasConsented = localStorage.getItem('privacyConsent');
        if (!hasConsented) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('privacyConsent', 'true');
        localStorage.setItem('privacyConsentDate', new Date().toISOString());
        setIsVisible(false);
        onAccept();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* 标题 */}
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                隐私政策
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                在继续使用前，请阅读并同意我们的隐私政策
                            </p>
                        </div>
                    </div>
                </div>

                {/* 内容 */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                    <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
                        <p>
                            欢迎使用词匣子！为保护您的隐私权益，请在使用前了解：
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>我们仅收集邮箱地址和提示词内容等必要信息</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>您的数据使用 HTTPS 加密传输，安全存储于云端</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>我们承诺不会查看、出售或分享您的个人数据</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>您可随时导出或删除自己的数据</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 按钮 */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                    <button
                        onClick={handleAccept}
                        className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-[1rem] py-3 px-6 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        我已阅读并同意
                    </button>
                    <Link
                        href="/privacy"
                        target="_blank"
                        className="block w-full text-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors py-2"
                    >
                        查看完整隐私政策 →
                    </Link>
                </div>
            </div>
        </div>
    );
}

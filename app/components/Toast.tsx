'use client';

import { useState, useEffect, useCallback } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 显示动画
        requestAnimationFrame(() => setIsVisible(true));

        // 自动关闭
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 200); // 等待退出动画
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const iconMap = {
        success: (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                {iconMap[type]}
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {message}
                </span>
            </div>
        </div>
    );
}

// Toast 管理 Hook
interface ToastState {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        isVisible: false,
        message: '',
        type: 'success',
    });

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ isVisible: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    const ToastComponent = toast.isVisible ? (
        <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
        />
    ) : null;

    return { showToast, ToastComponent };
}

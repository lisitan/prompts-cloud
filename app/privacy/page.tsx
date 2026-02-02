'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PrivacyPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 从 localStorage 读取主题
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Link
            href="/login"
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
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

        {/* 隐私政策内容 */}
        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            隐私政策
          </h1>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
            最后更新日期：2026年2月2日
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                1. 数据收集范围
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                词匣子（以下简称"本应用"）仅收集为提供服务所必需的最少信息：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>您的邮箱地址（用于账户注册和登录）</li>
                <li>您创建的提示词内容（标题、内容、标签）</li>
                <li>基本使用日志（用于服务优化和故障排查）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                2. 数据存储与安全
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                我们采取以下措施保护您的数据安全：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>所有数据传输均使用 HTTPS 加密</li>
                <li>密码使用业界标准的加密算法存储，我们无法查看您的原始密码</li>
                <li>数据存储于安全的云服务器，定期进行安全审计</li>
                <li>仅授权人员可访问系统后台，且受严格的访问控制</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                3. 数据使用承诺
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                我们郑重承诺：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li><strong>不会查看</strong>您的提示词内容，除非为解决技术问题且经您授权</li>
                <li><strong>不会出售</strong>或将您的个人信息分享给第三方用于营销目的</li>
                <li><strong>不会使用</strong>您的内容训练 AI 模型</li>
                <li><strong>不会发送</strong>营销邮件，除非您明确订阅</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                4. 您的权利
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                您随时可以：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li><strong>导出数据</strong>：使用应用内的导出功能下载您的所有提示词</li>
                <li><strong>删除数据</strong>：删除单个提示词或请求删除全部数据</li>
                <li><strong>注销账户</strong>：联系我们注销账户，我们将在 30 天内删除所有相关数据</li>
                <li><strong>访问信息</strong>：请求获取我们持有的关于您的个人信息副本</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                5. Cookie 与本地存储
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                本应用使用浏览器本地存储（localStorage）保存以下信息：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>主题偏好（亮色/暗色模式）</li>
                <li>隐私政策同意状态</li>
                <li>标签展开/收起状态等用户偏好</li>
              </ul>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-3">
                这些数据仅存储在您的设备上，不会上传到服务器。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                6. 政策更新
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                我们可能会不时更新此隐私政策。如有重大变更，我们将通过应用内通知或邮件方式告知您。
                继续使用本应用即表示您同意更新后的政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                7. 联系我们
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                如果您对本隐私政策有任何疑问或需要行使您的数据权利，请通过以下方式联系我们：
              </p>
              <p className="text-neutral-700 dark:text-neutral-300 mt-3">
                邮箱：<a href="mailto:contact@example.com" className="text-primary-600 dark:text-primary-400 hover:underline">contact@example.com</a>
              </p>
            </section>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-8">
          Copyright © 2026 思潭有话说. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

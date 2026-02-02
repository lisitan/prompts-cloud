# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**词匣子** - 一个基于 Next.js 的提示词管理工具，支持云端同步、标签分类、导入导出等功能。

**线上地址**: https://prompt.sitan.top

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **认证**: Supabase Auth
- **数据库**: Vercel KV (Redis)
- **状态管理**: React Query (TanStack Query)
- **部署**: Vercel

## 项目结构

```
app/
├── api/                    # API 路由
│   ├── prompts/           # 提示词 CRUD API
│   ├── tags/              # 标签 API
│   └── import/            # 数据导入 API
├── app/                   # 主应用页面 (需登录)
├── login/                 # 登录/注册页面
├── forgot-password/       # 忘记密码页面
├── reset-password/        # 重置密码页面
├── settings/              # 账户设置页面
├── privacy/               # 隐私政策页面
├── components/            # React 组件
│   ├── Header.tsx         # 顶部导航栏
│   ├── PromptCard.tsx     # 提示词卡片
│   ├── PromptModal.tsx    # 编辑弹窗
│   ├── TagFilter.tsx      # 标签筛选器
│   ├── SearchBar.tsx      # 搜索框
│   ├── ConfirmModal.tsx   # 确认弹窗
│   ├── Toast.tsx          # Toast 提示
│   └── PrivacyConsentModal.tsx  # 隐私同意弹窗
├── hooks/                 # 自定义 Hooks
│   └── usePrompts.ts      # 提示词数据管理
├── lib/                   # 工具库
│   ├── kv.ts             # Vercel KV 数据层
│   └── supabase-*.ts     # Supabase 客户端
├── scripts/               # 实用脚本
│   └── extract_prompts.py # Markdown 提示词提取工具
└── layout.tsx            # 根布局
```

## 数据结构

**Prompt 对象**:
```typescript
interface Prompt {
  id: string;           // UUID
  userId: string;       // 用户 ID
  title: string;        // 标题
  content: string;      // 内容
  tags: string[];       // 标签数组
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}
```

## 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vercel KV
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npx tsc --noEmit

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 主要功能

1. **用户认证**: 邮箱注册/登录、密码修改、忘记密码找回
2. **提示词管理**: 创建、编辑、删除、复制
3. **标签系统**: 标签筛选、置顶标签（右键点击）
4. **搜索功能**: 实时搜索标题和内容
5. **导入/导出**: 支持 JSON 和 Excel 格式
6. **主题切换**: 亮色/暗色模式
7. **账户设置**: 查看账户信息、修改密码、清除缓存

## API 路由

| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/prompts` | GET | 获取用户所有提示词 |
| `/api/prompts` | POST | 创建新提示词 |
| `/api/prompts/[id]` | PUT | 更新提示词 |
| `/api/prompts/[id]` | DELETE | 删除提示词 |
| `/api/tags` | GET | 获取所有标签及使用频率 |
| `/api/tags/pin` | POST | 切换标签置顶状态 |
| `/api/import` | POST | 批量导入提示词 |

## 设计原则

- **Liquid Air 设计语言**: 圆润倒角 (`rounded-2xl`)、毛玻璃效果、流畅动画
- **响应式布局**: 移动端优先，适配各种屏幕尺寸
- **深色模式**: 完整支持暗色主题
- **无障碍**: 语义化 HTML、键盘导航支持

## 注意事项

- 所有 API 路由需要 Supabase 认证
- 数据按用户隔离存储在 Vercel KV
- 忘记密码功能依赖 Supabase 邮件服务
- 标签置顶状态保存在服务端

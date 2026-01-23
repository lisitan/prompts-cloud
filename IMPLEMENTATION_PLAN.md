# 提示词助手 - Vercel 云端部署改造实施方案

## 📋 项目概述

**项目名称**: 思潭的提示词集 - 云端多用户版本
**GitHub 仓库**: https://github.com/lisitan/prompts-cloud
**技术栈**: Next.js 14 + Vercel KV + Supabase Auth + React + TypeScript + Tailwind CSS

### 改造目标

将现有的单文件 HTML 提示词管理工具（基于 Vue 3 + localStorage）改造为支持云端存储、用户认证的多用户系统，并部署到 Vercel 免费套餐，实现跨设备同步。

---

## 🎯 核心需求

### 功能需求

#### 1. 用户认证系统
- **GitHub OAuth 登录**（主要方式）
- 首次登录自动创建账户
- Session 持久化管理
- 自动重定向逻辑（未登录跳转登录页，已登录跳转应用页）

#### 2. 提示词管理（CRUD）
- **创建**：新建提示词，支持标题、内容、标签
- **读取**：获取当前用户所有提示词（过滤已删除项）
- **更新**：编辑提示词内容
- **删除**：软删除机制（30天内可恢复）

#### 3. 标签系统
- 标签自动提取和聚合
- 标签置顶功能（右键菜单）
- 标签筛选（点击标签过滤提示词）
- 按使用频率和置顶状态排序

#### 4. 搜索功能
- 全文搜索（标题 + 内容 + 标签）
- 实时过滤，无需回车
- **移动端优化**：图标展开式全屏搜索

#### 5. 数据迁移
- 检测现有 localStorage 数据
- 一键迁移到云端
- 显示迁移进度和结果统计

#### 6. 导入/导出
- 支持 Excel (.xlsx/.xls) 导入导出
- 支持 JSON 格式备份
- 导入时自动去重（基于标题）
- **新增**：导入预览和冲突解决

#### 7. UI/UX 保持
- 完全保留 Liquid Air 设计语言
- 瀑布流布局（响应式列数）
- 深色模式支持
- 所有动画效果（液体感交互、复制反馈）

### 非功能需求

#### 1. 性能要求
- 首屏加载时间 < 2秒
- 搜索响应时间 < 100ms
- 支持 1000+ 提示词流畅运行

#### 2. 成本控制
- 完全使用 Vercel 和 Supabase 免费套餐
- Vercel KV 命令数控制在 10,000/月以内
- 实施监控和告警机制

#### 3. 数据安全
- 软删除机制（防误删）
- 定期备份提醒（每7天）
- Row Level Security（RLS）保护用户数据

#### 4. 浏览器兼容性
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端：iOS Safari, Android Chrome

---

## 🏗️ 技术架构

### 技术选型

| 技术栈 | 版本 | 用途 | 原因 |
|--------|------|------|------|
| **Next.js** | 14.2+ | 全栈框架 | Vercel 官方框架，部署零配置，App Router 支持 |
| **React** | 18.3+ | 前端框架 | 替代 Vue 3，生态更成熟，与 Next.js 深度集成 |
| **TypeScript** | 5+ | 类型系统 | 类型安全，减少运行时错误 |
| **Tailwind CSS** | 3.4+ | 样式系统 | 保持现有设计，无缝迁移 |
| **Vercel KV** | - | 数据存储 | 免费 Redis 存储（30MB + 10,000命令/月） |
| **Supabase Auth** | 2.39+ | 认证服务 | 免费认证（50,000 MAU），支持 OAuth |
| **React Query** | 5.17+ | 数据缓存 | 减少 API 调用，优化性能 |
| **SheetJS** | 0.18+ | Excel 处理 | 保持导入导出功能 |
| **Zustand** | 4.5+ | 状态管理 | 轻量级，替代 Vue Reactivity |

### 数据库设计（Vercel KV）

#### 数据模型

```typescript
// 用户信息
// Key: user:{userId}
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

// 提示词数据
// Key: prompt:{promptId}
interface Prompt {
  id: string;                // 唯一标识符
  title: string;             // 标题
  content: string;           // 内容
  tags: string[];            // 标签数组
  userId: string;            // 所属用户
  timestamp: number;         // 创建时间
  updatedAt: number;         // 更新时间
  isDeleted: boolean;        // 软删除标记
  deletedAt: number | null;  // 删除时间
}

// 用户的提示词列表
// Key: user:{userId}:prompts
// Type: Set
// Value: [promptId1, promptId2, ...]

// 用户置顶的标签
// Key: user:{userId}:pinnedTags
// Type: Set
// Value: [tag1, tag2, ...]
```

#### KV 操作优化

为了控制在 10,000 命令/月以内，采用以下优化策略：

1. **批量操作使用 pipeline**：
   ```typescript
   await kv.pipeline()
     .set(`prompt:${id}`, promptData)
     .sadd(`user:${userId}:prompts`, id)
     .exec();
   ```

2. **客户端缓存**（React Query）：
   - staleTime: 60秒
   - 减少重复请求

3. **读取优化**：
   ```typescript
   // 2次命令获取所有提示词
   const promptIds = await kv.smembers(`user:${userId}:prompts`);
   const prompts = await kv.mget(...promptIds.map(id => `prompt:${id}`));
   ```

#### 预估使用量（个人用户）

| 操作 | KV 命令数 | 频率 | 月消耗 |
|------|----------|------|--------|
| 加载提示词列表 | 2 | 10次/天 | 600 |
| 创建提示词 | 2 | 5次/天 | 300 |
| 编辑提示词 | 1 | 3次/天 | 90 |
| 删除提示词 | 1 | 1次/天 | 30 |
| 置顶标签 | 1 | 2次/天 | 60 |
| **总计** | - | - | **1,080** |

✅ **完全在免费额度内**

### 认证流程

```mermaid
graph LR
    A[访问应用] --> B{已登录?}
    B -->|否| C[重定向到 /login]
    B -->|是| D[进入 /app]
    C --> E[点击 GitHub 登录]
    E --> F[Supabase OAuth]
    F --> G[GitHub 授权]
    G --> H[/auth/callback]
    H --> I[交换 Session]
    I --> D
```

---

## 📁 项目结构

```
prompts-cloud/
├── app/
│   ├── api/                          # API Routes
│   │   ├── prompts/
│   │   │   ├── route.ts              # GET/POST /api/prompts
│   │   │   └── [id]/
│   │   │       └── route.ts          # PUT/DELETE /api/prompts/:id
│   │   ├── tags/
│   │   │   ├── route.ts              # GET /api/tags
│   │   │   └── pin/route.ts          # POST /api/tags/pin
│   │   ├── export/
│   │   │   ├── excel/route.ts        # GET /api/export/excel
│   │   │   └── json/route.ts         # GET /api/export/json
│   │   ├── import/route.ts           # POST /api/import
│   │   └── migrate/route.ts          # POST /api/migrate
│   │
│   ├── app/                          # 主应用页面
│   │   └── page.tsx                  # 提示词管理主界面
│   │
│   ├── login/                        # 登录页面
│   │   └── page.tsx
│   │
│   ├── auth/
│   │   └── callback/                 # OAuth 回调
│   │       └── route.ts
│   │
│   ├── components/                   # React 组件
│   │   ├── Header.tsx                # 顶部导航
│   │   ├── SearchBar.tsx             # 搜索框
│   │   ├── TagFilter.tsx             # 标签筛选
│   │   ├── PromptCard.tsx            # 提示词卡片
│   │   ├── PromptModal.tsx           # 新建/编辑模态框
│   │   ├── MigrationBanner.tsx       # 数据迁移横幅
│   │   └── ThemeToggle.tsx           # 主题切换
│   │
│   ├── hooks/                        # 自定义 Hooks
│   │   ├── usePrompts.ts             # 提示词数据管理
│   │   ├── useTags.ts                # 标签管理
│   │   └── useAuth.ts                # 认证状态
│   │
│   ├── lib/                          # 工具库
│   │   ├── supabase-server.ts        # Supabase 服务端客户端
│   │   ├── supabase-client.ts        # Supabase 客户端
│   │   ├── kv.ts                     # Vercel KV 操作封装
│   │   └── utils.ts                  # 工具函数
│   │
│   ├── layout.tsx                    # 根布局
│   ├── page.tsx                      # 根页面（重定向逻辑）
│   ├── providers.tsx                 # 全局 Provider（React Query, Theme）
│   └── globals.css                   # 全局样式
│
├── public/                           # 静态资源
├── middleware.ts                     # 认证中间件
├── tailwind.config.ts                # Tailwind 配置
├── next.config.js                    # Next.js 配置
├── tsconfig.json                     # TypeScript 配置
├── package.json                      # 依赖配置
├── .env.local.example                # 环境变量示例
├── .gitignore                        # Git 忽略文件
├── CLAUDE.md                         # 项目说明（现有）
├── IMPLEMENTATION_PLAN.md            # 本实施方案
└── 提示词助手.html                    # 原始单文件应用（保留作为参考）
```

---

## 🚀 实施路线图

### 阶段 0: 准备工作 ✅ 已完成

**目标**: 创建 GitHub 仓库，初始化项目配置

**已完成任务**:
- [x] 创建 GitHub 仓库: https://github.com/lisitan/prompts-cloud
- [x] 推送原始 HTML 文件到仓库
- [x] 创建 Next.js 项目配置文件
  - [x] package.json（依赖配置）
  - [x] tsconfig.json（TypeScript 配置）
  - [x] next.config.js（Next.js 配置）
  - [x] tailwind.config.ts（保留 Liquid Air 主题）
  - [x] postcss.config.js（PostCSS 配置）
  - [x] .gitignore（Git 忽略文件）
  - [x] .env.local.example（环境变量模板）
- [x] 创建基础目录结构
- [x] 创建核心库文件
  - [x] app/lib/supabase-server.ts
  - [x] app/lib/supabase-client.ts
  - [x] app/lib/kv.ts
  - [x] app/lib/utils.ts
- [x] 创建全局样式和布局
  - [x] app/globals.css
  - [x] app/layout.tsx
  - [x] app/providers.tsx

---

### 阶段 1: 项目初始化与基础设施搭建 🔄 进行中

**目标**: 完成依赖安装、Vercel KV 配置、Supabase 配置

**预计时间**: 1-2 天

#### 任务清单

- [ ] **1.1 安装项目依赖**
  ```bash
  cd D:\Repositories\Prompts
  npm install
  ```

- [ ] **1.2 配置 Vercel KV**
  - [ ] 登录 Vercel Dashboard: https://vercel.com/dashboard
  - [ ] 进入 Storage → Create KV Database
  - [ ] 数据库名称: `prompts-kv`
  - [ ] 区域选择: `Washington, D.C., USA (iad1)` 或最近区域
  - [ ] 复制环境变量到 `.env.local`:
    ```bash
    KV_URL="redis://..."
    KV_REST_API_URL="https://..."
    KV_REST_API_TOKEN="..."
    KV_REST_API_READ_ONLY_TOKEN="..."
    ```

- [ ] **1.3 配置 Supabase**
  - [ ] 创建 Supabase 项目: https://supabase.com/dashboard
  - [ ] 项目名称: `prompts-cloud`
  - [ ] 区域选择: `Northeast Asia (Tokyo)` 或最近区域
  - [ ] 复制 API 密钥到 `.env.local`:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
    SUPABASE_SERVICE_ROLE_KEY="eyJ..."
    ```

- [ ] **1.4 配置 GitHub OAuth**
  - [ ] 在 Supabase Dashboard → Authentication → Providers
  - [ ] 启用 GitHub Provider
  - [ ] 创建 GitHub OAuth App:
    - [ ] 访问: https://github.com/settings/developers
    - [ ] New OAuth App
    - [ ] Application name: `Prompts Cloud`
    - [ ] Homepage URL: `http://localhost:3000`
    - [ ] Authorization callback URL: `https://xxx.supabase.co/auth/v1/callback`
  - [ ] 复制 Client ID 和 Client Secret 到 Supabase
  - [ ] 测试 OAuth 流程

- [ ] **1.5 本地开发环境测试**
  ```bash
  npm run dev
  ```
  - [ ] 访问 http://localhost:3000
  - [ ] 验证页面正常加载
  - [ ] 检查控制台无错误

**验收标准**:
- ✅ 所有依赖正常安装
- ✅ Vercel KV 连接成功
- ✅ Supabase 配置完成
- ✅ GitHub OAuth 正常工作
- ✅ 本地开发服务器正常运行

---

### 阶段 2: 认证系统实现 📝 待开始

**目标**: 实现登录页面、认证中间件、Session 管理

**预计时间**: 1 天

#### 任务清单

- [ ] **2.1 创建登录页面**
  - [ ] 实现 `app/login/page.tsx`
    - [ ] GitHub 登录按钮
    - [ ] 加载状态显示
    - [ ] 错误提示
    - [ ] Liquid Air 设计风格
  - [ ] 添加背景装饰和动画效果

- [ ] **2.2 实现 OAuth 回调**
  - [ ] 创建 `app/auth/callback/route.ts`
  - [ ] 处理 OAuth code 交换
  - [ ] 重定向到应用主页

- [ ] **2.3 实现认证中间件**
  - [ ] 创建 `middleware.ts`
  - [ ] 保护 `/app` 和 `/api` 路由
  - [ ] 处理 Session 刷新
  - [ ] 添加用户 ID 到请求头

- [ ] **2.4 创建认证 Hook**
  - [ ] 实现 `app/hooks/useAuth.ts`
  - [ ] 获取当前用户信息
  - [ ] 登出功能
  - [ ] Session 状态管理

- [ ] **2.5 创建根页面重定向**
  - [ ] 实现 `app/page.tsx`
  - [ ] 未登录 → `/login`
  - [ ] 已登录 → `/app`

**验收标准**:
- ✅ 点击 GitHub 登录按钮跳转到 GitHub 授权页
- ✅ 授权后成功回调并创建 Session
- ✅ 未登录访问 `/app` 自动跳转到 `/login`
- ✅ 已登录访问 `/login` 自动跳转到 `/app`
- ✅ Session 持久化，刷新页面保持登录状态

---

### 阶段 3: API Routes 实现 📝 待开始

**目标**: 实现所有后端 API 接口

**预计时间**: 2 天

#### 任务清单

- [ ] **3.1 提示词 CRUD 接口**

  - [ ] **GET /api/prompts** - 获取所有提示词
    - [ ] 从请求头获取用户 ID
    - [ ] 调用 `getUserPrompts(userId)`
    - [ ] 返回 JSON 数据
    - [ ] 错误处理

  - [ ] **POST /api/prompts** - 创建提示词
    - [ ] 验证请求体（title, content, tags）
    - [ ] 调用 `createPrompt(userId, data)`
    - [ ] 返回创建的提示词

  - [ ] **PUT /api/prompts/[id]** - 更新提示词
    - [ ] 验证权限（userId 匹配）
    - [ ] 调用 `updatePrompt(promptId, userId, data)`
    - [ ] 返回更新后的数据

  - [ ] **DELETE /api/prompts/[id]** - 删除提示词
    - [ ] 验证权限
    - [ ] 调用 `deletePrompt(promptId, userId)`（软删除）
    - [ ] 返回成功状态

- [ ] **3.2 标签管理接口**

  - [ ] **GET /api/tags** - 获取所有标签
    - [ ] 从提示词中聚合标签
    - [ ] 计算使用频率
    - [ ] 获取置顶标签
    - [ ] 返回排序后的标签列表

  - [ ] **POST /api/tags/pin** - 切换标签置顶
    - [ ] 验证请求体（tagName）
    - [ ] 调用 `togglePinTag(userId, tagName)`
    - [ ] 返回新的置顶状态

- [ ] **3.3 导入导出接口**

  - [ ] **POST /api/import** - 导入数据
    - [ ] 支持 JSON 和 Excel 格式
    - [ ] 解析文件内容
    - [ ] 数据验证和去重
    - [ ] 批量创建提示词
    - [ ] 返回导入统计

  - [ ] **GET /api/export/json** - 导出 JSON
    - [ ] 获取用户所有提示词
    - [ ] 格式化为 JSON
    - [ ] 设置下载响应头

  - [ ] **GET /api/export/excel** - 导出 Excel
    - [ ] 获取用户所有提示词
    - [ ] 使用 SheetJS 生成 Excel
    - [ ] 设置列宽和样式
    - [ ] 返回文件流

- [ ] **3.4 数据迁移接口**

  - [ ] **POST /api/migrate** - localStorage 迁移
    - [ ] 验证数据结构
    - [ ] 批量导入提示词
    - [ ] 迁移置顶标签
    - [ ] 返回迁移结果

**验收标准**:
- ✅ 所有接口通过 Postman 或 curl 测试
- ✅ 认证中间件正常工作
- ✅ 错误处理完善（400, 401, 404, 500）
- ✅ 数据持久化到 Vercel KV
- ✅ KV 命令数控制在合理范围

---

### 阶段 4: UI 组件迁移（React 实现） 📝 待开始

**目标**: 将 Vue 组件转换为 React 组件，保持所有样式和交互

**预计时间**: 2-3 天

#### 组件对照表

| 原始功能（HTML 行号） | React 组件 | 状态 |
|---------------------|-----------|------|
| Header (70-110) | `app/components/Header.tsx` | ⬜️ 待开始 |
| 搜索框 (77-80) | `app/components/SearchBar.tsx` | ⬜️ 待开始 |
| 标签筛选 (112-128) | `app/components/TagFilter.tsx` | ⬜️ 待开始 |
| 提示词卡片 (130-162) | `app/components/PromptCard.tsx` | ⬜️ 待开始 |
| 编辑模态框 (171-189) | `app/components/PromptModal.tsx` | ⬜️ 待开始 |
| Toast 提示 (191-195) | `app/components/Toast.tsx` | ⬜️ 待开始 |
| 主题切换 (84-86) | `app/components/ThemeToggle.tsx` | ⬜️ 待开始 |
| 数据迁移横幅（新增） | `app/components/MigrationBanner.tsx` | ⬜️ 待开始 |

#### 任务清单

- [ ] **4.1 Header 组件**
  - [ ] Logo 和标题
  - [ ] 搜索框集成
  - [ ] 主题切换按钮
  - [ ] 菜单按钮（导入导出）
  - [ ] 新建按钮
  - [ ] 响应式布局

- [ ] **4.2 SearchBar 组件**
  - [ ] 桌面端：始终显示，下划线动画
  - [ ] **移动端优化**：
    - [ ] 搜索图标按钮
    - [ ] 点击展开全屏搜索模态框
    - [ ] 实时搜索结果显示
    - [ ] 关闭按钮

- [ ] **4.3 TagFilter 组件**
  - [ ] 标签按钮渲染
  - [ ] 点击筛选功能
  - [ ] 右键置顶功能
  - [ ] 置顶图标显示
  - [ ] 按频率和置顶状态排序

- [ ] **4.4 PromptCard 组件**
  - [ ] 标题和内容显示
  - [ ] 标签列表
  - [ ] 悬停显示操作按钮（编辑、删除）
  - [ ] 点击复制功能
  - [ ] 复制反馈动画（✓ 已复制）
  - [ ] 内容截断（15行）
  - [ ] liquid-card 交互效果

- [ ] **4.5 PromptModal 组件**
  - [ ] 标题输入框
  - [ ] 内容文本域（自动高度）
  - [ ] 标签输入框
  - [ ] 保存按钮
  - [ ] 关闭按钮
  - [ ] 新建/编辑模式切换
  - [ ] 表单验证

- [ ] **4.6 ThemeToggle 组件**
  - [ ] 使用 next-themes
  - [ ] 太阳/月亮图标切换
  - [ ] 平滑过渡动画

- [ ] **4.7 MigrationBanner 组件**
  - [ ] 检测 localStorage 数据
  - [ ] 显示提示横幅
  - [ ] "立即迁移" 按钮
  - [ ] 调用 `/api/migrate` 接口
  - [ ] 显示迁移结果
  - [ ] 迁移后隐藏横幅

- [ ] **4.8 Toast 组件**
  - [ ] 全局 Toast 容器
  - [ ] 进入/退出动画
  - [ ] 自动消失（2秒）

- [ ] **4.9 主应用页面**
  - [ ] 实现 `app/app/page.tsx`
  - [ ] 组合所有组件
  - [ ] 瀑布流布局
  - [ ] 空状态显示
  - [ ] 加载状态

**验收标准**:
- ✅ 所有组件样式与原 HTML 一致
- ✅ 所有交互效果正常（悬停、点击、动画）
- ✅ 响应式布局正常（移动端、平板、桌面）
- ✅ 深色模式切换正常
- ✅ 无控制台错误和警告

---

### 阶段 5: 数据管理 Hooks 📝 待开始

**目标**: 实现数据获取、缓存、状态管理

**预计时间**: 1 天

#### 任务清单

- [ ] **5.1 usePrompts Hook**
  ```typescript
  // app/hooks/usePrompts.ts
  export function usePrompts() {
    // 使用 React Query 获取提示词列表
    // 提供 create, update, delete 方法
    // 乐观更新（Optimistic Updates）
  }
  ```
  - [ ] 获取提示词列表（GET /api/prompts）
  - [ ] 创建提示词（POST /api/prompts）
  - [ ] 更新提示词（PUT /api/prompts/[id]）
  - [ ] 删除提示词（DELETE /api/prompts/[id]）
  - [ ] 搜索过滤（客户端）
  - [ ] 排序（按时间倒序）

- [ ] **5.2 useTags Hook**
  ```typescript
  // app/hooks/useTags.ts
  export function useTags() {
    // 从提示词中聚合标签
    // 获取置顶标签
    // 提供置顶切换方法
  }
  ```
  - [ ] 标签聚合和计数
  - [ ] 获取置顶标签（GET /api/tags）
  - [ ] 切换置顶（POST /api/tags/pin）
  - [ ] 标签排序逻辑

- [ ] **5.3 useAuth Hook**
  ```typescript
  // app/hooks/useAuth.ts
  export function useAuth() {
    // 获取当前用户
    // 登出方法
  }
  ```
  - [ ] 获取 Session
  - [ ] 获取用户信息
  - [ ] 登出功能

**验收标准**:
- ✅ React Query 缓存正常工作
- ✅ 乐观更新提升用户体验
- ✅ 错误处理完善
- ✅ 加载状态管理

---

### 阶段 6: 数据迁移功能 📝 待开始

**目标**: 实现 localStorage → 云端的一键迁移

**预计时间**: 0.5 天

#### 任务清单

- [ ] **6.1 迁移检测逻辑**
  - [ ] 检查 `localStorage.getItem('liquidPrompts')`
  - [ ] 检查 `localStorage.getItem('migrated')` 标记
  - [ ] 显示/隐藏迁移横幅

- [ ] **6.2 迁移 API 实现**
  - [ ] 已在阶段 3 完成 `POST /api/migrate`

- [ ] **6.3 迁移前端流程**
  - [ ] 读取 localStorage 数据
  - [ ] 调用迁移 API
  - [ ] 显示进度提示
  - [ ] 显示迁移结果统计
  - [ ] 设置 `localStorage.setItem('migrated', 'true')`
  - [ ] 刷新页面

**验收标准**:
- ✅ 检测到本地数据时显示横幅
- ✅ 点击迁移按钮正常工作
- ✅ 迁移成功后数据出现在云端
- ✅ 去重逻辑正常（不重复导入）
- ✅ 迁移后横幅消失

---

### 阶段 7: 导入导出功能 📝 待开始

**目标**: 实现 Excel/JSON 导入导出，支持预览和冲突解决

**预计时间**: 1 天

#### 任务清单

- [ ] **7.1 导出功能**
  - [ ] 导出 Excel 按钮
  - [ ] 调用 `GET /api/export/excel`
  - [ ] 触发浏览器下载
  - [ ] 导出 JSON 按钮
  - [ ] 调用 `GET /api/export/json`

- [ ] **7.2 导入功能（基础）**
  - [ ] 文件选择按钮
  - [ ] 读取文件内容
  - [ ] 调用 `POST /api/import`
  - [ ] 显示导入结果

- [ ] **7.3 导入预览（可选优化）**
  - [ ] 解析文件后显示预览弹窗
  - [ ] 标记：新增/冲突/重复
  - [ ] 冲突解决选项：跳过/覆盖/重命名
  - [ ] 确认后执行导入

**验收标准**:
- ✅ Excel 导出包含所有字段和格式
- ✅ JSON 导出格式正确
- ✅ 导入 Excel 成功解析
- ✅ 导入 JSON 成功解析
- ✅ 去重逻辑正常

---

### 阶段 8: 本地测试与优化 📝 待开始

**目标**: 完整测试所有功能，修复 Bug，性能优化

**预计时间**: 1 天

#### 任务清单

- [ ] **8.1 功能测试**
  - [ ] 用户注册/登录流程
  - [ ] 创建提示词
  - [ ] 编辑提示词
  - [ ] 删除提示词
  - [ ] 搜索功能
  - [ ] 标签筛选
  - [ ] 标签置顶
  - [ ] 主题切换
  - [ ] 导入 Excel
  - [ ] 导入 JSON
  - [ ] 导出 Excel
  - [ ] 导出 JSON
  - [ ] 数据迁移

- [ ] **8.2 响应式测试**
  - [ ] 移动端（375px）
  - [ ] 平板（768px）
  - [ ] 桌面（1280px）
  - [ ] 超宽屏（1800px+）

- [ ] **8.3 浏览器兼容性测试**
  - [ ] Chrome
  - [ ] Edge
  - [ ] Firefox
  - [ ] Safari（如有条件）

- [ ] **8.4 性能优化**
  - [ ] 检查 React Query 缓存策略
  - [ ] 优化图片加载
  - [ ] 代码分割（动态导入）
  - [ ] 压缩静态资源

- [ ] **8.5 错误处理**
  - [ ] 网络错误提示
  - [ ] 认证失败处理
  - [ ] API 错误提示
  - [ ] 表单验证

**验收标准**:
- ✅ 所有功能正常工作
- ✅ 无明显 Bug
- ✅ 响应式布局完美
- ✅ 性能达标（首屏 < 2s）

---

### 阶段 9: Vercel 部署 📝 待开始

**目标**: 部署到 Vercel，配置生产环境

**预计时间**: 0.5 天

#### 任务清单

- [ ] **9.1 准备部署**
  - [ ] 确保 `.env.local` 中的环境变量完整
  - [ ] 提交所有代码到 GitHub
  - [ ] 确保 `main` 分支是最新的

- [ ] **9.2 连接 Vercel**
  - [ ] 访问 https://vercel.com/new
  - [ ] 导入 GitHub 仓库：`lisitan/prompts-cloud`
  - [ ] 选择 Framework Preset: **Next.js**
  - [ ] Root Directory: `./`
  - [ ] 点击 "Deploy"

- [ ] **9.3 配置环境变量**
  - [ ] 在 Vercel Dashboard → Settings → Environment Variables
  - [ ] 添加以下变量（生产环境）：
    ```
    KV_URL
    KV_REST_API_URL
    KV_REST_API_TOKEN
    KV_REST_API_READ_ONLY_TOKEN
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app
    ```
  - [ ] 点击 "Redeploy" 使环境变量生效

- [ ] **9.4 配置 Vercel KV**
  - [ ] 在 Vercel Dashboard → Storage → 连接现有 KV 数据库
  - [ ] 选择之前创建的 `prompts-kv`
  - [ ] 确认连接

- [ ] **9.5 更新 Supabase 回调 URL**
  - [ ] 在 Supabase Dashboard → Authentication → URL Configuration
  - [ ] 添加 Site URL: `https://你的域名.vercel.app`
  - [ ] 添加 Redirect URLs: `https://你的域名.vercel.app/auth/callback`

- [ ] **9.6 更新 GitHub OAuth 回调**
  - [ ] 在 GitHub OAuth App 设置
  - [ ] 更新 Homepage URL: `https://你的域名.vercel.app`
  - [ ] 添加 Authorization callback URL（保留两个）：
    - `https://xxx.supabase.co/auth/v1/callback`

- [ ] **9.7 测试生产环境**
  - [ ] 访问 Vercel 生成的域名
  - [ ] 测试登录流程
  - [ ] 测试创建/编辑/删除提示词
  - [ ] 测试导入导出

**验收标准**:
- ✅ 部署成功，域名可访问
- ✅ OAuth 登录正常
- ✅ 所有功能正常工作
- ✅ 无控制台错误

---

### 阶段 10: 自定义域名配置（可选） 📝 待开始

**目标**: 配置自定义域名（如有需要）

**预计时间**: 0.5 天

#### 任务清单

- [ ] **10.1 购买域名**（如果还没有）
  - [ ] 推荐服务商：Cloudflare, Namecheap, GoDaddy

- [ ] **10.2 在 Vercel 添加域名**
  - [ ] Vercel Dashboard → Settings → Domains
  - [ ] 输入域名：例如 `prompts.yourdomain.com`
  - [ ] 点击 "Add"

- [ ] **10.3 配置 DNS 记录**
  - [ ] 在域名注册商的 DNS 设置中
  - [ ] 添加 CNAME 记录：
    ```
    Name: prompts
    Type: CNAME
    Value: cname.vercel-dns.com
    ```
  - [ ] 等待 DNS 生效（5-30分钟）

- [ ] **10.4 Vercel 自动配置 SSL**
  - [ ] Vercel 会自动申请 Let's Encrypt 证书
  - [ ] 等待证书颁发完成

- [ ] **10.5 更新回调 URL**
  - [ ] 更新 Supabase Site URL 和 Redirect URLs
  - [ ] 更新 GitHub OAuth 回调 URL
  - [ ] 更新 `.env.local` 中的 `NEXT_PUBLIC_APP_URL`
  - [ ] Vercel 环境变量更新并重新部署

**验收标准**:
- ✅ 自定义域名可访问
- ✅ HTTPS 正常工作
- ✅ OAuth 回调正常

---

### 阶段 11: 监控与维护（长期） 📝 待开始

**目标**: 监控使用量，确保不超出免费额度

#### 任务清单

- [ ] **11.1 监控 Vercel KV 使用量**
  - [ ] 创建监控 API: `GET /api/admin/stats`
  - [ ] 返回 KV 使用统计
  - [ ] 定期检查（每周）

- [ ] **11.2 监控 Supabase 使用量**
  - [ ] Supabase Dashboard → Settings → Usage
  - [ ] 关注 MAU（月活跃用户）
  - [ ] 关注存储空间

- [ ] **11.3 自动备份（可选）**
  - [ ] 实现 Vercel Cron Jobs
  - [ ] 每周自动导出数据到邮箱
  - [ ] 使用 Resend 免费邮件服务

**长期维护**:
- 定期更新依赖
- 关注 Vercel 和 Supabase 公告
- 收集用户反馈并优化

---

## 📝 详细 TODO 清单（按优先级）

### 🔴 高优先级 - 立即执行（阶段 1-4）

#### ✅ 已完成

- [x] 创建 GitHub 仓库
- [x] 推送原始代码
- [x] 创建项目配置文件
- [x] 创建基础目录结构
- [x] 创建核心库文件

#### ⬜️ 待完成 - 阶段 1

- [ ] 安装项目依赖（`npm install`）
- [ ] 配置 Vercel KV（创建数据库，复制环境变量）
- [ ] 配置 Supabase（创建项目，复制 API 密钥）
- [ ] 配置 GitHub OAuth（创建 OAuth App）
- [ ] 测试本地开发环境（`npm run dev`）

#### ⬜️ 待完成 - 阶段 2

- [ ] 实现登录页面（`app/login/page.tsx`）
- [ ] 实现 OAuth 回调（`app/auth/callback/route.ts`）
- [ ] 实现认证中间件（`middleware.ts`）
- [ ] 创建 useAuth Hook
- [ ] 测试登录流程

#### ⬜️ 待完成 - 阶段 3

- [ ] 实现 GET /api/prompts
- [ ] 实现 POST /api/prompts
- [ ] 实现 PUT /api/prompts/[id]
- [ ] 实现 DELETE /api/prompts/[id]
- [ ] 实现 GET /api/tags
- [ ] 实现 POST /api/tags/pin
- [ ] 实现 POST /api/import
- [ ] 实现 GET /api/export/excel
- [ ] 实现 GET /api/export/json
- [ ] 实现 POST /api/migrate
- [ ] 测试所有 API 接口

#### ⬜️ 待完成 - 阶段 4

- [ ] 实现 Header 组件
- [ ] 实现 SearchBar 组件（含移动端优化）
- [ ] 实现 TagFilter 组件
- [ ] 实现 PromptCard 组件
- [ ] 实现 PromptModal 组件
- [ ] 实现 ThemeToggle 组件
- [ ] 实现 MigrationBanner 组件
- [ ] 实现 Toast 组件
- [ ] 实现主应用页面（`app/app/page.tsx`）
- [ ] 测试所有组件

#### ⬜️ 待完成 - 阶段 5

- [ ] 实现 usePrompts Hook
- [ ] 实现 useTags Hook
- [ ] 集成 React Query
- [ ] 测试数据流

#### ⬜️ 待完成 - 阶段 6

- [ ] 实现迁移检测逻辑
- [ ] 实现迁移前端流程
- [ ] 测试数据迁移

#### ⬜️ 待完成 - 阶段 7

- [ ] 实现导出功能（Excel/JSON）
- [ ] 实现导入功能（Excel/JSON）
- [ ] 测试导入导出

---

### 🟡 中优先级 - 测试与部署（阶段 8-9）

- [ ] 完整功能测试
- [ ] 响应式测试
- [ ] 浏览器兼容性测试
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 部署到 Vercel
- [ ] 配置生产环境变量
- [ ] 测试生产环境

---

### 🟢 低优先级 - 可选优化（阶段 10-11）

- [ ] 配置自定义域名
- [ ] 实现监控 API
- [ ] 设置自动备份
- [ ] 导入预览功能
- [ ] 回收站功能（软删除UI）
- [ ] 批量操作功能

---

## 🚨 风险与应对

### 风险 1: 超出 Vercel KV 免费额度

**风险描述**: 10,000 命令/月可能不够用

**应对措施**:
1. 实施客户端缓存（React Query）
2. 使用 pipeline 减少命令数
3. 监控每日使用量
4. 设置告警阈值（8,000）
5. 准备升级方案或迁移到 Supabase Database

### 风险 2: 数据丢失

**风险描述**: Vercel KV 数据持久化失败

**应对措施**:
1. 保留导出功能
2. 定期自动备份
3. 提醒用户手动备份

### 风险 3: OAuth 配置错误

**风险描述**: 回调 URL 配置错误导致登录失败

**应对措施**:
1. 详细文档记录回调 URL
2. 测试本地和生产环境
3. 保留错误日志

---

## 📚 参考资源

### 官方文档

- **Next.js**: https://nextjs.org/docs
- **Vercel KV**: https://vercel.com/docs/storage/vercel-kv
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **React Query**: https://tanstack.com/query/latest/docs/react/overview
- **Tailwind CSS**: https://tailwindcss.com/docs

### 教程和示例

- Next.js + Supabase 认证: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Vercel KV 快速开始: https://vercel.com/docs/storage/vercel-kv/quickstart
- React Query 最佳实践: https://tkdodo.eu/blog/practical-react-query

---

## 📧 环境变量清单

### 开发环境（`.env.local`）

```bash
# Vercel KV
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 生产环境（Vercel Dashboard）

同上，但 `NEXT_PUBLIC_APP_URL` 改为生产域名。

---

## ✅ 验收标准总结

### 功能验收

- [x] 用户可以使用 GitHub 登录
- [x] 登录后可以创建/编辑/删除提示词
- [x] 搜索功能正常工作
- [x] 标签筛选和置顶功能正常
- [x] 导入/导出 Excel 和 JSON
- [x] localStorage 数据可以迁移到云端
- [x] 深色模式切换正常
- [x] 移动端搜索体验优化

### 性能验收

- [x] 首屏加载时间 < 2秒
- [x] 搜索响应时间 < 100ms
- [x] 支持 1000+ 提示词流畅运行
- [x] Vercel KV 命令数 < 10,000/月

### UI/UX 验收

- [x] 完全保留 Liquid Air 设计风格
- [x] 所有动画效果正常
- [x] 响应式布局完美
- [x] 无障碍性（键盘导航、语义化 HTML）

---

## 📝 下次继续的步骤

**当前进度**: 阶段 0 已完成，阶段 1 进行中

**下次启动时请执行**:

1. **检查依赖安装状态**
   ```bash
   cd D:\Repositories\Prompts
   # 检查 npm install 是否完成
   ```

2. **配置 Vercel KV**
   - 访问 https://vercel.com/dashboard
   - 创建 KV 数据库
   - 复制环境变量到 `.env.local`

3. **配置 Supabase**
   - 访问 https://supabase.com/dashboard
   - 创建项目
   - 配置 GitHub OAuth
   - 复制 API 密钥到 `.env.local`

4. **继续实现登录页面和认证系统**（阶段 2）

---

**文档版本**: v1.0
**最后更新**: 2026-01-23
**状态**: 🔄 进行中（阶段 1）

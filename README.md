# 词匣子

> 收集整理你的AI提示词

一个简单优雅的提示词管理工具，采用 Liquid Air 设计语言，支持云端同步与多端适配。

## ✨ 特性

- 🎨 **Liquid Air 设计** - 圆润倒角，深邃黑色，自然交互
- 🌓 **深色模式** - 自动适配系统主题偏好
- 🏷️ **智能标签** - 右键置顶，频率排序，快速筛选
- 📥 **双向导入导出** - 支持 Excel (.xlsx), JSON 以及 Markdown 提取
- ☁️ **云端同步** - 基于 Supabase + Vercel KV，数据多端实时同步
- 📱 **响应式布局** - 瀑布流设计，完美适配移动端
- ⚡ **一键复制** - 点击卡片即可复制提示词内容

## 🚀 快速开始

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/lisitan/prompts.git

# 进入目录
cd prompts

# 安装依赖
npm install

# 配置环境变量 (参照 .env.local.example)
cp .env.local.example .env.local

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:3000` 即可看到应用。

### 部署

本项目专为 Vercel 部署优化：

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. 配置 Supabase 和 KV 环境变量
4. 点击部署

## 📖 使用指南

### 基础操作

- **新建提示词**：点击右上角「新建」按钮
- **编辑提示词**：悬停卡片，点击铅笔图标
- **删除提示词**：悬停卡片，点击垃圾桶图标
- **复制内容**：直接点击卡片即可复制提示词内容
- **搜索**：顶部搜索框支持搜索标题、内容和标签

### 标签管理

- **筛选标签**：点击标签即可筛选相关提示词
- **置顶标签**：右键点击标签可置顶/取消置顶
- **标签排序**：置顶标签在前，其余按使用频率排序

### 数据管理

#### 导出数据

- **导出 Excel**：点击菜单 → 导出 Excel（适合分享和备份）
- **备份 JSON**：点击菜单 → 备份 JSON（适合开发者）

#### 导入数据

点击菜单 → 导入 Excel/JSON，支持：

**Markdown 提取工具**：
我们提供了一个 Python 脚本，可以将 Markdown 文件中的提示词提取为可导入的 JSON 格式：
```bash
# 运行提取脚本
python scripts/extract_prompts.py
```
这会生成 `prompts_import.json` 文件，可以直接导入。

**Excel 格式**：
- 必需列：`标题/Title`、`内容/Content`
- 可选列：`标签/Tags`（用逗号分隔）

**JSON 格式**：
```json
[
  {
    "title": "提示词标题",
    "content": "提示词内容",
    "tags": ["标签1", "标签2"]
  }
]
```

导入时会自动去重（基于标题），不会覆盖现有数据。

## 🎨 设计哲学

**Liquid Air** 设计语言的核心理念：

- **更圆润的倒角**：使用 `rounded-[2rem]` 营造柔和的视觉体验
- **更深的黑色**：精心调教的 zinc 灰阶，暗色模式下更加优雅
- **更自然的交互**：触摸友好的按压反馈，流畅的动画过渡

## 🛠️ 技术栈

- **框架**：Next.js 14 + TypeScript
- **数据库**：Supabase (PostgreSQL)
- **缓存**：Vercel KV (Redis)
- **认证**：Supabase Auth (GitHub OAuth)
- **样式**：Tailwind CSS
- **组件库**：Headless UI
- **工具**：SheetJS (Excel 处理)

## 📁 项目结构

```
prompts/
├── app/                      # Next.js 应用源码
├── scripts/                  # 实用脚本
│   └── extract_prompts.py    # Markdown 提示词提取工具
├── CLAUDE.md                 # AI 助手项目文档
├── IMPLEMENTATION_PLAN.md    # 开发计划
└── PROGRESS.md               # 开发进度
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Phosphor Icons](https://phosphoricons.com/)

---

**词匣子** - 让提示词管理变得简单优雅 ✨

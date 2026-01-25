# 词匣子

> 收集整理你的AI提示词

一个简单优雅的提示词管理工具，采用 Liquid Air 设计语言，支持本地和云端双模式。

## ✨ 特性

- 🎨 **Liquid Air 设计** - 圆润倒角，深邃黑色，自然交互
- 🌓 **深色模式** - 自动适配系统主题偏好
- 🏷️ **智能标签** - 右键置顶，频率排序，快速筛选
- 📥 **双向导入导出** - 支持 Excel (.xlsx) 和 JSON 格式
- 💾 **本地优先** - 单文件 HTML，离线可用，数据存储在本地
- 📱 **响应式布局** - 瀑布流设计，完美适配移动端
- ⚡ **一键复制** - 点击卡片即可复制提示词内容

## 🚀 快速开始

### 单文件版本（推荐）

直接下载 `prompt-box.html` 在浏览器中打开即可使用：

```bash
# 克隆仓库
git clone https://github.com/lisitan/prompts.git

# 打开文件
cd prompts
open prompt-box.html  # macOS
start prompt-box.html # Windows
```

无需安装任何依赖，数据保存在浏览器 localStorage 中。

### 云端版本（开发中）

基于 Next.js + Supabase + Vercel KV 的多用户云端版本正在开发中，敬请期待。

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

### 单文件版本

- **前端框架**：Vue 3 (CDN)
- **样式系统**：Tailwind CSS (CDN)
- **图标库**：Phosphor Icons
- **Excel 处理**：SheetJS
- **字体**：LXGW WenKai Screen（霞鹜文楷）

### 云端版本（开发中）

- **框架**：Next.js 14 + TypeScript
- **数据库**：Supabase (PostgreSQL)
- **缓存**：Vercel KV (Redis)
- **认证**：Supabase Auth (GitHub OAuth)
- **部署**：Vercel

## 📁 项目结构

```
prompts/
├── prompt-box.html           # 单文件应用（生产可用）
├── app/                      # Next.js 云端版本（开发中）
├── CLAUDE.md                 # AI 助手项目文档
├── IMPLEMENTATION_PLAN.md    # 云端版本实施计划
└── PROGRESS.md               # 开发进度快照
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Phosphor Icons](https://phosphoricons.com/) - 灵活的图标库
- [SheetJS](https://sheetjs.com/) - 强大的电子表格工具
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) - 开源中文字体

---

**词匣子** - 让提示词管理变得简单优雅 ✨

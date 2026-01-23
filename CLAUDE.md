# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个单文件的提示词管理工具应用,名为"思潭的提示词集 | Liquid Air"。整个应用打包在一个 HTML 文件中(`提示词助手.html`),可以直接在浏览器中打开使用,无需构建步骤。

## 技术栈

- **前端框架**: Vue 3 (通过 CDN: `unpkg.com/vue@3/dist/vue.global.js`)
- **样式系统**: Tailwind CSS (通过 CDN: `cdn.tailwindcss.com`)
- **图标库**: Phosphor Icons (`unpkg.com/@phosphor-icons/web`)
- **Excel 处理**: SheetJS (`cdn.sheetjs.com/xlsx-0.19.3`)
- **字体**: LXGW WenKai Screen (霞鹜文楷屏幕阅读版)

## 核心架构

### 数据结构

**Prompt 对象**:
```javascript
{
  id: Number,           // 唯一标识符 (timestamp)
  title: String,        // 提示词标题
  content: String,      // 提示词内容
  tags: Array<String>,  // 标签数组
  timestamp: Number     // 创建/更新时间戳
}
```

### 数据持久化

- 使用 `localStorage` 存储数据
- `liquidPrompts`: 存储所有提示词数据
- `liquidPinnedTags`: 存储置顶标签列表

### 关键功能模块

1. **标签系统**
   - 标签按使用频率和置顶状态排序
   - 右键点击标签可置顶/取消置顶
   - 点击标签即可筛选相关提示词

2. **搜索功能**
   - 支持搜索标题、内容和标签
   - 实时过滤,无需按回车

3. **导入/导出**
   - 支持 Excel (.xlsx, .xls) 和 JSON 格式
   - Excel 列映射: `标题/Title`, `内容/Content`, `标签/Tags`
   - 导入时自动去重(基于标题)

4. **主题切换**
   - 支持亮色/暗色模式
   - 自动适配系统偏好
   - 状态保存在 `localStorage.theme`

5. **瀑布流布局**
   - 响应式列数: 移动端 1 列, 平板 2 列, 桌面 3 列, 超宽屏 4 列
   - 使用 CSS `column-count` 实现

## 开发指南

### 文件结构

整个应用是单文件架构:
- HTML 结构 (第 66-197 行)
- Vue 应用逻辑 (第 199-365 行)
- 内联样式配置 (第 14-64 行, 第 367-370 行)

### 修改常见元素

**修改颜色方案**:
- Tailwind 配置在第 15-36 行
- 自定义 zinc 灰阶色板在第 22 行

**修改响应式断点**:
- 瀑布流列数配置在第 44-47 行

**修改动画效果**:
- 主要动画在第 28-33 行定义
- 液体感交互效果在第 57-63 行

### Vue 计算属性

- `filteredPrompts`: 根据 `searchQuery` 过滤提示词
- `sortedTags`: 按置顶状态和使用频率排序标签

### 关键方法

- `loadFromStorage()` / `saveToStorage()`: 数据持久化
- `importJSON()` / `importExcel()`: 数据导入
- `exportJSON()` / `exportXLSX()`: 数据导出
- `mergeData()`: 导入时的数据合并逻辑(去重)
- `copyToClipboard()`: 复制提示词内容

## 测试和调试

由于是纯前端应用,在浏览器中打开即可测试:

```bash
# 在默认浏览器中打开
start 提示词助手.html  # Windows
open 提示词助手.html   # macOS
xdg-open 提示词助手.html  # Linux
```

**检查 localStorage 数据**:
```javascript
// 在浏览器控制台执行
JSON.parse(localStorage.getItem('liquidPrompts'))
JSON.parse(localStorage.getItem('liquidPinnedTags'))
```

## 设计原则

- **Liquid Air 设计语言**: 更圆润的倒角 (`rounded-[2rem]`), 更深的黑色, 更自然的交互
- **触摸友好**: 所有交互元素有明显的按压反馈 (`.btn-press`, `.liquid-card`)
- **无障碍**: 支持键盘导航,语义化 HTML 结构
- **性能优化**: 使用 CSS transitions 而非 JavaScript 动画

## 注意事项

- 所有 CDN 资源需要网络连接才能加载
- localStorage 有 5-10MB 容量限制
- 导入 Excel 时会自动处理中英文列名映射
- 标签分隔符支持: 逗号 `,`、中文逗号 `，`、顿号 `、`

# @schema-component/storybook

Storybook 文档和组件展示平台，为 Schema Component 项目提供交互式文档和示例。

## 功能特性

- 📖 **完整文档**: 包含所有 packages 的详细文档
- 🎨 **组件展示**: 交互式组件演示
- 💡 **使用示例**: 实际应用场景的示例代码
- 🧪 **开发环境**: 组件隔离开发和调试
- ✅ **测试平台**: 支持交互测试和视觉回归测试
- 🌗 **主题切换**: 支持亮色/暗色主题

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动 Storybook

```bash
# 在项目根目录
pnpm --filter storybook storybook

# 或者在当前目录
pnpm storybook
```

Storybook 将在 http://localhost:6006 启动。

### 构建静态站点

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

### 预览构建结果

```bash
pnpm serve
```

## 文件结构

```
packages/storybook/
├── .storybook/          # Storybook 配置
│   ├── main.ts          # 主配置
│   ├── preview.ts       # 预览配置
│   └── manager.ts       # 管理界面配置
│
├── stories/             # Story 文件
│   ├── Introduction.mdx
│   ├── GettingStarted.mdx
│   ├── schema/          # Schema Stories
│   ├── engine/          # Engine Stories
│   ├── theme/           # Theme Stories
│   └── examples/        # 综合示例
│
├── docs/                # 文档
│   ├── guides/          # 使用指南
│   ├── api/             # API 文档
│   └── tutorials/       # 教程
│
├── src/                 # 辅助组件
│   ├── components/      # 文档专用组件
│   ├── decorators/      # Story 装饰器
│   └── utils/           # 工具函数
│
└── public/              # 静态资源
```

## 编写 Story

### MDX 文档

```mdx
import { Meta } from '@storybook/blocks'

<Meta title="Your/Title" />

# Your Documentation

Your content here...
```

### TypeScript Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { YourComponent } from './YourComponent'

const meta: Meta<typeof YourComponent> = {
  title: 'Category/YourComponent',
  component: YourComponent,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof YourComponent>

export const Primary: Story = {
  args: {
    // your props
  }
}
```

## 插件配置

已安装的插件：

- `@storybook/addon-essentials` - 必备插件集合
- `@storybook/addon-interactions` - 交互测试
- `@storybook/addon-links` - Story 链接
- `@storybook/addon-a11y` - 无障碍检查
- `@storybook/addon-themes` - 主题切换
- `storybook-dark-mode` - 暗黑模式
- `@storybook/addon-storysource` - 源码展示

## 部署

### Vercel

```bash
# 构建
pnpm build

# 部署（需要 Vercel CLI）
vercel --prod
```

### Netlify

```bash
# 构建
pnpm build

# 部署到 dist 目录
netlify deploy --prod --dir=dist
```

### GitHub Pages

参考 `.github/workflows/deploy-storybook.yml`（需要创建）。

## 开发指南

### 添加新 Story

1. 在对应的目录下创建 `.stories.tsx` 或 `.mdx` 文件
2. 遵循命名约定：`ComponentName.stories.tsx`
3. 添加适当的分类和标签
4. 提供完整的文档和示例

### 添加新文档

1. 在 `docs/` 目录下创建 `.mdx` 文件
2. 使用 `<Meta>` 标签设置标题
3. 遵循统一的文档格式
4. 包含代码示例和 API 说明

### 自定义主题

编辑 `.storybook/theme.ts` 来定制 Storybook 主题。

## 相关链接

- [Storybook 官方文档](https://storybook.js.org/docs)
- [Storybook React](https://storybook.js.org/docs/react/get-started/introduction)
- [MDX 文档](https://mdxjs.com/)

## 技术栈

- Storybook 7.6+
- React 18
- TypeScript 5.3
- Vite 5.0
- MDX 2.3

## 许可证

MIT

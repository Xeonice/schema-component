# Storybook Package 详细设计文档 (Ultra-Think)

**创建日期**: 2025-10-30
**Package 版本**: 0.0.0
**Storybook 版本**: 7.6+

---

## 1. 设计概述

### 1.1 目标与定位

**Storybook Package** 作为 Schema Component Monorepo 的文档和演示中心，旨在：

1. **组件文档化**: 为所有 packages 提供交互式组件文档
2. **设计系统展示**: 展示完整的设计系统和主题
3. **API 文档**: 提供清晰的 API 使用说明
4. **示例库**: 收集各种使用场景的示例代码
5. **开发调试**: 为组件开发提供隔离的开发环境
6. **测试平台**: 支持视觉回归测试和交互测试

### 1.2 核心功能

```
┌─────────────────────────────────────────────────┐
│           Storybook Package 架构                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │      文档层 (Documentation)            │     │
│  │  - 使用指南                             │     │
│  │  - API 文档                             │     │
│  │  - 最佳实践                             │     │
│  │  - 教程                                 │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │      展示层 (Stories)                  │     │
│  │  - Schema Stories                       │     │
│  │  - Engine Stories                       │     │
│  │  - Theme Stories                        │     │
│  │  - 组合示例                             │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │      插件层 (Addons)                   │     │
│  │  - Controls (交互控制)                  │     │
│  │  - Actions (事件日志)                   │     │
│  │  - Docs (自动文档)                      │     │
│  │  - A11y (无障碍检查)                    │     │
│  │  - Viewport (响应式)                    │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │      构建层 (Build)                    │     │
│  │  - Webpack/Vite 配置                    │     │
│  │  - 静态站点生成                         │     │
│  │  - 部署优化                             │     │
│  └───────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 2. 技术选型

### 2.1 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Storybook** | 7.6+ | 核心框架 |
| **React** | 18+ | UI 渲染 |
| **TypeScript** | 5.3+ | 类型安全 |
| **Vite** | 5.0+ | 构建工具 |
| **MDX** | 2.3+ | 文档格式 |

### 2.2 Storybook 插件

```json
{
  "@storybook/addon-essentials": "必备插件集合",
  "@storybook/addon-interactions": "交互测试",
  "@storybook/addon-links": "Story 链接",
  "@storybook/addon-a11y": "无障碍检查",
  "@storybook/addon-themes": "主题切换",
  "storybook-dark-mode": "暗黑模式",
  "@storybook/addon-storysource": "源码展示"
}
```

### 2.3 选择 Storybook 9.x 的理由

1. **性能提升**
   - 极快的启动速度（50% 提升）
   - 优化的 HMR (热模块替换)
   - 显著改进的构建性能
   - 更小的 bundle 大小

2. **新特性**
   - 零配置的 TypeScript 支持
   - 自动化的 Args 和 Controls
   - 完整的 MDX 3 支持
   - 改进的测试能力
   - 更好的无障碍支持

3. **现代化**
   - Vite 6 原生支持
   - React 18+ 完全兼容
   - 完整的 ESM 支持
   - 更好的 TypeScript 类型推导
   - pnpm workspace 完美支持

---

## 3. 文件结构设计

### 3.1 目录结构

```
packages/storybook/
├── .storybook/                 # Storybook 配置
│   ├── main.ts                 # 主配置文件
│   ├── preview.ts              # 全局预览配置
│   ├── manager.ts              # 管理界面配置
│   └── theme.ts                # 自定义主题
│
├── stories/                    # Story 文件
│   ├── Introduction.mdx        # 介绍页面
│   ├── GettingStarted.mdx      # 快速开始
│   │
│   ├── schema/                 # Schema Stories
│   │   ├── BasicFields.stories.tsx
│   │   ├── RelationFields.stories.tsx
│   │   ├── Validation.stories.tsx
│   │   └── TypeInference.stories.tsx
│   │
│   ├── engine/                 # Engine Stories
│   │   ├── Rendering.stories.tsx
│   │   ├── DataBinding.stories.tsx
│   │   └── Lifecycle.stories.tsx
│   │
│   ├── theme/                  # Theme Stories
│   │   ├── Colors.stories.tsx
│   │   ├── Typography.stories.tsx
│   │   ├── Spacing.stories.tsx
│   │   └── Components.stories.tsx
│   │
│   └── examples/               # 综合示例
│       ├── FormBuilder.stories.tsx
│       ├── DataTable.stories.tsx
│       └── Dashboard.stories.tsx
│
├── docs/                       # 文档
│   ├── guides/                 # 使用指南
│   │   ├── schema-definition.mdx
│   │   ├── field-types.mdx
│   │   ├── relations.mdx
│   │   └── validation.mdx
│   │
│   ├── api/                    # API 文档
│   │   ├── schema-api.mdx
│   │   ├── engine-api.mdx
│   │   └── theme-api.mdx
│   │
│   └── tutorials/              # 教程
│       ├── building-forms.mdx
│       ├── creating-themes.mdx
│       └── advanced-patterns.mdx
│
├── src/                        # 辅助组件和工具
│   ├── components/             # 文档专用组件
│   │   ├── CodeBlock.tsx
│   │   ├── PropsTable.tsx
│   │   ├── ApiReference.tsx
│   │   └── LiveEditor.tsx
│   │
│   ├── decorators/             # Story 装饰器
│   │   ├── ThemeDecorator.tsx
│   │   └── SchemaProvider.tsx
│   │
│   └── utils/                  # 工具函数
│       ├── mockData.ts
│       └── helpers.ts
│
├── public/                     # 静态资源
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── package.json                # 包配置
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 配置
└── README.md                   # 说明文档
```

---

## 4. 核心配置设计

### 4.1 Storybook 主配置 (.storybook/main.ts)

```typescript
import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  // Story 文件匹配
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../docs/**/*.mdx'
  ],

  // 插件配置
  addons: [
    '@storybook/addon-essentials',      // 必备插件
    '@storybook/addon-interactions',     // 交互测试
    '@storybook/addon-links',            // Story 链接
    '@storybook/addon-a11y',             // 无障碍
    '@storybook/addon-themes',           // 主题切换
    'storybook-dark-mode',               // 暗黑模式
    '@storybook/addon-storysource'       // 源码展示
  ],

  // 框架配置
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  // 文档配置
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  },

  // TypeScript 配置
  typescript: {
    check: true,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        return prop.parent
          ? !/node_modules/.test(prop.parent.fileName)
          : true
      }
    }
  },

  // Vite 配置定制
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@schema-component/schema': '../schema/src',
          '@schema-component/engine': '../engine/src',
          '@schema-component/theme': '../theme/src'
        }
      }
    })
  }
}

export default config
```

### 4.2 预览配置 (.storybook/preview.ts)

```typescript
import type { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'

const preview: Preview = {
  // 全局参数
  parameters: {
    // 操作配置
    actions: { argTypesRegex: '^on[A-Z].*' },

    // 控件配置
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      },
      expanded: true,
      sort: 'requiredFirst'
    },

    // 文档配置
    docs: {
      theme: themes.light,
      toc: {
        title: 'Table of Contents',
        headingSelector: 'h2, h3'
      }
    },

    // 视口配置
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' }
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' }
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' }
        }
      }
    },

    // 背景配置
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'gray', value: '#f5f5f5' }
      ]
    },

    // 布局
    layout: 'padded'
  },

  // 全局类型
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ],
        dynamicTitle: true
      }
    }
  }
}

export default preview
```

---

## 5. Story 组织设计

### 5.1 Story 命名约定

```typescript
// 文件命名: ComponentName.stories.tsx
// Story 命名: Primary, Secondary, Large, Small, etc.

import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',      // 分类/组件名
  component: Button,
  tags: ['autodocs'],              // 自动生成文档
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    }
  }
}

export default meta
type Story = StoryObj<typeof Button>

// 主要示例
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button'
  }
}

// 次要示例
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button'
  }
}
```

### 5.2 Story 分类策略

```
Stories 分类层次:
├── Introduction (介绍)
├── Getting Started (快速开始)
├── Schema (Schema 包)
│   ├── Basic Fields (基础字段)
│   ├── Relation Fields (关联字段)
│   ├── Validation (验证)
│   └── Type Inference (类型推导)
├── Engine (引擎包)
│   ├── Rendering (渲染)
│   ├── Data Binding (数据绑定)
│   └── Lifecycle (生命周期)
├── Theme (主题包)
│   ├── Colors (颜色)
│   ├── Typography (排版)
│   ├── Spacing (间距)
│   └── Components (组件)
└── Examples (综合示例)
    ├── Form Builder (表单构建器)
    ├── Data Table (数据表格)
    └── Dashboard (仪表板)
```

---

## 6. 文档编写规范

### 6.1 MDX 文档模板

```mdx
---
title: Schema Definition Guide
description: Learn how to define schemas in Schema Component
---

import { Meta } from '@storybook/blocks'

<Meta title="Guides/Schema Definition" />

# Schema Definition Guide

Learn how to define and use schemas in Schema Component.

## Overview

Brief overview of the guide...

## Prerequisites

- Node.js 16+
- Basic TypeScript knowledge
- Understanding of schemas

## Quick Start

\`\`\`typescript
import { defineSchema, field } from '@schema-component/schema'

const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  email: field.email({ unique: true })
})
\`\`\`

## API Reference

Detailed API documentation...

## Examples

Real-world examples...

## Best Practices

Tips and best practices...

## Related

- [Field Types](./field-types)
- [Validation](./validation)
```

### 6.2 API 文档模板

```mdx
# defineSchema API

Define a new schema.

## Signature

\`\`\`typescript
function defineSchema<T extends FieldDefinitions>(
  name: string,
  fields: T,
  options?: SchemaOptions
): Schema<T>
\`\`\`

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | Schema name |
| fields | FieldDefinitions | Field definitions |
| options | SchemaOptions | Optional configuration |

## Returns

Returns a `Schema<T>` instance with full type inference.

## Examples

### Basic Usage

\`\`\`typescript
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  name: field.string({ required: true })
})
\`\`\`

### With Options

\`\`\`typescript
const PostSchema = defineSchema('Post', {
  title: field.string({ required: true }),
  content: field.text()
}, {
  timestamps: true,
  softDelete: true
})
\`\`\`
```

---

## 7. 辅助组件设计

### 7.1 代码块组件

```typescript
// src/components/CodeBlock.tsx
import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  showLineNumbers = true,
  highlightLines = []
}) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      showLineNumbers={showLineNumbers}
      wrapLines={true}
      lineProps={(lineNumber) => ({
        style: {
          backgroundColor: highlightLines.includes(lineNumber)
            ? 'rgba(255, 255, 255, 0.1)'
            : 'transparent'
        }
      })}
    >
      {code}
    </SyntaxHighlighter>
  )
}
```

### 7.2 Props 表格组件

```typescript
// src/components/PropsTable.tsx
import React from 'react'

interface PropDefinition {
  name: string
  type: string
  required?: boolean
  default?: string
  description: string
}

interface PropsTableProps {
  props: PropDefinition[]
}

export const PropsTable: React.FC<PropsTableProps> = ({ props }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Required</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop) => (
          <tr key={prop.name}>
            <td><code>{prop.name}</code></td>
            <td><code>{prop.type}</code></td>
            <td>{prop.required ? '✅' : '❌'}</td>
            <td>{prop.default || '-'}</td>
            <td>{prop.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### 7.3 实时编辑器组件

```typescript
// src/components/LiveEditor.tsx
import React, { useState } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'

interface LiveEditorProps {
  code: string
  scope?: Record<string, any>
  theme?: any
}

export const LiveCodeEditor: React.FC<LiveEditorProps> = ({
  code,
  scope = {},
  theme
}) => {
  return (
    <LiveProvider code={code} scope={scope} theme={theme}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h4>Code</h4>
          <LiveEditor />
          <LiveError />
        </div>
        <div>
          <h4>Preview</h4>
          <LivePreview />
        </div>
      </div>
    </LiveProvider>
  )
}
```

---

## 8. 主题定制

### 8.1 自定义 Storybook 主题

```typescript
// .storybook/theme.ts
import { create } from '@storybook/theming/create'

export const customTheme = create({
  base: 'light',

  // 品牌
  brandTitle: 'Schema Component',
  brandUrl: 'https://schema-component.dev',
  brandImage: '/logo.svg',
  brandTarget: '_self',

  // 颜色
  colorPrimary: '#3b82f6',
  colorSecondary: '#8b5cf6',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,

  // 文字
  fontBase: '"Inter", sans-serif',
  fontCode: '"Fira Code", monospace',

  // 工具栏
  barTextColor: '#6b7280',
  barSelectedColor: '#3b82f6',
  barBg: '#f9fafb',

  // 输入
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#1f2937',
  inputBorderRadius: 6
})
```

---

## 9. 构建与部署

### 9.1 构建配置

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build -o dist",
    "serve-storybook": "npx serve dist",
    "test-storybook": "test-storybook"
  }
}
```

### 9.2 部署策略

**推荐部署平台:**
1. **Chromatic** - Storybook 官方推荐，支持视觉回归测试
2. **Vercel** - 简单快速，支持自动部署
3. **Netlify** - 免费托管，支持 PR 预览
4. **GitHub Pages** - 完全免费，与 GitHub 集成

**部署工作流:**
```yaml
# .github/workflows/deploy-storybook.yml
name: Deploy Storybook

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm --filter storybook build-storybook
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./packages/storybook/dist
```

---

## 10. 测试集成

### 10.1 交互测试

```typescript
// stories/Button.stories.tsx
import { expect } from '@storybook/jest'
import { within, userEvent } from '@storybook/testing-library'

export const ClickTest: Story = {
  args: {
    label: 'Click me'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)
    await expect(button).toHaveTextContent('Clicked!')
  }
}
```

### 10.2 视觉回归测试

使用 Chromatic 进行视觉回归测试：

```bash
# 安装 Chromatic
pnpm add -D chromatic

# 运行视觉测试
npx chromatic --project-token=<token>
```

---

## 11. 性能优化

### 11.1 懒加载 Stories

```typescript
// 使用动态导入
const LazyComponent = lazy(() => import('./HeavyComponent'))

export const Heavy: Story = {
  render: () => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

### 11.2 优化构建

```typescript
// .storybook/main.ts
export default {
  // ... 其他配置

  // 优化配置
  core: {
    disableTelemetry: true
  },

  // Webpack 优化（如果使用 Webpack）
  webpackFinal: async (config) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          }
        }
      }
    }
    return config
  }
}
```

---

## 12. 最佳实践

### 12.1 Story 编写原则

1. **单一职责**: 每个 Story 展示一个特定状态或场景
2. **有意义的命名**: 使用描述性的 Story 名称
3. **完整的文档**: 为每个 Story 添加描述和注释
4. **交互示例**: 展示组件的交互行为
5. **边界情况**: 包含边界情况和错误状态

### 12.2 文档编写原则

1. **用户视角**: 从用户角度编写文档
2. **渐进式**: 从简单到复杂
3. **代码示例**: 提供可运行的代码示例
4. **视觉辅助**: 使用图表和截图
5. **保持更新**: 及时更新文档

### 12.3 组织原则

1. **清晰的分类**: 使用合理的目录结构
2. **一致的命名**: 遵循统一的命名约定
3. **易于导航**: 提供清晰的导航结构
4. **搜索友好**: 使用描述性的标题和标签

---

## 13. 集成其他 Packages

### 13.1 与 Schema Package 集成

```typescript
// stories/schema/BasicFields.stories.tsx
import { defineSchema, field } from '@schema-component/schema'
import { SchemaDemo } from '../../src/components/SchemaDemo'

export default {
  title: 'Schema/Basic Fields',
  component: SchemaDemo
}

export const StringField: Story = {
  render: () => {
    const schema = defineSchema('User', {
      name: field.string({ required: true, minLength: 2 })
    })

    return <SchemaDemo schema={schema} />
  }
}
```

### 13.2 与 Engine Package 集成

```typescript
// stories/engine/Rendering.stories.tsx
import { Engine } from '@schema-component/engine'
import { EngineDemo } from '../../src/components/EngineDemo'

export default {
  title: 'Engine/Rendering',
  component: EngineDemo
}

export const BasicRendering: Story = {
  render: () => {
    const engine = new Engine({ /* config */ })
    return <EngineDemo engine={engine} />
  }
}
```

### 13.3 与 Theme Package 集成

```typescript
// stories/theme/Colors.stories.tsx
import { ThemeProvider } from '@schema-component/theme'
import { ColorPalette } from '../../src/components/ColorPalette'

export default {
  title: 'Theme/Colors',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ]
}

export const Primary: Story = {
  render: () => <ColorPalette />
}
```

---

## 14. 未来扩展

### 14.1 计划功能

- [ ] **国际化支持**: 多语言文档
- [ ] **版本控制**: 多版本文档共存
- [ ] **搜索功能**: 全文搜索
- [ ] **代码沙箱**: 在线编辑和运行
- [ ] **视频教程**: 集成视频内容
- [ ] **API Playground**: 交互式 API 测试

### 14.2 技术演进

- [ ] 升级到 Storybook 8（发布后）
- [ ] 集成 AI 辅助文档生成
- [ ] 自动化截图和视频录制
- [ ] 性能监控和分析

---

## 15. 总结

Storybook Package 将作为 Schema Component 项目的：

1. **统一文档中心**: 集中管理所有文档
2. **开发平台**: 提供隔离的开发环境
3. **展示窗口**: 向外展示项目能力
4. **测试工具**: 支持各类测试
5. **设计系统**: 维护统一的设计语言

通过合理的架构设计和最佳实践，Storybook Package 将成为项目不可或缺的一部分。

---

**文档版本**: 1.0.0
**最后更新**: 2025-10-30
**状态**: 设计阶段

# @schema-component/engine

A framework-agnostic data engine with DDD (Domain-Driven Design) principles.

基于 DDD 原则的框架无关数据引擎。

## Features

- 🎯 **Function-First Design**: APIs, Actions, and Views are executable functions
- 🏗️ **DDD Architecture**: Clean separation of concerns with Model, Repository, State layers
- 🔌 **Framework Agnostic**: Works with React, Vue, or any JavaScript framework
- 💉 **Dependency Injection**: Built on InversifyJS for flexible dependency management
- 📡 **Event-Driven**: Comprehensive event system for reactive programming
- 🔄 **Reactive State**: MobX-based state management
- 📦 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
pnpm add @schema-component/engine
```

## Quick Start

### 1. Create Engine Context

```typescript
import { createEngineContext } from '@schema-component/engine'

const engine = createEngineContext({
  apiBaseUrl: 'https://api.example.com',
  debug: true
})

await engine.initialize()
```

## Implementation Status

### ✅ Phase 1: Core Infrastructure (Completed)

- [x] Project setup (package.json, tsconfig, vite config)
- [x] Core type definitions
- [x] Dependency Injection container
- [x] Engine Context
- [x] Event Bus
- [x] Unit tests

### 🚧 Next: Phase 2 - Model Layer

See [../../IMPLEMENTATION_PLAN.md](../../IMPLEMENTATION_PLAN.md) for details.

## Documentation

完整的交互式文档和 108 个代码示例请访问 Storybook：

**本地查看**:
```bash
cd ../../
pnpm storybook
```

### 📚 Storybook 文档

- **[Overview](../../packages/storybook/stories/engine/Overview.mdx)** - Engine 总览
- **[Getting Started](../../packages/storybook/stories/engine/GettingStarted.stories.tsx)** - 快速入门 (8个示例)
- **[Architecture](../../packages/storybook/stories/engine/Architecture.mdx)** - 架构设计文档索引

### 🎯 模块文档

- **[Core](../../packages/storybook/stories/engine/core/)** - 核心模型系统 (8个示例)
- **[DI](../../packages/storybook/stories/engine/di/)** - 依赖注入 (12个示例)
- **[Event](../../packages/storybook/stories/engine/event/)** - 事件总线 (11个示例)
- **[HTTP](../../packages/storybook/stories/engine/http/)** - HTTP 客户端 (18个示例)
- **[State](../../packages/storybook/stories/engine/state/)** - 状态管理 (15个示例)
- **[Repository](../../packages/storybook/stories/engine/repository/)** - 仓储模式 (12个示例)
- **[Render](../../packages/storybook/stories/engine/render/)** - 渲染系统 (36个示例)

### 🏗️ 架构文档

- **[Render Architecture](../../packages/storybook/stories/engine/docs/RenderArchitecture.mdx)** - 渲染架构设计
- **[Render Design](../../packages/storybook/stories/engine/docs/RenderDesign.mdx)** - 渲染详细设计
- **[Render Layer Design](../../packages/storybook/stories/engine/docs/RenderLayerDesign.mdx)** - 渲染分层设计
- **[Action Renderer Design](../../packages/storybook/stories/engine/docs/ActionRendererDesign.mdx)** - Action 渲染器设计

## Development

```bash
pnpm test          # Run tests
pnpm test:watch    # Watch mode
pnpm test:coverage # Coverage
pnpm build         # Build
pnpm dev           # Dev mode
```

## License

MIT

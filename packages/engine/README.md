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

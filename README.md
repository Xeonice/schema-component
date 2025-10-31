# schema-component

A powerful schema-driven component system built with Lerna monorepo architecture, pnpm workspaces, and Vite.

## Tech Stack

- **包管理**: pnpm + Lerna
- **构建工具**: Vite
- **语言**: TypeScript
- **模块格式**: ESM + CJS (dual package)

## Project Structure

```
schema-component/
├── packages/
│   ├── schema/          # Schema definition and validation
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── engine/          # Core engine for component rendering
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── theme/           # Theme system and styling
│       ├── src/
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── lerna.json           # Lerna configuration
├── tsconfig.json        # Root TypeScript configuration
└── package.json         # Root package configuration
```

## Packages

- **@schema-component/schema**: Schema definition and validation layer
- **@schema-component/engine**: Core rendering engine
- **@schema-component/theme**: Theme system for styling components

## Installation

```bash
# 安装依赖
pnpm install
```

## Development

```bash
# 开发模式 (watch mode)
pnpm run dev

# 构建所有包
pnpm run build

# 测试所有包
pnpm run test

# 清理所有包
pnpm run clean
```

## Build Output

每个包都会输出以下格式：
- **ESM**: `dist/index.js` (用于现代打包工具和 Node.js)
- **CJS**: `dist/index.cjs` (用于兼容性)
- **Types**: `dist/index.d.ts` (TypeScript 类型定义)

## Documentation

完整的交互式文档和示例代码请访问我们的 Storybook：

**本地开发**:
```bash
pnpm storybook
```

访问 http://localhost:6006 查看文档。

### 📚 快速链接

- **Engine 架构**: [packages/storybook/stories/engine/](packages/storybook/stories/engine/)
  - 108 个交互式代码示例
  - 完整的架构设计文档
  - 各模块使用指南

- **Schema 系统**: [packages/storybook/stories/schema/](packages/storybook/stories/schema/)
  - 字段类型和验证
  - 关系字段
  - 类型推导

### 📖 项目文档

- [实施计划](IMPLEMENTATION_PLAN.md) - 详细的开发路线图
- [Phase 1 完成](PHASE1_COMPLETE.md) - 核心基础设施里程碑
- [Engine Storybook 迁移](ENGINE_STORYBOOK_MIGRATION_SUMMARY.md) - 文档迁移总结
- [文档整理计划](DOCS_CONSOLIDATION_PLAN.md) - 文档组织策略

## License

MIT

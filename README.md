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

## License

MIT

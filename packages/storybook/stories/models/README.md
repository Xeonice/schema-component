# Storybook 模型注册中心

这个目录是 Storybook 演示模型的统一管理中心。

## 目录结构

```
stories/models/
├── README.md           # 本文档
├── index.ts            # 统一注册入口
└── definitions.ts      # 所有模型定义
```

## 架构设计

### 1. 模型定义 (`definitions.ts`)

所有演示用的模型都在这里定义：

```typescript
import { defineModel, defineSchema } from '@schema-component/engine'

export const UserModel = defineModel({
  name: 'User',
  schema: defineSchema({
    name: 'User',
    fields: {
      firstName: { type: 'string', label: 'First Name' },
      lastName: { type: 'string', label: 'Last Name' },
      email: { type: 'email', label: 'Email' }
    }
  }),
  views: {
    form: {
      type: 'form',
      name: 'user-form',
      title: 'User Information',
      fields: ['firstName', 'lastName', 'email']
    },
    table: {
      type: 'table',
      name: 'user-table',
      title: 'Users',
      fields: ['firstName', 'lastName', 'email']
    }
  },
  apis: {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async (id) => ({ id }),
    create: async (data) => ({ id: Date.now(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async (id) => true
  }
})
```

### 2. 统一注册 (`index.ts`)

提供统一的注册入口和辅助函数：

```typescript
import type { EngineContext } from '@schema-component/engine'
import { UserModel, ProductModel } from './definitions'

// 所有模型的集合
export const DEMO_MODELS = {
  User: UserModel,
  Product: ProductModel
} as const

// 统一注册函数
export function registerDemoModels(engineContext: EngineContext): void {
  Object.values(DEMO_MODELS).forEach(model => {
    engineContext.registerModel(model)
  })
}

// 辅助函数
export function getModelViews(modelName: DemoModelName): string[] {
  const model = DEMO_MODELS[modelName]
  return Object.keys(model.views)
}
```

### 3. 全局注册 (`preview.tsx`)

在 Storybook 启动时统一注册：

```typescript
import { registerDemoModels } from '../stories/models'

const engineContext = createEngineContext({ debug: true })
registerDemoModels(engineContext)
```

### 4. Stories 消费

Stories 只需引用模型名称和视图名称：

```typescript
import type { DemoModelName } from '../models'

interface ViewRendererDemoProps {
  modelName: DemoModelName  // 类型安全
  viewName: string
  initialData?: any
}

export const FormViewBasic: Story = {
  args: {
    modelName: 'User',      // ✅ 自动补全
    viewName: 'form',       // ✅ 可以进一步类型化
    initialData: { ... }
  }
}
```

## 如何添加新模型

### 步骤 1: 在 `definitions.ts` 中定义模型

```typescript
export const NewModel = defineModel({
  name: 'NewModel',
  schema: defineSchema({ ... }),
  views: { ... },
  apis: { ... }
})
```

### 步骤 2: 在 `index.ts` 中添加到 `DEMO_MODELS`

```typescript
export const DEMO_MODELS = {
  User: UserModel,
  Product: ProductModel,
  NewModel: NewModel  // 添加这一行
} as const
```

### 步骤 3: 在 Stories 中使用

```typescript
export const NewModelStory: Story = {
  args: {
    modelName: 'NewModel',  // 自动获得类型提示
    viewName: 'someView',
    initialData: { ... }
  }
}
```

就这样！无需修改 `preview.tsx`，因为 `registerDemoModels` 会自动注册所有模型。

## 当前可用模型

| 模型名称 | 描述 | 视图 | 用途 |
|---------|------|------|------|
| User | 用户模型 | form, formGrouped, formTwoColumn | 表单演示 |
| Product | 产品模型 | table, tableWithActions | 表格演示 |
| Order | 订单模型 | detail, detailGrouped | 详情演示 |
| Article | 文章模型 | list, listWithStatus | 列表演示 |
| Dashboard | 仪表板模型 | overview | 复杂布局演示 |

## 设计优势

### ✅ 集中管理
- 所有模型定义在一个地方
- 统一的注册逻辑
- 易于查找和维护

### ✅ 类型安全
- `DemoModelName` 类型确保模型名称正确
- 自动补全和类型检查
- 减少拼写错误

### ✅ 可复用
- 模型定义可在多个 stories 中复用
- 避免重复定义
- 保持一致性

### ✅ 易扩展
- 添加新模型只需 2 步
- 无需修改基础设施代码
- 自动集成到现有系统

### ✅ 符合架构
- 遵循 Model-View-Action 模式
- 清晰的职责分离
- 符合 schema-component 设计理念

## 注意事项

1. **模型名称必须唯一**: 同一个 EngineContext 中不能有重复的模型名称
2. **视图名称在模型内唯一**: 每个模型的视图名称不能重复
3. **类型一致性**: 确保 schema 定义与实际数据结构匹配
4. **API 实现**: 演示模型可以使用 mock APIs,实际项目应连接真实后端

## 相关文件

- `../theme/ViewRenderers.stories.tsx` - 视图渲染器演示
- `../theme/DataRenderers.stories.tsx` - 数据渲染器演示
- `../theme/FieldRenderers.stories.tsx` - 字段渲染器演示
- `.storybook/preview.tsx` - Storybook 全局配置

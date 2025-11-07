import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { useRenderContext } from '@schema-component/react-connector'
import type { ActionDefinition } from '@schema-component/engine'
import type { DemoModelName } from '../models'

/**
 * ViewRenderer 演示组件
 *
 * ## 架构说明
 *
 * 这个 Story 展示了 schema-component 的正确使用方式：
 *
 * ### 1. 模型定义 (`stories/models/definitions.ts`)
 * 使用 `defineModel` 定义完整的业务模型：
 * ```typescript
 * export const UserModel = defineModel({
 *   name: 'User',
 *   schema: defineSchema({...}),
 *   views: {
 *     form: {...},
 *     table: {...}
 *   },
 *   apis: {...}
 * })
 * ```
 *
 * ### 2. 统一注册 (`stories/models/index.ts`)
 * 提供统一的模型注册中心：
 * ```typescript
 * export const DEMO_MODELS = {
 *   User: UserModel,
 *   Product: ProductModel,
 *   ...
 * }
 *
 * export function registerDemoModels(engineContext) {
 *   Object.values(DEMO_MODELS).forEach(model => {
 *     engineContext.registerModel(model)
 *   })
 * }
 * ```
 *
 * ### 3. 全局注册 (`preview.tsx`)
 * 在 Storybook 启动时注册所有模型：
 * ```typescript
 * import { registerDemoModels } from '../stories/models'
 * const engineContext = createEngineContext({ debug: true })
 * registerDemoModels(engineContext)
 * ```
 *
 * ### 4. Story 消费 (`*.stories.tsx`)
 * Stories 只需引用已注册的模型名称和视图名称：
 * ```typescript
 * export const FormViewBasic: Story = {
 *   args: {
 *     modelName: 'User',
 *     viewName: 'form',
 *     initialData: {...}
 *   }
 * }
 * ```
 *
 * ## 优势
 *
 * - ✅ **集中管理**: 所有模型在一个地方定义和注册
 * - ✅ **类型安全**: 使用 TypeScript 类型确保模型和视图名称正确
 * - ✅ **可复用**: 模型定义可在多个 stories 中复用
 * - ✅ **易维护**: 新增模型只需在 models 目录添加定义
 * - ✅ **符合架构**: 遵循 Model-View-Action 的设计模式
 */
interface ViewRendererDemoProps {
  title: string
  description: string
  modelName: DemoModelName
  viewName: string
  initialData?: any
  actions?: ActionDefinition[]
}

const ViewRendererDemo: React.FC<ViewRendererDemoProps> = ({
  title,
  description,
  modelName,
  viewName,
  initialData,
  actions
}) => {
  const renderContext = useRenderContext()
  const [data, setData] = React.useState(initialData)
  const [actionLog, setActionLog] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  // 获取模型
  const model = renderContext.engineContext.modelRegistry?.get?.(modelName)

  if (!model) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Model "{modelName}" not found. Make sure it's registered in preview.tsx
      </div>
    )
  }

  // 获取视图定义
  const view = model.views[viewName]

  if (!view) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: View "{viewName}" not found in model "{modelName}". Available views: {Object.keys(model.views).join(', ')}
      </div>
    )
  }

  // 自动获取数据（当 initialData 为 undefined 时）
  React.useEffect(() => {
    if (initialData === undefined) {
      // 根据 view type 判断使用 getList 还是 getOne
      const isDetailView = view.type === 'detail'
      const isListView = view.type === 'table' || view.type === 'list'

      if (isDetailView && model.apis?.getOne) {
        // DetailView: 使用 getOne 获取单条数据
        setLoading(true)
        model.apis.getOne('123') // 使用默认 ID
          .then((result: any) => {
            setData(result)
            setLoading(false)
          })
          .catch(() => {
            setLoading(false)
          })
      } else if (isListView && model.apis?.getList) {
        // TableView/ListView: 使用 getList 获取列表数据
        setLoading(true)
        model.apis.getList({})
          .then((result: any) => {
            // getList 可能返回 { data, total } 或直接返回数组
            const listData = result.data || result
            setData(listData)
            setLoading(false)
          })
          .catch(() => {
            setLoading(false)
          })
      }
    }
  }, [initialData, model, view.type])

  const handleDataChange = (newData: any) => {
    setData(newData)
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [...prev, `[${timestamp}] Data updated`])
  }

  const handleActionClick = (actionName: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [...prev, `[${timestamp}] Action "${actionName}" clicked`])
  }

  // 为视图添加 actions 和必需的字段 (如果提供)
  // 从 view.actions、view.options.rowActions 或 props.actions 中提取 actions
  const viewActions = actions || view.actions || (view.options as any)?.rowActions || []

  const viewDefinition = {
    ...view,
    modelName,  // 添加 modelName
    name: view.name || `${modelName}-${viewName}`,  // 确保有 name
    actions: viewActions
  }

  // 使用 renderView 渲染
  let viewElement: React.ReactElement
  try {
    viewElement = renderContext.renderView(viewDefinition, {
      data,
      schema: model.schema,  // 传递 schema
      model,  // 传递 model 对象
      modelName,  // 传递 modelName
      onChange: handleDataChange,
      onAction: handleActionClick
    } as any)
  } catch (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error rendering view: {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>
        {title} <code style={{ fontSize: '14px', color: '#6b7280' }}>({view.type})</code>
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{description}</p>

      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        {viewElement}
      </div>

      {actionLog.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Event Log</h4>
          <pre style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            maxHeight: '150px'
          }}>
            {actionLog.join('\n')}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Current Data</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}

const meta: Meta<typeof ViewRendererDemo> = {
  title: 'Theme/View Renderers',
  component: ViewRendererDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
ViewRenderer 组件提供完整的视图渲染,包括表单、表格、详情和列表视图。

## 架构流程

1. **定义模型** - 使用 \`defineModel\` 定义包含 schema、views、actions 的模型
2. **注册模型** - 在 preview.tsx 中注册模型到 EngineContext
3. **渲染视图** - 通过 modelName + viewName 引用视图进行渲染
4. **Engine 渲染** - 使用 \`useRenderContext().renderView()\` 调用 Engine 层渲染

所有模型定义在 \`stories/theme/models.ts\` 中。
        `
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ViewRendererDemo>

// ==================== Form View ====================

export const FormViewBasic: Story = {
  args: {
    title: 'Form View - Basic',
    description: '基础表单视图,用于创建或编辑数据。',
    modelName: 'User',
    viewName: 'form',
    initialData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-234-567-8900'
    },
    actions: [
      { type: 'button', name: 'save', label: 'Save' } as any,
      { type: 'button', name: 'cancel', label: 'Cancel', buttonType: 'secondary' } as any
    ]
  }
}

export const FormViewWithGroups: Story = {
  args: {
    title: 'Form View with Groups',
    description: '带分组的表单视图,将相关字段组织在一起。',
    modelName: 'User',
    viewName: 'formGrouped',
    initialData: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1-234-567-8901',
      bio: 'Product designer with 5 years of experience.',
      active: true
    },
    actions: [
      { type: 'button', name: 'save', label: 'Save Changes' } as any,
      { type: 'button', name: 'cancel', label: 'Cancel', buttonType: 'secondary' } as any
    ]
  }
}

export const FormViewTwoColumn: Story = {
  args: {
    title: 'Form View - Two Column Layout',
    description: '双列表单布局,适合宽屏显示。',
    modelName: 'User',
    viewName: 'formTwoColumn',
    initialData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      active: false,
      role: 'user'
    },
    actions: [
      { type: 'button', name: 'create', label: 'Create User' } as any,
      { type: 'button', name: 'reset', label: 'Reset', buttonType: 'secondary' } as any
    ]
  }
}

// ==================== Table View ====================

export const TableViewBasic: Story = {
  args: {
    title: 'Table View - Basic',
    description: '基础表格视图,用于展示列表数据。',
    modelName: 'Product',
    viewName: 'table',
    initialData: undefined
  }
}

export const TableViewWithActions: Story = {
  args: {
    title: 'Table View with Row Actions',
    description: '带行操作的表格视图。',
    modelName: 'Product',
    viewName: 'tableWithActions',
    initialData: undefined
  }
}

export const TableViewWithHeaderAndRowActions: Story = {
  args: {
    title: 'Table View with Header and Row Actions',
    description: '同时支持表格顶部的 header actions（全局操作）和行内的 row actions（行级操作）。',
    modelName: 'Product',
    viewName: 'tableWithHeaderAndRowActions',
    initialData: undefined
  }
}

// ==================== Detail View ====================

export const DetailViewBasic: Story = {
  args: {
    title: 'Detail View - Basic',
    description: '基础详情视图,用于展示单条数据的完整信息。',
    modelName: 'Order',
    viewName: 'detail',
    initialData: undefined
  }
}

export const DetailViewWithGroups: Story = {
  args: {
    title: 'Detail View with Groups',
    description: '带分组的详情视图,将相关信息组织在不同的卡片中。',
    modelName: 'Order',
    viewName: 'detailGrouped',
    initialData: undefined
  }
}

// ==================== List View ====================

export const ListViewBasic: Story = {
  args: {
    title: 'List View - Basic',
    description: '基础列表视图,以卡片形式展示数据列表。',
    modelName: 'Article',
    viewName: 'list',
    initialData: undefined
  }
}

export const ListViewWithStatus: Story = {
  args: {
    title: 'List View with Status',
    description: '带状态标记的列表视图。',
    modelName: 'Article',
    viewName: 'listWithStatus',
    initialData: undefined
  }
}

// ==================== Complex Examples ====================

export const DashboardView: Story = {
  args: {
    title: 'Dashboard View',
    description: '仪表板视图示例,使用详情视图展示关键指标。',
    modelName: 'Dashboard',
    viewName: 'overview',
    initialData: undefined
  }
}

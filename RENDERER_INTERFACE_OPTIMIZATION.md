# 渲染器接口优化方案

## 问题分析

当前的 `IFieldRenderer` 接口违反了 Liskov 替换原则，具体表现为：

```typescript
// 基础接口：3个参数
interface IRenderer {
  render(definition: any, data: any, context: RenderContext): RenderDescriptor
}

// 字段接口：4个参数，破坏了接口一致性
interface IFieldRenderer extends Omit<IRenderer, 'render'> {
  render(field: FieldDefinition, value: any, record: any, context: RenderContext & { mode?: 'view' | 'edit' }): RenderDescriptor
}
```

## 优化方案：重新设计基础抽象

### 1. 重新设计通用的基础接口

```typescript
// 更通用的基础渲染器接口
export interface IRenderer<TDefinition = any, TData = any, TContext = RenderContext> {
  category: RendererCategory
  type: string
  render(definition: TDefinition, data: TData, context: TContext): RenderDescriptor
}
```

### 2. 定义专门的数据结构

```typescript
// 字段渲染数据结构
export interface FieldRenderData {
  value: any        // 字段值
  record: any       // 完整记录
  index?: number    // 在数组中的索引（可选）
}

// 字段渲染上下文
export interface FieldRenderContext extends RenderContext {
  mode?: 'view' | 'edit'
}

// 批量数据结构（用于列表渲染）
export interface BatchRenderData<T = any> {
  items: T[]
  total?: number
  page?: number
  pageSize?: number
}
```

### 3. 具体渲染器接口

```typescript
// 字段渲染器：类型安全，接口一致
export interface IFieldRenderer extends IRenderer<
  FieldDefinition,
  FieldRenderData,
  FieldRenderContext
> {
  category: 'field'
  type: 'horizontal' | 'vertical' | 'inline' | 'grid' | string
}

// 数据渲染器
export interface IDataRenderer extends IRenderer<
  DataDefinition,
  any,
  RenderContext
> {
  category: 'data'
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object' | string
}

// 动作渲染器
export interface IActionRenderer extends IRenderer<
  ActionDefinition,
  any,
  RenderContext
> {
  category: 'action'
  type: 'button' | 'link' | 'modal' | 'dropdown' | string
}

// 视图渲染器
export interface IViewRenderer extends IRenderer<
  ViewDefinition,
  any,
  RenderContext
> {
  category: 'view'
  type: 'list' | 'form' | 'detail' | 'card' | string
}

// 分组渲染器
export interface IGroupRenderer extends IRenderer<
  GroupDefinition,
  any,
  RenderContext
> {
  category: 'group'
  type: 'card' | 'collapse' | 'tab' | 'section' | string
}
```

### 4. 示例实现

```typescript
// 字段渲染器实现示例
export class HorizontalFieldRenderer implements IFieldRenderer {
  category = 'field' as const
  type = 'horizontal'

  render(
    definition: FieldDefinition,
    data: FieldRenderData,
    context: FieldRenderContext
  ): RenderDescriptor {
    const { value, record } = data
    const { mode = 'view' } = context

    return {
      component: 'div',
      props: {
        className: 'field-horizontal',
        'data-field': definition.name,
        'data-mode': mode
      },
      children: [
        // 标签
        {
          component: 'label',
          props: { className: 'field-label' },
          children: [definition.label || definition.name]
        },
        // 值
        {
          component: 'div',
          props: { className: 'field-value' },
          children: [this.renderValue(definition, value, mode)]
        }
      ]
    }
  }

  private renderValue(definition: FieldDefinition, value: any, mode: string): string {
    // 根据 mode 和 definition.type 渲染不同的值
    if (mode === 'edit') {
      return `<input value="${value}" />`  // 简化示例
    }
    return String(value || '')
  }
}
```

### 5. React Connector 适配

```typescript
// React 层的字段渲染器
export interface IReactFieldRenderer extends IFieldRenderer {
  renderReact?(
    definition: FieldDefinition,
    data: FieldRenderData,
    context: FieldRenderContext
  ): React.ReactElement
}

// React 字段渲染器实现
export class ReactHorizontalFieldRenderer implements IReactFieldRenderer {
  category = 'field' as const
  type = 'horizontal'

  render(definition: FieldDefinition, data: FieldRenderData, context: FieldRenderContext): RenderDescriptor {
    // 标准的 RenderDescriptor 实现...
  }

  renderReact(definition: FieldDefinition, data: FieldRenderData, context: FieldRenderContext): React.ReactElement {
    const { value, record } = data
    const { mode = 'view' } = context

    return (
      <div className="field-horizontal" data-field={definition.name} data-mode={mode}>
        <label className="field-label">
          {definition.label || definition.name}
        </label>
        <div className="field-value">
          {this.renderReactValue(definition, value, mode)}
        </div>
      </div>
    )
  }

  private renderReactValue(definition: FieldDefinition, value: any, mode: string): React.ReactNode {
    if (mode === 'edit') {
      return <input value={value || ''} onChange={/* ... */} />
    }
    return <span>{String(value || '')}</span>
  }
}
```

### 6. 使用方式

```typescript
// 字段渲染调用
const fieldRenderer = new ReactHorizontalFieldRenderer()

const fieldData: FieldRenderData = {
  value: 'John Doe',
  record: { name: 'John Doe', age: 30, email: 'john@example.com' }
}

const fieldContext: FieldRenderContext = {
  ...baseContext,
  mode: 'view'
}

// 统一的接口调用
const result = fieldRenderer.render(fieldDefinition, fieldData, fieldContext)
```

## 优势

1. **Liskov 替换原则**：所有渲染器都可以在需要 IRenderer 的地方互换使用
2. **类型安全**：泛型提供编译时类型检查
3. **接口一致性**：所有渲染器都使用相同的调用模式
4. **扩展性**：容易添加新的渲染器类型
5. **可维护性**：清晰的类型定义便于理解和维护

## 迁移策略

1. **第一阶段**：在新包中实现优化后的接口
2. **第二阶段**：提供适配器支持旧接口
3. **第三阶段**：逐步迁移现有渲染器
4. **第四阶段**：废弃旧接口

这种方法既解决了设计问题，又保证了向后兼容性。

## 修复完成状态

### ✅ 已完成的修复

1. **基础接口重新设计**：
   - 重新设计了 `IRenderer<TDefinition, TData, TContext>` 基础接口，使用泛型支持类型安全
   - 所有渲染器现在都遵循统一的三参数模式：`render(definition, data, context)`

2. **专门数据结构定义**：
   - `FieldRenderData`：包含 `value`、`record`、`fieldPath` 等字段渲染所需数据
   - `FieldRenderContext`：扩展 `RenderContext` 支持 `mode`、`required`、`disabled` 等字段特定属性
   - `BatchRenderData`：支持批量渲染的数据结构

3. **具体渲染器接口更新**：
   - `IFieldRenderer extends IRenderer<FieldDefinition, FieldRenderData, FieldRenderContext>`
   - `IDataRenderer extends IRenderer<DataDefinition, any, RenderContext>`
   - `IActionRenderer extends IRenderer<ActionDefinition, any, RenderContext>`
   - `IViewRenderer extends IRenderer<ViewDefinition, any, RenderContext>`
   - `IGroupRenderer extends IRenderer<GroupDefinition, any, RenderContext>`

4. **Engine 层接口实现修复**：
   - 更新了 `RenderEngine.ts` 中的 `renderField` 方法，使用新的数据结构
   - 修复了 `renderData` 和 `renderAction` 方法的参数传递
   - 保持向后兼容的公共 API

5. **React Connector 兼容性更新**：
   - 更新 `FieldLayer.ts` 中的 `IReactFieldRenderer` 接口
   - 修改 `ReactFieldRender.render` 方法以构建正确的数据结构
   - 保持外部调用接口不变

6. **类型导出修复**：
   - 在 `packages/engine/src/render/index.ts` 中添加了缺失的类型导出
   - 确保 `DataDefinition`、`FieldRenderData`、`FieldRenderContext` 等类型可以被外部使用

### 🎯 修复效果

- **✅ LSP 合规**：所有渲染器现在都可以在需要 `IRenderer` 的地方互换使用
- **✅ 类型安全**：泛型提供编译时类型检查，避免运行时错误
- **✅ 接口一致性**：所有渲染器都使用相同的三参数调用模式
- **✅ 向后兼容**：外部调用代码无需修改
- **✅ 构建通过**：TypeScript 编译无渲染器相关错误

### 🔧 修复的核心问题

原始问题：
```typescript
// 违反 LSP - 不同的方法签名
interface IRenderer {
  render(definition: any, data: any, context: RenderContext): RenderDescriptor
}

interface IFieldRenderer extends Omit<IRenderer, 'render'> {
  render(field: FieldDefinition, value: any, record: any, context: RenderContext & { mode?: 'view' | 'edit' }): RenderDescriptor
}
```

修复后：
```typescript
// 符合 LSP - 统一的泛型接口
interface IRenderer<TDefinition = any, TData = any, TContext = RenderContext> {
  render(definition: TDefinition, data: TData, context: TContext): RenderDescriptor
}

interface IFieldRenderer extends IRenderer<FieldDefinition, FieldRenderData, FieldRenderContext> {
  category: 'field'
  type: 'horizontal' | 'vertical' | 'inline' | 'grid' | string
}
```

这次修复彻底解决了 LSP 违反问题，提升了系统的架构质量和可维护性。
# Render 层架构设计（修订版）

## 概述

Render 层负责将数据、视图和动作渲染成 UI 元素。采用三层渲染器架构：
1. **DataRenderer（字段级渲染器）** - 基于 Schema 字段类型渲染单个数据字段
2. **ViewRenderer（视图级渲染器）** - 基于 View 类型渲染整个视图布局
3. **ActionRenderer（动作渲染器）** - 渲染 Actions 为交互元素（按钮、菜单等）

## 核心原则

- **类型驱动**：根据 Schema 类型自动选择合适的 Renderer
- **可扩展**：允许注册自定义 Renderer
- **框架无关**：Renderer 输出 VNode/Descriptor，由上层框架实现
- **上下文注入**：支持通过 Context Injector 增强渲染上下文

---

## 1. DataRenderer（字段级渲染器）

### 设计原则

DataRenderer 根据 **Schema 字段类型**渲染单个数据字段。每种字段类型对应一个专门的渲染器。

### 支持的字段类型

基于 `@schema-component/schema` 的类型系统：

#### 基础类型
- `string` → `StringRenderer`
- `number` → `NumberRenderer`
- `boolean` → `BooleanRenderer`
- `date` → `DateRenderer`
- `enum` → `EnumRenderer`
- `json` → `JsonRenderer`
- `array` → `ArrayRenderer`

#### 关系类型
- `belongsTo` → `BelongsToRenderer`
- `hasMany` → `HasManyRenderer`
- `manyToMany` → `ManyToManyRenderer`

### 类型定义

```typescript
export interface IDataRenderer {
  /** 渲染器名称（对应字段类型） */
  type: string

  /** 渲染数据字段 */
  render(value: any, field: FieldDefinition, context: RenderContext): RenderResult

  /** 渲染编辑模式（可选） */
  renderEdit?(value: any, field: FieldDefinition, context: RenderContext): RenderResult

  /** 格式化显示值（可选） */
  format?(value: any, field: FieldDefinition): string
}

export interface FieldDefinition {
  type: string
  name: string
  label?: string
  required?: boolean
  default?: any
  validation?: any
  options?: any  // 用于 enum 等特殊类型
  [key: string]: any
}

export interface RenderResult {
  type: string  // 组件类型，如 'Input', 'Select', 'DatePicker'
  props: Record<string, any>
  children?: RenderResult[]
}
```

### 各类型 Renderer 实现

#### 1.1 StringRenderer

```typescript
export class StringRenderer implements IDataRenderer {
  type = 'string'

  render(value: string, field: FieldDefinition, context: RenderContext): RenderResult {
    // 根据 field 的 format 选择不同的渲染方式
    const format = field.format || 'text'

    switch (format) {
      case 'email':
        return {
          type: 'Link',
          props: { href: `mailto:${value}`, text: value }
        }
      case 'url':
        return {
          type: 'Link',
          props: { href: value, text: value, target: '_blank' }
        }
      case 'phone':
        return {
          type: 'Link',
          props: { href: `tel:${value}`, text: value }
        }
      case 'markdown':
        return {
          type: 'Markdown',
          props: { content: value }
        }
      case 'html':
        return {
          type: 'Html',
          props: { html: value }
        }
      default:
        return {
          type: 'Text',
          props: { value, maxLength: field.maxLength }
        }
    }
  }

  renderEdit(value: string, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'text'

    switch (format) {
      case 'markdown':
        return {
          type: 'MarkdownEditor',
          props: {
            value,
            placeholder: field.placeholder,
            required: field.required
          }
        }
      case 'html':
        return {
          type: 'RichTextEditor',
          props: {
            value,
            placeholder: field.placeholder,
            required: field.required
          }
        }
      case 'textarea':
        return {
          type: 'TextArea',
          props: {
            value,
            placeholder: field.placeholder,
            required: field.required,
            rows: field.rows || 4
          }
        }
      default:
        return {
          type: 'Input',
          props: {
            value,
            type: format,  // 'text', 'email', 'url', 'phone'
            placeholder: field.placeholder,
            required: field.required,
            maxLength: field.maxLength
          }
        }
    }
  }

  format(value: string, field: FieldDefinition): string {
    if (field.maxLength && value.length > field.maxLength) {
      return value.substring(0, field.maxLength) + '...'
    }
    return value
  }
}
```

#### 1.2 NumberRenderer

```typescript
export class NumberRenderer implements IDataRenderer {
  type = 'number'

  render(value: number, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'decimal'

    switch (format) {
      case 'currency':
        return {
          type: 'Currency',
          props: {
            value,
            currency: field.currency || 'USD',
            locale: context.locale
          }
        }
      case 'percentage':
        return {
          type: 'Percentage',
          props: { value, decimals: field.decimals || 2 }
        }
      case 'integer':
        return {
          type: 'Integer',
          props: { value }
        }
      default:
        return {
          type: 'Decimal',
          props: { value, decimals: field.decimals || 2 }
        }
    }
  }

  renderEdit(value: number, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'decimal'

    return {
      type: 'NumberInput',
      props: {
        value,
        min: field.min,
        max: field.max,
        step: field.step || (format === 'integer' ? 1 : 0.01),
        precision: format === 'integer' ? 0 : (field.decimals || 2),
        required: field.required,
        prefix: format === 'currency' ? field.currencySymbol : undefined,
        suffix: format === 'percentage' ? '%' : undefined
      }
    }
  }
}
```

#### 1.3 BooleanRenderer

```typescript
export class BooleanRenderer implements IDataRenderer {
  type = 'boolean'

  render(value: boolean, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'badge'

    switch (format) {
      case 'badge':
        return {
          type: 'Badge',
          props: {
            status: value ? 'success' : 'default',
            text: value ? (field.trueLabel || 'Yes') : (field.falseLabel || 'No')
          }
        }
      case 'icon':
        return {
          type: 'Icon',
          props: {
            name: value ? 'check-circle' : 'x-circle',
            color: value ? 'green' : 'red'
          }
        }
      default:
        return {
          type: 'Text',
          props: {
            value: value ? (field.trueLabel || 'Yes') : (field.falseLabel || 'No')
          }
        }
    }
  }

  renderEdit(value: boolean, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'switch'

    switch (format) {
      case 'switch':
        return {
          type: 'Switch',
          props: {
            checked: value,
            checkedLabel: field.trueLabel,
            uncheckedLabel: field.falseLabel
          }
        }
      case 'checkbox':
        return {
          type: 'Checkbox',
          props: {
            checked: value,
            label: field.label
          }
        }
      default:
        return {
          type: 'Switch',
          props: { checked: value }
        }
    }
  }
}
```

#### 1.4 DateRenderer

```typescript
export class DateRenderer implements IDataRenderer {
  type = 'date'

  render(value: Date | string, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'datetime'

    return {
      type: 'DateTime',
      props: {
        value,
        format: this.getDateFormat(format),
        locale: context.locale,
        relative: field.relative  // 显示相对时间，如 "2 hours ago"
      }
    }
  }

  renderEdit(value: Date | string, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'datetime'

    switch (format) {
      case 'date':
        return {
          type: 'DatePicker',
          props: {
            value,
            format: 'YYYY-MM-DD',
            required: field.required,
            min: field.min,
            max: field.max
          }
        }
      case 'time':
        return {
          type: 'TimePicker',
          props: {
            value,
            format: 'HH:mm:ss',
            required: field.required
          }
        }
      case 'datetime':
        return {
          type: 'DateTimePicker',
          props: {
            value,
            format: 'YYYY-MM-DD HH:mm:ss',
            required: field.required,
            min: field.min,
            max: field.max
          }
        }
      case 'month':
        return {
          type: 'MonthPicker',
          props: {
            value,
            format: 'YYYY-MM',
            required: field.required
          }
        }
      case 'year':
        return {
          type: 'YearPicker',
          props: {
            value,
            format: 'YYYY',
            required: field.required
          }
        }
      default:
        return {
          type: 'DateTimePicker',
          props: { value, required: field.required }
        }
    }
  }

  private getDateFormat(format: string): string {
    const formats: Record<string, string> = {
      date: 'YYYY-MM-DD',
      time: 'HH:mm:ss',
      datetime: 'YYYY-MM-DD HH:mm:ss',
      month: 'YYYY-MM',
      year: 'YYYY'
    }
    return formats[format] || 'YYYY-MM-DD HH:mm:ss'
  }
}
```

#### 1.5 EnumRenderer

```typescript
export class EnumRenderer implements IDataRenderer {
  type = 'enum'

  render(value: string | number, field: FieldDefinition, context: RenderContext): RenderResult {
    const option = field.options?.find((opt: any) => opt.value === value)
    const format = field.format || 'tag'

    switch (format) {
      case 'tag':
        return {
          type: 'Tag',
          props: {
            text: option?.label || value,
            color: option?.color
          }
        }
      case 'badge':
        return {
          type: 'Badge',
          props: {
            status: option?.status || 'default',
            text: option?.label || value
          }
        }
      default:
        return {
          type: 'Text',
          props: { value: option?.label || value }
        }
    }
  }

  renderEdit(value: string | number, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'select'

    switch (format) {
      case 'select':
        return {
          type: 'Select',
          props: {
            value,
            options: field.options,
            required: field.required,
            placeholder: field.placeholder,
            allowClear: !field.required
          }
        }
      case 'radio':
        return {
          type: 'RadioGroup',
          props: {
            value,
            options: field.options,
            required: field.required
          }
        }
      case 'segmented':
        return {
          type: 'Segmented',
          props: {
            value,
            options: field.options
          }
        }
      default:
        return {
          type: 'Select',
          props: {
            value,
            options: field.options,
            required: field.required
          }
        }
    }
  }
}
```

#### 1.6 ArrayRenderer

```typescript
export class ArrayRenderer implements IDataRenderer {
  type = 'array'

  render(value: any[], field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'list'

    switch (format) {
      case 'tags':
        return {
          type: 'Tags',
          props: {
            items: value,
            max: field.maxDisplay
          }
        }
      case 'list':
        return {
          type: 'List',
          props: {
            items: value,
            itemRenderer: field.itemRenderer
          }
        }
      case 'count':
        return {
          type: 'Badge',
          props: {
            count: value.length,
            text: `${value.length} items`
          }
        }
      default:
        return {
          type: 'List',
          props: { items: value }
        }
    }
  }

  renderEdit(value: any[], field: FieldDefinition, context: RenderContext): RenderResult {
    const itemType = field.itemType || 'string'

    return {
      type: 'ArrayInput',
      props: {
        value,
        itemType,
        min: field.min,
        max: field.max,
        required: field.required,
        addButtonText: field.addButtonText || 'Add Item'
      }
    }
  }
}
```

#### 1.7 JsonRenderer

```typescript
export class JsonRenderer implements IDataRenderer {
  type = 'json'

  render(value: any, field: FieldDefinition, context: RenderContext): RenderResult {
    const format = field.format || 'code'

    switch (format) {
      case 'code':
        return {
          type: 'CodeBlock',
          props: {
            code: JSON.stringify(value, null, 2),
            language: 'json',
            collapsed: field.collapsed
          }
        }
      case 'tree':
        return {
          type: 'JsonTree',
          props: {
            data: value,
            collapsed: field.collapsed
          }
        }
      default:
        return {
          type: 'CodeBlock',
          props: {
            code: JSON.stringify(value, null, 2),
            language: 'json'
          }
        }
    }
  }

  renderEdit(value: any, field: FieldDefinition, context: RenderContext): RenderResult {
    return {
      type: 'JsonEditor',
      props: {
        value,
        schema: field.schema,  // JSON Schema for validation
        required: field.required
      }
    }
  }
}
```

#### 1.8 RelationRenderer (belongsTo)

```typescript
export class BelongsToRenderer implements IDataRenderer {
  type = 'belongsTo'

  render(value: any, field: FieldDefinition, context: RenderContext): RenderResult {
    const displayField = field.displayField || 'name'
    const displayValue = value?.[displayField] || value

    return {
      type: 'Link',
      props: {
        text: displayValue,
        href: `/${field.targetModel}/${value?.id}`,
        onClick: () => context.navigate?.(`/${field.targetModel}/${value?.id}`)
      }
    }
  }

  renderEdit(value: any, field: FieldDefinition, context: RenderContext): RenderResult {
    return {
      type: 'RelationSelect',
      props: {
        value: value?.id,
        targetModel: field.targetModel,
        displayField: field.displayField || 'name',
        required: field.required,
        searchable: true,
        onCreate: field.allowCreate
      }
    }
  }
}
```

#### 1.9 RelationRenderer (hasMany)

```typescript
export class HasManyRenderer implements IDataRenderer {
  type = 'hasMany'

  render(value: any[], field: FieldDefinition, context: RenderContext): RenderResult {
    return {
      type: 'RelationList',
      props: {
        items: value,
        targetModel: field.targetModel,
        displayField: field.displayField || 'name',
        max: field.maxDisplay || 5
      }
    }
  }

  renderEdit(value: any[], field: FieldDefinition, context: RenderContext): RenderResult {
    return {
      type: 'RelationMultiSelect',
      props: {
        value: value?.map((item: any) => item.id),
        targetModel: field.targetModel,
        displayField: field.displayField || 'name',
        searchable: true,
        onCreate: field.allowCreate,
        max: field.max
      }
    }
  }
}
```

### DataRenderer 注册

```typescript
export class DataRendererRegistry {
  private renderers: Map<string, IDataRenderer> = new Map()

  register(renderer: IDataRenderer): void {
    this.renderers.set(renderer.type, renderer)
  }

  unregister(type: string): void {
    this.renderers.delete(type)
  }

  get(type: string): IDataRenderer | undefined {
    return this.renderers.get(type)
  }

  render(
    value: any,
    field: FieldDefinition,
    context: RenderContext,
    mode: 'view' | 'edit' = 'view'
  ): RenderResult {
    const renderer = this.get(field.type)

    if (!renderer) {
      throw new Error(`No renderer found for type "${field.type}"`)
    }

    if (mode === 'edit' && renderer.renderEdit) {
      return renderer.renderEdit(value, field, context)
    }

    return renderer.render(value, field, context)
  }
}
```

---

## 2. ViewRenderer（视图级渲染器）

### 设计原则

ViewRenderer 根据 **View 类型**渲染整个视图布局。负责组织多个字段的展示。

### 支持的视图类型

- `list` → `ListRenderer` (Table/Grid/Cards)
- `form` → `FormRenderer`
- `detail` → `DetailRenderer`
- `kanban` → `KanbanRenderer`
- `calendar` → `CalendarRenderer`
- `chart` → `ChartRenderer`
- `custom` → 自定义渲染器

### 类型定义

```typescript
export interface IViewRenderer {
  /** 视图类型 */
  type: ViewType

  /** 渲染视图 */
  render(view: ViewDefinition, data: any, context: RenderContext): RenderResult
}

export interface ViewDefinition {
  type: ViewType
  title?: string
  fields?: string[]  // 要显示的字段
  layout?: 'table' | 'grid' | 'cards' | 'kanban' | 'calendar'
  columns?: ColumnDefinition[]
  actions?: ActionDefinition[]
  filters?: FilterDefinition[]
  sorts?: SortDefinition[]
  pagination?: PaginationConfig
  [key: string]: any
}
```

### 各类型 Renderer 实现

#### 2.1 ListRenderer

```typescript
export class ListRenderer implements IViewRenderer {
  type: ViewType = 'list'

  render(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    const layout = view.layout || 'table'

    switch (layout) {
      case 'table':
        return this.renderTable(view, data, context)
      case 'grid':
        return this.renderGrid(view, data, context)
      case 'cards':
        return this.renderCards(view, data, context)
      default:
        return this.renderTable(view, data, context)
    }
  }

  private renderTable(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    return {
      type: 'Table',
      props: {
        columns: view.columns,
        dataSource: data,
        rowKey: 'id',
        pagination: view.pagination,
        // Toolbar
        toolbar: {
          title: view.title,
          actions: view.actions,  // 将由 ActionRenderer 渲染
          filters: view.filters,
          search: view.search
        },
        // Row actions
        rowActions: view.rowActions,  // 将由 ActionRenderer 渲染
        // Selection
        rowSelection: view.selectable ? {
          type: view.selectionType || 'checkbox'
        } : undefined
      }
    }
  }

  private renderGrid(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    return {
      type: 'Grid',
      props: {
        items: data,
        columns: view.gridColumns || 3,
        gap: view.gridGap || 16,
        cardRenderer: view.cardRenderer
      }
    }
  }

  private renderCards(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    return {
      type: 'Cards',
      props: {
        items: data,
        cardConfig: view.cardConfig,
        columns: view.cardColumns || 4
      }
    }
  }
}
```

#### 2.2 FormRenderer

```typescript
export class FormRenderer implements IViewRenderer {
  type: ViewType = 'form'

  render(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    const layout = view.layout || 'vertical'

    return {
      type: 'Form',
      props: {
        layout,  // 'horizontal' | 'vertical' | 'inline'
        initialValues: data,
        sections: this.renderSections(view, context),
        actions: view.actions,  // 将由 ActionRenderer 渲染
        labelWidth: view.labelWidth,
        labelAlign: view.labelAlign
      }
    }
  }

  private renderSections(view: ViewDefinition, context: RenderContext): any[] {
    return (view.sections || [{ fields: view.fields }]).map(section => ({
      title: section.title,
      description: section.description,
      columns: section.columns || 1,
      fields: section.fields.map((fieldName: string) => {
        const field = context.schema.fields[fieldName]
        return {
          name: fieldName,
          label: field.label,
          required: field.required,
          // Field 将由 DataRenderer 渲染（edit mode）
          renderer: context.dataRendererRegistry.render(
            data?.[fieldName],
            field,
            context,
            'edit'
          )
        }
      })
    }))
  }
}
```

#### 2.3 DetailRenderer

```typescript
export class DetailRenderer implements IViewRenderer {
  type: ViewType = 'detail'

  render(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    return {
      type: 'Descriptions',
      props: {
        title: view.title,
        columns: view.columns || 3,
        items: (view.fields || []).map((fieldName: string) => {
          const field = context.schema.fields[fieldName]
          return {
            label: field.label,
            // Field 将由 DataRenderer 渲染（view mode）
            content: context.dataRendererRegistry.render(
              data?.[fieldName],
              field,
              context,
              'view'
            )
          }
        }),
        actions: view.actions  // 将由 ActionRenderer 渲染
      }
    }
  }
}
```

#### 2.4 KanbanRenderer

```typescript
export class KanbanRenderer implements IViewRenderer {
  type: ViewType = 'kanban'

  render(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    const groupField = view.groupBy || 'status'

    return {
      type: 'Kanban',
      props: {
        columns: view.columns,  // Kanban column definitions
        data,
        groupField,
        cardRenderer: view.cardRenderer,
        onCardMove: view.onCardMove,
        actions: view.actions
      }
    }
  }
}
```

#### 2.5 CalendarRenderer

```typescript
export class CalendarRenderer implements IViewRenderer {
  type: ViewType = 'calendar'

  render(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    return {
      type: 'Calendar',
      props: {
        events: data,
        dateField: view.dateField || 'date',
        titleField: view.titleField || 'title',
        colorField: view.colorField,
        mode: view.mode || 'month',  // 'month' | 'week' | 'day'
        onEventClick: view.onEventClick,
        actions: view.actions
      }
    }
  }
}
```

---

## 3. ActionRenderer（动作渲染器）**【新增】**

### 设计原则

ActionRenderer 负责将 Model 的 Actions 渲染为交互元素（按钮、菜单、工具栏等）。

### 支持的动作渲染类型

- `button` → `ButtonRenderer`
- `menu` → `MenuRenderer`
- `dropdown` → `DropdownRenderer`
- `toolbar` → `ToolbarRenderer`
- `modal` → `ModalRenderer`
- `drawer` → `DrawerRenderer`
- `popconfirm` → `PopconfirmRenderer`

### 类型定义

```typescript
export interface IActionRenderer {
  /** 渲染器类型 */
  type: ActionRenderType

  /** 渲染动作 */
  render(action: ActionDefinition, context: RenderContext): RenderResult
}

export type ActionRenderType =
  | 'button'
  | 'menu'
  | 'dropdown'
  | 'toolbar'
  | 'modal'
  | 'drawer'
  | 'popconfirm'

export interface ActionDefinition {
  /** Action 名称（对应 Model 中的 action key） */
  name: string

  /** 显示文本 */
  label: string

  /** 图标 */
  icon?: string

  /** 渲染类型 */
  renderAs?: ActionRenderType

  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'

  /** 危险操作 */
  danger?: boolean

  /** 是否禁用 */
  disabled?: boolean | ((record?: any) => boolean)

  /** 是否显示 */
  visible?: boolean | ((record?: any) => boolean)

  /** 确认提示 */
  confirm?: string | {
    title: string
    description?: string
    okText?: string
    cancelText?: string
  }

  /** 参数获取函数 */
  getParams?: (record?: any) => any

  /** 成功后的回调 */
  onSuccess?: (result: any) => void

  /** 失败后的回调 */
  onError?: (error: Error) => void
}
```

### 各类型 Renderer 实现

#### 3.1 ButtonRenderer

```typescript
export class ButtonRenderer implements IActionRenderer {
  type: ActionRenderType = 'button'

  render(action: ActionDefinition, context: RenderContext): RenderResult {
    return {
      type: 'Button',
      props: {
        text: action.label,
        icon: action.icon,
        type: action.type || 'default',
        danger: action.danger,
        disabled: this.resolveDisabled(action, context),
        onClick: async () => {
          // 执行 Action
          await this.executeAction(action, context)
        }
      }
    }
  }

  private async executeAction(action: ActionDefinition, context: RenderContext): Promise<void> {
    try {
      // 获取参数
      const params = action.getParams?.(context.record) || {}

      // 执行 Model 的 Action
      const result = await context.model.actions[action.name](params)

      // 成功回调
      action.onSuccess?.(result)

      // 显示成功消息
      context.message?.success(`${action.label} successful`)
    } catch (error) {
      // 失败回调
      action.onError?.(error as Error)

      // 显示错误消息
      context.message?.error(`${action.label} failed: ${(error as Error).message}`)
    }
  }

  private resolveDisabled(action: ActionDefinition, context: RenderContext): boolean {
    if (typeof action.disabled === 'function') {
      return action.disabled(context.record)
    }
    return action.disabled || false
  }
}
```

#### 3.2 MenuRenderer

```typescript
export class MenuRenderer implements IActionRenderer {
  type: ActionRenderType = 'menu'

  render(action: ActionDefinition, context: RenderContext): RenderResult {
    return {
      type: 'MenuItem',
      props: {
        key: action.name,
        label: action.label,
        icon: action.icon,
        disabled: this.resolveDisabled(action, context),
        onClick: async () => {
          await this.executeAction(action, context)
        }
      }
    }
  }

  private async executeAction(action: ActionDefinition, context: RenderContext): Promise<void> {
    // 同 ButtonRenderer.executeAction
  }

  private resolveDisabled(action: ActionDefinition, context: RenderContext): boolean {
    if (typeof action.disabled === 'function') {
      return action.disabled(context.record)
    }
    return action.disabled || false
  }
}
```

#### 3.3 DropdownRenderer

```typescript
export class DropdownRenderer implements IActionRenderer {
  type: ActionRenderType = 'dropdown'

  render(actions: ActionDefinition[], context: RenderContext): RenderResult {
    return {
      type: 'Dropdown',
      props: {
        menu: {
          items: actions.map(action => ({
            key: action.name,
            label: action.label,
            icon: action.icon,
            danger: action.danger,
            disabled: this.resolveDisabled(action, context),
            onClick: async () => {
              await this.executeAction(action, context)
            }
          }))
        },
        trigger: ['click']
      }
    }
  }

  private async executeAction(action: ActionDefinition, context: RenderContext): Promise<void> {
    // 同 ButtonRenderer.executeAction
  }

  private resolveDisabled(action: ActionDefinition, context: RenderContext): boolean {
    if (typeof action.disabled === 'function') {
      return action.disabled(context.record)
    }
    return action.disabled || false
  }
}
```

#### 3.4 ToolbarRenderer

```typescript
export class ToolbarRenderer implements IActionRenderer {
  type: ActionRenderType = 'toolbar'

  render(actions: ActionDefinition[], context: RenderContext): RenderResult {
    const primaryActions = actions.filter(a => a.type === 'primary' || !a.type)
    const moreActions = actions.filter(a => a.type !== 'primary')

    return {
      type: 'Toolbar',
      props: {
        left: {
          type: 'Space',
          children: primaryActions.map(action =>
            context.actionRendererRegistry.render(action, { ...context, renderAs: 'button' })
          )
        },
        right: moreActions.length > 0 ? {
          type: 'Dropdown',
          children: context.actionRendererRegistry.render(moreActions, { ...context, renderAs: 'dropdown' })
        } : undefined
      }
    }
  }
}
```

#### 3.5 ModalRenderer

```typescript
export class ModalRenderer implements IActionRenderer {
  type: ActionRenderType = 'modal'

  render(action: ActionDefinition, context: RenderContext): RenderResult {
    return {
      type: 'ModalTrigger',
      props: {
        trigger: {
          type: 'Button',
          props: {
            text: action.label,
            icon: action.icon,
            type: action.type
          }
        },
        modal: {
          title: action.modalTitle || action.label,
          width: action.modalWidth || 520,
          content: action.modalContent,  // Form or custom content
          okText: action.okText || 'Confirm',
          cancelText: action.cancelText || 'Cancel',
          onOk: async (formData: any) => {
            const params = action.getParams?.(formData) || formData
            const result = await context.model.actions[action.name](params)
            action.onSuccess?.(result)
            return result
          }
        }
      }
    }
  }
}
```

#### 3.6 PopconfirmRenderer

```typescript
export class PopconfirmRenderer implements IActionRenderer {
  type: ActionRenderType = 'popconfirm'

  render(action: ActionDefinition, context: RenderContext): RenderResult {
    const confirmConfig = typeof action.confirm === 'string'
      ? { title: action.confirm }
      : action.confirm || {}

    return {
      type: 'Popconfirm',
      props: {
        title: confirmConfig.title || `Are you sure to ${action.label}?`,
        description: confirmConfig.description,
        okText: confirmConfig.okText || 'Yes',
        cancelText: confirmConfig.cancelText || 'No',
        onConfirm: async () => {
          const params = action.getParams?.(context.record) || {}
          const result = await context.model.actions[action.name](params)
          action.onSuccess?.(result)
          return result
        },
        children: {
          type: 'Button',
          props: {
            text: action.label,
            icon: action.icon,
            type: action.type,
            danger: action.danger
          }
        }
      }
    }
  }
}
```

### ActionRenderer 注册

```typescript
export class ActionRendererRegistry {
  private renderers: Map<ActionRenderType, IActionRenderer> = new Map()

  register(renderer: IActionRenderer): void {
    this.renderers.set(renderer.type, renderer)
  }

  unregister(type: ActionRenderType): void {
    this.renderers.delete(type)
  }

  get(type: ActionRenderType): IActionRenderer | undefined {
    return this.renderers.get(type)
  }

  render(
    action: ActionDefinition | ActionDefinition[],
    context: RenderContext
  ): RenderResult {
    // 处理批量 actions
    if (Array.isArray(action)) {
      const renderAs = context.renderAs || 'toolbar'
      const renderer = this.get(renderAs)
      if (!renderer) {
        throw new Error(`No action renderer found for type "${renderAs}"`)
      }
      return renderer.render(action, context)
    }

    // 处理单个 action
    const renderAs = action.renderAs || context.renderAs || 'button'
    const renderer = this.get(renderAs)

    if (!renderer) {
      throw new Error(`No action renderer found for type "${renderAs}"`)
    }

    // 如果有 confirm，包装为 popconfirm
    if (action.confirm && renderAs !== 'popconfirm') {
      return this.get('popconfirm')!.render(action, context)
    }

    return renderer.render(action, context)
  }
}
```

---

## 4. RenderRegistry（统一注册表）

```typescript
export class RenderRegistry {
  private static instance: RenderRegistry

  private dataRenderers: DataRendererRegistry
  private viewRenderers: Map<ViewType, IViewRenderer> = new Map()
  private actionRenderers: ActionRendererRegistry
  private contextInjectors: Array<(context: RenderContext) => RenderContext> = []

  static getInstance(): RenderRegistry {
    if (!RenderRegistry.instance) {
      RenderRegistry.instance = new RenderRegistry()
    }
    return RenderRegistry.instance
  }

  constructor() {
    this.dataRenderers = new DataRendererRegistry()
    this.actionRenderers = new ActionRendererRegistry()
    this.registerDefaultRenderers()
  }

  // Data Renderer 管理
  registerDataRenderer(renderer: IDataRenderer): void {
    this.dataRenderers.register(renderer)
  }

  unregisterDataRenderer(type: string): void {
    this.dataRenderers.unregister(type)
  }

  // View Renderer 管理
  registerViewRenderer(renderer: IViewRenderer): void {
    this.viewRenderers.set(renderer.type, renderer)
  }

  unregisterViewRenderer(type: ViewType): void {
    this.viewRenderers.delete(type)
  }

  // Action Renderer 管理
  registerActionRenderer(renderer: IActionRenderer): void {
    this.actionRenderers.register(renderer)
  }

  unregisterActionRenderer(type: ActionRenderType): void {
    this.actionRenderers.unregister(type)
  }

  // Context Injector 管理
  registerContextInjector(injector: (context: RenderContext) => RenderContext): void {
    this.contextInjectors.push(injector)
  }

  // 渲染方法
  renderData(
    value: any,
    field: FieldDefinition,
    context: RenderContext,
    mode: 'view' | 'edit' = 'view'
  ): RenderResult {
    const enrichedContext = this.applyContextInjectors(context)
    return this.dataRenderers.render(value, field, enrichedContext, mode)
  }

  renderView(view: ViewDefinition, data: any, context: RenderContext): RenderResult {
    const enrichedContext = this.applyContextInjectors({
      ...context,
      dataRendererRegistry: this.dataRenderers,
      actionRendererRegistry: this.actionRenderers
    })

    const renderer = this.viewRenderers.get(view.type)
    if (!renderer) {
      throw new Error(`View renderer for type "${view.type}" not found`)
    }

    return renderer.render(view, data, enrichedContext)
  }

  renderAction(
    action: ActionDefinition | ActionDefinition[],
    context: RenderContext
  ): RenderResult {
    const enrichedContext = this.applyContextInjectors(context)
    return this.actionRenderers.render(action, enrichedContext)
  }

  private applyContextInjectors(context: RenderContext): RenderContext {
    return this.contextInjectors.reduce(
      (ctx, injector) => injector(ctx),
      context
    )
  }

  private registerDefaultRenderers(): void {
    // Data Renderers
    this.registerDataRenderer(new StringRenderer())
    this.registerDataRenderer(new NumberRenderer())
    this.registerDataRenderer(new BooleanRenderer())
    this.registerDataRenderer(new DateRenderer())
    this.registerDataRenderer(new EnumRenderer())
    this.registerDataRenderer(new JsonRenderer())
    this.registerDataRenderer(new ArrayRenderer())
    this.registerDataRenderer(new BelongsToRenderer())
    this.registerDataRenderer(new HasManyRenderer())

    // View Renderers
    this.registerViewRenderer(new ListRenderer())
    this.registerViewRenderer(new FormRenderer())
    this.registerViewRenderer(new DetailRenderer())
    this.registerViewRenderer(new KanbanRenderer())
    this.registerViewRenderer(new CalendarRenderer())

    // Action Renderers
    this.registerActionRenderer(new ButtonRenderer())
    this.registerActionRenderer(new MenuRenderer())
    this.registerActionRenderer(new DropdownRenderer())
    this.registerActionRenderer(new ToolbarRenderer())
    this.registerActionRenderer(new ModalRenderer())
    this.registerActionRenderer(new PopconfirmRenderer())
  }
}
```

---

## 5. RenderContext（渲染上下文）

```typescript
export interface RenderContext {
  // Model 信息
  modelName: string
  model: IModel
  schema: any

  // 数据信息
  record?: any
  records?: any[]

  // 渲染器注册表
  dataRendererRegistry?: DataRendererRegistry
  actionRendererRegistry?: ActionRendererRegistry

  // UI 配置
  locale?: string
  theme?: any

  // 导航
  navigate?: (path: string) => void

  // 消息提示
  message?: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (msg: string) => void
    info: (msg: string) => void
  }

  // 其他上下文信息
  [key: string]: any
}
```

---

## 6. 使用示例

### 6.1 DataRenderer 使用示例

```typescript
const registry = RenderRegistry.getInstance()

// 渲染字符串字段
const stringField = {
  type: 'string',
  name: 'email',
  label: 'Email',
  format: 'email'
}

const result = registry.renderData(
  'user@example.com',
  stringField,
  { modelName: 'User', locale: 'en' },
  'view'
)
// 输出: { type: 'Link', props: { href: 'mailto:user@example.com', text: 'user@example.com' } }

// 渲染枚举字段（编辑模式）
const enumField = {
  type: 'enum',
  name: 'status',
  label: 'Status',
  options: [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'red' }
  ]
}

const editResult = registry.renderData(
  'active',
  enumField,
  { modelName: 'User' },
  'edit'
)
// 输出: { type: 'Select', props: { value: 'active', options: [...] } }
```

### 6.2 ViewRenderer 使用示例

```typescript
const registry = RenderRegistry.getInstance()

// 渲染 List View
const listView = {
  type: 'list',
  layout: 'table',
  title: 'Users',
  columns: [
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'status', label: 'Status' }
  ],
  actions: [
    { name: 'create', label: 'Create User', type: 'primary' }
  ],
  rowActions: [
    { name: 'edit', label: 'Edit' },
    { name: 'delete', label: 'Delete', danger: true, confirm: 'Are you sure?' }
  ]
}

const result = registry.renderView(listView, users, {
  modelName: 'User',
  model: UserModel,
  schema: UserSchema
})
```

### 6.3 ActionRenderer 使用示例

```typescript
const registry = RenderRegistry.getInstance()

// 渲染 Button Action
const createAction = {
  name: 'create',
  label: 'Create User',
  icon: 'plus',
  type: 'primary',
  renderAs: 'modal',
  modalTitle: 'Create New User',
  modalContent: { type: 'form', fields: ['name', 'email'] }
}

const result = registry.renderAction(createAction, {
  modelName: 'User',
  model: UserModel
})

// 渲染 Toolbar Actions
const toolbarActions = [
  { name: 'create', label: 'Create', type: 'primary' },
  { name: 'export', label: 'Export' },
  { name: 'import', label: 'Import' }
]

const toolbarResult = registry.renderAction(toolbarActions, {
  modelName: 'User',
  model: UserModel,
  renderAs: 'toolbar'
})
```

---

## 7. 总结

### 改进要点

1. **新增 ActionRenderer**
   - 支持 Button、Menu、Dropdown、Toolbar、Modal、Popconfirm 等多种渲染方式
   - 统一管理 Action 的渲染逻辑
   - 支持确认提示、参数获取、成功/失败回调

2. **完善 DataRenderer**
   - 基于 Schema 字段类型提供专门的渲染器
   - 支持 8+ 种基础类型和关系类型
   - 每种类型支持多种显示格式和编辑组件
   - 支持 view/edit 双模式

3. **优化 ViewRenderer**
   - 集成 DataRenderer 和 ActionRenderer
   - 支持更多视图类型（List、Form、Detail、Kanban、Calendar）
   - 统一的渲染上下文传递

### 架构优势

- **类型驱动**：基于 Schema 自动选择合适的渲染器
- **高度可扩展**：易于注册自定义渲染器
- **框架无关**：输出标准的 VNode/Descriptor
- **职责清晰**：DataRenderer、ViewRenderer、ActionRenderer 各司其职
- **上下文丰富**：通过 Context Injector 灵活扩展渲染上下文

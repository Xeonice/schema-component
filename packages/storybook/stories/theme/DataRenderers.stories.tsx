import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { DataRenderer } from '@schema-component/theme'
import type { BaseFieldDefinition } from '@schema-component/schema'

// Renderers are registered globally in preview.ts

interface DataRendererDemoProps {
  title: string
  description: string
  rendererType: string
  field: BaseFieldDefinition
  value: any
  mode?: 'view' | 'edit'
}

const DataRendererDemo: React.FC<DataRendererDemoProps> = ({
  title,
  description,
  rendererType,
  field,
  value,
  mode = 'view'
}) => {
  const [currentValue, setCurrentValue] = React.useState(value)

  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>
        {title} <code style={{ fontSize: '14px', color: '#6b7280' }}>({rendererType})</code>
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>{description}</p>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>View Mode:</h4>
          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <DataRenderer
              field={field}
              name="demo"
              value={currentValue}
              mode="view"
              schema={{ name: 'Demo', fields: {} }}
            />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Edit Mode:</h4>
          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <DataRenderer
              field={field}
              name="demo"
              value={currentValue}
              onChange={setCurrentValue}
              mode="edit"
              schema={{ name: 'Demo', fields: {} }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Current Value:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {JSON.stringify(currentValue, null, 2)}
        </pre>
      </div>
    </div>
  )
}

const meta: Meta<typeof DataRendererDemo> = {
  title: 'Theme/Data Renderers',
  component: DataRendererDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'DataRenderer 组件根据字段类型动态渲染数据，支持 view 和 edit 两种模式。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof DataRendererDemo>

// ==================== String Renderers ====================

export const TextRenderer: Story = {
  args: {
    title: 'Text Renderer',
    description: '基础文本渲染器，用于短文本输入。',
    rendererType: 'string',
    field: { type: 'string' },
    value: 'Hello World'
  }
}

export const TextareaRenderer: Story = {
  args: {
    title: 'Textarea Renderer',
    description: '多行文本渲染器，适用于长文本内容。',
    rendererType: 'textarea',
    field: { type: 'textarea' },
    value: 'This is a long text that spans multiple lines.\nIt supports line breaks and longer content.'
  }
}

export const EmailRenderer: Story = {
  args: {
    title: 'Email Renderer',
    description: '邮箱渲染器，view 模式下显示为可点击的邮箱链接。',
    rendererType: 'email',
    field: { type: 'email' },
    value: 'user@example.com'
  }
}

export const UrlRenderer: Story = {
  args: {
    title: 'URL Renderer',
    description: 'URL 渲染器，view 模式下显示为可点击的链接。',
    rendererType: 'url',
    field: { type: 'url' },
    value: 'https://example.com'
  }
}

export const PhoneRenderer: Story = {
  args: {
    title: 'Phone Renderer',
    description: '电话号码渲染器，view 模式下显示为可拨打的电话链接。',
    rendererType: 'phone',
    field: { type: 'phone' },
    value: '+1-234-567-8900'
  }
}

export const ColorRenderer: Story = {
  args: {
    title: 'Color Renderer',
    description: '颜色渲染器，支持颜色选择和预览。',
    rendererType: 'color',
    field: { type: 'color' },
    value: '#3b82f6'
  }
}

export const PasswordRenderer: Story = {
  args: {
    title: 'Password Renderer',
    description: '密码渲染器，edit 模式下隐藏输入内容。',
    rendererType: 'password',
    field: { type: 'password' },
    value: 'secret123'
  }
}

// ==================== Number Renderers ====================

export const NumberRenderer: Story = {
  args: {
    title: 'Number Renderer',
    description: '数字渲染器，支持整数和小数。',
    rendererType: 'number',
    field: { type: 'number' },
    value: 42.5
  }
}

export const CurrencyRenderer: Story = {
  args: {
    title: 'Currency Renderer',
    description: '货币渲染器，格式化显示货币金额。',
    rendererType: 'currency',
    field: { type: 'currency', options: { currency: 'USD' } },
    value: 1234.56
  }
}

export const PercentRenderer: Story = {
  args: {
    title: 'Percent Renderer',
    description: '百分比渲染器，格式化显示百分比值。',
    rendererType: 'percent',
    field: { type: 'percent' },
    value: 0.75
  }
}

// ==================== Boolean Renderers ====================

export const CheckboxRenderer: Story = {
  args: {
    title: 'Checkbox Renderer',
    description: '复选框渲染器，用于布尔值选择。',
    rendererType: 'checkbox',
    field: { type: 'checkbox' },
    value: true
  }
}

export const SwitchRenderer: Story = {
  args: {
    title: 'Switch Renderer',
    description: '开关渲染器，用于布尔值切换。',
    rendererType: 'switch',
    field: { type: 'switch' },
    value: false
  }
}

export const BadgeRenderer: Story = {
  args: {
    title: 'Badge Renderer',
    description: '徽章渲染器，用徽章形式显示布尔状态。',
    rendererType: 'badge',
    field: { type: 'badge' },
    value: true
  }
}

// ==================== Date Renderers ====================

export const DateRenderer: Story = {
  args: {
    title: 'Date Renderer',
    description: '日期渲染器，格式化显示日期（不含时间）。',
    rendererType: 'date',
    field: { type: 'date' },
    value: new Date('2024-03-15').toISOString()
  }
}

export const DateTimeRenderer: Story = {
  args: {
    title: 'DateTime Renderer',
    description: '日期时间渲染器，格式化显示完整的日期和时间。',
    rendererType: 'datetime',
    field: { type: 'datetime' },
    value: new Date('2024-03-15T14:30:00Z').toISOString()
  }
}

export const TimestampRenderer: Story = {
  args: {
    title: 'Timestamp Renderer',
    description: '时间戳渲染器，将 Unix 时间戳转换为可读格式。',
    rendererType: 'timestamp',
    field: { type: 'timestamp' },
    value: 1710512400000
  }
}

export const RelativeTimeRenderer: Story = {
  args: {
    title: 'Relative Time Renderer',
    description: '相对时间渲染器，显示相对于当前时间的描述（如 "2 hours ago"）。',
    rendererType: 'relativetime',
    field: { type: 'relativetime' },
    value: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  }
}

// ==================== Array Renderers ====================

export const ArrayRenderer: Story = {
  args: {
    title: 'Array Renderer',
    description: '数组渲染器，以列表形式显示数组内容。',
    rendererType: 'array',
    field: { type: 'array' },
    value: ['Apple', 'Banana', 'Cherry', 'Date']
  }
}

export const TagArrayRenderer: Story = {
  args: {
    title: 'Tag Array Renderer',
    description: '标签数组渲染器，以标签形式显示数组元素。',
    rendererType: 'tags',
    field: { type: 'tags' },
    value: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook']
  }
}

// ==================== Object Renderers ====================

export const ObjectRenderer: Story = {
  args: {
    title: 'Object Renderer',
    description: '对象渲染器，以 JSON 格式显示对象内容。',
    rendererType: 'object',
    field: { type: 'object' },
    value: { id: 1, name: 'John Doe', role: 'Developer', active: true }
  }
}

export const KeyValueRenderer: Story = {
  args: {
    title: 'Key-Value Renderer',
    description: '键值对渲染器，以表格形式显示对象的键值对。',
    rendererType: 'keyvalue',
    field: { type: 'keyvalue' },
    value: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-234-567-8900'
    }
  }
}

// ==================== Media Renderers ====================

export const ImageRenderer: Story = {
  args: {
    title: 'Image Renderer',
    description: '图片渲染器，显示图片并支持预览。',
    rendererType: 'image',
    field: { type: 'image' },
    value: 'https://via.placeholder.com/300x200'
  }
}

export const FileRenderer: Story = {
  args: {
    title: 'File Renderer',
    description: '文件渲染器，显示文件信息和下载链接。',
    rendererType: 'file',
    field: { type: 'file' },
    value: {
      name: 'document.pdf',
      url: 'https://example.com/files/document.pdf',
      size: 1024000,
      type: 'application/pdf'
    }
  }
}

// ==================== Relation Renderers ====================

export const BelongsToRenderer: Story = {
  args: {
    title: 'BelongsTo Renderer',
    description: '一对一关联渲染器，显示关联的单个对象。',
    rendererType: 'belongsto',
    field: { type: 'belongsto', options: { target: 'User' } },
    value: { id: 1, name: 'John Doe', email: 'john@example.com' }
  }
}

export const HasManyRenderer: Story = {
  args: {
    title: 'HasMany Renderer',
    description: '一对多关联渲染器，显示关联的多个对象列表。',
    rendererType: 'hasmany',
    field: { type: 'hasmany', options: { target: 'Post' } },
    value: [
      { id: 1, title: 'First Post' },
      { id: 2, title: 'Second Post' },
      { id: 3, title: 'Third Post' }
    ]
  }
}

export const ManyToManyRenderer: Story = {
  args: {
    title: 'ManyToMany Renderer',
    description: '多对多关联渲染器，显示多对多关联的对象列表。',
    rendererType: 'manytomany',
    field: { type: 'manytomany', options: { target: 'Tag' } },
    value: [
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'React' },
      { id: 3, name: 'TypeScript' }
    ]
  }
}

// ==================== Special Renderers ====================

export const JSONRenderer: Story = {
  args: {
    title: 'JSON Renderer',
    description: 'JSON 渲染器，以语法高亮的方式显示 JSON 数据。',
    rendererType: 'json',
    field: { type: 'json' },
    value: {
      user: {
        id: 1,
        name: 'John Doe',
        preferences: {
          theme: 'dark',
          language: 'en'
        },
        tags: ['admin', 'developer']
      }
    }
  }
}

export const CodeRenderer: Story = {
  args: {
    title: 'Code Renderer',
    description: '代码渲染器，以语法高亮的方式显示代码。',
    rendererType: 'code',
    field: { type: 'code', options: { language: 'javascript' } },
    value: `function greet(name) {
  console.log(\`Hello, \${name}!\`)
  return true
}`
  }
}

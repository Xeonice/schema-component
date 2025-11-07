import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  FieldRenderer,
  HorizontalFieldRenderer,
  InlineFieldRenderer,
} from '@schema-component/theme'
import type { FieldRendererProps } from '@schema-component/theme'

// Renderers are registered globally in preview.ts

interface FieldRendererDemoProps {
  title: string
  description: string
  layoutType: string
  fields: Array<Omit<FieldRendererProps, 'schema'>>
}

const FieldRendererDemo: React.FC<FieldRendererDemoProps> = ({
  title,
  description,
  layoutType,
  fields
}) => {
  const schema = { name: 'Demo', fields: {} }

  // No-op change handler - do nothing on change
  const handleFieldChange = () => {
    // Intentionally empty
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>
        {title} <code style={{ fontSize: '14px', color: '#6b7280' }}>({layoutType})</code>
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* View Mode */}
        <div>
          <h4 style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>View Mode</h4>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {fields.map((fieldProps) => {
              const Component = layoutType === 'horizontal'
                ? HorizontalFieldRenderer
                : layoutType === 'inline'
                  ? InlineFieldRenderer
                  : FieldRenderer

              return (
                <Component
                  key={fieldProps.field.name}
                  {...fieldProps}
                  schema={schema}
                  mode="view"
                />
              )
            })}
          </div>
        </div>

        {/* Edit Mode */}
        <div>
          <h4 style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>Edit Mode</h4>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {fields.map((fieldProps) => {
              const Component = layoutType === 'horizontal'
                ? HorizontalFieldRenderer
                : layoutType === 'inline'
                  ? InlineFieldRenderer
                  : FieldRenderer

              return (
                <Component
                  key={fieldProps.field.name}
                  {...fieldProps}
                  onChange={handleFieldChange}
                  schema={schema}
                  mode="edit"
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Current Form Data */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Current Form Data</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {JSON.stringify(fields.reduce((acc, f) => ({ ...acc, [f.field.name]: f.value }), {}), null, 2)}
        </pre>
      </div>
    </div>
  )
}

const meta: Meta<typeof FieldRendererDemo> = {
  title: 'Theme/Field Renderers',
  component: FieldRendererDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'FieldRenderer 组件将字段标签、描述和数据渲染器组合在一起，提供不同的布局方式。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof FieldRendererDemo>

// ==================== Default (Vertical) Layout ====================

export const DefaultLayout: Story = {
  args: {
    title: 'Default Field Renderer',
    description: '默认的垂直布局，标签在上方，字段在下方。适合大多数表单场景。',
    layoutType: 'default',
    fields: [
      {
        field: {
          name: 'name',
          type: 'string',
          label: 'Full Name',
          description: 'Enter your full name',
          required: true
        },
        fieldDef: { type: 'string' },
        value: 'John Doe'
      },
      {
        field: {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          description: 'We will never share your email',
          required: true
        },
        fieldDef: { type: 'email' },
        value: 'john@example.com'
      },
      {
        field: {
          name: 'phone',
          type: 'phone',
          label: 'Phone Number',
          description: 'Include country code'
        },
        fieldDef: { type: 'phone' },
        value: '+1-234-567-8900'
      },
      {
        field: {
          name: 'bio',
          type: 'textarea',
          label: 'Biography',
          description: 'Tell us about yourself'
        },
        fieldDef: { type: 'textarea' },
        value: 'Software developer with a passion for React and TypeScript.'
      }
    ]
  }
}

export const DefaultLayoutWithValidation: Story = {
  args: {
    title: 'Default Layout with Validation',
    description: '展示默认布局下的字段验证错误显示。',
    layoutType: 'default',
    fields: [
      {
        field: {
          name: 'username',
          type: 'string',
          label: 'Username',
          required: true
        },
        fieldDef: { type: 'string' },
        value: '',
        error: 'Username is required'
      },
      {
        field: {
          name: 'password',
          type: 'password',
          label: 'Password',
          required: true
        },
        fieldDef: { type: 'password' },
        value: '123',
        error: 'Password must be at least 8 characters'
      },
      {
        field: {
          name: 'age',
          type: 'number',
          label: 'Age',
          required: true
        },
        fieldDef: { type: 'number' },
        value: 15,
        error: 'Must be at least 18 years old'
      }
    ]
  }
}

// ==================== Horizontal Layout ====================

export const HorizontalLayout: Story = {
  args: {
    title: 'Horizontal Field Renderer',
    description: '水平布局，标签在左侧，字段在右侧。适合详情页和设置页面。',
    layoutType: 'horizontal',
    fields: [
      {
        field: {
          name: 'firstName',
          type: 'string',
          label: 'First Name',
          required: true
        },
        fieldDef: { type: 'string' },
        value: 'John'
      },
      {
        field: {
          name: 'lastName',
          type: 'string',
          label: 'Last Name',
          required: true
        },
        fieldDef: { type: 'string' },
        value: 'Doe'
      },
      {
        field: {
          name: 'company',
          type: 'string',
          label: 'Company',
          description: 'Your current company'
        },
        fieldDef: { type: 'string' },
        value: 'Acme Corp'
      },
      {
        field: {
          name: 'role',
          type: 'string',
          label: 'Role',
          description: 'Your job title'
        },
        fieldDef: { type: 'string' },
        value: 'Senior Developer'
      }
    ]
  }
}

export const HorizontalLayoutSettings: Story = {
  args: {
    title: 'Horizontal Layout - Settings Form',
    description: '水平布局的设置表单示例，展示不同类型的字段。',
    layoutType: 'horizontal',
    fields: [
      {
        field: {
          name: 'notifications',
          type: 'switch',
          label: 'Email Notifications',
          description: 'Receive email updates'
        },
        fieldDef: { type: 'switch' },
        value: true
      },
      {
        field: {
          name: 'theme',
          type: 'string',
          label: 'Theme',
          description: 'Choose your preferred theme'
        },
        fieldDef: { type: 'string' },
        value: 'dark'
      },
      {
        field: {
          name: 'language',
          type: 'string',
          label: 'Language',
          description: 'Select your language'
        },
        fieldDef: { type: 'string' },
        value: 'English'
      },
      {
        field: {
          name: 'timezone',
          type: 'string',
          label: 'Timezone',
          description: 'Your local timezone'
        },
        fieldDef: { type: 'string' },
        value: 'UTC-8'
      }
    ]
  }
}

// ==================== Inline Layout ====================

export const InlineLayout: Story = {
  args: {
    title: 'Inline Field Renderer',
    description: '内联布局，标签和字段在同一行。适合紧凑的表单和过滤器。',
    layoutType: 'inline',
    fields: [
      {
        field: {
          name: 'search',
          type: 'string',
          label: 'Search',
          required: false
        },
        fieldDef: { type: 'string' },
        value: ''
      },
      {
        field: {
          name: 'category',
          type: 'string',
          label: 'Category'
        },
        fieldDef: { type: 'string' },
        value: 'All'
      },
      {
        field: {
          name: 'status',
          type: 'string',
          label: 'Status'
        },
        fieldDef: { type: 'string' },
        value: 'Active'
      },
      {
        field: {
          name: 'sortBy',
          type: 'string',
          label: 'Sort By'
        },
        fieldDef: { type: 'string' },
        value: 'Date'
      }
    ]
  }
}

export const InlineLayoutFilters: Story = {
  args: {
    title: 'Inline Layout - Filter Form',
    description: '内联布局的过滤器表单示例。',
    layoutType: 'inline',
    fields: [
      {
        field: {
          name: 'dateFrom',
          type: 'date',
          label: 'From'
        },
        fieldDef: { type: 'date' },
        value: '2024-01-01'
      },
      {
        field: {
          name: 'dateTo',
          type: 'date',
          label: 'To'
        },
        fieldDef: { type: 'date' },
        value: '2024-12-31'
      },
      {
        field: {
          name: 'minPrice',
          type: 'number',
          label: 'Min Price'
        },
        fieldDef: { type: 'number' },
        value: 0
      },
      {
        field: {
          name: 'maxPrice',
          type: 'number',
          label: 'Max Price'
        },
        fieldDef: { type: 'number' },
        value: 1000
      }
    ]
  }
}

// ==================== Mixed Field Types ====================

export const MixedFieldTypes: Story = {
  args: {
    title: 'Mixed Field Types',
    description: '展示不同字段类型在默认布局下的渲染效果。',
    layoutType: 'default',
    fields: [
      {
        field: {
          name: 'title',
          type: 'string',
          label: 'Title',
          required: true
        },
        fieldDef: { type: 'string' },
        value: 'Sample Article'
      },
      {
        field: {
          name: 'published',
          type: 'switch',
          label: 'Published',
          description: 'Make this article public'
        },
        fieldDef: { type: 'switch' },
        value: false
      },
      {
        field: {
          name: 'publishDate',
          type: 'datetime',
          label: 'Publish Date',
          description: 'When to publish this article'
        },
        fieldDef: { type: 'datetime' },
        value: new Date().toISOString()
      },
      {
        field: {
          name: 'author',
          type: 'belongsto',
          label: 'Author'
        },
        fieldDef: { type: 'belongsto', options: { target: 'User' } },
        value: { id: 1, name: 'John Doe' }
      },
      {
        field: {
          name: 'tags',
          type: 'tags',
          label: 'Tags',
          description: 'Add relevant tags'
        },
        fieldDef: { type: 'tags' },
        value: ['React', 'TypeScript', 'Tutorial']
      },
      {
        field: {
          name: 'views',
          type: 'number',
          label: 'View Count',
          description: 'Number of views'
        },
        fieldDef: { type: 'number' },
        value: 1250,
        readOnly: true
      }
    ]
  }
}

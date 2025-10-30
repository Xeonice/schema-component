import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// 这是一个示例组件，展示如何使用 Schema 的基础字段
// 实际使用时，您需要从 @schema-component/schema 导入真实的 API

interface SchemaFieldDemoProps {
  fieldType: string
  fieldOptions: Record<string, any>
  description: string
}

const SchemaFieldDemo: React.FC<SchemaFieldDemoProps> = ({
  fieldType,
  fieldOptions,
  description
}) => {
  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>
        <code>{fieldType}</code>
      </h3>
      <p style={{ color: '#6b7280' }}>{description}</p>
      <div style={{ marginTop: '16px' }}>
        <h4>选项:</h4>
        <pre style={{
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
          {JSON.stringify(fieldOptions, null, 2)}
        </pre>
      </div>
      <div style={{ marginTop: '16px' }}>
        <h4>使用示例:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
          {`field.${fieldType}(${JSON.stringify(fieldOptions, null, 2)})`}
        </pre>
      </div>
    </div>
  )
}

const meta: Meta<typeof SchemaFieldDemo> = {
  title: 'Schema/Basic Fields',
  component: SchemaFieldDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '展示 Schema Component 的基础字段类型及其使用方法。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof SchemaFieldDemo>

// String 字段
export const StringField: Story = {
  args: {
    fieldType: 'string',
    fieldOptions: {
      minLength: 2,
      maxLength: 50,
      required: true
    },
    description: '字符串类型字段，支持长度限制、正则验证等。'
  }
}

// Email 字段
export const EmailField: Story = {
  args: {
    fieldType: 'email',
    fieldOptions: {
      required: true,
      unique: true,
      lowercase: true
    },
    description: '邮箱类型字段，自动进行邮箱格式验证。'
  }
}

// Integer 字段
export const IntegerField: Story = {
  args: {
    fieldType: 'integer',
    fieldOptions: {
      min: 0,
      max: 150,
      required: true
    },
    description: '整数类型字段，支持范围限制。'
  }
}

// Boolean 字段
export const BooleanField: Story = {
  args: {
    fieldType: 'boolean',
    fieldOptions: {
      default: false
    },
    description: '布尔类型字段，表示真/假值。'
  }
}

// Enum 字段
export const EnumField: Story = {
  args: {
    fieldType: 'enum',
    fieldOptions: {
      values: ['pending', 'active', 'inactive'],
      default: 'pending'
    },
    description: '枚举类型字段，限制为预定义的值列表。'
  }
}

// Date 字段
export const DateField: Story = {
  args: {
    fieldType: 'date',
    fieldOptions: {
      max: new Date().toISOString(),
      required: true
    },
    description: '日期类型字段，支持日期范围限制。'
  }
}

// Timestamp 字段
export const TimestampField: Story = {
  args: {
    fieldType: 'timestamp',
    fieldOptions: {
      autoCreate: true,
      required: true
    },
    description: '时间戳字段，可自动设置创建/更新时间。'
  }
}

// JSON 字段
export const JSONField: Story = {
  args: {
    fieldType: 'json',
    fieldOptions: {
      default: {}
    },
    description: 'JSON 类型字段，存储 JSON 对象。'
  }
}

// Array 字段
export const ArrayField: Story = {
  args: {
    fieldType: 'array',
    fieldOptions: {
      items: { type: 'string' },
      minItems: 1,
      maxItems: 10
    },
    description: '数组类型字段，可限制元素类型和数量。'
  }
}

// UUID 字段
export const UUIDField: Story = {
  args: {
    fieldType: 'uuid',
    fieldOptions: {
      primary: true,
      required: true
    },
    description: 'UUID 类型字段，通常用作主键。'
  }
}

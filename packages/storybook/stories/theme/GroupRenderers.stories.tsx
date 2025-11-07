import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  StackGroupRenderer,
  GridGroupRenderer,
  TabsGroupRenderer,
  AccordionGroupRenderer,
  CardGroupRenderer,
  FieldRenderer,
} from '@schema-component/theme'
import type { GroupDefinition } from '@schema-component/engine'

// Renderers are registered globally in preview.ts

interface GroupRendererDemoProps {
  title: string
  description: string
  groupType: string
  groups: Array<{
    group: GroupDefinition
    fields: Array<{
      name: string
      type: string
      label: string
      value: any
    }>
  }>
}

const GroupRendererDemo: React.FC<GroupRendererDemoProps> = ({
  title,
  description,
  groupType,
  groups
}) => {
  const schema = { name: 'Demo', fields: {} }

  // Compute form data directly from props
  const formData: Record<string, any> = {}
  groups.forEach(({ fields }) => {
    fields.forEach(field => {
      formData[field.name] = field.value
    })
  })

  // No-op change handler
  const handleFieldChange = () => {
    // Intentionally empty
  }

  const GroupComponent = groupType === 'stack'
    ? StackGroupRenderer
    : groupType === 'grid'
      ? GridGroupRenderer
      : groupType === 'tabs'
        ? TabsGroupRenderer
        : groupType === 'accordion'
          ? AccordionGroupRenderer
          : CardGroupRenderer

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>
        {title} <code style={{ fontSize: '14px', color: '#6b7280' }}>({groupType})</code>
      </h3>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{description}</p>

      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        {groups.map(({ group, fields }, index) => (
          <GroupComponent
            key={index}
            group={group}
            data={formData}
            schema={schema}
            mode="edit"
          >
            {fields.map(field => (
              <FieldRenderer
                key={field.name}
                field={{
                  name: field.name,
                  type: field.type,
                  label: field.label
                }}
                fieldDef={{ type: field.type as any }}
                value={formData[field.name]}
                onChange={(value) => handleFieldChange(field.name, value)}
                schema={schema}
                mode="edit"
              />
            ))}
          </GroupComponent>
        ))}
      </div>

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
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  )
}

const meta: Meta<typeof GroupRendererDemo> = {
  title: 'Theme/Group Renderers',
  component: GroupRendererDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'GroupRenderer 组件将多个字段组织在一起，提供不同的布局和交互方式。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof GroupRendererDemo>

// ==================== Stack Group ====================

export const StackGroup: Story = {
  args: {
    title: 'Stack Group Renderer',
    description: '垂直堆叠布局，字段按顺序垂直排列。这是最简单和常用的布局方式。',
    groupType: 'stack',
    groups: [
      {
        group: {
          type: 'stack',
          title: 'Personal Information',
          description: 'Basic personal details',
          fields: ['firstName', 'lastName', 'email', 'phone']
        },
        fields: [
          { name: 'firstName', type: 'string', label: 'First Name', value: 'John' },
          { name: 'lastName', type: 'string', label: 'Last Name', value: 'Doe' },
          { name: 'email', type: 'email', label: 'Email', value: 'john@example.com' },
          { name: 'phone', type: 'phone', label: 'Phone', value: '+1-234-567-8900' }
        ]
      }
    ]
  }
}

export const StackGroupMultiple: Story = {
  args: {
    title: 'Multiple Stack Groups',
    description: '多个垂直堆叠组，每个组有独立的标题和描述。',
    groupType: 'stack',
    groups: [
      {
        group: {
          type: 'stack',
          title: 'Account Settings',
          description: 'Manage your account preferences',
          fields: ['username', 'password']
        },
        fields: [
          { name: 'username', type: 'string', label: 'Username', value: 'johndoe' },
          { name: 'password', type: 'password', label: 'Password', value: 'secret123' }
        ]
      },
      {
        group: {
          type: 'stack',
          title: 'Notification Settings',
          description: 'Configure how you receive notifications',
          fields: ['emailNotif', 'pushNotif']
        },
        fields: [
          { name: 'emailNotif', type: 'switch', label: 'Email Notifications', value: true },
          { name: 'pushNotif', type: 'switch', label: 'Push Notifications', value: false }
        ]
      }
    ]
  }
}

// ==================== Grid Group ====================

export const GridGroup: Story = {
  args: {
    title: 'Grid Group Renderer',
    description: '网格布局，字段在多列中排列。适合紧凑显示多个字段。',
    groupType: 'grid',
    groups: [
      {
        group: {
          type: 'grid',
          title: 'Contact Information',
          description: 'How to reach you',
          fields: ['email', 'phone', 'address', 'city', 'state', 'zip'],
          options: { columns: 2 }
        },
        fields: [
          { name: 'email', type: 'email', label: 'Email', value: 'john@example.com' },
          { name: 'phone', type: 'phone', label: 'Phone', value: '+1-234-567-8900' },
          { name: 'address', type: 'string', label: 'Address', value: '123 Main St' },
          { name: 'city', type: 'string', label: 'City', value: 'San Francisco' },
          { name: 'state', type: 'string', label: 'State', value: 'CA' },
          { name: 'zip', type: 'string', label: 'ZIP Code', value: '94101' }
        ]
      }
    ]
  }
}

export const GridGroupThreeColumns: Story = {
  args: {
    title: 'Grid Group - Three Columns',
    description: '三列网格布局示例。',
    groupType: 'grid',
    groups: [
      {
        group: {
          type: 'grid',
          title: 'Product Details',
          fields: ['sku', 'price', 'stock', 'weight', 'width', 'height'],
          options: { columns: 3 }
        },
        fields: [
          { name: 'sku', type: 'string', label: 'SKU', value: 'PROD-001' },
          { name: 'price', type: 'currency', label: 'Price', value: 99.99 },
          { name: 'stock', type: 'number', label: 'Stock', value: 150 },
          { name: 'weight', type: 'number', label: 'Weight (kg)', value: 2.5 },
          { name: 'width', type: 'number', label: 'Width (cm)', value: 30 },
          { name: 'height', type: 'number', label: 'Height (cm)', value: 20 }
        ]
      }
    ]
  }
}

// ==================== Tabs Group ====================

export const TabsGroup: Story = {
  args: {
    title: 'Tabs Group Renderer',
    description: '选项卡布局，将字段分组到不同的标签页中。适合组织大量相关但独立的字段。',
    groupType: 'tabs',
    groups: [
      {
        group: {
          type: 'tabs',
          title: 'User Profile',
          fields: ['name', 'bio'],
          options: { label: 'Profile' }
        },
        fields: [
          { name: 'name', type: 'string', label: 'Display Name', value: 'John Doe' },
          { name: 'bio', type: 'textarea', label: 'Bio', value: 'Software developer' }
        ]
      },
      {
        group: {
          type: 'tabs',
          title: 'Security',
          fields: ['oldPassword', 'newPassword'],
          options: { label: 'Security' }
        },
        fields: [
          { name: 'oldPassword', type: 'password', label: 'Old Password', value: '' },
          { name: 'newPassword', type: 'password', label: 'New Password', value: '' }
        ]
      },
      {
        group: {
          type: 'tabs',
          title: 'Preferences',
          fields: ['theme', 'language'],
          options: { label: 'Preferences' }
        },
        fields: [
          { name: 'theme', type: 'string', label: 'Theme', value: 'dark' },
          { name: 'language', type: 'string', label: 'Language', value: 'English' }
        ]
      }
    ]
  }
}

// ==================== Accordion Group ====================

export const AccordionGroup: Story = {
  args: {
    title: 'Accordion Group Renderer',
    description: '手风琴布局，可折叠/展开的分组。适合有大量可选配置的表单。',
    groupType: 'accordion',
    groups: [
      {
        group: {
          type: 'accordion',
          title: 'Basic Information',
          description: 'Essential user details',
          fields: ['firstName', 'lastName'],
          options: { defaultOpen: true }
        },
        fields: [
          { name: 'firstName', type: 'string', label: 'First Name', value: 'John' },
          { name: 'lastName', type: 'string', label: 'Last Name', value: 'Doe' }
        ]
      },
      {
        group: {
          type: 'accordion',
          title: 'Contact Details',
          description: 'How to reach you',
          fields: ['email', 'phone']
        },
        fields: [
          { name: 'email', type: 'email', label: 'Email', value: 'john@example.com' },
          { name: 'phone', type: 'phone', label: 'Phone', value: '+1-234-567-8900' }
        ]
      },
      {
        group: {
          type: 'accordion',
          title: 'Additional Information',
          description: 'Optional details',
          fields: ['company', 'website']
        },
        fields: [
          { name: 'company', type: 'string', label: 'Company', value: 'Acme Corp' },
          { name: 'website', type: 'url', label: 'Website', value: 'https://example.com' }
        ]
      }
    ]
  }
}

// ==================== Card Group ====================

export const CardGroup: Story = {
  args: {
    title: 'Card Group Renderer',
    description: '卡片布局，将字段包装在卡片容器中。提供视觉上的分组和层次感。',
    groupType: 'card',
    groups: [
      {
        group: {
          type: 'card',
          title: 'Billing Address',
          description: 'Where should we send the invoice?',
          fields: ['street', 'city', 'country']
        },
        fields: [
          { name: 'street', type: 'string', label: 'Street Address', value: '123 Main St' },
          { name: 'city', type: 'string', label: 'City', value: 'San Francisco' },
          { name: 'country', type: 'string', label: 'Country', value: 'United States' }
        ]
      }
    ]
  }
}

export const CardGroupMultiple: Story = {
  args: {
    title: 'Multiple Card Groups',
    description: '多个卡片组，每个卡片独立显示。',
    groupType: 'card',
    groups: [
      {
        group: {
          type: 'card',
          title: 'Personal Details',
          fields: ['fullName', 'dateOfBirth']
        },
        fields: [
          { name: 'fullName', type: 'string', label: 'Full Name', value: 'John Doe' },
          { name: 'dateOfBirth', type: 'date', label: 'Date of Birth', value: '1990-01-15' }
        ]
      },
      {
        group: {
          type: 'card',
          title: 'Employment',
          description: 'Your current employment status',
          fields: ['employer', 'position', 'startDate']
        },
        fields: [
          { name: 'employer', type: 'string', label: 'Employer', value: 'Acme Corp' },
          { name: 'position', type: 'string', label: 'Position', value: 'Senior Developer' },
          { name: 'startDate', type: 'date', label: 'Start Date', value: '2020-03-01' }
        ]
      },
      {
        group: {
          type: 'card',
          title: 'Emergency Contact',
          description: 'Who should we contact in case of emergency?',
          fields: ['emergencyName', 'emergencyPhone']
        },
        fields: [
          { name: 'emergencyName', type: 'string', label: 'Contact Name', value: 'Jane Doe' },
          { name: 'emergencyPhone', type: 'phone', label: 'Contact Phone', value: '+1-234-567-8901' }
        ]
      }
    ]
  }
}

// ==================== Complex Example ====================

export const ComplexForm: Story = {
  args: {
    title: 'Complex Form with Mixed Groups',
    description: '展示如何组合使用不同的组渲染器创建复杂表单。',
    groupType: 'stack',
    groups: [
      {
        group: {
          type: 'stack',
          title: 'Registration Form',
          description: 'Create your account',
          fields: ['username', 'email', 'password', 'confirmPassword', 'agree']
        },
        fields: [
          { name: 'username', type: 'string', label: 'Username', value: '' },
          { name: 'email', type: 'email', label: 'Email Address', value: '' },
          { name: 'password', type: 'password', label: 'Password', value: '' },
          { name: 'confirmPassword', type: 'password', label: 'Confirm Password', value: '' },
          { name: 'agree', type: 'checkbox', label: 'I agree to the Terms and Conditions', value: false }
        ]
      }
    ]
  }
}

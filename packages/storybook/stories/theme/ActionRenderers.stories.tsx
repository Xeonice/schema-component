import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  ActionRenderer,
  registerRenderers,
} from '@schema-component/theme'
import type { ActionDefinition } from '@schema-component/engine'

// Initialize renderers only once
if (typeof window !== 'undefined' && !(window as any).__renderersInitialized) {
  registerRenderers()
  ;(window as any).__renderersInitialized = true
}

interface ActionRendererDemoProps {
  title: string
  description: string
  actions: ActionDefinition[]
}

const ActionRendererDemo: React.FC<ActionRendererDemoProps> = ({
  title,
  description,
  actions
}) => {
  const [clickLog, setClickLog] = React.useState<string[]>([])
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null)

  const handleActionClick = async (actionName: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setClickLog(prev => [...prev, `[${timestamp}] Action "${actionName}" clicked`])

    // Simulate async action
    setLoadingAction(actionName)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoadingAction(null)

    setClickLog(prev => [...prev, `[${timestamp}] Action "${actionName}" completed`])
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>{title}</h3>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{description}</p>

      <div style={{
        padding: '24px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {actions.map((action, index) => (
          <ActionRenderer
            key={index}
            action={action}
            onClick={() => handleActionClick(action.name)}
            loading={loadingAction === action.name}
          />
        ))}
      </div>

      {clickLog.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Action Log</h4>
          <pre style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            maxHeight: '200px'
          }}>
            {clickLog.join('\n')}
          </pre>
        </div>
      )}
    </div>
  )
}

const meta: Meta<typeof ActionRendererDemo> = {
  title: 'Theme/Action Renderers',
  component: ActionRendererDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ActionRenderer 组件根据 action 定义动态渲染按钮、链接或下拉菜单等交互元素。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ActionRendererDemo>

// ==================== Button Actions ====================

export const ButtonActions: Story = {
  args: {
    title: 'Button Action Renderer',
    description: '按钮形式的操作，支持不同的按钮样式和状态。',
    actions: [
      {
        type: 'button',
        name: 'submit',
        label: 'Submit',
        icon: '✓',
        buttonType: 'primary'
      },
      {
        type: 'button',
        name: 'cancel',
        label: 'Cancel',
        buttonType: 'secondary'
      },
      {
        type: 'button',
        name: 'delete',
        label: 'Delete',
        icon: '🗑',
        buttonType: 'danger'
      }
    ]
  }
}

export const ButtonVariants: Story = {
  args: {
    title: 'Button Variants',
    description: '展示不同变体的按钮样式。',
    actions: [
      {
        type: 'button',
        name: 'default',
        label: 'Default'
      },
      {
        type: 'button',
        name: 'secondary',
        label: 'Secondary'
      },
      {
        type: 'button',
        name: 'outline',
        label: 'Outline'
      },
      {
        type: 'button',
        name: 'ghost',
        label: 'Ghost'
      },
      {
        type: 'button',
        name: 'link',
        label: 'Link'
      }
    ]
  }
}

export const ButtonWithIcons: Story = {
  args: {
    title: 'Buttons with Icons',
    description: '带图标的按钮示例。',
    actions: [
      {
        type: 'button',
        name: 'save',
        label: 'Save',
        icon: '💾'
      },
      {
        type: 'button',
        name: 'edit',
        label: 'Edit',
        icon: '✏️'
      },
      {
        type: 'button',
        name: 'download',
        label: 'Download',
        icon: '⬇️'
      },
      {
        type: 'button',
        name: 'upload',
        label: 'Upload',
        icon: '⬆️'
      },
      {
        type: 'button',
        name: 'refresh',
        label: 'Refresh',
        icon: '🔄'
      }
    ]
  }
}

export const DisabledButtons: Story = {
  args: {
    title: 'Disabled Button Actions',
    description: '禁用状态的按钮。',
    actions: [
      {
        type: 'button',
        name: 'submit',
        label: 'Submit',
        disabled: true
      },
      {
        type: 'button',
        name: 'delete',
        label: 'Delete',
        icon: '🗑',
        disabled: true
      }
    ]
  }
}

// ==================== Link Actions ====================

export const LinkActions: Story = {
  args: {
    title: 'Link Action Renderer',
    description: '链接形式的操作，适合导航和跳转。',
    actions: [
      {
        type: 'link',
        name: 'view-details',
        label: 'View Details'
      },
      {
        type: 'link',
        name: 'view-profile',
        label: 'View Profile',
        icon: '👤'
      },
      {
        type: 'link',
        name: 'external-link',
        label: 'External Link',
        icon: '🔗'
      }
    ]
  }
}

export const LinkWithIcons: Story = {
  args: {
    title: 'Links with Icons',
    description: '带图标的链接示例。',
    actions: [
      {
        type: 'link',
        name: 'home',
        label: 'Home',
        icon: '🏠'
      },
      {
        type: 'link',
        name: 'settings',
        label: 'Settings',
        icon: '⚙️'
      },
      {
        type: 'link',
        name: 'help',
        label: 'Help',
        icon: '❓'
      },
      {
        type: 'link',
        name: 'logout',
        label: 'Logout',
        icon: '🚪'
      }
    ]
  }
}

// ==================== Dropdown Actions ====================

export const DropdownActions: Story = {
  args: {
    title: 'Dropdown Action Renderer',
    description: '下拉菜单形式的操作，将多个操作组织在一起。',
    actions: [
      {
        type: 'dropdown',
        name: 'more-actions',
        label: 'More Actions',
        icon: '⋮'
      }
    ]
  }
}

// ==================== Mixed Actions ====================

export const MixedActions: Story = {
  args: {
    title: 'Mixed Action Types',
    description: '混合使用不同类型的 Action Renderer。',
    actions: [
      {
        type: 'button',
        name: 'create',
        label: 'Create New',
        icon: '➕',
        buttonType: 'primary'
      },
      {
        type: 'button',
        name: 'import',
        label: 'Import',
        icon: '📥'
      },
      {
        type: 'button',
        name: 'export',
        label: 'Export',
        icon: '📤'
      },
      {
        type: 'link',
        name: 'view-all',
        label: 'View All',
        icon: '👁'
      },
      {
        type: 'dropdown',
        name: 'more',
        label: 'More',
        icon: '⋮'
      }
    ]
  }
}

// ==================== Action Bar Example ====================

export const ActionBar: Story = {
  args: {
    title: 'Action Bar',
    description: '典型的操作栏示例，包含主要操作和次要操作。',
    actions: [
      {
        type: 'button',
        name: 'save',
        label: 'Save',
        icon: '💾',
        buttonType: 'primary'
      },
      {
        type: 'button',
        name: 'save-draft',
        label: 'Save as Draft',
        icon: '📝'
      },
      {
        type: 'button',
        name: 'preview',
        label: 'Preview',
        icon: '👁'
      },
      {
        type: 'link',
        name: 'cancel',
        label: 'Cancel'
      }
    ]
  }
}

export const TableActions: Story = {
  args: {
    title: 'Table Row Actions',
    description: '表格行操作示例，用于对单个数据项进行操作。',
    actions: [
      {
        type: 'link',
        name: 'view',
        label: 'View',
        icon: '👁'
      },
      {
        type: 'link',
        name: 'edit',
        label: 'Edit',
        icon: '✏️'
      },
      {
        type: 'link',
        name: 'duplicate',
        label: 'Duplicate',
        icon: '📋'
      },
      {
        type: 'button',
        name: 'delete',
        label: 'Delete',
        icon: '🗑',
        buttonType: 'danger'
      }
    ]
  }
}

// ==================== Form Actions ====================

export const FormActions: Story = {
  args: {
    title: 'Form Actions',
    description: '表单底部的操作按钮组合。',
    actions: [
      {
        type: 'button',
        name: 'submit',
        label: 'Submit',
        buttonType: 'primary'
      },
      {
        type: 'button',
        name: 'reset',
        label: 'Reset'
      },
      {
        type: 'link',
        name: 'cancel',
        label: 'Cancel'
      }
    ]
  }
}

export const ModalActions: Story = {
  args: {
    title: 'Modal Actions',
    description: '对话框/模态框的操作按钮。',
    actions: [
      {
        type: 'button',
        name: 'confirm',
        label: 'Confirm',
        buttonType: 'primary'
      },
      {
        type: 'button',
        name: 'cancel',
        label: 'Cancel',
        buttonType: 'secondary'
      }
    ]
  }
}

// ==================== Bulk Actions ====================

export const BulkActions: Story = {
  args: {
    title: 'Bulk Actions',
    description: '批量操作示例，用于对多个选中项进行操作。',
    actions: [
      {
        type: 'button',
        name: 'bulk-edit',
        label: 'Edit Selected',
        icon: '✏️'
      },
      {
        type: 'button',
        name: 'bulk-delete',
        label: 'Delete Selected',
        icon: '🗑',
        buttonType: 'danger'
      },
      {
        type: 'button',
        name: 'bulk-export',
        label: 'Export Selected',
        icon: '📤'
      },
      {
        type: 'dropdown',
        name: 'more-bulk',
        label: 'More Actions',
        icon: '⋮'
      }
    ]
  }
}

// ==================== CRUD Actions ====================

export const CRUDActions: Story = {
  args: {
    title: 'CRUD Actions',
    description: '标准 CRUD 操作集合。',
    actions: [
      {
        type: 'button',
        name: 'create',
        label: 'Create',
        icon: '➕',
        buttonType: 'primary'
      },
      {
        type: 'link',
        name: 'read',
        label: 'Read',
        icon: '📖'
      },
      {
        type: 'button',
        name: 'update',
        label: 'Update',
        icon: '✏️'
      },
      {
        type: 'button',
        name: 'delete',
        label: 'Delete',
        icon: '🗑',
        buttonType: 'danger'
      }
    ]
  }
}

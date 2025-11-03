import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import {
  FormView,
  TableView,
  DetailView,
  ListView,
  registerRenderers,
  getRegistry,
} from '@schema-component/theme'
import type { RenderViewDefinition, ActionDefinition } from '@schema-component/engine'
import type { SchemaDefinition } from '@schema-component/schema'

// Initialize renderers only once
if (typeof window !== 'undefined' && !(window as any).__renderersInitialized) {
  registerRenderers()
  ;(window as any).__renderersInitialized = true
}

interface ViewRendererDemoProps {
  title: string
  description: string
  view: RenderViewDefinition
  schema: SchemaDefinition
  data?: any
  actions?: ActionDefinition[]
}

const ViewRendererDemo: React.FC<ViewRendererDemoProps> = ({
  title,
  description,
  view,
  schema,
  data: initialData,
  actions
}) => {
  const [data, setData] = React.useState(initialData)
  const [actionLog, setActionLog] = React.useState<string[]>([])

  const handleDataChange = (newData: any) => {
    setData(newData)
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [...prev, `[${timestamp}] Data updated`])
  }

  const handleActionClick = (actionName: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLog(prev => [...prev, `[${timestamp}] Action "${actionName}" clicked`])
  }

  const ViewComponent = view.type === 'form'
    ? FormView
    : view.type === 'table'
      ? TableView
      : view.type === 'detail'
        ? DetailView
        : ListView

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
        <ViewComponent
          view={view}
          schema={schema}
          data={data}
          onChange={handleDataChange}
          actions={actions}
          mode="edit"
        />
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
        component: 'ViewRenderer 组件提供完整的视图渲染，包括表单、表格、详情和列表视图。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ViewRendererDemo>

// ==================== Form View ====================

const userSchema: SchemaDefinition = {
  name: 'User',
  fields: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'email' },
    phone: { type: 'phone' },
    bio: { type: 'textarea' },
    active: { type: 'switch' },
    role: { type: 'string' }
  }
}

export const FormViewBasic: Story = {
  args: {
    title: 'Form View - Basic',
    description: '基础表单视图，用于创建或编辑数据。',
    view: {
      type: 'form',
      name: 'user-form',
      title: 'User Information',
      fields: ['firstName', 'lastName', 'email', 'phone'],
      layout: 'default'
    },
    schema: userSchema,
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-234-567-8900'
    },
    actions: [
      { type: 'button', name: 'save', label: 'Save', buttonType: 'primary' },
      { type: 'button', name: 'cancel', label: 'Cancel' }
    ]
  }
}

export const FormViewWithGroups: Story = {
  args: {
    title: 'Form View with Groups',
    description: '带分组的表单视图，将相关字段组织在一起。',
    view: {
      type: 'form',
      name: 'user-form-grouped',
      title: 'User Profile',
      groups: [
        {
          type: 'card',
          title: 'Basic Information',
          fields: ['firstName', 'lastName', 'email']
        },
        {
          type: 'card',
          title: 'Additional Details',
          fields: ['phone', 'bio', 'active']
        }
      ],
      layout: 'default'
    },
    schema: userSchema,
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1-234-567-8901',
      bio: 'Product designer with 5 years of experience.',
      active: true
    },
    actions: [
      { type: 'button', name: 'save', label: 'Save Changes', buttonType: 'primary', icon: '💾' },
      { type: 'link', name: 'cancel', label: 'Cancel' }
    ]
  }
}

export const FormViewTwoColumn: Story = {
  args: {
    title: 'Form View - Two Column Layout',
    description: '双列表单布局，适合宽屏显示。',
    view: {
      type: 'form',
      name: 'user-form-2col',
      title: 'Registration Form',
      fields: ['firstName', 'lastName', 'email', 'phone', 'bio', 'active', 'role'],
      layout: 'grid',
      layoutOptions: { columns: 2 }
    },
    schema: userSchema,
    data: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      active: false,
      role: 'user'
    },
    actions: [
      { type: 'button', name: 'submit', label: 'Create Account', buttonType: 'primary' },
      { type: 'button', name: 'reset', label: 'Reset' }
    ]
  }
}

// ==================== Table View ====================

const productSchema: SchemaDefinition = {
  name: 'Product',
  fields: {
    id: { type: 'number', primary: true },
    name: { type: 'string' },
    sku: { type: 'string' },
    price: { type: 'currency' },
    stock: { type: 'number' },
    active: { type: 'badge' },
    category: { type: 'string' }
  }
}

const productsData = [
  { id: 1, name: 'Laptop', sku: 'LAP-001', price: 999.99, stock: 15, active: true, category: 'Electronics' },
  { id: 2, name: 'Mouse', sku: 'MOU-002', price: 29.99, stock: 150, active: true, category: 'Accessories' },
  { id: 3, name: 'Keyboard', sku: 'KEY-003', price: 79.99, stock: 85, active: true, category: 'Accessories' },
  { id: 4, name: 'Monitor', sku: 'MON-004', price: 299.99, stock: 42, active: false, category: 'Electronics' },
  { id: 5, name: 'Webcam', sku: 'WEB-005', price: 89.99, stock: 0, active: true, category: 'Electronics' }
]

export const TableViewBasic: Story = {
  args: {
    title: 'Table View - Basic',
    description: '基础表格视图，用于展示列表数据。',
    view: {
      type: 'table',
      name: 'products-table',
      title: 'Products',
      fields: ['id', 'name', 'sku', 'price', 'stock', 'active']
    },
    schema: productSchema,
    data: productsData,
    actions: [
      { type: 'button', name: 'add', label: 'Add Product', icon: '➕', buttonType: 'primary' },
      { type: 'button', name: 'export', label: 'Export', icon: '📤' }
    ]
  }
}

export const TableViewWithActions: Story = {
  args: {
    title: 'Table View with Row Actions',
    description: '带行操作的表格视图。',
    view: {
      type: 'table',
      name: 'products-table-actions',
      title: 'Product Inventory',
      fields: ['name', 'sku', 'price', 'stock', 'category', 'active'],
      options: {
        showActions: true,
        rowActions: [
          { type: 'link', name: 'edit', label: 'Edit', icon: '✏️' },
          { type: 'button', name: 'delete', label: 'Delete', icon: '🗑', buttonType: 'danger' }
        ]
      }
    },
    schema: productSchema,
    data: productsData,
    actions: [
      { type: 'button', name: 'bulk-delete', label: 'Delete Selected', icon: '🗑' },
      { type: 'button', name: 'refresh', label: 'Refresh', icon: '🔄' }
    ]
  }
}

// ==================== Detail View ====================

const orderSchema: SchemaDefinition = {
  name: 'Order',
  fields: {
    id: { type: 'string' },
    orderNumber: { type: 'string' },
    customer: { type: 'belongsTo' },
    status: { type: 'badge' },
    total: { type: 'currency' },
    items: { type: 'hasMany' },
    createdAt: { type: 'datetime' },
    updatedAt: { type: 'datetime' },
    shippingAddress: { type: 'textarea' },
    notes: { type: 'textarea' }
  }
}

const orderData = {
  id: '123',
  orderNumber: 'ORD-2024-001',
  customer: { id: 1, name: 'John Doe', email: 'john@example.com' },
  status: 'shipped',
  total: 1299.97,
  items: [
    { id: 1, product: 'Laptop', quantity: 1, price: 999.99 },
    { id: 2, product: 'Mouse', quantity: 2, price: 29.99 },
    { id: 3, product: 'Keyboard', quantity: 1, price: 79.99 }
  ],
  createdAt: new Date('2024-03-15T10:30:00').toISOString(),
  updatedAt: new Date('2024-03-16T14:20:00').toISOString(),
  shippingAddress: '123 Main St\nSan Francisco, CA 94101\nUnited States',
  notes: 'Customer requested gift wrapping.'
}

export const DetailViewBasic: Story = {
  args: {
    title: 'Detail View - Basic',
    description: '基础详情视图，用于展示单条数据的完整信息。',
    view: {
      type: 'detail',
      name: 'order-detail',
      title: 'Order Details',
      fields: ['orderNumber', 'customer', 'status', 'total', 'createdAt', 'updatedAt']
    },
    schema: orderSchema,
    data: orderData,
    actions: [
      { type: 'button', name: 'edit', label: 'Edit Order', icon: '✏️' },
      { type: 'button', name: 'cancel', label: 'Cancel Order', buttonType: 'danger' },
      { type: 'link', name: 'back', label: 'Back to Orders' }
    ]
  }
}

export const DetailViewWithGroups: Story = {
  args: {
    title: 'Detail View with Groups',
    description: '带分组的详情视图，将相关信息组织在不同的卡片中。',
    view: {
      type: 'detail',
      name: 'order-detail-grouped',
      title: 'Order #ORD-2024-001',
      groups: [
        {
          type: 'card',
          title: 'Order Information',
          fields: ['orderNumber', 'status', 'total', 'createdAt', 'updatedAt']
        },
        {
          type: 'card',
          title: 'Customer',
          fields: ['customer']
        },
        {
          type: 'card',
          title: 'Items',
          fields: ['items']
        },
        {
          type: 'card',
          title: 'Shipping & Notes',
          fields: ['shippingAddress', 'notes']
        }
      ]
    },
    schema: orderSchema,
    data: orderData,
    actions: [
      { type: 'button', name: 'print', label: 'Print Invoice', icon: '🖨️' },
      { type: 'button', name: 'email', label: 'Email Customer', icon: '📧' }
    ]
  }
}

// ==================== List View ====================

const articleSchema: SchemaDefinition = {
  name: 'Article',
  fields: {
    id: { type: 'number' },
    title: { type: 'string' },
    excerpt: { type: 'textarea' },
    author: { type: 'belongsTo' },
    publishedAt: { type: 'relativeTime' },
    views: { type: 'number' },
    tags: { type: 'tags' },
    status: { type: 'badge' }
  }
}

const articlesData = [
  {
    id: 1,
    title: 'Getting Started with React',
    excerpt: 'Learn the basics of React and start building your first application.',
    author: { id: 1, name: 'John Doe' },
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    views: 1250,
    tags: ['React', 'JavaScript', 'Tutorial'],
    status: 'published'
  },
  {
    id: 2,
    title: 'Advanced TypeScript Patterns',
    excerpt: 'Explore advanced TypeScript patterns and best practices for large applications.',
    author: { id: 2, name: 'Jane Smith' },
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    views: 890,
    tags: ['TypeScript', 'Advanced'],
    status: 'published'
  },
  {
    id: 3,
    title: 'Building Scalable APIs',
    excerpt: 'Best practices for designing and implementing scalable REST APIs.',
    author: { id: 3, name: 'Bob Johnson' },
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    views: 2100,
    tags: ['API', 'Backend', 'Architecture'],
    status: 'published'
  }
]

export const ListViewBasic: Story = {
  args: {
    title: 'List View - Basic',
    description: '基础列表视图，以卡片形式展示数据列表。',
    view: {
      type: 'list',
      name: 'articles-list',
      title: 'Articles',
      fields: ['title', 'excerpt', 'author', 'publishedAt', 'views', 'tags']
    },
    schema: articleSchema,
    data: articlesData,
    actions: [
      { type: 'button', name: 'new', label: 'New Article', icon: '➕', buttonType: 'primary' },
      { type: 'button', name: 'filter', label: 'Filter', icon: '🔍' }
    ]
  }
}

export const ListViewWithStatus: Story = {
  args: {
    title: 'List View with Status',
    description: '带状态标记的列表视图。',
    view: {
      type: 'list',
      name: 'articles-list-status',
      title: 'All Articles',
      fields: ['title', 'author', 'status', 'publishedAt', 'views', 'tags'],
      options: {
        showStatus: true,
        cardLayout: 'comfortable'
      }
    },
    schema: articleSchema,
    data: articlesData,
    actions: [
      { type: 'button', name: 'publish', label: 'Publish Selected', icon: '📢' },
      { type: 'button', name: 'archive', label: 'Archive Selected', icon: '📦' }
    ]
  }
}

// ==================== Complex Examples ====================

const dashboardSchema: SchemaDefinition = {
  name: 'Dashboard',
  fields: {
    totalUsers: { type: 'number' },
    activeUsers: { type: 'number' },
    revenue: { type: 'currency' },
    growth: { type: 'percent' },
    lastUpdated: { type: 'relativeTime' }
  }
}

export const DashboardView: Story = {
  args: {
    title: 'Dashboard View',
    description: '仪表板视图示例，使用详情视图展示关键指标。',
    view: {
      type: 'detail',
      name: 'dashboard',
      title: 'Dashboard Overview',
      groups: [
        {
          type: 'grid',
          title: 'Key Metrics',
          fields: ['totalUsers', 'activeUsers', 'revenue', 'growth'],
          options: { columns: 2 }
        },
        {
          type: 'card',
          title: 'Last Updated',
          fields: ['lastUpdated']
        }
      ]
    },
    schema: dashboardSchema,
    data: {
      totalUsers: 12500,
      activeUsers: 8750,
      revenue: 125000.50,
      growth: 0.15,
      lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 mins ago
    },
    actions: [
      { type: 'button', name: 'refresh', label: 'Refresh', icon: '🔄' },
      { type: 'button', name: 'export', label: 'Export Report', icon: '📊' }
    ]
  }
}

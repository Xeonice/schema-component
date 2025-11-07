/**
 * 模型定义 - 用于 Storybook Stories
 *
 * 这个文件定义了用于演示的各种模型:
 * - User: 用户模型
 * - Product: 产品模型
 * - Order: 订单模型
 * - Article: 文章模型
 */

import { defineModel } from '@schema-component/engine'
import { defineSchema, field } from '@schema-component/schema'

/**
 * User Model - 用户模型
 *
 * 字段说明:
 * - firstName: string - 名字
 * - lastName: string - 姓氏
 * - email: email - 电子邮件地址
 * - phone: phone - 电话号码
 * - bio: textarea - 个人简介
 * - active: switch - 激活状态
 * - role: string - 角色
 */
export const UserModel = defineModel({
  name: 'User',
  schema: defineSchema({
    name: 'User',
    fields: {
      firstName: field.string({ description: 'First Name' }),
      lastName: field.string({ description: 'Last Name' }),
      email: field.email({ description: 'Email' }),
      phone: field.phone({ description: 'Phone' }),
      bio: field.text({ description: 'Bio' }),
      active: field.boolean({ description: 'Active' }),
      role: field.string({ description: 'Role' })
    }
  }),
  views: {
    form: {
      type: 'form',
      name: 'user-form',
      title: 'User Information',
      fields: ['firstName', 'lastName', 'email', 'phone'],
      layout: 'default'
    },
    formGrouped: {
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
    formTwoColumn: {
      type: 'form',
      name: 'user-form-2col',
      title: 'Registration Form',
      fields: ['firstName', 'lastName', 'email', 'phone', 'bio', 'active', 'role'],
      layout: 'grid',
      layoutOptions: { columns: 2 }
    }
  },
  apis: {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async (id: any) => ({ id }),
    create: async (data: any) => ({ id: Date.now(), ...data }),
    update: async (id: any, data: any) => ({ id, ...data }),
    delete: async (id: any) => true
  }
})

/**
 * Product Model - 产品模型
 *
 * 字段说明:
 * - id: number (primary) - 产品ID
 * - name: string - 产品名称
 * - sku: string - SKU
 * - price: currency - 价格
 * - stock: number - 库存
 * - active: badge - 状态
 * - category: string - 分类
 */
export const ProductModel = defineModel({
  name: 'Product',
  schema: defineSchema({
    name: 'Product',
    fields: {
      id: field.integer({ description: 'ID' }),
      name: field.string({ description: 'Name' }),
      sku: field.string({ description: 'SKU' }),
      price: field.float({ description: 'Price' }),
      stock: field.integer({ description: 'Stock' }),
      active: field.boolean({ description: 'Active' }),
      category: field.string({ description: 'Category' })
    }
  }),
  views: {
    table: {
      type: 'table',
      name: 'products-table',
      title: 'Products',
      fields: ['id', 'name', 'sku', 'price', 'stock', 'active']
    },
    tableWithActions: {
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
    tableWithHeaderAndRowActions: {
      type: 'table',
      name: 'products-table-header-row-actions',
      title: 'Product Management',
      fields: ['name', 'sku', 'price', 'stock', 'category', 'active'],
      options: {
        pageSize: 10,
        headerActions: [
          { type: 'button', name: 'create', label: 'New Product', icon: '➕' },
          { type: 'button', name: 'export', label: 'Export', icon: '📥', buttonType: 'secondary' },
          { type: 'button', name: 'bulkDelete', label: 'Bulk Delete', icon: '🗑', buttonType: 'danger' }
        ],
        rowActions: [
          { type: 'link', name: 'view', label: 'View', icon: '👁' },
          { type: 'link', name: 'edit', label: 'Edit', icon: '✏️' },
          { type: 'button', name: 'delete', label: 'Delete', icon: '🗑', buttonType: 'danger' }
        ]
      }
    }
  },
  apis: {
    getList: async () => ({
      data: [
        { id: 1, name: 'Laptop', sku: 'LAP-001', price: 999.99, stock: 15, active: true, category: 'Electronics' },
        { id: 2, name: 'Mouse', sku: 'MOU-002', price: 29.99, stock: 150, active: true, category: 'Accessories' },
        { id: 3, name: 'Keyboard', sku: 'KEY-003', price: 79.99, stock: 85, active: true, category: 'Accessories' },
        { id: 4, name: 'Monitor', sku: 'MON-004', price: 299.99, stock: 42, active: false, category: 'Electronics' },
        { id: 5, name: 'Webcam', sku: 'WEB-005', price: 89.99, stock: 0, active: true, category: 'Electronics' }
      ],
      total: 5
    }),
    getOne: async (id: any) => ({ id }),
    create: async (data: any) => ({ id: Date.now(), ...data }),
    update: async (id: any, data: any) => ({ id, ...data }),
    delete: async (id: any) => true
  }
})

/**
 * Order Model - 订单模型
 *
 * 字段说明:
 * - id: string - 订单ID
 * - orderNumber: string - 订单编号
 * - customer: belongsto - 客户信息
 * - status: badge - 订单状态
 * - total: currency - 订单总额
 * - items: hasmany - 订单项
 * - createdAt: datetime - 创建时间
 * - updatedAt: datetime - 更新时间
 * - shippingAddress: textarea - 收货地址
 * - notes: textarea - 备注
 */
export const OrderModel = defineModel({
  name: 'Order',
  schema: defineSchema({
    name: 'Order',
    fields: {
      id: field.string({ description: 'ID' }),
      orderNumber: field.string({ description: 'Order Number' }),
      customer: field.json({ description: 'Customer' }),
      status: field.string({ description: 'Status' }),
      total: field.float({ description: 'Total' }),
      items: field.jsonArray({ description: 'Items' }),
      createdAt: field.datetime({ description: 'Created' }),
      updatedAt: field.datetime({ description: 'Updated' }),
      shippingAddress: field.text({ description: 'Shipping Address' }),
      notes: field.text({ description: 'Notes' })
    }
  }),
  views: {
    detail: {
      type: 'detail',
      name: 'order-detail',
      title: 'Order Details',
      fields: ['orderNumber', 'customer', 'status', 'total', 'createdAt', 'updatedAt']
    },
    detailGrouped: {
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
    }
  },
  apis: {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async (id: any) => ({
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
    }),
    create: async (data: any) => ({ id: Date.now(), ...data }),
    update: async (id: any, data: any) => ({ id, ...data }),
    delete: async (id: any) => true
  }
})

/**
 * Article Model - 文章模型
 *
 * 字段说明:
 * - id: number - 文章ID
 * - title: string - 标题
 * - excerpt: textarea - 摘要
 * - author: belongsto - 作者
 * - publishedAt: relativetime - 发布时间
 * - views: number - 浏览次数
 * - tags: tags - 标签
 * - status: badge - 状态
 */
export const ArticleModel = defineModel({
  name: 'Article',
  schema: defineSchema({
    name: 'Article',
    fields: {
      id: field.integer({ description: 'ID' }),
      title: field.string({ description: 'Title' }),
      excerpt: field.text({ description: 'Excerpt' }),
      author: field.json({ description: 'Author' }),
      publishedAt: field.datetime({ description: 'Published' }),
      views: field.integer({ description: 'Views' }),
      tags: field.stringArray({ description: 'Tags' }),
      status: field.string({ description: 'Status' })
    }
  }),
  views: {
    list: {
      type: 'list',
      name: 'articles-list',
      title: 'Articles',
      fields: ['title', 'excerpt', 'author', 'publishedAt', 'views', 'tags']
    },
    listWithStatus: {
      type: 'list',
      name: 'articles-list-status',
      title: 'All Articles',
      fields: ['title', 'author', 'status', 'publishedAt', 'views', 'tags'],
      options: {
        showStatus: true,
        cardLayout: 'comfortable'
      }
    }
  },
  apis: {
    getList: async () => ({
      data: [
        {
          id: 1,
          title: 'Getting Started with React',
          excerpt: 'Learn the basics of React and start building your first application.',
          author: { id: 1, name: 'John Doe' },
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          views: 1250,
          tags: ['React', 'JavaScript', 'Tutorial'],
          status: 'published'
        },
        {
          id: 2,
          title: 'Advanced TypeScript Patterns',
          excerpt: 'Explore advanced TypeScript patterns and best practices for large applications.',
          author: { id: 2, name: 'Jane Smith' },
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          views: 890,
          tags: ['TypeScript', 'Advanced'],
          status: 'published'
        },
        {
          id: 3,
          title: 'Building Scalable APIs',
          excerpt: 'Best practices for designing and implementing scalable REST APIs.',
          author: { id: 3, name: 'Bob Johnson' },
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          views: 2100,
          tags: ['API', 'Backend', 'Architecture'],
          status: 'published'
        }
      ],
      total: 3
    }),
    getOne: async (id: any) => ({ id }),
    create: async (data: any) => ({ id: Date.now(), ...data }),
    update: async (id: any, data: any) => ({ id, ...data }),
    delete: async (id: any) => true
  }
})

/**
 * Dashboard Model - 仪表板模型
 */
export const DashboardModel = defineModel({
  name: 'Dashboard',
  schema: defineSchema({
    name: 'Dashboard',
    fields: {
      totalUsers: field.integer({ description: 'Total Users' }),
      activeUsers: field.integer({ description: 'Active Users' }),
      revenue: field.float({ description: 'Revenue' }),
      growth: field.float({ description: 'Growth' }),
      lastUpdated: field.datetime({ description: 'Last Updated' })
    }
  }),
  views: {
    overview: {
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
    }
  },
  apis: {
    getList: async () => ({ data: [], total: 0 }),
    getOne: async () => ({
      totalUsers: 12500,
      activeUsers: 8750,
      revenue: 125000.50,
      growth: 0.15,
      lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }),
    create: async (data: any) => data,
    update: async (id: any, data: any) => ({ id, ...data }),
    delete: async (id: any) => true
  }
})

import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

/**
 * Schema 完整示例集
 *
 * 展示从基础字段到复杂关联的所有核心功能
 * 技术栈：Zod（核心验证引擎）+ TypeBox（JSON Schema 序列化）
 */

interface ExampleDemoProps {
  title: string
  description: string
  schemaCode: string
  usageCode?: string
  features: string[]
  category: 'basic' | 'relation' | 'advanced' | 'complete'
}

const ExampleDemo: React.FC<ExampleDemoProps> = ({
  title,
  description,
  schemaCode,
  usageCode,
  features,
  category
}) => {
  const getCategoryBadge = () => {
    const badges = {
      basic: { text: '基础示例', color: '#3b82f6' },
      relation: { text: '关联关系', color: '#8b5cf6' },
      advanced: { text: '高级特性', color: '#f59e0b' },
      complete: { text: '完整应用', color: '#10b981' }
    }
    const badge = badges[category]
    return (
      <span
        style={{
          padding: '4px 12px',
          backgroundColor: badge.color,
          color: 'white',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {badge.text}
      </span>
    )
  }

  return (
    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {getCategoryBadge()}
      </div>

      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{description}</p>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '8px' }}>✨ 核心特性:</h4>
        <ul style={{ margin: '0', paddingLeft: '24px' }}>
          {features.map((feature, idx) => (
            <li key={idx} style={{ marginBottom: '4px', color: '#374151' }}>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4>Schema 定义:</h4>
        <pre
          style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6'
          }}
        >
          {schemaCode}
        </pre>
      </div>

      {usageCode && (
        <div>
          <h4>使用示例:</h4>
          <pre
            style={{
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              padding: '16px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6',
              border: '1px solid #d1d5db'
            }}
          >
            {usageCode}
          </pre>
        </div>
      )}
    </div>
  )
}

const meta: Meta<typeof ExampleDemo> = {
  title: 'Schema/Complete Examples',
  component: ExampleDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Schema 完整示例集

展示从基础字段定义到复杂关联关系的完整功能。

## 技术架构

- **Zod**: 核心验证引擎（成熟稳定，生态完善）
- **TypeBox**: JSON Schema 序列化（标准兼容，高性能）

## 示例分类

- 🟦 **基础示例**: 基础字段类型和 Schema 定义
- 🟪 **关联关系**: 一对一、一对多、多对多关联
- 🟧 **高级特性**: withOption、Schema 组合、虚拟字段
- 🟩 **完整应用**: 真实世界的完整系统案例

## 学习路径

1. 从基础示例开始，了解字段类型
2. 学习关联关系的定义和使用
3. 掌握高级特性和最佳实践
4. 通过完整应用案例加深理解
        `
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ExampleDemo>

// ============================================================================
// 基础示例
// ============================================================================

export const BasicUser: Story = {
  args: {
    category: 'basic',
    title: '基础用户 Schema',
    description: '展示基础字段类型的使用：字符串、数值、布尔、枚举、时间戳',
    features: [
      'UUID 主键字段',
      '字符串验证（长度、唯一性）',
      '邮箱格式验证',
      '整数范围验证',
      '布尔默认值',
      '自动时间戳（createdAt/updatedAt）'
    ],
    schemaCode: `import { defineSchema, field } from '@schema-component/schema'

const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({
    minLength: 3,
    maxLength: 20,
    required: true,
    unique: true
  }),
  email: field.email({
    required: true,
    unique: true,
    lowercase: true
  }),
  password: field.string({ minLength: 8, required: true }),
  age: field.integer({ min: 0, max: 150 }),
  isActive: field.boolean({ default: true }),
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
})`,
    usageCode: `import { Infer } from '@schema-component/schema'

// 自动类型推导
type User = Infer<typeof UserSchema>

// 验证数据
const result = UserSchema.safeParse({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  age: 25
})

if (result.success) {
  console.log('✅ 验证成功:', result.data)
} else {
  console.error('❌ 验证失败:', result.errors)
}`
  }
}

export const ComplexFields: Story = {
  args: {
    category: 'basic',
    title: '复杂字段类型',
    description: '展示高级字段类型：JSON、数组、枚举、日期时间',
    features: [
      'Decimal 精确小数（价格）',
      'Enum 枚举类型',
      'JSON 对象字段',
      'URL 类型数组',
      '字符串数组（唯一性约束）',
      'Datetime 日期时间'
    ],
    schemaCode: `const ProductSchema = defineSchema('Product', {
  id: field.uuid({ primary: true }),

  // 字符串类型
  name: field.string({ required: true, maxLength: 100 }),
  sku: field.varchar(50, { unique: true }),
  description: field.text(),

  // 数值类型
  price: field.decimal(10, 2, { min: 0, required: true }),
  stock: field.integer({ min: 0, default: 0 }),
  weight: field.float({ min: 0 }),

  // 枚举
  status: field.enum({
    values: ['draft', 'active', 'archived'] as const,
    default: 'draft'
  }),

  // JSON 字段
  specifications: field.json({ default: {} }),

  // 数组字段
  images: field.array({
    items: field.url(),
    maxItems: 10
  }),

  tags: field.array({
    items: field.string(),
    unique: true
  }),

  // 日期时间
  launchedAt: field.datetime({ nullable: true }),
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
})`
  }
}

// ============================================================================
// 关联关系示例
// ============================================================================

export const OneToOneRelation: Story = {
  args: {
    category: 'relation',
    title: '一对一关联 (One-to-One)',
    description: 'User 和 Profile 的一对一关联关系',
    features: [
      '一对一关联定义',
      'belongsTo 反向关联',
      '外键约束',
      '级联删除策略',
      '必填关联字段'
    ],
    schemaCode: `// Profile Schema
const ProfileSchema = defineSchema('Profile', {
  id: field.uuid({ primary: true }),
  bio: field.text(),
  avatar: field.url(),
  website: field.url(),

  // 一对一关联 - 用户
  userId: field.uuid({ required: true }),
  user: relation.belongsTo('User', {
    foreignKey: 'userId',
    references: 'id',
    required: true,
    onDelete: 'CASCADE'
  })
})

// User Schema（反向）
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),
  email: field.email({ required: true }),

  // 一对一关联
  profile: relation.one('Profile', {
    foreignKey: 'userId'
  })
})`
  }
}

export const OneToManyRelation: Story = {
  args: {
    category: 'relation',
    title: '一对多关联 (One-to-Many)',
    description: 'User 和 Post 的一对多关联关系',
    features: [
      '一对多关联（hasMany）',
      '多对一关联（belongsTo）',
      '外键定义',
      '排序配置',
      '急加载支持'
    ],
    schemaCode: `// Post Schema
const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true, maxLength: 200 }),
  content: field.text(),
  published: field.boolean({ default: false }),

  // 多对一关联 - 作者
  authorId: field.uuid({ required: true }),
  author: relation.belongsTo('User', {
    foreignKey: 'authorId',
    references: 'id',
    required: true,
    eager: true  // 急加载
  }),

  createdAt: field.timestamp({ autoCreate: true })
})

// User Schema
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),

  // 一对多关联 - 文章列表
  posts: relation.many('Post', {
    foreignKey: 'authorId',
    orderBy: { field: 'createdAt', order: 'DESC' }
  })
})`
  }
}

export const ManyToManyRelation: Story = {
  args: {
    category: 'relation',
    title: '多对多关联 (Many-to-Many)',
    description: 'Post 和 Tag 的多对多关联关系，通过中间表实现',
    features: [
      '多对多关联定义',
      '中间表（PostTags）',
      '双向关联',
      '中间表额外字段',
      '复合主键索引'
    ],
    schemaCode: `// Tag Schema
const TagSchema = defineSchema('Tag', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true, unique: true }),
  slug: field.slug({ unique: true }),

  // 多对多关联 - 文章
  posts: relation.manyToMany('Post', {
    through: 'PostTags',
    foreignKey: 'tagId',
    otherKey: 'postId'
  })
})

// Post Schema
const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),

  // 多对多关联 - 标签
  tags: relation.manyToMany('Tag', {
    through: 'PostTags',
    foreignKey: 'postId',
    otherKey: 'tagId'
  })
})

// 中间表（带额外字段）
const PostTagSchema = defineSchema('PostTag', {
  postId: field.uuid({ required: true }),
  tagId: field.uuid({ required: true }),

  // 额外字段
  order: field.integer({ default: 0 }),
  createdAt: field.timestamp({ autoCreate: true }),

  // 关联
  post: relation.belongsTo('Post'),
  tag: relation.belongsTo('Tag')
}, {
  indexes: [
    { fields: ['postId', 'tagId'], unique: true }
  ]
})`
  }
}

// ============================================================================
// 高级特性示例
// ============================================================================

export const WithOptionAdvanced: Story = {
  args: {
    category: 'advanced',
    title: 'withOption 高级配置',
    description: '使用 withOption 实现自定义错误消息和复杂验证规则',
    features: [
      '自定义错误消息',
      '多重验证规则',
      '数据转换（transform）',
      '正则表达式验证',
      '自定义列名'
    ],
    schemaCode: `import { withOption } from '@schema-component/schema'

const RegisterSchema = defineSchema('Register', {
  // 自定义错误消息
  email: withOption(field.email(), {
    required: true,
    unique: true,
    errorMessages: {
      required: '邮箱地址不能为空',
      invalid: '请输入有效的邮箱地址',
      unique: '该邮箱已被注册'
    },
    label: '邮箱地址',
    description: '用于登录和接收通知'
  }),

  // 复杂密码验证
  password: withOption(field.string(), {
    minLength: 8,
    required: true,
    validate: [
      (v) => /[A-Z]/.test(v) || '必须包含至少一个大写字母',
      (v) => /[a-z]/.test(v) || '必须包含至少一个小写字母',
      (v) => /[0-9]/.test(v) || '必须包含至少一个数字',
      (v) => /[^A-Za-z0-9]/.test(v) || '必须包含至少一个特殊字符'
    ]
  }),

  // 数据转换
  username: withOption(field.string(), {
    transform: (value) => value.toLowerCase().trim(),
    pattern: /^[a-z0-9_]+$/,
    errorMessages: {
      pattern: '用户名只能包含小写字母、数字和下划线'
    }
  })
})`
  }
}

export const SchemaComposition: Story = {
  args: {
    category: 'advanced',
    title: 'Schema 组合与继承',
    description: '通过组合可复用字段组，避免重复定义',
    features: [
      '可复用字段组',
      'Schema 扩展（extend）',
      'DRY 原则',
      '时间戳字段组',
      '软删除字段组'
    ],
    schemaCode: `// 可复用字段组
const TimestampFields = {
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
}

const SoftDeleteFields = {
  deletedAt: field.timestamp({ nullable: true }),
  isDeleted: field.boolean({ default: false })
}

// 组合使用
const ArticleSchema = defineSchema('Article', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),
  content: field.text(),

  // 继承时间戳
  ...TimestampFields,

  // 继承软删除
  ...SoftDeleteFields
})

// 扩展 Schema
const FeaturedArticleSchema = ArticleSchema.extend({
  featured: field.boolean({ default: false }),
  featuredAt: field.timestamp(),
  viewCount: field.integer({ default: 0 }),
  likeCount: field.integer({ default: 0 })
})`
  }
}

export const VirtualFields: Story = {
  args: {
    category: 'advanced',
    title: '虚拟字段和计算字段',
    description: '定义不存储在数据库中的虚拟字段和自动计算字段',
    features: [
      '虚拟字段（getter/setter）',
      '计算字段（computed）',
      '自动计算年龄',
      '全名组合',
      '不占用存储空间'
    ],
    schemaCode: `const PersonSchema = defineSchema('Person', {
  firstName: field.string({ required: true }),
  lastName: field.string({ required: true }),
  birthDate: field.date({ required: true }),

  // 虚拟字段 - 全名
  fullName: field.virtual({
    get: (person) => \`\${person.firstName} \${person.lastName}\`,
    set: (person, value) => {
      const parts = value.split(' ')
      person.firstName = parts[0]
      person.lastName = parts.slice(1).join(' ')
    }
  }),

  // 计算字段 - 年龄
  age: field.computed({
    type: field.integer(),
    compute: (person) => {
      const today = new Date()
      const birthDate = new Date(person.birthDate)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }
  })
})`
  }
}

export const ConditionalValidation: Story = {
  args: {
    category: 'advanced',
    title: '条件验证',
    description: '根据其他字段的值动态调整验证规则',
    features: [
      '条件必填字段',
      '基于枚举值的验证',
      '动态验证规则',
      '上下文感知验证',
      '友好的错误提示'
    ],
    schemaCode: `const OrderSchema = defineSchema('Order', {
  id: field.uuid({ primary: true }),

  type: field.enum({
    values: ['pickup', 'delivery'] as const,
    required: true
  }),

  // 当 type 为 delivery 时，address 必填
  address: withOption(field.string(), {
    required: (data) => data.type === 'delivery',
    validate: (value, context) => {
      if (context.data.type === 'delivery' && !value) {
        return '配送订单必须填写地址'
      }
      return true
    }
  }),

  // 当 type 为 pickup 时，pickupTime 必填
  pickupTime: withOption(field.datetime(), {
    required: (data) => data.type === 'pickup',
    validate: (value, context) => {
      if (context.data.type === 'pickup' && !value) {
        return '自提订单必须选择自提时间'
      }
      return true
    }
  })
})`
  }
}

// ============================================================================
// 完整应用示例
// ============================================================================

export const BlogSystem: Story = {
  args: {
    category: 'complete',
    title: '完整博客系统',
    description: '一个真实世界的博客系统，包含用户、文章、评论、标签的完整关联关系',
    features: [
      '5 个关联的 Schema',
      '一对一关联（User-Profile）',
      '一对多关联（User-Post, Post-Comment）',
      '多对多关联（Post-Tag）',
      '自关联（Comment 回复）',
      '完整的时间戳和软删除'
    ],
    schemaCode: `// 用户
const BlogUserSchema = defineSchema('BlogUser', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true, unique: true }),
  email: field.email({ required: true, unique: true }),
  password: field.string({ minLength: 8, required: true }),

  profile: relation.one('BlogProfile'),
  posts: relation.many('BlogPost', { foreignKey: 'authorId' }),
  comments: relation.many('BlogComment', { foreignKey: 'userId' }),

  ...TimestampFields
})

// 文章
const BlogPostSchema = defineSchema('BlogPost', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true, maxLength: 200 }),
  slug: field.slug({ unique: true }),
  content: field.text({ required: true }),
  published: field.boolean({ default: false }),

  authorId: field.uuid({ required: true }),
  author: relation.belongsTo('BlogUser', { eager: true }),

  tags: relation.manyToMany('BlogTag', { through: 'BlogPostTags' }),
  comments: relation.many('BlogComment', {
    foreignKey: 'postId',
    orderBy: { field: 'createdAt', order: 'DESC' }
  }),

  ...TimestampFields,
  ...SoftDeleteFields
})

// 评论（支持回复）
const BlogCommentSchema = defineSchema('BlogComment', {
  id: field.uuid({ primary: true }),
  content: field.text({ required: true }),

  postId: field.uuid({ required: true }),
  post: relation.belongsTo('BlogPost'),

  userId: field.uuid({ required: true }),
  user: relation.belongsTo('BlogUser'),

  // 自关联 - 回复评论
  parentId: field.uuid(),
  parent: relation.belongsTo('BlogComment'),
  replies: relation.many('BlogComment', { foreignKey: 'parentId' }),

  ...TimestampFields
})`,
    usageCode: `// 创建文章
const newPost = await BlogPostSchema.parse({
  title: 'Getting Started with Schema',
  slug: 'getting-started-schema',
  content: '...',
  authorId: userId,
  tags: [
    { id: 'tag-1', name: 'Tutorial' },
    { id: 'tag-2', name: 'TypeScript' }
  ]
})

// 查询文章（包含作者和标签）
const post = await db.posts.findOne({
  where: { slug: 'getting-started' },
  include: {
    author: true,
    tags: true,
    comments: {
      include: { user: true, replies: true }
    }
  }
})`
  }
}

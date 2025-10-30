/**
 * Schema Component - 基础使用示例
 *
 * 演示如何使用 Schema 系统定义和验证数据模型
 */

import { defineSchema, field, validateSchema, parseSchema } from '../src/index'
import type { InferSchema } from '../src/index'

// ============================================================================
// 示例 1: 简单的用户 Schema
// ============================================================================

const UserSchema = defineSchema({
  name: 'User',
  fields: {
    id: field.uuid({ required: true }),
    email: field.email({ required: true, unique: true }),
    name: field.string({ required: true, minLength: 2, maxLength: 100 }),
    age: field.integer({ min: 0, max: 150 }),
    isActive: field.boolean({ default: true }),
    bio: field.text()
  },
  options: {
    timestamps: true,  // 自动添加 createdAt 和 updatedAt
    softDelete: true   // 添加 deletedAt 字段
  }
})

// 类型推导
type User = InferSchema<typeof UserSchema>

// 验证示例数据
const userData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  name: 'John Doe',
  age: 30,
  isActive: true,
  bio: 'A software developer'
}

const validationResult = validateSchema(UserSchema, userData)
if (validationResult.success) {
  console.log('✅ User data is valid:', validationResult.data)
} else {
  console.error('❌ Validation failed:', validationResult.error)
}

// ============================================================================
// 示例 2: 文章 Schema（带关联关系）
// ============================================================================

const PostSchema = defineSchema({
  name: 'Post',
  fields: {
    id: field.uuid({ required: true }),
    title: field.string({ required: true, minLength: 1, maxLength: 200 }),
    slug: field.slug({ required: true, unique: true }),
    content: field.text({ required: true }),
    status: field.enum({
      values: ['draft', 'published', 'archived'] as const,
      default: 'draft'
    }),
    publishedAt: field.datetime({ nullable: true }),
    viewCount: field.nonNegativeInteger({ default: 0 }),

    // 关联字段
    authorId: field.uuid({ required: true }),
    author: field.belongsTo({
      target: 'User',
      foreignKey: 'authorId',
      onDelete: 'CASCADE'
    }),

    // 多对多关联
    tags: field.manyToMany({
      target: 'Tag',
      through: 'PostTags',
      foreignKey: 'postId',
      otherKey: 'tagId'
    })
  },
  options: {
    timestamps: true,
    description: 'Blog post schema'
  }
})

type Post = InferSchema<typeof PostSchema>

// ============================================================================
// 示例 3: 使用枚举和复杂验证
// ============================================================================

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

const AdminUserSchema = defineSchema({
  name: 'AdminUser',
  fields: {
    id: field.uuid({ required: true }),
    username: field.string({
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_]+$/
    }),
    email: field.email({ required: true, unique: true }),
    role: field.nativeEnum(UserRole, { default: UserRole.USER }),
    permissions: field.stringArray({
      uniqueItems: true,
      default: []
    }),
    metadata: field.json({ default: {} })
  },
  options: {
    timestamps: true,
    validate: (data) => {
      // 自定义验证：管理员必须有至少一个权限
      if (data.role === UserRole.ADMIN && (!data.permissions || data.permissions.length === 0)) {
        return {
          field: 'permissions',
          message: 'Admin users must have at least one permission'
        }
      }
      return true
    }
  }
})

// ============================================================================
// 示例 4: Schema 操作（扩展、选择、排除）
// ============================================================================

import { extendSchema, pickSchema, omitSchema } from '../src/index'

// 扩展 Schema
const ExtendedUserSchema = extendSchema(UserSchema, {
  avatar: field.url(),
  phoneNumber: field.phone()
})

// 选择部分字段（公开信息）
const UserPublicSchema = pickSchema(UserSchema, ['id', 'name', 'email'])

// 排除敏感字段
const UserSafeSchema = omitSchema(UserSchema, ['deletedAt'])

// ============================================================================
// 示例 5: 验证和解析
// ============================================================================

// 安全验证（不抛出错误）
const result1 = validateSchema(UserSchema, {
  id: 'invalid-uuid',
  email: 'not-an-email',
  name: 'J'  // 太短
})

if (!result1.success) {
  console.log('Validation errors:', result1.error.issues)
}

// 解析（验证失败会抛出错误）
try {
  const user = parseSchema(UserSchema, userData)
  console.log('Parsed user:', user)
} catch (error) {
  console.error('Parse error:', error)
}

// ============================================================================
// 示例 6: JSON Schema 和嵌套对象
// ============================================================================

import { z } from 'zod'

const ProductSchema = defineSchema({
  name: 'Product',
  fields: {
    id: field.uuid({ required: true }),
    name: field.string({ required: true }),
    price: field.float({ required: true, positive: true, precision: 10, scale: 2 }),

    // 使用 jsonObject 定义结构化 JSON
    dimensions: field.jsonObject({
      width: z.number().positive(),
      height: z.number().positive(),
      depth: z.number().positive(),
      unit: z.enum(['cm', 'in', 'm'])
    }),

    // JSON 数组
    images: field.jsonArray(z.string().url()),

    // 标签数组
    tags: field.stringArray({ minItems: 1, maxItems: 10 })
  }
})

const product = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Laptop',
  price: 999.99,
  dimensions: {
    width: 30,
    height: 2,
    depth: 20,
    unit: 'cm' as const
  },
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  tags: ['electronics', 'computers']
}

console.log('✅ Product example:', product)

// ============================================================================
// 示例 7: 日期和时间戳
// ============================================================================

const EventSchema = defineSchema({
  name: 'Event',
  fields: {
    id: field.uuid({ required: true }),
    title: field.string({ required: true }),
    startDate: field.datetime({
      required: true,
      min: new Date('2025-01-01')
    }),
    endDate: field.datetime({
      required: true
    }),
    createdAt: field.createdAt(),  // 自动设置为创建时间
    updatedAt: field.updatedAt()   // 自动更新
  },
  options: {
    validate: (data) => {
      if (data.endDate <= data.startDate) {
        return 'End date must be after start date'
      }
      return true
    }
  }
})

console.log('📝 All examples completed!')

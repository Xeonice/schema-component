/**
 * Schema Component 实现示例
 *
 * 本文件展示了如何使用 Schema Component 定义和使用各种类型的 Schema
 *
 * 技术栈:
 * - Zod: 核心验证引擎 (成熟稳定，生态完善)
 * - TypeBox: JSON Schema 序列化 (标准兼容，极致性能)
 */

import {
  defineSchema,
  field,
  relation,
  withOption,
  Infer,
  InferInput,
  defineRule
} from '@schema-component/schema'

// ============================================================================
// 示例 1: 基础 Schema 定义
// ============================================================================

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
})

// 类型推导
type User = Infer<typeof UserSchema>
// 等价于:
// type User = {
//   id: string
//   username: string
//   email: string
//   password: string
//   age?: number
//   isActive?: boolean
//   createdAt: Date
//   updatedAt: Date
// }

// ============================================================================
// 示例 2: 关联关系 Schema
// ============================================================================

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
    required: true
  })
})

const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true, maxLength: 200 }),
  content: field.text(),
  slug: field.slug({ unique: true }),
  published: field.boolean({ default: false }),
  publishedAt: field.timestamp({ nullable: true }),

  // 多对一关联 - 作者
  authorId: field.uuid({ required: true }),
  author: relation.belongsTo('User', {
    foreignKey: 'authorId',
    references: 'id',
    required: true,
    eager: true
  }),

  // 一对多关联 - 评论
  comments: relation.many('Comment', {
    foreignKey: 'postId',
    orderBy: { field: 'createdAt', order: 'DESC' }
  }),

  // 多对多关联 - 标签
  tags: relation.manyToMany('Tag', {
    through: 'PostTags',
    foreignKey: 'postId',
    otherKey: 'tagId'
  }),

  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
})

const CommentSchema = defineSchema('Comment', {
  id: field.uuid({ primary: true }),
  content: field.text({ required: true }),

  // 关联文章
  postId: field.uuid({ required: true }),
  post: relation.belongsTo('Post', {
    foreignKey: 'postId',
    references: 'id'
  }),

  // 关联用户
  userId: field.uuid({ required: true }),
  user: relation.belongsTo('User', {
    foreignKey: 'userId',
    references: 'id'
  }),

  // 自关联 - 回复评论
  parentId: field.uuid({ nullable: true }),
  parent: relation.belongsTo('Comment', {
    foreignKey: 'parentId',
    references: 'id'
  }),
  replies: relation.many('Comment', {
    foreignKey: 'parentId'
  }),

  createdAt: field.timestamp({ autoCreate: true })
})

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

// 多对多中间表（带额外字段）
const PostTagSchema = defineSchema('PostTag', {
  postId: field.uuid({ required: true }),
  tagId: field.uuid({ required: true }),

  // 额外字段
  order: field.integer({ default: 0 }),
  createdAt: field.timestamp({ autoCreate: true }),

  // 关联
  post: relation.belongsTo('Post', {
    foreignKey: 'postId',
    references: 'id'
  }),
  tag: relation.belongsTo('Tag', {
    foreignKey: 'tagId',
    references: 'id'
  })
}, {
  indexes: [
    {
      fields: ['postId', 'tagId'],
      unique: true
    }
  ]
})

// ============================================================================
// 示例 3: 复杂字段类型
// ============================================================================

const ProductSchema = defineSchema('Product', {
  id: field.uuid({ primary: true }),

  // 字符串类型变体
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
  specifications: field.json({
    default: {}
  }),

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
})

// ============================================================================
// 示例 4: withOption 高级用法
// ============================================================================

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

  // 自定义验证规则
  password: withOption(field.string(), {
    minLength: 8,
    required: true,
    validate: [
      (value) => /[A-Z]/.test(value) || '密码必须包含至少一个大写字母',
      (value) => /[a-z]/.test(value) || '密码必须包含至少一个小写字母',
      (value) => /[0-9]/.test(value) || '密码必须包含至少一个数字',
      (value) => /[^A-Za-z0-9]/.test(value) || '密码必须包含至少一个特殊字符'
    ],
    errorMessages: {
      minLength: '密码至少需要8个字符'
    }
  }),

  // 转换函数
  username: withOption(field.string(), {
    minLength: 3,
    maxLength: 20,
    required: true,
    transform: (value) => value.toLowerCase().trim(),
    pattern: /^[a-z0-9_]+$/,
    errorMessages: {
      pattern: '用户名只能包含小写字母、数字和下划线'
    }
  }),

  // 自定义列名
  firstName: withOption(field.string(), {
    column: 'first_name',
    required: true
  }),

  lastName: withOption(field.string(), {
    column: 'last_name',
    required: true
  })
})

// ============================================================================
// 示例 5: Schema 组合与继承
// ============================================================================

// 基础时间戳 Schema
const TimestampFields = {
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
}

// 软删除 Schema
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
const ExtendedArticleSchema = ArticleSchema.extend({
  featured: field.boolean({ default: false }),
  viewCount: field.integer({ default: 0 }),
  likeCount: field.integer({ default: 0 })
})

// ============================================================================
// 示例 6: 虚拟字段和计算字段
// ============================================================================

const PersonSchema = defineSchema('Person', {
  firstName: field.string({ required: true }),
  lastName: field.string({ required: true }),
  birthDate: field.date({ required: true }),

  // 虚拟字段 - 全名
  fullName: field.virtual({
    get: (person) => `${person.firstName} ${person.lastName}`,
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

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      return age
    }
  })
})

// ============================================================================
// 示例 7: 条件验证
// ============================================================================

const OrderSchema = defineSchema('Order', {
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
})

// ============================================================================
// 示例 8: 自定义验证规则
// ============================================================================

// 异步验证规则 - 检查邮箱唯一性
const uniqueEmailRule = defineRule<string>({
  name: 'uniqueEmail',
  async validate(value, context) {
    // 模拟数据库查询
    const exists = await checkEmailExists(value, context.data?.id)

    if (exists) {
      return {
        valid: false,
        message: '该邮箱已被注册'
      }
    }

    return { valid: true }
  }
})

// 同步验证规则 - 检查年龄
const minimumAgeRule = defineRule<number>({
  name: 'minimumAge',
  validate(value, context) {
    const minAge = 18

    if (value < minAge) {
      return {
        valid: false,
        message: `年龄必须至少 ${minAge} 岁`
      }
    }

    return { valid: true }
  }
})

// 使用自定义规则
const UserRegistrationSchema = defineSchema('UserRegistration', {
  email: withOption(field.email(), {
    required: true,
    validate: [uniqueEmailRule]
  }),

  age: withOption(field.integer(), {
    required: true,
    validate: [minimumAgeRule]
  })
})

// ============================================================================
// 示例 9: 数据验证示例
// ============================================================================

async function validateUserData() {
  const userData = {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    age: 25
  }

  // 方式 1: safeParse (推荐)
  const result = UserSchema.safeParse(userData)

  if (result.success) {
    console.log('验证成功:', result.data)
    // result.data 是类型安全的 User 对象
  } else {
    console.error('验证失败:')
    result.errors.forEach(error => {
      console.error(`- ${error.path.join('.')}: ${error.message}`)
    })
  }

  // 方式 2: parse (失败抛异常)
  try {
    const user = UserSchema.parse(userData)
    console.log('用户:', user)
  } catch (error) {
    if (error instanceof ValidationException) {
      const formatted = error.format()
      console.error('验证错误:', formatted)
      // { email: ['邮箱格式不正确'], age: ['年龄必须大于0'] }
    }
  }

  // 方式 3: 异步验证
  const asyncResult = await UserRegistrationSchema.validateAsync(userData)

  if (asyncResult.success) {
    console.log('异步验证成功')
  }

  // 方式 4: 部分验证
  const partialResult = UserSchema.validatePartial({
    email: 'newemail@example.com'
  }, {
    fields: ['email']
  })
}

// ============================================================================
// 示例 10: 类型推导和工具类型
// ============================================================================

// 基础类型推导
type User = Infer<typeof UserSchema>

// 输入类型（创建时）
type UserInput = InferInput<typeof UserSchema>
// 排除自动生成字段: id, createdAt, updatedAt

// 部分更新类型
type UserUpdate = Partial<User>

// 选择部分字段
type UserBasic = Pick<User, 'id' | 'username' | 'email'>

// 排除部分字段
type UserPublic = Omit<User, 'password'>

// 必填类型
type StrictUser = Required<User>

// ============================================================================
// 示例 11: Schema 导出
// ============================================================================

function exportSchemas() {
  // 导出为 JSON Schema
  const jsonSchema = UserSchema.toJSONSchema()
  console.log('JSON Schema:', JSON.stringify(jsonSchema, null, 2))

  // 导出为 OpenAPI
  const openApiSchema = UserSchema.toOpenAPI()
  console.log('OpenAPI Schema:', JSON.stringify(openApiSchema, null, 2))

  // 导出为 Prisma
  const prismaSchema = UserSchema.toPrisma()
  console.log('Prisma Schema:')
  console.log(prismaSchema)

  // 导出为 TypeBox
  import { toTypeBox } from '@schema-component/schema'
  const typeBoxSchema = toTypeBox(UserSchema)

  // 使用 TypeBox 验证
  import { Value } from '@sinclair/typebox/value'
  const isValid = Value.Check(typeBoxSchema, userData)
}

// ============================================================================
// 示例 12: 完整的博客系统 Schema
// ============================================================================

// 用户
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

// 个人资料
const BlogProfileSchema = defineSchema('BlogProfile', {
  id: field.uuid({ primary: true }),
  bio: field.text(),
  avatar: field.url(),
  website: field.url(),
  socialLinks: field.json(),

  userId: field.uuid({ required: true }),
  user: relation.belongsTo('BlogUser'),

  ...TimestampFields
})

// 文章
const BlogPostSchema = defineSchema('BlogPost', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true, maxLength: 200 }),
  slug: field.slug({ unique: true }),
  content: field.text({ required: true }),
  excerpt: field.text(),
  coverImage: field.url(),

  published: field.boolean({ default: false }),
  publishedAt: field.timestamp(),

  viewCount: field.integer({ default: 0 }),
  likeCount: field.integer({ default: 0 }),

  authorId: field.uuid({ required: true }),
  author: relation.belongsTo('BlogUser', {
    foreignKey: 'authorId',
    eager: true
  }),

  categoryId: field.uuid(),
  category: relation.belongsTo('BlogCategory'),

  tags: relation.manyToMany('BlogTag', {
    through: 'BlogPostTags'
  }),

  comments: relation.many('BlogComment', {
    foreignKey: 'postId',
    orderBy: { field: 'createdAt', order: 'DESC' }
  }),

  ...TimestampFields,
  ...SoftDeleteFields
})

// 分类
const BlogCategorySchema = defineSchema('BlogCategory', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true, unique: true }),
  slug: field.slug({ unique: true }),
  description: field.text(),

  posts: relation.many('BlogPost', { foreignKey: 'categoryId' }),

  ...TimestampFields
})

// 标签
const BlogTagSchema = defineSchema('BlogTag', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true, unique: true }),
  slug: field.slug({ unique: true }),

  posts: relation.manyToMany('BlogPost', {
    through: 'BlogPostTags'
  }),

  ...TimestampFields
})

// 评论
const BlogCommentSchema = defineSchema('BlogComment', {
  id: field.uuid({ primary: true }),
  content: field.text({ required: true }),

  postId: field.uuid({ required: true }),
  post: relation.belongsTo('BlogPost'),

  userId: field.uuid({ required: true }),
  user: relation.belongsTo('BlogUser'),

  parentId: field.uuid(),
  parent: relation.belongsTo('BlogComment'),
  replies: relation.many('BlogComment', { foreignKey: 'parentId' }),

  ...TimestampFields,
  ...SoftDeleteFields
})

// ============================================================================
// 辅助函数
// ============================================================================

async function checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
  // 模拟数据库查询
  return false
}

// 导出所有 Schema
export {
  UserSchema,
  ProfileSchema,
  PostSchema,
  CommentSchema,
  TagSchema,
  PostTagSchema,
  ProductSchema,
  RegisterSchema,
  ArticleSchema,
  ExtendedArticleSchema,
  PersonSchema,
  OrderSchema,
  UserRegistrationSchema,
  BlogUserSchema,
  BlogProfileSchema,
  BlogPostSchema,
  BlogCategorySchema,
  BlogTagSchema,
  BlogCommentSchema
}

// 导出类型
export type {
  User
}

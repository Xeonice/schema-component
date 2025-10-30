import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// 展示 Schema 的 TypeScript 类型推导功能
// 基于 Zod 的类型系统，提供完整的 TypeScript 类型推导和类型安全
// 实际使用时，您需要从 @schema-component/schema 导入真实的 API

interface TypeInferenceDemoProps {
  title: string
  schemaDefinition: string
  inferredTypes: string
  usageExample: string
  description: string
  benefits: string[]
}

const TypeInferenceDemo: React.FC<TypeInferenceDemoProps> = ({
  title,
  schemaDefinition,
  inferredTypes,
  usageExample,
  description,
  benefits
}) => {
  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>
        <code>{title}</code>
      </h3>
      <p style={{ color: '#6b7280' }}>{description}</p>

      <div style={{ marginTop: '16px' }}>
        <h4>Schema 定义:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {schemaDefinition}
        </pre>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4>自动推导的 TypeScript 类型:</h4>
        <pre style={{
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {inferredTypes}
        </pre>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4>类型安全的使用:</h4>
        <pre style={{
          backgroundColor: '#f0fdf4',
          color: '#166534',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {usageExample}
        </pre>
      </div>

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
        <strong>✨ 类型推导的优势：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          {benefits.map((benefit, index) => (
            <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const meta: Meta<typeof TypeInferenceDemo> = {
  title: 'Schema/Type Inference',
  component: TypeInferenceDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
展示 Schema Component 的 TypeScript 类型推导功能。

## 类型推导系统

基于 Zod 的强大类型系统，Schema Component 提供：

- 🔍 **自动类型推导**: 从 Schema 定义自动推导 TypeScript 类型
- 🛡️ **类型安全**: 编译时类型检查，避免运行时错误
- 💡 **智能提示**: IDE 自动补全和类型提示
- 🔄 **双向同步**: Schema 和 Type 始终保持一致
- 📦 **泛型支持**: 完整的泛型类型推导
- 🎯 **精确推导**: 包括可选性、联合类型等细节

## 类型推导能力

- 基础类型推导（string, number, boolean 等）
- 可选字段和必选字段
- 联合类型和交叉类型
- 数组和嵌套对象类型
- 关联关系类型
- 自定义类型约束
        `
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof TypeInferenceDemo>

// 基础类型推导
export const BasicTypeInference: Story = {
  args: {
    title: '基础类型推导',
    schemaDefinition: `const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),
  email: field.email({ required: true }),
  age: field.integer({ nullable: true }),
  isActive: field.boolean({ default: true })
})`,
    inferredTypes: `type User = {
  id: string              // UUID 推导为 string
  username: string        // required = true → 必选
  email: string           // email 推导为 string
  age: number | null      // nullable = true → 联合类型
  isActive: boolean       // boolean 类型
}`,
    usageExample: `// ✅ 类型安全的使用
const user: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'johndoe',
  email: 'john@example.com',
  age: null,      // ✅ 允许 null
  isActive: true
}

// ❌ TypeScript 编译错误
const invalidUser: User = {
  id: 123,        // ❌ 类型错误：应为 string
  username: 'johndoe',
  email: 'invalid',
  // ❌ 缺少必选字段 email
  age: '25',      // ❌ 类型错误：应为 number | null
  isActive: 'yes' // ❌ 类型错误：应为 boolean
}`,
    description: '从 Schema 定义自动推导基础的 TypeScript 类型。',
    benefits: [
      '自动识别字段的基础类型（string, number, boolean 等）',
      '根据 required 属性推导必选或可选',
      '根据 nullable 推导联合类型',
      'IDE 提供完整的类型提示'
    ]
  }
}

// 可选字段推导
export const OptionalFields: Story = {
  args: {
    title: '可选字段推导',
    schemaDefinition: `const ProfileSchema = defineSchema('Profile', {
  // 必选字段
  userId: field.uuid({ required: true }),
  displayName: field.string({ required: true }),

  // 可选字段
  bio: field.text({ required: false }),
  avatar: field.string(),  // 默认 required: false
  website: field.url(),
  location: field.string()
})`,
    inferredTypes: `type Profile = {
  // 必选字段
  userId: string
  displayName: string

  // 可选字段（自动推导为 ?: 语法）
  bio?: string
  avatar?: string
  website?: string
  location?: string
}`,
    usageExample: `// ✅ 只提供必选字段
const profile1: Profile = {
  userId: '123',
  displayName: 'John Doe'
}

// ✅ 提供可选字段
const profile2: Profile = {
  userId: '456',
  displayName: 'Jane Smith',
  bio: 'Developer',
  avatar: 'https://example.com/avatar.jpg'
}

// ❌ 缺少必选字段
const invalid: Profile = {
  bio: 'Developer'  // ❌ 缺少 userId 和 displayName
}`,
    description: '自动识别可选字段，使用 TypeScript 的 ?: 语法。',
    benefits: [
      '自动区分必选和可选字段',
      '使用标准的 TypeScript 可选语法（?:）',
      '减少样板代码',
      '提高代码可读性'
    ]
  }
}

// 嵌套对象类型推导
export const NestedObjectTypes: Story = {
  args: {
    title: '嵌套对象类型推导',
    schemaDefinition: `const OrderSchema = defineSchema('Order', {
  id: field.uuid({ primary: true }),
  customer: field.object({
    name: field.string({ required: true }),
    email: field.email({ required: true }),
    address: field.object({
      street: field.string({ required: true }),
      city: field.string({ required: true }),
      zipCode: field.string({ required: true })
    })
  }),
  items: field.array({
    items: field.object({
      productId: field.uuid({ required: true }),
      quantity: field.integer({ required: true }),
      price: field.decimal({ required: true })
    })
  })
})`,
    inferredTypes: `type Order = {
  id: string
  customer: {
    name: string
    email: string
    address: {
      street: string
      city: string
      zipCode: string
    }
  }
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}`,
    usageExample: `// ✅ 完整的嵌套类型检查
const order: Order = {
  id: '123',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001'
    }
  },
  items: [
    {
      productId: '456',
      quantity: 2,
      price: 29.99
    }
  ]
}

// IDE 提供深层嵌套的智能提示
order.customer.address.city  // ✅ 自动补全
order.items[0].price        // ✅ 类型为 number`,
    description: '支持嵌套对象和数组的完整类型推导。',
    benefits: [
      '递归推导嵌套对象类型',
      '数组元素类型自动推导',
      '深层嵌套的智能提示',
      '避免手写复杂的嵌套类型'
    ]
  }
}

// 关联关系类型推导
export const RelationTypeInference: Story = {
  args: {
    title: '关联关系类型推导',
    schemaDefinition: `const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),
  posts: field.o2m({
    target: 'Post',
    foreignKey: 'authorId'
  })
})

const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),
  authorId: field.uuid({ required: true }),
  author: field.m2o({
    target: 'User',
    foreignKey: 'authorId'
  })
})`,
    inferredTypes: `// 基础类型
type User = {
  id: string
  username: string
  posts?: Post[]  // o2m 关系推导为可选数组
}

type Post = {
  id: string
  title: string
  authorId: string
  author?: User  // m2o 关系推导为可选对象
}

// 包含关联的查询结果类型
type UserWithPosts = User & {
  posts: Post[]  // 显式包含关联时，转为必选
}`,
    usageExample: `// ✅ 不包含关联
const user: User = {
  id: '123',
  username: 'johndoe'
  // posts 可选，可以不提供
}

// ✅ 包含关联
const userWithPosts: UserWithPosts = {
  id: '123',
  username: 'johndoe',
  posts: [
    {
      id: '456',
      title: 'My First Post',
      authorId: '123'
    }
  ]
}

// ✅ 类型安全的查询
const result = await User.findOne({
  where: { id: '123' },
  include: ['posts']  // IDE 自动补全关联名称
})
// result.posts 自动推导为 Post[]`,
    description: '自动推导关联关系的类型，支持延迟加载和预加载。',
    benefits: [
      '关联字段自动推导为可选',
      '支持包含关联时的类型变化',
      'IDE 自动补全关联名称',
      '类型安全的查询构建'
    ]
  }
}

// 联合类型和枚举推导
export const UnionAndEnumTypes: Story = {
  args: {
    title: '联合类型和枚举推导',
    schemaDefinition: `const TaskSchema = defineSchema('Task', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),

  // 枚举推导为字符串字面量联合类型
  status: field.enum({
    values: ['todo', 'in_progress', 'done', 'archived'],
    required: true
  }),

  // 枚举推导为数字字面量联合类型
  priority: field.enum({
    values: [1, 2, 3, 4, 5],
    required: true
  }),

  // 使用 oneOf 创建联合类型
  assignee: field.oneOf([
    field.object({
      type: field.literal('user'),
      userId: field.uuid({ required: true })
    }),
    field.object({
      type: field.literal('team'),
      teamId: field.uuid({ required: true })
    })
  ])
})`,
    inferredTypes: `type Task = {
  id: string
  title: string

  // 枚举推导为字符串字面量联合类型
  status: 'todo' | 'in_progress' | 'done' | 'archived'

  // 枚举推导为数字字面量联合类型
  priority: 1 | 2 | 3 | 4 | 5

  // oneOf 推导为联合类型
  assignee: {
    type: 'user'
    userId: string
  } | {
    type: 'team'
    teamId: string
  }
}`,
    usageExample: `// ✅ 类型安全的枚举
const task: Task = {
  id: '123',
  title: 'Implement feature',
  status: 'in_progress',  // ✅ 只能是枚举值之一
  priority: 3,            // ✅ 只能是 1-5
  assignee: {
    type: 'user',
    userId: '456'
  }
}

// ❌ 类型错误
const invalid: Task = {
  id: '123',
  title: 'Task',
  status: 'invalid',      // ❌ 不是枚举值
  priority: 10,           // ❌ 超出范围
  assignee: {
    type: 'user'
    // ❌ 缺少 userId
  }
}

// ✅ 类型守卫（Type Guard）
if (task.assignee.type === 'user') {
  // TypeScript 自动推导 assignee 为 user 类型
  console.log(task.assignee.userId)  // ✅ 类型安全
}`,
    description: '精确推导枚举和联合类型，提供类型安全的字面量类型。',
    benefits: [
      '枚举值推导为字面量联合类型',
      '支持字符串和数字枚举',
      '联合类型的类型守卫',
      'IDE 提供枚举值的自动补全'
    ]
  }
}

// 泛型类型推导
export const GenericTypeInference: Story = {
  args: {
    title: '泛型类型推导',
    schemaDefinition: `// 使用 withOption 创建泛型字段
const createEmailField = <T extends boolean>(
  required: T
) => {
  return field.email({
    required,
    unique: true
  })
}

// Schema 使用泛型字段
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  email: createEmailField(true),      // 必选
  backupEmail: createEmailField(false) // 可选
})

// 泛型 Schema 定义
function defineTypedSchema<T extends FieldDefinitions>(
  name: string,
  fields: T
) {
  return defineSchema(name, fields)
}`,
    inferredTypes: `// 泛型字段推导
type EmailField<T extends boolean> =
  T extends true
    ? { email: string }           // required = true
    : { email?: string }          // required = false

// Schema 类型推导
type User = {
  id: string
  email: string      // ✅ 推导为必选
  backupEmail?: string // ✅ 推导为可选
}

// 泛型 Schema 类型
type InferSchemaType<S extends Schema<any>> =
  S extends Schema<infer T> ? T : never`,
    usageExample: `// ✅ 泛型推导
const userSchema = defineTypedSchema('User', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true })
})

// 自动推导类型
type User = InferSchemaType<typeof userSchema>
// User = { id: string; name: string }

// ✅ 泛型约束
function createUser<T extends User>(data: T): T {
  // 类型安全的创建函数
  return data
}

const user = createUser({
  id: '123',
  name: 'John'
  // ✅ 完整的类型检查
})`,
    description: '支持高级泛型类型推导，实现灵活的类型系统。',
    benefits: [
      '支持泛型字段定义',
      '条件类型推导',
      '类型参数自动推导',
      '高级类型工具函数'
    ]
  }
}

// 部分类型和工具类型
export const UtilityTypes: Story = {
  args: {
    title: '工具类型推导',
    schemaDefinition: `const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),
  email: field.email({ required: true }),
  password: field.string({ required: true }),
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
})

// Schema 自动生成工具类型`,
    inferredTypes: `// 基础类型
type User = {
  id: string
  username: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

// 自动生成的工具类型
type UserCreate = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
// = { username: string; email: string; password: string }

type UserUpdate = Partial<UserCreate>
// = { username?: string; email?: string; password?: string }

type UserRead = Omit<User, 'password'>
// = { id: string; username: string; email: string; createdAt: Date; updatedAt: Date }

type UserQuery = Partial<User>
// = { id?: string; username?: string; email?: string; ... }`,
    usageExample: `// ✅ 创建用户（不需要 id 和时间戳）
const createData: UserCreate = {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'secret'
  // ❌ id, createdAt, updatedAt 不需要提供
}

// ✅ 更新用户（所有字段可选）
const updateData: UserUpdate = {
  email: 'newemail@example.com'
  // ✅ 其他字段可选
}

// ✅ 查询结果（不包含密码）
const user: UserRead = {
  id: '123',
  username: 'johndoe',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
  // ✅ 不包含 password
}

// ✅ 查询条件（所有字段可选）
const query: UserQuery = {
  username: 'johndoe'
  // ✅ 其他字段可选
}`,
    description: '自动生成常用的工具类型，简化 CRUD 操作的类型定义。',
    benefits: [
      '自动生成 Create、Update、Read 类型',
      '减少重复的类型定义',
      '保持类型与 Schema 同步',
      '类型安全的 CRUD 操作'
    ]
  }
}

// 类型推导的最佳实践
export const TypeInferenceBestPractices: Story = {
  args: {
    title: '类型推导最佳实践',
    schemaDefinition: `// ✅ 推荐：使用 const 声明 Schema
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true })
}) as const  // 使用 as const 获得更精确的类型

// ✅ 推荐：导出推导的类型
export type User = InferSchemaType<typeof UserSchema>
export type UserCreate = InferCreateType<typeof UserSchema>
export type UserUpdate = InferUpdateType<typeof UserSchema>

// ✅ 推荐：使用类型别名
type UserId = User['id']        // string
type Username = User['username'] // string

// ✅ 推荐：条件类型推导
type RequiredFields<T> = {
  [K in keyof T as T[K] extends { required: true } ? K : never]: T[K]
}`,
    inferredTypes: `// 精确的类型推导结果
type User = {
  readonly id: string     // as const → readonly
  readonly username: string
}

// 类型别名
type UserId = string
type Username = string

// 条件类型结果
type UserRequiredFields = {
  id: string
  username: string
}`,
    usageExample: `// ✅ 类型安全的使用
import type { User, UserCreate } from './schemas'

function createUser(data: UserCreate): User {
  // 实现...
  return user
}

function getUserId(user: User): UserId {
  return user.id
}

// ✅ 类型守卫
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value
  )
}

// ✅ 使用类型守卫
const data: unknown = fetchData()
if (isUser(data)) {
  // data 自动推导为 User 类型
  console.log(data.username)  // ✅ 类型安全
}`,
    description: '遵循最佳实践，充分利用 TypeScript 的类型系统。',
    benefits: [
      '使用 as const 获得更精确的类型',
      '导出推导的类型供其他模块使用',
      '使用类型别名提高代码可读性',
      '实现类型守卫增强类型安全',
      '利用条件类型实现高级推导'
    ]
  }
}

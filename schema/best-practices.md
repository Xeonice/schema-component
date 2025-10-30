# Schema Component 最佳实践指南

> **技术栈说明**: 本系统基于 **Zod** (核心验证) 和 **TypeBox** (JSON Schema) 构建。
>
> 本指南的最佳实践适用于使用 Zod 构建的 Schema 系统。

## 目录

1. [Schema 设计原则](#schema-设计原则)
2. [字段定义最佳实践](#字段定义最佳实践)
3. [关联关系设计](#关联关系设计)
4. [验证策略](#验证策略)
5. [性能优化](#性能优化)
6. [错误处理](#错误处理)
7. [类型安全](#类型安全)
8. [常见陷阱与解决方案](#常见陷阱与解决方案)

---

## Schema 设计原则

### 1. 单一职责原则

每个 Schema 应该只负责一个实体的定义。

```typescript
// ✅ 好的做法
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  username: field.string(),
  email: field.email()
})

const ProfileSchema = defineSchema('Profile', {
  id: field.uuid(),
  bio: field.text(),
  avatar: field.url()
})

// ❌ 不好的做法
const UserWithEverythingSchema = defineSchema('User', {
  id: field.uuid(),
  username: field.string(),
  email: field.email(),
  bio: field.text(),           // 应该在 Profile 中
  avatar: field.url(),         // 应该在 Profile 中
  orderHistory: field.array()  // 应该通过关联处理
})
```

### 2. DRY (Don't Repeat Yourself)

使用组合和继承避免重复定义。

```typescript
// ✅ 好的做法 - 可复用的字段组
const TimestampFields = {
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
}

const SoftDeleteFields = {
  deletedAt: field.timestamp({ nullable: true }),
  isDeleted: field.boolean({ default: false })
}

const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  title: field.string(),
  ...TimestampFields,
  ...SoftDeleteFields
})

const CommentSchema = defineSchema('Comment', {
  id: field.uuid(),
  content: field.text(),
  ...TimestampFields,
  ...SoftDeleteFields
})

// ❌ 不好的做法 - 重复定义
const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  title: field.string(),
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
})

const CommentSchema = defineSchema('Comment', {
  id: field.uuid(),
  content: field.text(),
  createdAt: field.timestamp({ autoCreate: true }),  // 重复
  updatedAt: field.timestamp({ autoUpdate: true })   // 重复
})
```

### 3. 明确的命名约定

使用清晰、一致的命名。

```typescript
// ✅ 好的做法
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  firstName: field.string(),    // 使用驼峰命名
  lastName: field.string(),
  emailAddress: field.email(),  // 明确的名称
  isActive: field.boolean(),    // 布尔值使用 is/has 前缀
  createdAt: field.timestamp()  // 日期使用 At 后缀
})

// ❌ 不好的做法
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  fname: field.string(),        // 缩写不清晰
  lname: field.string(),
  mail: field.email(),          // 不明确
  active: field.boolean(),      // 应该是 isActive
  created: field.timestamp()    // 应该是 createdAt
})
```

### 4. 使用适当的字段类型

选择最精确的字段类型。

```typescript
// ✅ 好的做法
const ProductSchema = defineSchema('Product', {
  sku: field.varchar(50),              // 使用 varchar 限制长度
  price: field.decimal(10, 2),         // 价格使用 decimal
  stock: field.integer(),              // 库存使用 integer
  status: field.enum({                 // 状态使用 enum
    values: ['draft', 'active', 'archived'] as const
  }),
  tags: field.array({                  // 标签使用 array
    items: field.string()
  })
})

// ❌ 不好的做法
const ProductSchema = defineSchema('Product', {
  sku: field.string(),                 // 应该限制长度
  price: field.float(),                // 浮点数不精确
  stock: field.number(),               // 应该是 integer
  status: field.string(),              // 应该使用 enum
  tags: field.string()                 // 应该使用 array
})
```

---

## 字段定义最佳实践

### 1. 始终设置 required

明确字段是否必填。

```typescript
// ✅ 好的做法
const UserSchema = defineSchema('User', {
  email: field.email({ required: true }),
  name: field.string({ required: true }),
  bio: field.text({ required: false })  // 或者不设置 required（默认 false）
})

// ⚠️ 不明确的做法
const UserSchema = defineSchema('User', {
  email: field.email(),  // 没有明确是否必填
  name: field.string()
})
```

### 2. 为枚举类型使用 as const

确保类型推导正确。

```typescript
// ✅ 好的做法
const status = field.enum({
  values: ['pending', 'active', 'inactive'] as const
})
// 类型: 'pending' | 'active' | 'inactive'

// ❌ 不好的做法
const status = field.enum({
  values: ['pending', 'active', 'inactive']
})
// 类型: string[]
```

### 3. 使用 withOption 提供完整的元数据

```typescript
// ✅ 好的做法
const email = withOption(field.email(), {
  required: true,
  unique: true,
  errorMessages: {
    required: '邮箱不能为空',
    invalid: '邮箱格式不正确',
    unique: '该邮箱已被注册'
  },
  label: '邮箱地址',
  description: '用于登录和接收通知',
  example: 'user@example.com'
})

// ❌ 不好的做法
const email = field.email()  // 缺少元数据
```

### 4. 为数值字段设置合理的范围

```typescript
// ✅ 好的做法
const age = field.integer({
  min: 0,
  max: 150,
  required: true
})

const rating = field.integer({
  min: 1,
  max: 5,
  required: true
})

const price = field.decimal(10, 2, {
  min: 0,
  required: true
})

// ❌ 不好的做法
const age = field.integer()     // 可以是负数或超大值
const rating = field.number()   // 没有限制
const price = field.float()     // 精度问题
```

### 5. 字符串字段设置长度限制

```typescript
// ✅ 好的做法
const username = field.string({
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/
})

const title = field.string({
  maxLength: 200
})

const content = field.text()  // 长文本使用 text 类型

// ❌ 不好的做法
const username = field.string()  // 没有长度限制
const title = field.string()     // 可能太长
```

---

## 关联关系设计

### 1. 明确外键命名

使用一致的外键命名约定。

```typescript
// ✅ 好的做法
const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  authorId: field.uuid({ required: true }),  // 明确的外键命名
  author: relation.belongsTo('User', {
    foreignKey: 'authorId',
    references: 'id'
  })
})

// ❌ 不好的做法
const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  userId: field.uuid(),  // 不清晰，应该是 authorId
  author: relation.belongsTo('User')
})
```

### 2. 设置适当的删除策略

根据业务需求选择删除策略。

```typescript
// ✅ 好的做法
const PostSchema = defineSchema('Post', {
  authorId: field.uuid({ required: true }),
  author: relation.belongsTo('User', {
    foreignKey: 'authorId',
    onDelete: 'CASCADE'  // 用户删除时，文章也删除
  })
})

const CommentSchema = defineSchema('Comment', {
  userId: field.uuid({ required: true }),
  user: relation.belongsTo('User', {
    foreignKey: 'userId',
    onDelete: 'SET_NULL'  // 用户删除时，评论保留但作者设为 NULL
  })
})

// ⚠️ 需要考虑的做法
const PostSchema = defineSchema('Post', {
  authorId: field.uuid(),
  author: relation.belongsTo('User')  // 没有指定删除策略
})
```

### 3. 多对多关系使用中间表

```typescript
// ✅ 好的做法 - 显式中间表
const PostTagSchema = defineSchema('PostTag', {
  postId: field.uuid({ required: true }),
  tagId: field.uuid({ required: true }),
  order: field.integer({ default: 0 }),  // 额外字段
  createdAt: field.timestamp({ autoCreate: true }),

  post: relation.belongsTo('Post'),
  tag: relation.belongsTo('Tag')
}, {
  indexes: [
    { fields: ['postId', 'tagId'], unique: true }
  ]
})

const PostSchema = defineSchema('Post', {
  tags: relation.manyToMany('Tag', {
    through: 'PostTag'
  })
})

// ⚠️ 简单场景可以使用
const PostSchema = defineSchema('Post', {
  tags: relation.manyToMany('Tag', {
    through: 'PostTags',  // 自动生成的中间表
    foreignKey: 'postId',
    otherKey: 'tagId'
  })
})
```

### 4. 避免循环依赖

```typescript
// ✅ 好的做法
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  posts: relation.many('Post', { foreignKey: 'authorId' })
})

const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  authorId: field.uuid({ required: true }),
  author: relation.belongsTo('User', { foreignKey: 'authorId' })
})

// ❌ 不好的做法 - 循环依赖
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  favoritePost: relation.belongsTo('Post')  // User -> Post
})

const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  author: relation.belongsTo('User')  // Post -> User
  // 如果 User 的 favoritePost 是必填，就会产生问题
})
```

---

## 验证策略

### 1. 分层验证

在不同层面实施验证。

```typescript
// 前端验证
const clientSchema = UserSchema.pick(['username', 'email', 'password'])

// 后端验证（更严格）
const serverSchema = UserSchema.extend({
  email: withOption(field.email(), {
    required: true,
    unique: true,
    validate: [uniqueEmailRule]  // 异步验证唯一性
  })
})

// 数据库层验证（Schema 约束）
const databaseSchema = UserSchema.withConstraints({
  unique: ['email', 'username'],
  indexes: ['email', 'createdAt']
})
```

### 2. 使用自定义验证规则

```typescript
// ✅ 好的做法 - 可复用的验证规则
const strongPasswordRule = defineRule<string>({
  name: 'strongPassword',
  validate(value) {
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    const hasSpecial = /[^A-Za-z0-9]/.test(value)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      return {
        valid: false,
        message: '密码必须包含大小写字母、数字和特殊字符'
      }
    }

    return { valid: true }
  }
})

const password = field.string({
  minLength: 8,
  validate: [strongPasswordRule]
})

// ❌ 不好的做法 - 内联验证逻辑
const password = field.string({
  validate: (value) => {
    if (!/[A-Z]/.test(value)) return '需要大写字母'
    if (!/[a-z]/.test(value)) return '需要小写字母'
    if (!/[0-9]/.test(value)) return '需要数字'
    if (!/[^A-Za-z0-9]/.test(value)) return '需要特殊字符'
    return true
  }
})
```

### 3. 异步验证最小化

仅在必要时使用异步验证。

```typescript
// ✅ 好的做法 - 仅对必要字段使用异步验证
const email = withOption(field.email(), {
  required: true,
  format: 'email',  // 同步验证
  validate: [uniqueEmailRule]  // 仅唯一性需要异步
})

// ❌ 不好的做法 - 过度使用异步验证
const email = withOption(field.email(), {
  validate: [
    async (value) => /\S+@\S+\.\S+/.test(value),  // 不需要异步
    async (value) => value.length > 5,            // 不需要异步
    async (value) => checkUnique(value)           // 需要异步
  ]
})
```

### 4. 条件验证

根据上下文进行验证。

```typescript
// ✅ 好的做法
const OrderSchema = defineSchema('Order', {
  type: field.enum({
    values: ['pickup', 'delivery'] as const
  }),

  address: withOption(field.string(), {
    required: (data) => data.type === 'delivery',
    validate: (value, context) => {
      if (context.data.type === 'delivery' && !value) {
        return '配送订单必须填写地址'
      }
      return true
    }
  })
})
```

---

## 性能优化

### 1. 懒加载关联

仅在需要时加载关联数据。

```typescript
// ✅ 好的做法 - 按需加载
const posts = relation.many('Post', {
  foreignKey: 'authorId',
  eager: false  // 默认懒加载
})

// 在需要时明确加载
const user = await User.findById(id, {
  include: ['posts']  // 仅在需要时加载
})

// ⚠️ 谨慎使用 - 急加载
const posts = relation.many('Post', {
  foreignKey: 'authorId',
  eager: true  // 总是加载，可能影响性能
})
```

### 2. 使用索引

为频繁查询的字段添加索引。

```typescript
// ✅ 好的做法
const UserSchema = defineSchema('User', {
  email: field.email({
    unique: true,  // 自动创建唯一索引
    index: true
  }),
  username: field.string({
    unique: true,
    index: true
  }),
  createdAt: field.timestamp({
    index: true  // 用于排序查询
  })
}, {
  indexes: [
    { fields: ['email', 'username'] },  // 复合索引
    { fields: ['status', 'createdAt'] }
  ]
})

// ❌ 不好的做法 - 缺少索引
const UserSchema = defineSchema('User', {
  email: field.email(),    // 经常查询但没有索引
  username: field.string()
})
```

### 3. 选择性字段查询

仅查询需要的字段。

```typescript
// ✅ 好的做法
const UserBasicSchema = UserSchema.pick(['id', 'username', 'avatar'])

const users = await User.find({
  select: ['id', 'username', 'avatar']  // 仅选择需要的字段
})

// ❌ 不好的做法
const users = await User.find()  // 查询所有字段，包括不需要的
```

### 4. 批量验证优化

```typescript
// ✅ 好的做法 - 批量验证
const validator = UserSchema.validator({
  cache: true,        // 启用缓存
  cacheSize: 1000
})

const results = await Promise.all(
  users.map(user => validator.safeParse(user))
)

// ❌ 不好的做法 - 逐个创建验证器
const results = await Promise.all(
  users.map(user => UserSchema.safeParse(user))  // 每次创建新验证器
)
```

---

## 错误处理

### 1. 提供友好的错误消息

```typescript
// ✅ 好的做法
const email = withOption(field.email(), {
  errorMessages: {
    required: '请输入您的邮箱地址',
    invalid: '邮箱格式不正确，请检查后重试',
    unique: '该邮箱已被注册，请使用其他邮箱或登录'
  }
})

// ❌ 不好的做法
const email = field.email()  // 使用默认错误消息
// Error: "Invalid email format"
```

### 2. 统一错误处理

```typescript
// ✅ 好的做法
function handleValidationError(error: ValidationException) {
  if (error instanceof ValidationException) {
    const formatted = error.format()

    // 返回结构化错误
    return {
      success: false,
      errors: formatted,
      message: '数据验证失败，请检查输入'
    }
  }

  // 处理其他错误
  return {
    success: false,
    message: '发生未知错误'
  }
}

// 使用
try {
  const user = UserSchema.parse(data)
} catch (error) {
  return handleValidationError(error)
}
```

### 3. 错误分类

```typescript
// ✅ 好的做法
class ValidationException extends Error {
  constructor(
    public errors: ValidationError[],
    public type: 'validation' | 'business' | 'system'
  ) {
    super('Validation failed')
  }

  isValidationError() {
    return this.type === 'validation'
  }

  isBusinessError() {
    return this.type === 'business'
  }
}
```

---

## 类型安全

### 1. 充分利用类型推导

```typescript
// ✅ 好的做法
const UserSchema = defineSchema('User', {
  id: field.uuid(),
  name: field.string({ required: true }),
  age: field.integer()
})

type User = Infer<typeof UserSchema>
// 自动推导: { id: string; name: string; age?: number }

function createUser(data: User) {
  // data 是类型安全的
}

// ❌ 不好的做法
interface User {  // 手动定义，可能与 Schema 不一致
  id: string
  name: string
  age: number  // 忘记设为可选
}
```

### 2. 使用工具类型

```typescript
// ✅ 好的做法
type User = Infer<typeof UserSchema>
type UserInput = InferInput<typeof UserSchema>  // 创建输入
type UserUpdate = Partial<User>                  // 更新输入
type UserPublic = Omit<User, 'password'>        // 公开数据

// ❌ 不好的做法
type UserInput = User  // 包含了自动生成的字段
type UserUpdate = User // 应该是部分更新
```

### 3. 泛型约束

```typescript
// ✅ 好的做法
function validateData<T extends Schema>(
  schema: T,
  data: unknown
): Infer<T> {
  return schema.parse(data)
}

// 使用时有完整的类型推导
const user = validateData(UserSchema, rawData)
// user 的类型自动推导为 User
```

---

## 常见陷阱与解决方案

### 1. 陷阱：忘记设置外键

```typescript
// ❌ 问题
const PostSchema = defineSchema('Post', {
  author: relation.belongsTo('User')
  // 忘记定义 authorId
})

// ✅ 解决方案
const PostSchema = defineSchema('Post', {
  authorId: field.uuid({ required: true }),  // 外键字段
  author: relation.belongsTo('User', {
    foreignKey: 'authorId'
  })
})
```

### 2. 陷阱：循环导入

```typescript
// ❌ 问题
// user.schema.ts
import { PostSchema } from './post.schema'
const UserSchema = defineSchema('User', {
  posts: relation.many(PostSchema)  // 使用实例
})

// post.schema.ts
import { UserSchema } from './user.schema'
const PostSchema = defineSchema('Post', {
  author: relation.belongsTo(UserSchema)  // 循环导入
})

// ✅ 解决方案 - 使用字符串引用
// user.schema.ts
const UserSchema = defineSchema('User', {
  posts: relation.many('Post')  // 使用字符串
})

// post.schema.ts
const PostSchema = defineSchema('Post', {
  author: relation.belongsTo('User')  // 使用字符串
})
```

### 3. 陷阱：浮点数精度问题

```typescript
// ❌ 问题
const price = field.float()  // 0.1 + 0.2 = 0.30000000000000004

// ✅ 解决方案
const price = field.decimal(10, 2)  // 精确的小数
```

### 4. 陷阱：未验证的用户输入

```typescript
// ❌ 问题
app.post('/users', async (req, res) => {
  const user = await User.create(req.body)  // 直接使用未验证的数据
})

// ✅ 解决方案
app.post('/users', async (req, res) => {
  const result = UserSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      errors: result.errors
    })
  }

  const user = await User.create(result.data)
  res.json(user)
})
```

### 5. 陷阱：N+1 查询问题

```typescript
// ❌ 问题
const posts = await Post.findAll()
for (const post of posts) {
  const author = await post.author  // N+1 查询
}

// ✅ 解决方案
const posts = await Post.findAll({
  include: ['author']  // 预加载关联
})

for (const post of posts) {
  console.log(post.author)  // 无需额外查询
}
```

---

## 总结

遵循这些最佳实践可以帮助您：

1. **提高代码质量**：清晰、一致的 Schema 定义
2. **增强类型安全**：充分利用 TypeScript 和 Zod 的类型系统
3. **优化性能**：合理使用索引、懒加载和缓存
4. **改善用户体验**：友好的错误消息和验证反馈
5. **降低维护成本**：可复用的组件和清晰的架构
6. **利用生态系统**：集成 tRPC、React Hook Form 等工具

记住：好的 Schema 设计是应用程序成功的基础。基于 Zod 的成熟生态，您可以快速构建生产就绪的应用。

# Schema Component 详细设计文档 (Ultra-Think)

## 1. 设计概述

### 1.1 目标与愿景

本 Schema 系统旨在提供一个类型安全、高性能、易于使用的数据模式定义与验证框架，支持：
- 完整的基础数据类型系统
- 强大的关系字段定义（o2o, o2m, m2o, m2m）
- 灵活的字段配置选项
- TypeScript 类型推导
- 运行时验证
- 可扩展的架构

### 1.2 技术选型

经过对主流 TypeScript Schema 验证库的调研（Zod、TypeBox、Valibot），我们选择：

**主要方案：Zod + TypeBox 混合架构**

#### 选择理由：

1. **Zod 作为核心验证引擎**
   - 成熟稳定，社区生态完善
   - 优秀的 TypeScript 类型推导
   - 完整的 API 设计和文档
   - 广泛的第三方集成（tRPC、React Hook Form 等）
   - 丰富的验证功能和错误处理
   - 适合构建复杂的字段系统

2. **TypeBox 作为 JSON Schema 桥接**
   - 极致性能（最快的验证库）
   - 完全符合 JSON Schema 标准
   - 支持 OpenAPI 文档生成
   - 适合 API 场景

3. **架构优势**
   - 两者结合：内部使用 Zod，对外暴露标准 JSON Schema
   - 类型安全与标准兼得
   - 灵活的扩展能力
   - 成熟的生态系统支持

---

## 2. 核心架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│          Schema Component 架构图                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │     字段定义层 (Field Definition)     │     │
│  │  ┌──────────────┐  ┌───────────────┐  │     │
│  │  │  基础字段    │  │  关联字段     │  │     │
│  │  │  (Basic)     │  │  (Relation)   │  │     │
│  │  └──────────────┘  └───────────────┘  │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │       Schema 构建层 (Builder)          │     │
│  │  - 链式调用 API                         │     │
│  │  - 类型推导                             │     │
│  │  - 选项配置 (withOption)                │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │      验证层 (Validation)               │     │
│  │  - Zod 核心引擎                         │     │
│  │  - 自定义验证器                         │     │
│  │  - 错误处理                             │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │    类型系统层 (Type System)            │     │
│  │  - TypeScript 类型推导                  │     │
│  │  - Infer 类型提取                       │     │
│  │  - 类型工具函数                         │     │
│  └───────────────────────────────────────┘     │
│              ↓                                  │
│  ┌───────────────────────────────────────┐     │
│  │      序列化层 (Serialization)          │     │
│  │  - JSON Schema 输出 (TypeBox)           │     │
│  │  - OpenAPI 支持                         │     │
│  │  - Schema 导入/导出                     │     │
│  └───────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 模块划分

```
packages/schema/src/
├── core/                    # 核心模块
│   ├── field.ts            # 字段基类
│   ├── schema.ts           # Schema 定义
│   ├── builder.ts          # 构建器
│   └── types.ts            # 核心类型定义
├── fields/                 # 字段类型
│   ├── basic/              # 基础字段
│   │   ├── string.ts
│   │   ├── number.ts
│   │   ├── boolean.ts
│   │   ├── date.ts
│   │   ├── enum.ts
│   │   ├── json.ts
│   │   ├── array.ts
│   │   └── index.ts
│   └── relation/           # 关联字段
│       ├── one-to-one.ts
│       ├── one-to-many.ts
│       ├── many-to-one.ts
│       ├── many-to-many.ts
│       └── index.ts
├── validation/             # 验证模块
│   ├── validator.ts        # 验证器
│   ├── rules.ts            # 验证规则
│   └── errors.ts           # 错误处理
├── options/                # 选项系统
│   ├── field-options.ts    # 字段选项
│   ├── with-option.ts      # withOption 包装
│   └── decorators.ts       # 装饰器
├── utils/                  # 工具函数
│   ├── type-helpers.ts     # 类型辅助
│   ├── serializer.ts       # 序列化
│   └── infer.ts            # 类型推导
└── index.ts                # 导出入口
```

---

## 3. 字段类型系统设计

### 3.1 基础字段类型 (Basic Fields)

#### 3.1.1 字符串类型 (String)

**类型变体：**
- `string()` - 基础字符串
- `text()` - 长文本
- `varchar(length)` - 可变长度字符串
- `char(length)` - 固定长度字符串
- `uuid()` - UUID 类型
- `email()` - 邮箱
- `url()` - URL
- `slug()` - URL slug

**选项：**
```typescript
{
  minLength?: number
  maxLength?: number
  pattern?: RegExp | string
  format?: 'email' | 'url' | 'uuid' | 'slug' | 'phone'
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
  default?: string
  required?: boolean
  unique?: boolean
  index?: boolean
}
```

#### 3.1.2 数值类型 (Number)

**类型变体：**
- `number()` - 基础数值
- `integer()` - 整数
- `float()` - 浮点数
- `decimal(precision, scale)` - 精确小数
- `bigint()` - 大整数
- `positive()` - 正数
- `negative()` - 负数
- `nonNegative()` - 非负数

**选项：**
```typescript
{
  min?: number
  max?: number
  step?: number
  precision?: number
  scale?: number
  default?: number
  required?: boolean
  unique?: boolean
  index?: boolean
}
```

#### 3.1.3 布尔类型 (Boolean)

**类型变体：**
- `boolean()` - 布尔值

**选项：**
```typescript
{
  default?: boolean
  required?: boolean
}
```

#### 3.1.4 日期时间类型 (Date/Time)

**类型变体：**
- `date()` - 日期 (YYYY-MM-DD)
- `datetime()` - 日期时间
- `timestamp()` - 时间戳
- `time()` - 时间 (HH:MM:SS)

**选项：**
```typescript
{
  min?: Date | string
  max?: Date | string
  default?: Date | string | 'now'
  autoCreate?: boolean    // 自动设置创建时间
  autoUpdate?: boolean    // 自动更新时间
  required?: boolean
  index?: boolean
}
```

#### 3.1.5 枚举类型 (Enum)

**类型变体：**
- `enum(values)` - 枚举值

**选项：**
```typescript
{
  values: readonly string[] | readonly number[]
  default?: string | number
  required?: boolean
  index?: boolean
}
```

#### 3.1.6 JSON 类型

**类型变体：**
- `json()` - JSON 对象
- `jsonb()` - 二进制 JSON (PostgreSQL)

**选项：**
```typescript
{
  schema?: Schema         // 嵌套 schema 验证
  default?: any
  required?: boolean
}
```

#### 3.1.7 数组类型 (Array)

**类型变体：**
- `array(itemType)` - 数组

**选项：**
```typescript
{
  items: FieldType        // 数组元素类型
  minItems?: number
  maxItems?: number
  unique?: boolean        // 数组元素唯一
  default?: any[]
  required?: boolean
}
```

#### 3.1.8 二进制类型 (Binary)

**类型变体：**
- `binary()` - 二进制数据
- `buffer()` - Buffer 类型

**选项：**
```typescript
{
  maxSize?: number        // 最大字节数
  mimeType?: string[]     // 允许的 MIME 类型
  required?: boolean
}
```

### 3.2 关联字段类型 (Relation Fields)

#### 3.2.1 一对一 (One-to-One)

**定义示例：**
```typescript
schema.define({
  user: {
    profile: one('Profile', {
      field: 'userId',        // 当前模型的外键字段
      references: 'id',       // 引用目标模型的字段
      onDelete: 'CASCADE',    // 删除策略
      onUpdate: 'CASCADE'     // 更新策略
    })
  }
})
```

**选项：**
```typescript
{
  target: string                           // 目标模型名称
  field: string                            // 外键字段名
  references: string                       // 引用字段名
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION'
  onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION'
  required?: boolean
  eager?: boolean                          // 是否急加载
}
```

#### 3.2.2 一对多 (One-to-Many)

**定义示例：**
```typescript
schema.define({
  user: {
    posts: many('Post', {
      foreignKey: 'authorId',   // 目标模型的外键字段
      references: 'id'          // 当前模型的引用字段
    })
  }
})
```

**选项：**
```typescript
{
  target: string                           // 目标模型名称
  foreignKey: string                       // 目标模型的外键字段
  references: string                       // 当前模型的引用字段
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT'
  eager?: boolean
  orderBy?: string | { field: string, order: 'ASC' | 'DESC' }
}
```

#### 3.2.3 多对一 (Many-to-One)

**定义示例：**
```typescript
schema.define({
  post: {
    author: belongsTo('User', {
      foreignKey: 'authorId',
      references: 'id'
    })
  }
})
```

**选项：**
```typescript
{
  target: string                           // 目标模型名称
  foreignKey: string                       // 当前模型的外键字段
  references: string                       // 目标模型的引用字段
  required?: boolean
  eager?: boolean
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT'
}
```

#### 3.2.4 多对多 (Many-to-Many)

**定义示例：**
```typescript
schema.define({
  post: {
    tags: manyToMany('Tag', {
      through: 'PostTags',              // 中间表名称
      foreignKey: 'postId',             // 中间表中指向当前模型的外键
      otherKey: 'tagId',                // 中间表中指向目标模型的外键
      // 或使用自定义中间表模型
      through: {
        model: 'PostTags',
        from: 'postId',
        to: 'tagId',
        extraFields: {                   // 中间表额外字段
          order: integer(),
          createdAt: timestamp()
        }
      }
    })
  }
})
```

**选项：**
```typescript
{
  target: string                           // 目标模型名称
  through: string | {                      // 中间表配置
    model: string                          // 中间表模型名
    from: string                           // 源外键
    to: string                             // 目标外键
    extraFields?: Record<string, Field>    // 额外字段
  }
  foreignKey?: string                      // 简化模式的外键
  otherKey?: string                        // 简化模式的目标外键
  eager?: boolean
  orderBy?: string | { field: string, order: 'ASC' | 'DESC' }
}
```

---

## 4. API 设计

### 4.1 基础 API

#### 4.1.1 字段定义 API

```typescript
import { field } from '@schema-component/schema'

// 基础字段
const nameField = field.string({
  minLength: 2,
  maxLength: 50,
  required: true
})

const ageField = field.integer({
  min: 0,
  max: 150,
  default: 0
})

const emailField = field.email({
  unique: true,
  required: true
})

// 日期字段
const createdAt = field.timestamp({
  autoCreate: true,
  required: true
})

const updatedAt = field.timestamp({
  autoUpdate: true
})

// 枚举字段
const status = field.enum({
  values: ['pending', 'active', 'inactive'] as const,
  default: 'pending'
})

// JSON 字段
const metadata = field.json({
  default: {}
})

// 数组字段
const tags = field.array({
  items: field.string(),
  minItems: 1,
  maxItems: 10
})
```

#### 4.1.2 关联字段 API

```typescript
import { relation } from '@schema-component/schema'

// 一对一
const profile = relation.one('Profile', {
  field: 'userId',
  references: 'id',
  onDelete: 'CASCADE'
})

// 一对多
const posts = relation.many('Post', {
  foreignKey: 'authorId',
  references: 'id'
})

// 多对一
const author = relation.belongsTo('User', {
  foreignKey: 'authorId',
  references: 'id',
  required: true
})

// 多对多
const tags = relation.manyToMany('Tag', {
  through: 'PostTags',
  foreignKey: 'postId',
  otherKey: 'tagId'
})
```

### 4.2 Schema 定义 API

```typescript
import { defineSchema } from '@schema-component/schema'

const UserSchema = defineSchema('User', {
  // 基础字段
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  email: field.email({ unique: true, required: true }),
  age: field.integer({ min: 0 }),
  status: field.enum({
    values: ['active', 'inactive'] as const,
    default: 'active'
  }),

  // 时间戳
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true }),

  // 关联字段
  profile: relation.one('Profile'),
  posts: relation.many('Post', { foreignKey: 'authorId' }),
  roles: relation.manyToMany('Role', {
    through: 'UserRoles'
  })
})

const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true, maxLength: 200 }),
  content: field.text(),
  published: field.boolean({ default: false }),

  // 关联
  author: relation.belongsTo('User', {
    foreignKey: 'authorId',
    required: true
  }),
  tags: relation.manyToMany('Tag', {
    through: 'PostTags'
  })
})
```

### 4.3 WithOption 包装函数

`withOption` 函数提供灵活的字段配置能力：

```typescript
import { withOption } from '@schema-component/schema'

// 方式 1: 直接使用预定义字段
const emailField = field.email()

// 方式 2: 使用 withOption 添加选项
const emailFieldWithOptions = withOption(field.email(), {
  required: true,
  unique: true,
  index: true,
  errorMessages: {
    required: '邮箱不能为空',
    invalid: '邮箱格式不正确'
  }
})

// 方式 3: 链式调用
const nameField = field.string()
  .withOption({ minLength: 2 })
  .withOption({ maxLength: 50 })
  .withOption({ required: true })

// 方式 4: 批量配置
const userSchema = defineSchema('User', {
  email: withOption(field.email(), {
    required: true,
    unique: true,
    errorMessages: {
      unique: '该邮箱已被注册'
    }
  }),

  name: withOption(field.string(), {
    minLength: 2,
    maxLength: 50,
    trim: true,
    errorMessages: {
      minLength: '姓名至少2个字符',
      maxLength: '姓名最多50个字符'
    }
  })
})
```

#### WithOption 类型定义

```typescript
// 通用选项接口
interface FieldOptions<T = any> {
  required?: boolean
  default?: T | (() => T)
  unique?: boolean
  index?: boolean | IndexOptions
  nullable?: boolean

  // 验证相关
  validate?: ValidateFunction<T> | ValidateFunction<T>[]
  transform?: TransformFunction<T>

  // 错误消息
  errorMessages?: {
    required?: string
    invalid?: string
    unique?: string
    [key: string]: string | undefined
  }

  // 元数据
  label?: string
  description?: string
  example?: T
  deprecated?: boolean | string

  // 数据库相关
  column?: string          // 自定义数据库列名
  comment?: string         // 数据库注释
}

// 字符串专用选项
interface StringFieldOptions extends FieldOptions<string> {
  minLength?: number
  maxLength?: number
  pattern?: RegExp | string
  format?: StringFormat
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
}

// 数值专用选项
interface NumberFieldOptions extends FieldOptions<number> {
  min?: number
  max?: number
  step?: number
  precision?: number
  scale?: number
  positive?: boolean
  negative?: boolean
}

// withOption 函数签名
function withOption<T extends Field>(
  field: T,
  options: FieldOptions
): T & { options: FieldOptions }

// 链式调用支持
interface Field {
  withOption(options: FieldOptions): this
}
```

---

## 5. 类型系统与类型推导

### 5.1 类型推导 (Type Inference)

```typescript
import { defineSchema, Infer } from '@schema-component/schema'

const UserSchema = defineSchema('User', {
  id: field.uuid(),
  name: field.string({ required: true }),
  age: field.integer(),
  email: field.email({ required: true }),
  roles: field.array({ items: field.string() })
})

// 自动推导类型
type User = Infer<typeof UserSchema>
// 等价于:
// type User = {
//   id: string
//   name: string
//   age?: number
//   email: string
//   roles?: string[]
// }

// 带关联的类型推导
const PostSchema = defineSchema('Post', {
  id: field.uuid(),
  title: field.string({ required: true }),
  author: relation.belongsTo('User')
})

type Post = Infer<typeof PostSchema>
// 等价于:
// type Post = {
//   id: string
//   title: string
//   author?: User
// }
```

### 5.2 工具类型

```typescript
// 提取字段类型
type ExtractFieldType<T> = T extends Field<infer U> ? U : never

// 提取 Schema 的所有字段名
type SchemaKeys<T> = T extends Schema<infer K> ? K : never

// 提取必填字段
type RequiredFields<T> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never
}[keyof T]

// 提取可选字段
type OptionalFields<T> = Exclude<keyof T, RequiredFields<T>>

// 创建部分更新类型
type PartialUpdate<T> = Partial<Infer<T>>

// 创建创建类型（排除自动生成字段）
type CreateInput<T> = Omit<Infer<T>, 'id' | 'createdAt' | 'updatedAt'>
```

---

## 6. 验证系统设计

### 6.1 验证器架构

基于 Zod 的验证系统设计：

```typescript
// 验证结果（基于 Zod）
interface ValidationResult<T = any> {
  success: boolean
  data?: T
  error?: ZodError
}

interface ValidationError {
  path: (string | number)[]
  message: string
  code: string
  expected?: any
  received?: any
}

// Schema 验证
// Zod 原生支持
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email()
})

// 同步验证
const result = UserSchema.safeParse({
  name: 'John',
  email: 'john@example.com'
})

if (result.success) {
  console.log(result.data)  // 类型安全的数据
} else {
  console.error(result.error.format())
}

// 异步验证（支持 refine 异步规则）
const asyncResult = await UserSchema.safeParseAsync(data)
```

### 6.2 自定义验证规则

```typescript
import { defineRule } from '@schema-component/schema'

// 自定义验证规则
const uniqueEmailRule = defineRule<string>({
  name: 'uniqueEmail',
  async validate(value, context) {
    const exists = await db.users.findOne({ email: value })
    if (exists && exists.id !== context.data?.id) {
      return {
        valid: false,
        message: '该邮箱已被注册'
      }
    }
    return { valid: true }
  }
})

// 应用到字段
const emailField = field.email()
  .withOption({
    validate: [uniqueEmailRule]
  })

// 复合验证规则
const passwordField = field.string()
  .withOption({
    validate: [
      (value) => value.length >= 8 || '密码至少8个字符',
      (value) => /[A-Z]/.test(value) || '密码必须包含大写字母',
      (value) => /[a-z]/.test(value) || '密码必须包含小写字母',
      (value) => /[0-9]/.test(value) || '密码必须包含数字'
    ]
  })
```

### 6.3 错误处理

```typescript
import { ValidationException } from '@schema-component/schema'

try {
  const user = UserSchema.parse(invalidData)
} catch (error) {
  if (error instanceof ValidationException) {
    // 格式化错误消息
    const formatted = error.format()
    // {
    //   name: ['姓名不能为空'],
    //   email: ['邮箱格式不正确', '该邮箱已被注册']
    // }

    // 扁平化错误
    const flat = error.flatten()
    // [
    //   { path: 'name', message: '姓名不能为空' },
    //   { path: 'email', message: '邮箱格式不正确' }
    // ]

    // 获取第一个错误
    const firstError = error.first()
  }
}
```

---

## 7. 序列化与互操作性

### 7.1 JSON Schema 导出

```typescript
// 导出为 JSON Schema
const jsonSchema = UserSchema.toJSONSchema()
// {
//   type: 'object',
//   properties: {
//     id: { type: 'string', format: 'uuid' },
//     name: { type: 'string', minLength: 2, maxLength: 50 },
//     email: { type: 'string', format: 'email' }
//   },
//   required: ['name', 'email']
// }

// 导出为 OpenAPI Schema
const openApiSchema = UserSchema.toOpenAPI()
```

### 7.2 TypeBox 集成

```typescript
import { Type } from '@sinclair/typebox'
import { toTypeBox } from '@schema-component/schema'

// 转换为 TypeBox
const typeBoxSchema = toTypeBox(UserSchema)

// 使用 TypeBox 的高性能验证
import { Value } from '@sinclair/typebox/value'
const isValid = Value.Check(typeBoxSchema, data)
```

### 7.3 Prisma 集成

```typescript
// 导出为 Prisma Schema
const prismaSchema = UserSchema.toPrisma()
// model User {
//   id        String   @id @default(uuid())
//   name      String
//   email     String   @unique
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   posts     Post[]
// }
```

---

## 8. 高级特性

### 8.1 Schema 组合与继承

```typescript
// 基础 Schema
const TimestampSchema = defineSchema('Timestamp', {
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true })
})

// 软删除 Schema
const SoftDeleteSchema = defineSchema('SoftDelete', {
  deletedAt: field.timestamp({ nullable: true })
})

// 组合 Schema
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),

  // 继承其他 Schema
  ...TimestampSchema.fields,
  ...SoftDeleteSchema.fields
})

// 扩展 Schema
const AdminUserSchema = UserSchema.extend({
  role: field.enum({
    values: ['admin', 'super_admin'] as const
  }),
  permissions: field.array({
    items: field.string()
  })
})
```

### 8.2 虚拟字段

```typescript
const UserSchema = defineSchema('User', {
  firstName: field.string(),
  lastName: field.string(),

  // 虚拟字段
  fullName: field.virtual({
    get: (user) => `${user.firstName} ${user.lastName}`,
    set: (user, value) => {
      const [firstName, lastName] = value.split(' ')
      user.firstName = firstName
      user.lastName = lastName
    }
  })
})
```

### 8.3 条件验证

```typescript
const OrderSchema = defineSchema('Order', {
  type: field.enum({
    values: ['pickup', 'delivery'] as const
  }),

  // 当 type 为 delivery 时，address 必填
  address: field.string()
    .withOption({
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

### 8.4 Schema 迁移

```typescript
// Schema 版本控制
const UserSchemaV1 = defineSchema('User', {
  name: field.string()
}, { version: 1 })

const UserSchemaV2 = defineSchema('User', {
  firstName: field.string(),
  lastName: field.string()
}, { version: 2 })

// 迁移函数
const migration = defineMigration({
  from: 1,
  to: 2,
  migrate: (data) => {
    const [firstName, lastName] = data.name.split(' ')
    return {
      ...data,
      firstName,
      lastName
    }
  }
})
```

---

## 9. 性能优化

### 9.1 懒加载验证

```typescript
// 延迟加载复杂验证规则
const complexField = field.string()
  .withOption({
    validate: async () => {
      const validator = await import('./complex-validator')
      return validator.validate
    }
  })
```

### 9.2 验证缓存

```typescript
// 启用验证缓存
const validator = UserSchema.validator({
  cache: true,
  cacheSize: 1000
})
```

### 9.3 增量验证

```typescript
// 仅验证变更字段
const result = validator.validatePartial(changedData, {
  fields: ['name', 'email']
})
```

---

## 10. 测试与质量保证

### 10.1 测试覆盖率目标

- 核心模块：100%
- 字段类型：95%+
- 验证规则：95%+
- 整体覆盖率：90%+

### 10.2 测试用例设计

```typescript
describe('Schema Validation', () => {
  it('should validate basic fields', () => {
    const result = UserSchema.safeParse({
      name: 'John',
      email: 'john@example.com'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid data', () => {
    const result = UserSchema.safeParse({
      name: '',  // 太短
      email: 'invalid'  // 格式错误
    })
    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(2)
  })

  it('should handle relations', async () => {
    const post = await PostSchema.parse({
      title: 'Test',
      author: { id: 'user-1', name: 'John' }
    })
    expect(post.author.name).toBe('John')
  })
})
```

---

## 11. 文档与示例

### 11.1 快速开始

```typescript
import { defineSchema, field, relation } from '@schema-component/schema'

// 1. 定义 Schema
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  email: field.email({ unique: true }),
  posts: relation.many('Post')
})

// 2. 验证数据
const result = UserSchema.safeParse({
  name: 'John Doe',
  email: 'john@example.com'
})

// 3. 使用类型
type User = Infer<typeof UserSchema>
```

### 11.2 完整示例

详见 `/packages/schema/examples/` 目录

---

## 12. 实现路线图

### Phase 1: 核心基础 (Week 1-2)
- [x] 项目架构设计
- [ ] 核心类型系统
- [ ] 基础字段实现（string, number, boolean）
- [ ] Schema 定义 API
- [ ] 基础验证功能

### Phase 2: 字段系统 (Week 3-4)
- [ ] 完整基础字段类型
- [ ] 字段选项系统
- [ ] withOption 包装函数
- [ ] 自定义验证规则

### Phase 3: 关联系统 (Week 5-6)
- [ ] One-to-One 关联
- [ ] One-to-Many 关联
- [ ] Many-to-One 关联
- [ ] Many-to-Many 关联
- [ ] 关联查询支持

### Phase 4: 高级特性 (Week 7-8)
- [ ] 类型推导系统
- [ ] Schema 组合与继承
- [ ] 虚拟字段
- [ ] 条件验证

### Phase 5: 互操作性 (Week 9-10)
- [ ] JSON Schema 导出
- [ ] TypeBox 集成
- [ ] OpenAPI 支持
- [ ] Prisma 集成

### Phase 6: 优化与文档 (Week 11-12)
- [ ] 性能优化
- [ ] 完整测试覆盖
- [ ] API 文档
- [ ] 示例项目

---

## 13. 依赖项

```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "@sinclair/typebox": "^0.32.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 14. 总结

本设计文档定义了一个完整、类型安全、高性能的 Schema 系统，核心特性包括：

1. **完整的类型系统**：支持所有常见基础类型和关联类型
2. **灵活的 API**：链式调用、withOption 包装、类型推导
3. **强大的验证**：基于 Zod，支持同步/异步、自定义规则、丰富的错误处理
4. **互操作性**：JSON Schema、TypeBox、OpenAPI、Prisma
5. **成熟生态**：与 tRPC、React Hook Form 等主流工具集成
6. **可扩展**：Schema 组合、继承、虚拟字段

该系统将为 schema-component 项目提供坚实的数据层基础。

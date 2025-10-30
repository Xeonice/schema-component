# Schema Component API 参考手册

> **技术栈**: 本 Schema 系统基于 **Zod** (核心验证引擎) 和 **TypeBox** (JSON Schema 序列化) 构建。
>
> Zod 提供成熟稳定的验证功能和丰富的生态系统支持，TypeBox 提供标准兼容的序列化能力。

## 目录

1. [字段类型 API](#字段类型-api)
2. [关联字段 API](#关联字段-api)
3. [Schema 定义 API](#schema-定义-api)
4. [选项系统 API](#选项系统-api)
5. [验证 API](#验证-api)
6. [类型工具 API](#类型工具-api)

---

## 字段类型 API

### field.string()

创建字符串类型字段。

**签名：**
```typescript
function string(options?: StringFieldOptions): StringField
```

**选项：**
```typescript
interface StringFieldOptions {
  minLength?: number          // 最小长度
  maxLength?: number          // 最大长度
  pattern?: RegExp | string   // 正则表达式验证
  format?: 'email' | 'url' | 'uuid' | 'slug' | 'phone'
  trim?: boolean              // 自动去除首尾空格
  lowercase?: boolean         // 自动转小写
  uppercase?: boolean         // 自动转大写
  default?: string            // 默认值
  required?: boolean          // 是否必填
  unique?: boolean            // 是否唯一
  index?: boolean             // 是否索引
}
```

**示例：**
```typescript
// 基础用法
const name = field.string()

// 带验证
const username = field.string({
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/,
  required: true,
  unique: true
})

// 邮箱
const email = field.string({
  format: 'email',
  lowercase: true,
  trim: true
})
```

---

### field.number()

创建数值类型字段。

**签名：**
```typescript
function number(options?: NumberFieldOptions): NumberField
```

**选项：**
```typescript
interface NumberFieldOptions {
  min?: number                // 最小值
  max?: number                // 最大值
  step?: number               // 步进值
  precision?: number          // 精度
  scale?: number              // 小数位数
  positive?: boolean          // 仅允许正数
  negative?: boolean          // 仅允许负数
  default?: number
  required?: boolean
  unique?: boolean
  index?: boolean
}
```

**示例：**
```typescript
// 整数
const age = field.integer({
  min: 0,
  max: 150
})

// 浮点数
const price = field.float({
  min: 0,
  precision: 10,
  scale: 2
})

// 正数
const quantity = field.positive()
```

---

### field.boolean()

创建布尔类型字段。

**签名：**
```typescript
function boolean(options?: BooleanFieldOptions): BooleanField
```

**选项：**
```typescript
interface BooleanFieldOptions {
  default?: boolean
  required?: boolean
}
```

**示例：**
```typescript
const isActive = field.boolean({
  default: true
})

const isPublished = field.boolean()
```

---

### field.date() / field.datetime() / field.timestamp()

创建日期/时间类型字段。

**签名：**
```typescript
function date(options?: DateFieldOptions): DateField
function datetime(options?: DateFieldOptions): DateTimeField
function timestamp(options?: TimestampFieldOptions): TimestampField
```

**选项：**
```typescript
interface DateFieldOptions {
  min?: Date | string
  max?: Date | string
  default?: Date | string | 'now'
  required?: boolean
  index?: boolean
}

interface TimestampFieldOptions extends DateFieldOptions {
  autoCreate?: boolean        // 自动设置创建时间
  autoUpdate?: boolean        // 自动更新时间
}
```

**示例：**
```typescript
// 日期
const birthDate = field.date({
  max: new Date()
})

// 时间戳
const createdAt = field.timestamp({
  autoCreate: true,
  required: true
})

const updatedAt = field.timestamp({
  autoUpdate: true
})
```

---

### field.enum()

创建枚举类型字段。

**签名：**
```typescript
function enum<T extends readonly (string | number)[]>(
  options: EnumFieldOptions<T>
): EnumField<T>
```

**选项：**
```typescript
interface EnumFieldOptions<T> {
  values: T                   // 枚举值数组
  default?: T[number]         // 默认值
  required?: boolean
  index?: boolean
}
```

**示例：**
```typescript
const status = field.enum({
  values: ['pending', 'active', 'inactive'] as const,
  default: 'pending'
})

const priority = field.enum({
  values: [1, 2, 3, 4, 5] as const,
  default: 3
})
```

---

### field.json()

创建 JSON 类型字段。

**签名：**
```typescript
function json<T = any>(options?: JsonFieldOptions<T>): JsonField<T>
```

**选项：**
```typescript
interface JsonFieldOptions<T> {
  schema?: Schema             // 嵌套 schema 验证
  default?: T
  required?: boolean
}
```

**示例：**
```typescript
// 基础 JSON
const metadata = field.json({
  default: {}
})

// 带 schema 验证
const config = field.json({
  schema: defineSchema('Config', {
    theme: field.string(),
    language: field.string()
  })
})
```

---

### field.array()

创建数组类型字段。

**签名：**
```typescript
function array<T extends Field>(
  options: ArrayFieldOptions<T>
): ArrayField<T>
```

**选项：**
```typescript
interface ArrayFieldOptions<T> {
  items: T                    // 数组元素类型
  minItems?: number           // 最小元素数
  maxItems?: number           // 最大元素数
  unique?: boolean            // 元素唯一
  default?: any[]
  required?: boolean
}
```

**示例：**
```typescript
// 字符串数组
const tags = field.array({
  items: field.string(),
  minItems: 1,
  maxItems: 10,
  unique: true
})

// 对象数组
const items = field.array({
  items: defineSchema('Item', {
    name: field.string(),
    quantity: field.integer()
  })
})
```

---

## 关联字段 API

### relation.one()

创建一对一关联。

**签名：**
```typescript
function one(target: string, options?: OneToOneOptions): OneToOneRelation
```

**选项：**
```typescript
interface OneToOneOptions {
  field?: string              // 当前模型的外键字段
  references?: string         // 引用目标模型的字段
  onDelete?: ReferentialAction
  onUpdate?: ReferentialAction
  required?: boolean
  eager?: boolean             // 是否急加载
}

type ReferentialAction =
  | 'CASCADE'                 // 级联删除/更新
  | 'SET_NULL'                // 设为 NULL
  | 'RESTRICT'                // 限制
  | 'NO_ACTION'               // 无操作
```

**示例：**
```typescript
const profile = relation.one('Profile', {
  field: 'userId',
  references: 'id',
  onDelete: 'CASCADE',
  eager: true
})
```

---

### relation.many()

创建一对多关联。

**签名：**
```typescript
function many(target: string, options?: OneToManyOptions): OneToManyRelation
```

**选项：**
```typescript
interface OneToManyOptions {
  foreignKey?: string         // 目标模型的外键字段
  references?: string         // 当前模型的引用字段
  onDelete?: ReferentialAction
  eager?: boolean
  orderBy?: string | OrderByOptions
}

interface OrderByOptions {
  field: string
  order: 'ASC' | 'DESC'
}
```

**示例：**
```typescript
const posts = relation.many('Post', {
  foreignKey: 'authorId',
  references: 'id',
  orderBy: { field: 'createdAt', order: 'DESC' }
})
```

---

### relation.belongsTo()

创建多对一关联。

**签名：**
```typescript
function belongsTo(target: string, options?: ManyToOneOptions): ManyToOneRelation
```

**选项：**
```typescript
interface ManyToOneOptions {
  foreignKey?: string         // 当前模型的外键字段
  references?: string         // 目标模型的引用字段
  required?: boolean
  eager?: boolean
  onDelete?: ReferentialAction
}
```

**示例：**
```typescript
const author = relation.belongsTo('User', {
  foreignKey: 'authorId',
  references: 'id',
  required: true,
  eager: true
})
```

---

### relation.manyToMany()

创建多对多关联。

**签名：**
```typescript
function manyToMany(
  target: string,
  options: ManyToManyOptions
): ManyToManyRelation
```

**选项：**
```typescript
interface ManyToManyOptions {
  through: string | ThroughTableOptions
  foreignKey?: string
  otherKey?: string
  eager?: boolean
  orderBy?: string | OrderByOptions
}

interface ThroughTableOptions {
  model: string               // 中间表模型名
  from: string                // 源外键
  to: string                  // 目标外键
  extraFields?: Record<string, Field>  // 额外字段
}
```

**示例：**
```typescript
// 简单方式
const tags = relation.manyToMany('Tag', {
  through: 'PostTags',
  foreignKey: 'postId',
  otherKey: 'tagId'
})

// 带额外字段
const roles = relation.manyToMany('Role', {
  through: {
    model: 'UserRoles',
    from: 'userId',
    to: 'roleId',
    extraFields: {
      assignedAt: field.timestamp({ autoCreate: true }),
      assignedBy: field.string()
    }
  }
})
```

---

## Schema 定义 API

### defineSchema()

定义一个 Schema。

**签名：**
```typescript
function defineSchema<T extends FieldDefinitions>(
  name: string,
  fields: T,
  options?: SchemaOptions
): Schema<T>
```

**选项：**
```typescript
interface SchemaOptions {
  version?: number            // Schema 版本
  tableName?: string          // 自定义表名
  timestamps?: boolean        // 自动添加时间戳字段
  softDelete?: boolean        // 软删除支持
  indexes?: IndexDefinition[] // 索引定义
}

interface IndexDefinition {
  fields: string[]
  unique?: boolean
  name?: string
}
```

**示例：**
```typescript
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  email: field.email({ unique: true })
}, {
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['name', 'email'] }
  ]
})
```

---

### Schema 方法

#### schema.extend()

扩展现有 Schema。

```typescript
const AdminSchema = UserSchema.extend({
  role: field.string(),
  permissions: field.array({ items: field.string() })
})
```

#### schema.pick()

选择部分字段。

```typescript
const UserBasicSchema = UserSchema.pick(['id', 'name', 'email'])
```

#### schema.omit()

排除部分字段。

```typescript
const UserWithoutPassword = UserSchema.omit(['password'])
```

#### schema.partial()

将所有字段变为可选。

```typescript
const UserUpdateSchema = UserSchema.partial()
```

#### schema.required()

将所有字段变为必填。

```typescript
const StrictUserSchema = UserSchema.required()
```

---

## 选项系统 API

### withOption()

为字段添加选项配置。

**签名：**
```typescript
function withOption<T extends Field>(
  field: T,
  options: FieldOptions
): T & { options: FieldOptions }
```

**通用选项：**
```typescript
interface FieldOptions {
  required?: boolean
  default?: any | (() => any)
  unique?: boolean
  index?: boolean | IndexOptions
  nullable?: boolean

  // 验证
  validate?: ValidateFunction | ValidateFunction[]
  transform?: TransformFunction

  // 错误消息
  errorMessages?: {
    required?: string
    invalid?: string
    [key: string]: string | undefined
  }

  // 元数据
  label?: string
  description?: string
  example?: any
  deprecated?: boolean | string

  // 数据库
  column?: string
  comment?: string
}
```

**示例：**
```typescript
const email = withOption(field.email(), {
  required: true,
  unique: true,
  errorMessages: {
    required: '邮箱不能为空',
    invalid: '邮箱格式不正确',
    unique: '该邮箱已被注册'
  },
  label: '邮箱地址',
  description: '用户的登录邮箱'
})
```

---

## 验证 API

### validator()

创建验证器。

**签名：**
```typescript
function validator(options?: ValidatorOptions): Validator
```

**选项：**
```typescript
interface ValidatorOptions {
  cache?: boolean             // 启用缓存
  cacheSize?: number          // 缓存大小
  abortEarly?: boolean        // 遇到第一个错误时停止
  stripUnknown?: boolean      // 移除未知字段
}
```

**示例：**
```typescript
const validator = UserSchema.validator({
  cache: true,
  abortEarly: false
})
```

### parse()

验证并解析数据（失败抛异常）。

```typescript
try {
  const user = UserSchema.parse(data)
} catch (error) {
  console.error(error)
}
```

### safeParse()

安全验证（返回结果对象）。

```typescript
const result = UserSchema.safeParse(data)

if (result.success) {
  console.log(result.data)
} else {
  console.error(result.errors)
}
```

### validateAsync()

异步验证。

```typescript
const result = await UserSchema.validateAsync(data)
```

### validatePartial()

部分验证（仅验证提供的字段）。

```typescript
const result = UserSchema.validatePartial({
  email: 'new@email.com'
}, {
  fields: ['email']
})
```

---

## 类型工具 API

### Infer<T>

从 Schema 推导 TypeScript 类型。

```typescript
const UserSchema = defineSchema('User', {
  id: field.string(),
  name: field.string({ required: true })
})

type User = Infer<typeof UserSchema>
// { id?: string; name: string }
```

### InferInput<T>

推导输入类型（创建时）。

```typescript
type UserInput = InferInput<typeof UserSchema>
// 排除自动生成字段（id, createdAt, updatedAt）
```

### InferOutput<T>

推导输出类型（查询结果）。

```typescript
type UserOutput = InferOutput<typeof UserSchema>
// 包含所有字段，关联字段可能为 undefined
```

### Partial<T>

创建部分类型。

```typescript
type UserUpdate = Partial<Infer<typeof UserSchema>>
```

### Required<T>

创建必填类型。

```typescript
type StrictUser = Required<Infer<typeof UserSchema>>
```

### Pick<T, K>

选择部分字段。

```typescript
type UserBasic = Pick<Infer<typeof UserSchema>, 'id' | 'name'>
```

### Omit<T, K>

排除部分字段。

```typescript
type UserPublic = Omit<Infer<typeof UserSchema>, 'password'>
```

---

## 自定义验证规则

### defineRule()

定义自定义验证规则。

**签名：**
```typescript
function defineRule<T>(options: RuleDefinition<T>): ValidationRule<T>
```

**选项：**
```typescript
interface RuleDefinition<T> {
  name: string
  validate: (value: T, context: ValidationContext) =>
    ValidationResult | Promise<ValidationResult>
  message?: string
}

interface ValidationContext {
  data?: any                  // 完整数据
  path: string[]              // 字段路径
  schema: Schema              // Schema 实例
}

interface ValidationResult {
  valid: boolean
  message?: string
}
```

**示例：**
```typescript
const minAge = defineRule<number>({
  name: 'minAge',
  validate: (value, context) => {
    if (value < 18) {
      return {
        valid: false,
        message: '年龄必须大于18岁'
      }
    }
    return { valid: true }
  }
})

// 使用
const age = field.integer()
  .withOption({
    validate: [minAge]
  })
```

---

## 序列化 API

### toJSONSchema()

导出为 JSON Schema。

```typescript
const jsonSchema = UserSchema.toJSONSchema()
```

### toOpenAPI()

导出为 OpenAPI Schema。

```typescript
const openApiSchema = UserSchema.toOpenAPI()
```

### toPrisma()

导出为 Prisma Schema。

```typescript
const prismaSchema = UserSchema.toPrisma()
```

### toTypeBox()

转换为 TypeBox Schema。

```typescript
import { toTypeBox } from '@schema-component/schema'

const typeBoxSchema = toTypeBox(UserSchema)
```

---

## 错误处理

### ValidationException

验证异常类。

**方法：**
```typescript
class ValidationException extends Error {
  errors: ValidationError[]

  // 格式化为对象 { field: [errors] }
  format(): Record<string, string[]>

  // 扁平化为数组
  flatten(): Array<{ path: string; message: string }>

  // 获取第一个错误
  first(): ValidationError | null

  // 按路径获取错误
  get(path: string): string[] | null
}
```

**示例：**
```typescript
try {
  UserSchema.parse(data)
} catch (error) {
  if (error instanceof ValidationException) {
    const formatted = error.format()
    // { email: ['邮箱格式不正确', '该邮箱已被注册'] }

    const flat = error.flatten()
    // [{ path: 'email', message: '邮箱格式不正确' }]

    const firstError = error.first()
    // { path: ['email'], message: '邮箱格式不正确', ... }
  }
}
```

---

## 高级 API

### schema.virtual()

定义虚拟字段。

```typescript
const UserSchema = defineSchema('User', {
  firstName: field.string(),
  lastName: field.string(),

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

### schema.computed()

定义计算字段。

```typescript
const OrderSchema = defineSchema('Order', {
  items: field.array({ items: ItemSchema }),

  total: field.computed({
    type: field.number(),
    compute: (order) => {
      return order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    }
  })
})
```

### schema.hooks()

定义钩子。

```typescript
UserSchema.hooks({
  beforeValidate: (data) => {
    // 验证前处理
    return data
  },
  afterValidate: (data) => {
    // 验证后处理
    return data
  },
  beforeSave: async (data) => {
    // 保存前处理
    data.password = await hash(data.password)
    return data
  }
})
```

---

## 完整示例

```typescript
import {
  defineSchema,
  field,
  relation,
  withOption,
  Infer
} from '@schema-component/schema'

// 定义用户 Schema
const UserSchema = defineSchema('User', {
  // 主键
  id: field.uuid({ primary: true }),

  // 基础字段
  username: withOption(field.string(), {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    required: true,
    unique: true,
    errorMessages: {
      pattern: '用户名只能包含字母、数字和下划线'
    }
  }),

  email: withOption(field.email(), {
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }),

  password: field.string({
    minLength: 8,
    required: true
  }),

  age: field.integer({
    min: 0,
    max: 150
  }),

  status: field.enum({
    values: ['active', 'inactive', 'banned'] as const,
    default: 'active'
  }),

  // 时间戳
  createdAt: field.timestamp({ autoCreate: true }),
  updatedAt: field.timestamp({ autoUpdate: true }),

  // 关联
  profile: relation.one('Profile'),
  posts: relation.many('Post', { foreignKey: 'authorId' }),
  roles: relation.manyToMany('Role', {
    through: 'UserRoles'
  })
})

// 类型推导
type User = Infer<typeof UserSchema>

// 验证数据
const result = UserSchema.safeParse({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securePassword123',
  age: 25
})

if (result.success) {
  console.log('验证成功:', result.data)
} else {
  console.error('验证失败:', result.errors)
}
```

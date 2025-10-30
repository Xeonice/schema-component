# @schema-component/schema

基于 Zod 的类型安全 Schema 定义系统。

## 特性

✅ **完整的类型系统**：支持字符串、数字、布尔、日期、枚举、JSON、数组等基础类型
✅ **关联关系**：支持 BelongsTo、HasMany、ManyToMany 关联
✅ **类型推导**：完整的 TypeScript 类型推导支持
✅ **灵活配置**：支持 withOption 链式配置
✅ **运行时验证**：基于 Zod 的强大验证能力
✅ **Schema 操作**：支持扩展、选择、排除字段等操作

## 安装

```bash
pnpm add @schema-component/schema zod
```

## 快速开始

### 1. 定义 Schema

```typescript
import { defineSchema, field } from '@schema-component/schema'
import type { InferSchema } from '@schema-component/schema'

const UserSchema = defineSchema({
  name: 'User',
  fields: {
    id: field.uuid({ required: true }),
    email: field.email({ required: true, unique: true }),
    name: field.string({ required: true, minLength: 2, maxLength: 100 }),
    age: field.integer({ min: 0, max: 150 }),
    isActive: field.boolean({ default: true })
  },
  options: {
    timestamps: true,  // 自动添加 createdAt 和 updatedAt
    softDelete: true   // 添加 deletedAt 字段
  }
})

// 类型推导
type User = InferSchema<typeof UserSchema>
```

### 2. 验证数据

```typescript
import { validateSchema, parseSchema } from '@schema-component/schema'

// 安全验证（返回结果对象）
const result = validateSchema(UserSchema, userData)
if (result.success) {
  console.log('Valid:', result.data)
} else {
  console.error('Errors:', result.error)
}

// 直接解析（失败会抛出错误）
try {
  const user = parseSchema(UserSchema, userData)
  console.log(user)
} catch (error) {
  console.error(error)
}
```

## 字段类型

### 基础字段

#### 字符串类型
```typescript
field.string({ minLength: 2, maxLength: 100 })
field.text()           // 长文本
field.email()          // 邮箱
field.url()            // URL
field.uuid()           // UUID
field.slug()           // URL 友好字符串
field.phone()          // 电话号码
```

#### 数值类型
```typescript
field.number({ min: 0, max: 100 })
field.integer({ positive: true })
field.float({ precision: 10, scale: 2 })
field.positiveInteger()
field.nonNegativeInteger()
```

#### 其他基础类型
```typescript
field.boolean({ default: true })
field.date({ min: new Date('2025-01-01') })
field.datetime()
field.timestamp()
field.createdAt()      // 自动创建时间
field.updatedAt()      // 自动更新时间
```

#### 枚举类型
```typescript
// 字符串枚举
field.enum({ values: ['draft', 'published', 'archived'] as const })

// TypeScript 原生枚举
enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}
field.nativeEnum(UserRole)
```

#### JSON 和数组
```typescript
// JSON 对象
field.json()
field.jsonObject({
  name: z.string(),
  age: z.number()
})

// JSON 数组
field.jsonArray(z.string())

// 数组
field.array(z.string(), { minItems: 1, maxItems: 10 })
field.stringArray()
field.numberArray()
field.booleanArray()
```

### 关联字段

#### BelongsTo (Many-to-One)
```typescript
const PostSchema = defineSchema({
  name: 'Post',
  fields: {
    authorId: field.uuid({ required: true }),
    author: field.belongsTo({
      target: 'User',
      foreignKey: 'authorId',
      onDelete: 'CASCADE'
    })
  }
})
```

#### HasMany (One-to-Many)
```typescript
const UserSchema = defineSchema({
  name: 'User',
  fields: {
    posts: field.hasMany({
      target: 'Post',
      foreignKey: 'authorId',
      orderBy: { field: 'createdAt', order: 'DESC' }
    })
  }
})
```

#### ManyToMany
```typescript
const PostSchema = defineSchema({
  name: 'Post',
  fields: {
    tags: field.manyToMany({
      target: 'Tag',
      through: 'PostTags',
      foreignKey: 'postId',
      otherKey: 'tagId'
    })
  }
})
```

## Schema 操作

### 扩展 Schema
```typescript
import { extendSchema } from '@schema-component/schema'

const ExtendedUserSchema = extendSchema(UserSchema, {
  avatar: field.url(),
  bio: field.text()
})
```

### 选择字段
```typescript
import { pickSchema } from '@schema-component/schema'

// 只选择公开字段
const UserPublicSchema = pickSchema(UserSchema, ['id', 'name', 'email'])
```

### 排除字段
```typescript
import { omitSchema } from '@schema-component/schema'

// 排除敏感字段
const UserSafeSchema = omitSchema(UserSchema, ['password', 'deletedAt'])
```

## 高级特性

### 自定义验证
```typescript
const UserSchema = defineSchema({
  name: 'User',
  fields: { /* ... */ },
  options: {
    validate: (data) => {
      if (data.role === 'admin' && !data.permissions?.length) {
        return {
          field: 'permissions',
          message: 'Admin must have permissions'
        }
      }
      return true
    }
  }
})
```

### withOption 链式配置
```typescript
import { withOption, field } from '@schema-component/schema'

const nameField = withOption(field.string())
  .required('Name is required')
  .minLength(2, 'Name too short')
  .maxLength(100, 'Name too long')
  .trim()
  .build()
```

### 类型推导工具
```typescript
import type {
  InferSchema,
  InferCreateType,
  InferUpdateType,
  RequiredFieldsOf,
  OptionalFieldsOf
} from '@schema-component/schema'

type User = InferSchema<typeof UserSchema>
type CreateUser = InferCreateType<typeof UserSchema>  // 排除自动生成字段
type UpdateUser = InferUpdateType<typeof UserSchema>  // 所有字段可选
type RequiredFields = RequiredFieldsOf<typeof UserSchema>
type OptionalFields = OptionalFieldsOf<typeof UserSchema>
```

## API 参考

### 核心函数
- `defineSchema()` - 定义 Schema
- `extendSchema()` - 扩展 Schema
- `pickSchema()` - 选择字段
- `omitSchema()` - 排除字段

### 验证函数
- `validateSchema()` - 安全验证
- `parseSchema()` - 解析（会抛出错误）
- `validatePartial()` - 验证部分数据
- `validateRequired()` - 验证必填字段

### 工具函数
- `getSchemaFieldNames()` - 获取字段名列表
- `hasSchemaField()` - 检查字段是否存在
- `getFieldType()` - 获取字段类型
- `getFieldOptions()` - 获取字段选项
- `cloneSchema()` - 克隆 Schema
- `mergeSchemas()` - 合并多个 Schema

## 示例

查看 `examples/basic-usage.ts` 了解更多使用示例。

## License

MIT

# 架构决策记录 (Architecture Decision Records - ADR)

## ADR-001: 选择 Zod 作为核心验证引擎

**日期**: 2025-10-30
**状态**: 已接受
**决策者**: Schema Component 团队

### 背景

需要为 Schema Component 选择一个 TypeScript 验证库作为核心验证引擎。主要候选方案包括：
- Zod
- Valibot
- TypeBox
- Yup
- io-ts

### 决策

选择 **Zod** 作为核心验证引擎，并结合 **TypeBox** 用于 JSON Schema 序列化。

### 理由

#### Zod 的优势

1. **成熟稳定的生态系统**
   - 社区活跃，文档完善
   - 广泛的第三方集成（tRPC、React Hook Form、Next.js 等）
   - 经过大规模生产环境验证
   - 长期维护和支持

2. **优秀的 TypeScript 支持**
   - 完整的类型推导
   - 精确的错误类型
   - 类型安全性强
   - IDE 支持良好

3. **丰富的功能**
   - 完整的验证规则库
   - 强大的错误处理机制
   - 支持 transform、refine、superRefine
   - 内置常见验证（email, url, uuid 等）

4. **出色的 API 设计**
   - 链式调用友好
   - API 直观易用
   - 学习曲线平缓
   - 适合构建复杂的字段系统

#### TypeBox 的补充作用

1. **JSON Schema 标准**
   - 完全符合 JSON Schema 规范
   - 易于与其他工具集成
   - 支持 OpenAPI 文档生成

2. **极致性能**
   - 最快的验证库
   - 适合高性能场景

3. **互操作性**
   - 提供标准的 Schema 导出
   - 支持 API 文档自动生成

### 对比分析

| 特性 | Zod | Valibot | TypeBox |
|------|-----|---------|---------|
| 包大小 | 13.5KB | 1.37KB | ~5KB |
| 性能 | 中等 | 快（2x Zod） | 最快 |
| TypeScript 支持 | 优秀 | 优秀 | 优秀 |
| 生态系统 | 成熟 | 新兴 | 中等 |
| JSON Schema | 需要转换 | 需要转换 | 原生支持 |
| 学习曲线 | 低 | 低 | 中等 |
| 社区支持 | 非常活跃 | 活跃 | 活跃 |
| 生产就绪 | ✅ | ⚠️ | ✅ |

### 后果

#### 正面影响

- 成熟的生态系统，降低技术风险
- 丰富的第三方集成，提升开发效率
- 完善的文档和社区支持
- 良好的 TypeScript 类型推导
- 双引擎架构兼顾功能和标准

#### 负面影响

- 包体积相对较大（13.5KB）
- 性能不如 Valibot 和 TypeBox

#### 风险缓解

- 使用 Tree-shaking 优化包体积
- 对性能要求极高的场景可切换到 TypeBox
- 提供完整的 API 文档和示例
- 封装统一的接口，保持灵活性

---

## ADR-002: 关联字段采用字符串引用而非直接导入

**日期**: 2025-10-30
**状态**: 已接受
**决策者**: Schema Component 团队

### 背景

在定义关联关系时，需要决定如何引用目标 Schema：
- 方案 A: 直接导入 Schema 实例
- 方案 B: 使用字符串名称引用

### 决策

使用 **字符串名称** 引用目标 Schema。

### 理由

1. **避免循环依赖**
   ```typescript
   // 字符串引用 - 无循环依赖
   // user.schema.ts
   const UserSchema = defineSchema('User', {
     posts: relation.many('Post')
   })

   // post.schema.ts
   const PostSchema = defineSchema('Post', {
     author: relation.belongsTo('User')
   })
   ```

2. **延迟解析**
   - Schema 注册后再解析关联
   - 支持动态 Schema 定义
   - 更灵活的模块加载

3. **与 ORM 保持一致**
   - Prisma、TypeORM、Sequelize 都使用字符串引用
   - 开发者熟悉的模式
   - 易于理解和维护

### 实现方式

```typescript
// Schema 注册表
const schemaRegistry = new Map<string, Schema>()

// 注册 Schema
function defineSchema(name: string, fields: FieldDefinitions) {
  const schema = new Schema(name, fields)
  schemaRegistry.set(name, schema)
  return schema
}

// 解析关联
function resolveRelation(targetName: string): Schema {
  const schema = schemaRegistry.get(targetName)
  if (!schema) {
    throw new Error(`Schema "${targetName}" not found`)
  }
  return schema
}
```

### 后果

#### 正面影响

- 无循环依赖问题
- 模块组织更灵活
- 支持动态 Schema

#### 负面影响

- 运行时才能发现 Schema 不存在的错误
- 失去编译时类型检查

#### 风险缓解

- 提供 Schema 验证工具
- 在开发环境检查 Schema 完整性
- 提供 TypeScript 类型提示

---

## ADR-003: 时间戳字段使用 ISO 8601 字符串而非 Date 对象

**日期**: 2025-10-30
**状态**: 讨论中
**决策者**: Schema Component 团队

### 背景

时间戳字段可以使用以下格式：
- JavaScript Date 对象
- Unix 时间戳（number）
- ISO 8601 字符串

### 决策

内部使用 **JavaScript Date 对象**，序列化时转换为 **ISO 8601 字符串**。

### 理由

1. **Date 对象的优势**
   - TypeScript 原生支持
   - 丰富的 API
   - 类型安全

2. **ISO 8601 的优势**
   - 标准格式
   - 人类可读
   - JSON 序列化友好
   - 时区信息完整

3. **最佳实践**
   ```typescript
   // 内部使用 Date
   const createdAt = field.timestamp()

   // 序列化为 ISO 8601
   const json = schema.toJSON(data)
   // { createdAt: "2025-10-30T12:00:00.000Z" }

   // 从 JSON 解析
   const parsed = schema.parse(json)
   // { createdAt: Date }
   ```

### 后果

- 需要在序列化/反序列化时转换
- 提供一致的 API 体验
- 兼容 JSON Schema 标准

---

## ADR-004: 验证失败时返回结果对象而非抛出异常

**日期**: 2025-10-30
**状态**: 已接受
**决策者**: Schema Component 团队

### 背景

验证失败时的处理方式：
- 方案 A: 抛出异常
- 方案 B: 返回结果对象
- 方案 C: 同时提供两种方式

### 决策

选择 **方案 C**：同时提供 `parse()` 和 `safeParse()` 两种 API。

### 理由

1. **灵活性**
   - 不同场景使用不同方式
   - 开发者可以选择最适合的方式

2. **parse() - 异常方式**
   ```typescript
   try {
     const user = UserSchema.parse(data)
     // 成功：使用 user
   } catch (error) {
     // 失败：处理错误
   }
   ```
   - 适合：必须验证通过的场景
   - 代码简洁

3. **safeParse() - 结果对象**
   ```typescript
   const result = UserSchema.safeParse(data)
   if (result.success) {
     // 成功：使用 result.data
   } else {
     // 失败：使用 result.errors
   }
   ```
   - 适合：需要优雅处理错误的场景
   - 类型安全
   - 无异常开销

### 实现

```typescript
interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

class Schema<T> {
  // 抛出异常
  parse(data: unknown): T {
    const result = this.safeParse(data)
    if (!result.success) {
      throw new ValidationException(result.errors)
    }
    return result.data
  }

  // 返回结果
  safeParse(data: unknown): ValidationResult<T> {
    // 验证逻辑
  }
}
```

### 后果

- 提供最大的灵活性
- 与 Zod/Valibot 保持一致
- 轻微增加 API 表面积

---

## ADR-005: 支持虚拟字段和计算字段

**日期**: 2025-10-30
**状态**: 已接受
**决策者**: Schema Component 团队

### 背景

某些字段不存储在数据库，而是动态计算：
- 虚拟字段：getter/setter
- 计算字段：只读计算

### 决策

同时支持 **虚拟字段** 和 **计算字段**。

### 理由

1. **虚拟字段**
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
   - 适合：需要双向绑定的场景
   - 提供 getter 和 setter

2. **计算字段**
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
   - 适合：只读计算值
   - 性能优化（缓存）

### 实现

```typescript
interface VirtualFieldOptions<T, U> {
  get: (data: T) => U
  set?: (data: T, value: U) => void
}

interface ComputedFieldOptions<T, U> {
  type: Field<U>
  compute: (data: T) => U
  cache?: boolean  // 是否缓存计算结果
}
```

### 后果

- 增强 Schema 表达能力
- 减少冗余数据
- 需要处理序列化逻辑

---

## ADR-006: 索引定义放在 Schema 选项中

**日期**: 2025-10-30
**状态**: 已接受
**决策者**: Schema Component 团队

### 背景

索引定义的位置：
- 方案 A: 在字段定义中
- 方案 B: 在 Schema 选项中
- 方案 C: 两者都支持

### 决策

选择 **方案 C**：字段级别索引 + Schema 级别复合索引。

### 理由

1. **字段级别索引**
   ```typescript
   const UserSchema = defineSchema('User', {
     email: field.email({
       unique: true,  // 唯一索引
       index: true    // 普通索引
     })
   })
   ```
   - 简单直观
   - 适合单字段索引

2. **Schema 级别索引**
   ```typescript
   const UserSchema = defineSchema('User', {
     firstName: field.string(),
     lastName: field.string(),
     email: field.email()
   }, {
     indexes: [
       { fields: ['firstName', 'lastName'] },  // 复合索引
       { fields: ['email'], unique: true }     // 唯一索引
     ]
   })
   ```
   - 适合复合索引
   - 集中管理

### 实现

```typescript
interface IndexDefinition {
  fields: string[]
  unique?: boolean
  name?: string
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST'
}

interface SchemaOptions {
  indexes?: IndexDefinition[]
}
```

### 后果

- 提供灵活的索引定义方式
- 支持复杂的索引需求
- 易于生成数据库迁移

---

## 总结

这些架构决策确立了 Schema Component 的核心设计原则：

1. **性能优先**：选择轻量级、高性能的技术栈
2. **类型安全**：充分利用 TypeScript 的类型系统
3. **灵活性**：提供多种使用方式，适应不同场景
4. **标准化**：遵循行业标准和最佳实践
5. **可扩展**：模块化设计，易于扩展

随着项目的发展，我们会继续记录重要的架构决策，确保设计的一致性和可追溯性。

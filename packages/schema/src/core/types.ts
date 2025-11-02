/**
 * Schema Component - 核心类型定义
 *
 * 定义了整个 Schema 系统的基础类型和接口
 */

import type { z } from 'zod'

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 字段类型枚举
 */
export enum FieldType {
  // 基础类型
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIMESTAMP = 'timestamp',
  ENUM = 'enum',
  JSON = 'json',
  ARRAY = 'array',

  // 特殊字符串类型
  UUID = 'uuid',
  EMAIL = 'email',
  URL = 'url',
  SLUG = 'slug',
  TEXT = 'text',

  // 关联类型
  BELONGS_TO = 'belongsTo',  // Many-to-One / One-to-One
  HAS_MANY = 'hasMany',      // One-to-Many
  MANY_TO_MANY = 'manyToMany' // Many-to-Many
}

/**
 * 基础字段选项
 */
export interface BaseFieldOptions {
  /** 是否必填 */
  required?: boolean
  /** 默认值 */
  default?: any
  /** 是否唯一 */
  unique?: boolean
  /** 是否索引 */
  index?: boolean
  /** 是否可为null */
  nullable?: boolean
  /** 字段说明 */
  description?: string
  /** 自定义验证消息 */
  errorMessages?: {
    required?: string
    invalid?: string
    [key: string]: string | undefined
  }
}

/**
 * 字符串字段选项
 */
export interface StringFieldOptions extends BaseFieldOptions {
  minLength?: number
  maxLength?: number
  pattern?: RegExp | string
  format?: 'email' | 'url' | 'uuid' | 'slug' | 'phone'
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
  default?: string
}

/**
 * 数值字段选项
 */
export interface NumberFieldOptions extends BaseFieldOptions {
  min?: number
  max?: number
  step?: number
  precision?: number
  scale?: number
  positive?: boolean
  negative?: boolean
  default?: number
}

/**
 * 布尔字段选项
 */
export interface BooleanFieldOptions extends BaseFieldOptions {
  default?: boolean
}

/**
 * 日期字段选项
 */
export interface DateFieldOptions extends BaseFieldOptions {
  min?: Date | string
  max?: Date | string
  autoCreate?: boolean  // 自动设置为创建时间
  autoUpdate?: boolean  // 自动更新为当前时间
  default?: Date | string
}

/**
 * 枚举字段选项
 */
export interface EnumFieldOptions<T extends readonly any[]> extends BaseFieldOptions {
  values: T
  default?: T[number]
}

/**
 * JSON 字段选项
 */
export interface JSONFieldOptions extends BaseFieldOptions {
  schema?: any  // JSON Schema 验证
  default?: Record<string, any> | any[]
}

/**
 * 数组字段选项
 */
export interface ArrayFieldOptions extends BaseFieldOptions {
  items?: any  // 数组元素类型
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  default?: any[]
}

// ============================================================================
// 关联字段选项
// ============================================================================

/**
 * BelongsTo 关联选项 (Many-to-One / One-to-One)
 */
export interface BelongsToOptions extends BaseFieldOptions {
  /** 关联的目标 Schema 名称 */
  target?: string
  /** 外键字段名 */
  foreignKey: string
  /** 引用字段名（默认为目标的主键） */
  references?: string
  /** 级联删除策略 */
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  /** 级联更新策略 */
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  /** 是否预加载 */
  eager?: boolean
}

/**
 * HasMany 关联选项 (One-to-Many)
 */
export interface HasManyOptions extends BaseFieldOptions {
  /** 关联的目标 Schema 名称 */
  target: string
  /** 目标 Schema 中的外键字段名 */
  foreignKey: string
  /** 引用字段名（默认为当前 Schema 的主键） */
  references?: string
  /** 排序规则 */
  orderBy?: {
    field: string
    order: 'ASC' | 'DESC'
  }
  /** 级联删除 */
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
}

/**
 * ManyToMany 关联选项
 */
export interface ManyToManyOptions extends BaseFieldOptions {
  /** 关联的目标 Schema 名称 */
  target: string
  /** 中间表名称 */
  through: string
  /** 当前 Schema 在中间表中的外键 */
  foreignKey: string
  /** 目标 Schema 在中间表中的外键 */
  otherKey: string
  /** 排序规则 */
  orderBy?: {
    field: string
    order: 'ASC' | 'DESC'
  }
}

// ============================================================================
// 字段定义接口
// ============================================================================

/**
 * 基础字段定义
 */
export interface BaseFieldDefinition<T = any> {
  /** 字段类型 */
  type: FieldType
  /** 字段选项 */
  options: BaseFieldOptions
  /** Zod Schema */
  zodSchema: z.ZodTypeAny
  /** 是否为主键 */
  primary?: boolean
}

/**
 * 字段定义映射类型
 */
export type FieldDefinitions = Record<string, BaseFieldDefinition>

// ============================================================================
// Schema 定义接口
// ============================================================================

/**
 * Schema 配置选项
 */
export interface SchemaOptions {
  /** Schema 名称 */
  name: string
  /** 表名（可选，默认为 Schema 名称的小写复数形式） */
  tableName?: string
  /** Schema 说明 */
  description?: string
  /** 时间戳字段配置 */
  timestamps?: boolean | {
    createdAt?: string | false
    updatedAt?: string | false
  }
  /** 软删除配置 */
  softDelete?: boolean | {
    field?: string
  }
  /** 自定义验证函数 */
  validate?: (data: any) => boolean | string | { field: string; message: string }
}

/**
 * Schema 定义
 */
export interface SchemaDefinition<T extends FieldDefinitions = FieldDefinitions> {
  /** Schema 名称 */
  name: string
  /** 字段定义 */
  fields: T
  /** Schema 配置 */
  options: SchemaOptions
  /** Zod Schema */
  zodSchema: z.ZodTypeAny
}

// ============================================================================
// 类型推导辅助类型
// ============================================================================

/**
 * 从字段定义推导 TypeScript 类型
 */
export type InferFieldType<F extends BaseFieldDefinition> = z.infer<F['zodSchema']>

/**
 * 从字段定义映射推导完整的对象类型
 */
export type InferSchemaType<T extends FieldDefinitions> = {
  [K in keyof T]: InferFieldType<T[K]>
}

/**
 * 从 Schema 定义推导类型
 */
export type Infer<S extends SchemaDefinition> = z.infer<S['zodSchema']>

/**
 * 推导输入类型（考虑 default 和 optional 字段）
 */
export type InferInput<S extends SchemaDefinition> = z.input<S['zodSchema']>

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 标记字段为可选
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 标记字段为必选
 */
export type RequiredPartial<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 提取必选字段
 */
export type RequiredFields<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K]
}

/**
 * 提取可选字段
 */
export type OptionalFields<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
}

/**
 * 创建类型（排除自动生成的字段）
 */
export type CreateType<T extends SchemaDefinition> = Omit<
  Infer<T>,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * 更新类型（所有字段可选）
 */
export type UpdateType<T extends SchemaDefinition> = Partial<Infer<T>>

/**
 * 查询类型（所有字段可选，用于查询条件）
 */
export type QueryType<T extends SchemaDefinition> = Partial<Infer<T>>

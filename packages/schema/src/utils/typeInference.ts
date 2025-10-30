/**
 * Schema Component - 类型推导工具
 *
 * 提供从 Schema 定义推导 TypeScript 类型的实用函数
 */

import type { SchemaDefinition, FieldDefinitions } from '../core/types'
import { z } from 'zod'

/**
 * 从 Schema 推导完整类型
 *
 * @example
 * ```typescript
 * const UserSchema = defineSchema({ ... })
 * type User = InferSchemaType<typeof UserSchema>
 * ```
 */
export type InferSchemaType<S extends SchemaDefinition<any>> = z.infer<S['zodSchema']>

/**
 * 从 Schema 推导输入类型（考虑默认值）
 */
export type InferInputType<S extends SchemaDefinition<any>> = z.input<S['zodSchema']>

/**
 * 从 Schema 推导输出类型（验证后的类型）
 */
export type InferOutputType<S extends SchemaDefinition<any>> = z.output<S['zodSchema']>

/**
 * 从 Schema 推导创建类型（排除自动生成字段）
 */
export type InferCreateType<S extends SchemaDefinition<any>> = Omit<
  InferSchemaType<S>,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

/**
 * 从 Schema 推导更新类型（所有字段可选）
 */
export type InferUpdateType<S extends SchemaDefinition<any>> = Partial<InferSchemaType<S>>

/**
 * 从 Schema 推导查询类型（用于过滤条件）
 */
export type InferQueryType<S extends SchemaDefinition<any>> = Partial<InferSchemaType<S>>

/**
 * 提取 Schema 中的必填字段
 */
export type RequiredFieldsOf<S extends SchemaDefinition<any>> = {
  [K in keyof InferSchemaType<S> as undefined extends InferSchemaType<S>[K] ? never : K]: InferSchemaType<S>[K]
}

/**
 * 提取 Schema 中的可选字段
 */
export type OptionalFieldsOf<S extends SchemaDefinition<any>> = {
  [K in keyof InferSchemaType<S> as undefined extends InferSchemaType<S>[K] ? K : never]?: InferSchemaType<S>[K]
}

/**
 * 从 Schema 中选择特定字段的类型
 */
export type PickSchemaFields<S extends SchemaDefinition<any>, K extends keyof InferSchemaType<S>> = Pick<
  InferSchemaType<S>,
  K
>

/**
 * 从 Schema 中排除特定字段的类型
 */
export type OmitSchemaFields<S extends SchemaDefinition<any>, K extends keyof InferSchemaType<S>> = Omit<
  InferSchemaType<S>,
  K
>

/**
 * 验证数据是否符合 Schema
 *
 * @example
 * ```typescript
 * const result = validateSchema(UserSchema, userData)
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export function validateSchema<S extends SchemaDefinition<any>>(
  schema: S,
  data: unknown
): z.SafeParseReturnType<unknown, InferSchemaType<S>> {
  return schema.zodSchema.safeParse(data)
}

/**
 * 验证数据并抛出错误（如果验证失败）
 *
 * @example
 * ```typescript
 * try {
 *   const user = parseSchema(UserSchema, userData)
 *   console.log(user)
 * } catch (error) {
 *   console.error(error)
 * }
 * ```
 */
export function parseSchema<S extends SchemaDefinition<any>>(
  schema: S,
  data: unknown
): InferSchemaType<S> {
  return schema.zodSchema.parse(data)
}

/**
 * 验证部分数据（用于更新操作）
 */
export function validatePartial<S extends SchemaDefinition<any>>(
  schema: S,
  data: unknown
): z.SafeParseReturnType<unknown, Partial<InferSchemaType<S>>> {
  return schema.zodSchema.partial().safeParse(data)
}

/**
 * 验证必填字段数据（用于创建操作）
 */
export function validateRequired<S extends SchemaDefinition<any>>(
  schema: S,
  data: unknown
): z.SafeParseReturnType<unknown, RequiredFieldsOf<S>> {
  return schema.zodSchema.required().safeParse(data)
}

/**
 * 获取 Schema 的字段名列表
 */
export function getSchemaFieldNames<S extends SchemaDefinition<any>>(
  schema: S
): Array<keyof InferSchemaType<S>> {
  return Object.keys(schema.fields) as Array<keyof InferSchemaType<S>>
}

/**
 * 检查 Schema 是否包含某个字段
 */
export function hasSchemaField<S extends SchemaDefinition<any>>(
  schema: S,
  fieldName: string
): fieldName is keyof InferSchemaType<S> {
  return fieldName in schema.fields
}

/**
 * 获取字段的类型信息
 */
export function getFieldType<S extends SchemaDefinition<any>>(
  schema: S,
  fieldName: keyof S['fields']
): S['fields'][typeof fieldName]['type'] {
  return schema.fields[fieldName].type
}

/**
 * 获取字段的选项
 */
export function getFieldOptions<S extends SchemaDefinition<any>>(
  schema: S,
  fieldName: keyof S['fields']
): S['fields'][typeof fieldName]['options'] {
  return schema.fields[fieldName].options
}

/**
 * 创建 Schema 的深拷贝
 */
export function cloneSchema<S extends SchemaDefinition<any>>(schema: S): S {
  return {
    ...schema,
    fields: { ...schema.fields },
    options: { ...schema.options }
  }
}

/**
 * 合并多个 Schema（浅合并字段）
 */
export function mergeSchemas<
  S1 extends SchemaDefinition<any>,
  S2 extends SchemaDefinition<any>
>(
  schema1: S1,
  schema2: S2,
  options?: {
    name?: string
    preferSecond?: boolean
  }
): SchemaDefinition<S1['fields'] & S2['fields']> {
  const fields = options?.preferSecond
    ? { ...schema1.fields, ...schema2.fields }
    : { ...schema2.fields, ...schema1.fields }

  return {
    name: options?.name || schema1.name,
    fields: fields as S1['fields'] & S2['fields'],
    options: schema1.options,
    zodSchema: z.object({
      ...schema1.zodSchema.shape,
      ...schema2.zodSchema.shape
    }) as any
  }
}

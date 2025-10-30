/**
 * Schema Component - JSON 字段构建器
 *
 * 提供 JSON 类型的字段构建器
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  JSONFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建 JSON 字段（对象）
 */
export function json(options: JSONFieldOptions = {}): BaseFieldDefinition<Record<string, any>> {
  let schema: z.ZodTypeAny = z.record(z.any())

  // 如果提供了 schema，使用指定的 schema
  if (options.schema) {
    schema = options.schema
  }

  // 处理可选性和默认值
  if (!options.required && options.default === undefined) {
    schema = schema.optional()
  }
  if (options.nullable) {
    schema = schema.nullable()
  }
  if (options.default !== undefined) {
    schema = schema.default(options.default)
  }

  return {
    type: 'json' as FieldType,
    options,
    zodSchema: schema
  }
}

/**
 * 创建 JSON 对象字段（带类型约束）
 */
export function jsonObject<T extends z.ZodRawShape>(
  shape: T,
  options: Omit<JSONFieldOptions, 'schema'> = {}
): BaseFieldDefinition<z.infer<z.ZodObject<T>>> {
  const objectSchema = z.object(shape)

  return json({
    ...options,
    schema: objectSchema
  }) as any
}

/**
 * 创建 JSON 数组字段
 */
export function jsonArray<T extends z.ZodTypeAny>(
  itemSchema: T,
  options: Omit<JSONFieldOptions, 'schema'> = {}
): BaseFieldDefinition<z.infer<T>[]> {
  const arraySchema = z.array(itemSchema)

  return json({
    ...options,
    schema: arraySchema
  }) as any
}

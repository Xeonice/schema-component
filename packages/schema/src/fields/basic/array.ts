/**
 * Schema Component - 数组字段构建器
 *
 * 提供数组类型的字段构建器
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  ArrayFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建数组字段
 */
export function array<T extends z.ZodTypeAny>(
  itemSchema: T,
  options: ArrayFieldOptions = {}
): BaseFieldDefinition<z.infer<T>[]> {
  let schema: z.ZodType<z.infer<T>[]> = z.array(itemSchema, {
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 应用数组长度约束
  if (options.minItems !== undefined) {
    schema = (schema as z.ZodArray<T>).min(options.minItems, options.errorMessages?.minItems)
  }
  if (options.maxItems !== undefined) {
    schema = (schema as z.ZodArray<T>).max(options.maxItems, options.errorMessages?.maxItems)
  }

  // 应用唯一性约束
  if (options.uniqueItems) {
    schema = schema.refine(
      (arr) => {
        const set = new Set(arr.map(item => JSON.stringify(item)))
        return set.size === arr.length
      },
      {
        message: options.errorMessages?.uniqueItems || 'Array items must be unique'
      }
    )
  }

  // 处理可选性和默认值
  if (!options.required && options.default === undefined) {
    schema = schema.optional() as z.ZodType<z.infer<T>[]>
  }
  if (options.nullable) {
    schema = schema.nullable() as z.ZodType<z.infer<T>[]>
  }
  if (options.default !== undefined) {
    schema = schema.default(options.default as any) as z.ZodType<z.infer<T>[]>
  }

  return {
    type: 'array' as FieldType,
    options: {
      ...options,
      items: itemSchema
    } as any,
    zodSchema: schema as any
  }
}

/**
 * 创建字符串数组字段
 */
export function stringArray(options: Omit<ArrayFieldOptions, 'items'> = {}): BaseFieldDefinition<string[]> {
  return array(z.string(), options)
}

/**
 * 创建数字数组字段
 */
export function numberArray(options: Omit<ArrayFieldOptions, 'items'> = {}): BaseFieldDefinition<number[]> {
  return array(z.number(), options)
}

/**
 * 创建布尔数组字段
 */
export function booleanArray(options: Omit<ArrayFieldOptions, 'items'> = {}): BaseFieldDefinition<boolean[]> {
  return array(z.boolean(), options)
}

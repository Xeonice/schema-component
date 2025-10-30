/**
 * Schema Component - 枚举字段构建器
 *
 * 提供枚举类型的字段构建器
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  EnumFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建枚举字段
 */
export function enumField<T extends readonly [string, ...string[]]>(
  options: EnumFieldOptions<T>
): BaseFieldDefinition<T[number]> {
  if (!options.values || options.values.length === 0) {
    throw new Error('Enum field must have at least one value')
  }

  let schema = z.enum(options.values as [string, ...string[]], {
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 处理可选性和默认值
  if (!options.required && options.default === undefined) {
    schema = schema.optional()
  }
  if (options.nullable) {
    schema = schema.nullable()
  }
  if (options.default !== undefined) {
    schema = schema.default(options.default as any)
  }

  return {
    type: 'enum' as FieldType,
    options,
    zodSchema: schema
  }
}

/**
 * 创建原生枚举字段（支持 TypeScript enum）
 */
export function nativeEnum<T extends Record<string, string | number>>(
  enumObject: T,
  options: Omit<EnumFieldOptions<any>, 'values'> = {}
): BaseFieldDefinition<T[keyof T]> {
  let schema = z.nativeEnum(enumObject, {
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

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
    type: 'enum' as FieldType,
    options: {
      ...options,
      values: Object.values(enumObject) as any
    },
    zodSchema: schema
  }
}

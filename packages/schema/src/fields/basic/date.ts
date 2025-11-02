/**
 * Schema Component - 日期时间字段构建器
 *
 * 提供日期和时间类型的字段构建器
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  DateFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建日期字段
 */
export function date(options: DateFieldOptions = {}): BaseFieldDefinition<Date> {
  let schema = z.date({
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 应用日期范围约束
  if (options.min !== undefined) {
    const minDate = typeof options.min === 'string' ? new Date(options.min) : options.min
    schema = schema.min(minDate, options.errorMessages?.min)
  }
  if (options.max !== undefined) {
    const maxDate = typeof options.max === 'string' ? new Date(options.max) : options.max
    schema = schema.max(maxDate, options.errorMessages?.max)
  }

  // 处理自动创建时间
  if (options.autoCreate) {
    schema = schema.default(() => new Date()) as any
  }

  // 处理可选性和默认值
  if (!options.required && options.default === undefined && !options.autoCreate) {
    schema = schema.optional() as any
  }
  if (options.nullable) {
    schema = schema.nullable() as any
  }
  if (options.default !== undefined && !options.autoCreate) {
    const defaultDate = typeof options.default === 'string'
      ? new Date(options.default)
      : options.default
    schema = schema.default(defaultDate) as any
  }

  return {
    type: 'date' as FieldType,
    options,
    zodSchema: schema as any
  }
}

/**
 * 创建日期时间字段
 */
export function datetime(options: DateFieldOptions = {}): BaseFieldDefinition<Date> {
  return {
    ...date(options),
    type: 'datetime' as FieldType
  }
}

/**
 * 创建时间戳字段
 */
export function timestamp(options: DateFieldOptions = {}): BaseFieldDefinition<Date> {
  return {
    ...date(options),
    type: 'timestamp' as FieldType
  }
}

/**
 * 创建创建时间字段（自动设置）
 */
export function createdAt(options: Omit<DateFieldOptions, 'autoCreate'> = {}): BaseFieldDefinition<Date> {
  return datetime({
    ...options,
    autoCreate: true,
    required: true
  })
}

/**
 * 创建更新时间字段（自动更新）
 */
export function updatedAt(options: Omit<DateFieldOptions, 'autoUpdate'> = {}): BaseFieldDefinition<Date> {
  return datetime({
    ...options,
    autoUpdate: true,
    required: true
  })
}

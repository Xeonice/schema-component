/**
 * Schema Component - 数值字段构建器
 *
 * 提供数值类型的字段构建器，包括整数、浮点数等
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  NumberFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建数值字段
 */
export function number(options: NumberFieldOptions = {}): BaseFieldDefinition<number> {
  let schema = z.number({
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 应用数值约束
  if (options.min !== undefined) {
    schema = schema.min(options.min, options.errorMessages?.min)
  }
  if (options.max !== undefined) {
    schema = schema.max(options.max, options.errorMessages?.max)
  }

  // 应用正负数约束
  if (options.positive) {
    schema = schema.positive(options.errorMessages?.positive)
  }
  if (options.negative) {
    schema = schema.negative(options.errorMessages?.negative)
  }

  // 应用步长约束
  if (options.step !== undefined) {
    schema = schema.step(options.step)
  }

  // 应用精度约束（对于浮点数）
  if (options.precision !== undefined && options.scale !== undefined) {
    schema = schema.refine(
      (val) => {
        const str = val.toString()
        const parts = str.split('.')
        const integerPart = parts[0]?.replace('-', '') || ''
        const decimalPart = parts[1] || ''
        return integerPart.length + decimalPart.length <= options.precision! &&
               decimalPart.length <= options.scale!
      },
      {
        message: options.errorMessages?.precision ||
          `Number must have at most ${options.precision} digits with ${options.scale} decimal places`
      }
    ) as any
  }

  // 处理可选性和默认值
  if (!options.required && options.default === undefined) {
    schema = schema.optional() as any
  }
  if (options.nullable) {
    schema = schema.nullable() as any
  }
  if (options.default !== undefined) {
    schema = schema.default(options.default) as any
  }

  return {
    type: 'number' as FieldType,
    options,
    zodSchema: schema as any
  }
}

/**
 * 创建整数字段
 */
export function integer(options: NumberFieldOptions = {}): BaseFieldDefinition<number> {
  let schema = z.number({
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 应用整数约束
  schema = schema.int(options.errorMessages?.integer || 'Must be an integer')

  // 应用数值约束
  if (options.min !== undefined) {
    schema = schema.min(options.min, options.errorMessages?.min)
  }
  if (options.max !== undefined) {
    schema = schema.max(options.max, options.errorMessages?.max)
  }

  // 应用正负数约束
  if (options.positive) {
    schema = schema.positive(options.errorMessages?.positive)
  }
  if (options.negative) {
    schema = schema.negative(options.errorMessages?.negative)
  }

  // 应用步长约束
  if (options.step !== undefined) {
    schema = schema.step(options.step)
  }

  // 处理可选性和默认值
  if (!options.required && options.default === undefined) {
    schema = schema.optional() as any
  }
  if (options.nullable) {
    schema = schema.nullable() as any
  }
  if (options.default !== undefined) {
    schema = schema.default(options.default) as any
  }

  return {
    type: 'integer' as FieldType,
    options,
    zodSchema: schema as any
  }
}

/**
 * 创建浮点数字段
 */
export function float(options: NumberFieldOptions = {}): BaseFieldDefinition<number> {
  return {
    ...number(options),
    type: 'float' as FieldType
  }
}

/**
 * 创建正整数字段
 */
export function positiveInteger(options: Omit<NumberFieldOptions, 'positive'> = {}): BaseFieldDefinition<number> {
  return integer({
    ...options,
    positive: true,
    min: options.min ?? 1
  })
}

/**
 * 创建非负整数字段（包括0）
 */
export function nonNegativeInteger(options: Omit<NumberFieldOptions, 'min'> = {}): BaseFieldDefinition<number> {
  return integer({
    ...options,
    min: 0
  })
}

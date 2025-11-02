/**
 * Schema Component - 字符串字段构建器
 *
 * 提供各种字符串类型的字段构建器，包括普通字符串、文本、邮箱、URL、UUID、Slug等
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  StringFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建字符串字段
 */
export function string(options: StringFieldOptions = {}): BaseFieldDefinition<string> {
  let schema = z.string({
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 应用字符串转换
  if (options.trim) {
    schema = schema.trim()
  }
  if (options.lowercase) {
    schema = schema.toLowerCase()
  }
  if (options.uppercase) {
    schema = schema.toUpperCase()
  }

  // 应用长度限制
  if (options.minLength !== undefined) {
    schema = schema.min(options.minLength, options.errorMessages?.minLength)
  }
  if (options.maxLength !== undefined) {
    schema = schema.max(options.maxLength, options.errorMessages?.maxLength)
  }

  // 应用正则模式
  if (options.pattern) {
    const regex = typeof options.pattern === 'string'
      ? new RegExp(options.pattern)
      : options.pattern
    schema = schema.regex(regex, options.errorMessages?.pattern)
  }

  // 应用格式验证
  if (options.format) {
    switch (options.format) {
      case 'email':
        schema = schema.email(options.errorMessages?.email)
        break
      case 'url':
        schema = schema.url(options.errorMessages?.url)
        break
      case 'uuid':
        schema = schema.uuid(options.errorMessages?.uuid)
        break
      case 'slug':
        schema = schema.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, options.errorMessages?.slug)
        break
      case 'phone':
        schema = schema.regex(/^\+?[1-9]\d{1,14}$/, options.errorMessages?.phone)
        break
    }
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
    type: 'string' as FieldType,
    options,
    zodSchema: schema as any
  }
}

/**
 * 创建文本字段（长文本）
 */
export function text(options: Omit<StringFieldOptions, 'format'> = {}): BaseFieldDefinition<string> {
  return string({
    ...options,
    // 文本字段通常不需要长度限制，或者有较大的限制
    maxLength: options.maxLength ?? 65535
  })
}

/**
 * 创建邮箱字段
 */
export function email(options: Omit<StringFieldOptions, 'format'> = {}): BaseFieldDefinition<string> {
  return string({
    ...options,
    format: 'email'
  })
}

/**
 * 创建 URL 字段
 */
export function url(options: Omit<StringFieldOptions, 'format'> = {}): BaseFieldDefinition<string> {
  return string({
    ...options,
    format: 'url'
  })
}

/**
 * 创建 UUID 字段
 */
export function uuid(options: Omit<StringFieldOptions, 'format'> = {}): BaseFieldDefinition<string> {
  return string({
    ...options,
    format: 'uuid'
  })
}

/**
 * 创建 Slug 字段（URL 友好的字符串）
 */
export function slug(options: Omit<StringFieldOptions, 'format'> = {}): BaseFieldDefinition<string> {
  return string({
    ...options,
    format: 'slug',
    lowercase: true,
    trim: true
  })
}

/**
 * 创建电话号码字段
 */
export function phone(options: Omit<StringFieldOptions, 'format'> = {}): BaseFieldDefinition<string> {
  return string({
    ...options,
    format: 'phone'
  })
}

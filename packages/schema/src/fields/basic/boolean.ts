/**
 * Schema Component - 布尔字段构建器
 *
 * 提供布尔类型的字段构建器
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  BooleanFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建布尔字段
 */
export function boolean(options: BooleanFieldOptions = {}): BaseFieldDefinition<boolean> {
  let schema = z.boolean({
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
    type: 'boolean' as FieldType,
    options,
    zodSchema: schema
  }
}
